import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {MatDatepicker} from '@angular/material/datepicker';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateAdapterOptions} from '@angular/material-moment-adapter';
import {debounceTime, switchMap, takeUntil, tap} from 'rxjs/operators';
import {FormControl, NgControl} from '@angular/forms';
import {Overlay, OverlayConfig} from '@angular/cdk/overlay';
import * as moment from 'moment';
import {DomService} from './dom.service';
import {TimePickerComponent} from './time-picker/time-picker.component';
import {Subject} from 'rxjs';
import {MAT_DATE_FORMATS} from '@angular/material/core';
import {CustomDateFormat} from './custom-date-format';

export function createMissingNgModel() {
  return Error(
    'coreTimePickerFor: No NgModel found for data binding.'
  );
}

@Directive({
  selector: '[coreTimePickerFor]'
})
export class TimePickerForDirective implements OnInit, OnDestroy {
  @Input('coreTimePickerFor') public datePicker: MatDatepicker<any>;
  @Input() public locale: string;

  componentRef: ComponentRef<any>;
  formControl: FormControl = new FormControl(null);
  stateChange = new Subject<boolean>();
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(MAT_DATE_FORMATS) public matDateFormat: CustomDateFormat,
    @Inject(ElementRef) private inputElementRef: ElementRef<HTMLInputElement>,
    private domService: DomService,
    private overlay: Overlay,
    @Optional() private ngControl: NgControl,
    @Optional() @Inject(MAT_MOMENT_DATE_ADAPTER_OPTIONS) private _options?: MatMomentDateAdapterOptions,
  ) {
    if (!this.ngControl) {
      throw createMissingNgModel();
    }
  }

  @HostListener('click')
  onClick() {
    if (!this.datePicker) {
      const width = this.inputElementRef.nativeElement.getBoundingClientRect().width;
      const config = new OverlayConfig({
        width: `${width + 20}px`,
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-transparent-backdrop',
        positionStrategy: this.overlay
          .position()
          .flexibleConnectedTo(this.inputElementRef)
          .withPositions([
            {
              originX: 'start',
              originY: 'bottom',
              overlayX: 'start',
              overlayY: 'top',
              offsetY: 15,
              offsetX: -10,
              panelClass: 'mat-datepicker-content'
            }
          ])
      });
      const overlayRef = this.domService.createOverlay(TimePickerComponent, config, this.props());
      overlayRef.backdropClick()
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          const value = this.inputElementRef.nativeElement.value;
          if (value) {
            this.updateTime();
          } else {
            this.value = value;
          }

          overlayRef.detach();
        });
    }
  }

  @HostListener('input', ['$event'])
  onInput(event) {
    const value = event.target.value;
    if (!this.hasDatePicker()) {
      this.refreshFormControl(value);
    }
  }

  ngOnInit(): void {
    this.locale = this.locale || moment.locale();
    const date = this.deserialize(this.value);
    this.formControl.setValue(date);
    this.viewToModel();
    if (this.hasDatePicker()) {
      this.embedTimePicker();
    }

    if (date && !date.isValid()) {
      this.ngControl.control.setErrors({matDatepickerParse: {text: this.value}});
      this.ngControl.control.markAsTouched({onlySelf: true});
    }

    // Update time when user increase/decrease time
    this.stateChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((isChange) => {
        if (isChange) {
          this.updateTime();
        }
      });
  }

  get value() {
    return this.ngControl.value;
  }

  set value(value: any) {
    this.ngControl.control.setValue(value);
  }

  private refreshFormControl(value) {
    let date = this.deserialize(value);
    if (!date || !date.isValid()) {
      date = moment().locale(this.locale);
      date.hours(0);
      date.minutes(0);
    }

    this.formControl.setValue(date);
  }

  private props() {
    this.refreshFormControl(this.value);
    return {
      formControl: this.formControl,
      stateChange: this.stateChange,
      datePickerId: this.datePicker?.id
    };
  }

  private viewToModel() {
    const format = this.matDateFormat.parse.dateInput;
    const date = this.formControl.value;
    if (!date) {
      return;
    }

    if (!this.hasDatePicker()) {
      this.value = date.format(format);
    } else {
      this.value = date.isValid() ? date : date.format();
    }
  }

  private embedTimePicker() {
    this.datePicker
      .openedStream
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(10),
        tap(() => {
          this.componentRef = this.domService
            .createComponent(
              TimePickerComponent,
              this.document.querySelector(`#${this.datePicker.id}`),
              this.props(),
              'wrapper-core-time-picker'
            );
        }),
        switchMap(() => {
          return this.datePicker.closedStream;
        })
      )
      .subscribe(
        () => {
          if (this.value) {
            this.parseFromDatePicker();
            this.viewToModel();
          }
          this.domService.detachComponent(this.componentRef);
        }
      );
  }

  private parseFromDatePicker() {
    const formControlDate = this.formControl.value as moment.Moment;
    const originValue = this.value;
    const date = this.deserialize(originValue ? originValue : moment().locale(this.locale));
    date.hours(formControlDate.hours());
    date.minutes(formControlDate.minutes());
    this.formControl.setValue(date);
  }

  private updateTime() {
    if (this.hasDatePicker()) {
      this.parseFromDatePicker();
    }

    this.viewToModel();
  }

  private hasDatePicker(): boolean {
    return !!this.datePicker;
  }

  private deserialize(value: any): moment.Moment | null {
    const format = this.matDateFormat.parse.dateInput;
    if (!value) {
      return null;
    }

    let date;
    if (moment.isMoment(value)) {
      return value.clone();
    }

    const typeOfValue = typeof value;
    if (typeOfValue === 'number') {
      return moment(value).locale(this.locale);
    }

    if (value instanceof Date || typeOfValue === 'string') {
      date = this.toMoment(value, format);
    }

    if (date && date.isValid()) {
      return date;
    }

    if (!this.hasDatePicker()) {
      return moment(value, format).locale(this.locale);
    }

    return moment.invalid();
  }

  private toMoment(date: moment.MomentInput, format: string): moment.Moment {
    const {strict, useUtc}: MatMomentDateAdapterOptions = this._options || {};

    return useUtc
      ? moment.utc(date, format, this.locale, strict)
      : moment(date, format, this.locale, strict);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
