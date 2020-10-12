import {
  ChangeDetectorRef,
  ComponentRef,
  Directive, ElementRef, HostListener,
  Inject,
  Input, OnInit, Optional,
} from '@angular/core';
import {MatDatepicker} from '@angular/material/datepicker';
import {TimePickerComponent} from './time-picker/time-picker.component';
import {DOCUMENT} from '@angular/common';
import {debounceTime, switchMap, tap} from 'rxjs/operators';
import {FormControl, NgControl} from '@angular/forms';
import {DomService} from './dom.service';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import {CustomDatePickerAdapter} from './custom-date-picker.adapter';
import {Overlay, OverlayConfig} from '@angular/cdk/overlay';
import {Moment, MomentInput, MomentFormatSpecification} from 'moment';
import * as moment from 'moment';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateAdapterOptions} from '@angular/material-moment-adapter';
import {DateTimeService} from './date-time.service';

export type FormatValue = 'number' | 'string' | 'moment' | 'time';
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[timePickerFor]',
  providers: [
    DateTimeService,
    {
      provide: DateAdapter,
      useClass: CustomDatePickerAdapter
    }
  ]
})
export class TimePickerForDirective implements OnInit {
  @Input('timePickerFor') datePicker: MatDatepicker<any>;
  @Input() format: string;
  @Input() formatValue: FormatValue = 'string';

  componentRef: ComponentRef<any>;
  formControl: FormControl = new FormControl(null);
  locale: string;
  value: any;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(ElementRef) private elementRef: ElementRef,
    private ngControl: NgControl,
    private domService: DomService,
    private dateTimeService: DateTimeService,
    private overlay: Overlay,
    @Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string,
    @Optional() @Inject(MAT_MOMENT_DATE_ADAPTER_OPTIONS) private _options?: MatMomentDateAdapterOptions,
  ) {
    this.locale = dateLocale || moment.locale();
  }

  @HostListener('click')
  onClick() {
    if (!this.datePicker) {
      const config = new OverlayConfig({
        width: '200px',
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-transparent-backdrop',
        positionStrategy: this.overlay.position().flexibleConnectedTo(this.elementRef)
          .withPositions([
            {
              originX: 'start',
              originY: 'bottom',
              overlayX: 'start',
              overlayY: 'top',
              offsetY: 15,
              offsetX: -10,
              panelClass: 'mat-elevation-z1'
            }
          ])
      });
      const overlayRef = this.domService.createOverlay(TimePickerComponent, config, this.props());
      overlayRef.backdropClick().subscribe(() => {
        const date = this.formControl.value as Moment;
        this.value = date.toISOString();
        this.viewToModel(this.value);
        overlayRef.detach();
      });
    }
  }

  ngOnInit(): void {
    this.value = this.ngControl.control.value;
    this.dateTimeService.setFormat(this.format);
    if (this.isDatePicker()) {
      this.embedTimePicker();
    }
    this.viewToModel(this.value);
  }

  private props() {
    const date = this.deserialize(this.value);
    this.formControl.setValue(date ? date : moment().locale(this.locale));
    return {
      formControl: this.formControl
    };
  }

  private viewToModel(value: any) {
    if (!value) {
      return;
    }
    if (!this.isDatePicker()) {
      const date = this.deserialize(value);
      value = date.format(this.format);
    }

    this.ngControl.control.setValue(value);
  }

  private embedTimePicker() {
    this.datePicker
      .openedStream
      .pipe(
        debounceTime(10),
        tap(() => {
          this.componentRef = this.domService
            .createComponent(
              TimePickerComponent,
              this.document.querySelector(`#${this.datePicker.id}`),
              this.props()
            );
        }),
        switchMap(() => {
          return this.datePicker.closedStream;
        })
      )
      .subscribe(() => {
        const formControlDate = this.formControl.value as Moment;
        const date = this.deserialize(this.ngControl.control.value);
        date.hours(formControlDate.hours());
        date.minutes(formControlDate.minutes());
        this.value = date.toISOString();
        this.viewToModel(this.value);
        this.domService.detachComponent(this.componentRef);
      });
  }

  private isDatePicker(): boolean {
    return !!this.datePicker;
  }

  private deserialize(value: any): Moment | null {
    let date;
    if (value instanceof Date) {
      date = this._createMoment(value).locale(this.locale);
    } else if (moment.isMoment(value)) {
      return value.clone();
    }
    if (typeof value === 'string') {
      if (!value) {
        return null;
      }
      date = this._createMoment(value).locale(this.locale);
    }

    if (typeof value === 'number') {
      if (!value) {
        return null;
      }
      date = this._createMoment(value).locale(this.locale);
    }

    if (date && this.isValid(date)) {
      return this._createMoment(date).locale(this.locale);
    }else {
      return moment(value, this.format).locale(this.locale);
    }
  }

  private clone(date: Moment): Moment {
    return date.clone().locale(this.locale);
  }

  private isValid(date: Moment): boolean {
    return this.clone(date).isValid();
  }

  private _createMoment(date: MomentInput, format?: MomentFormatSpecification, locale?: string): Moment {
    const {strict, useUtc}: MatMomentDateAdapterOptions = this._options || {};

    return useUtc
      ? moment.utc(date, format, locale, strict)
      : moment(date, format, locale, strict);
  }
}
