import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import {DateAdapter} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';
import {DOCUMENT} from '@angular/common';
import {debounceTime, switchMap, tap} from 'rxjs/operators';
import {FormControl, NgControl} from '@angular/forms';
import {DomService} from './dom.service';
import {CustomDatePickerAdapter} from './custom-date-picker.adapter';
import {Overlay, OverlayConfig} from '@angular/cdk/overlay';
import * as moment from 'moment';
import {TimePickerComponent} from './time-picker/time-picker.component';
import {FormatService} from './format.service';

export function createMissingNgModel() {
  return Error(
    'timePickerFor: No NgModel found for data binding. You must binding with these options:' +
    ' [(ngModel)]="date" or formControlName="date" or [formControl]="date"'
  );
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[timePickerFor]',
  providers: [
    FormatService,
    {
      provide: DateAdapter,
      useClass: CustomDatePickerAdapter
    }
  ]
})
export class TimePickerForDirective implements OnInit {
  @Input('timePickerFor') datePicker: MatDatepicker<any>;
  @Input() format = 'YYYY/MM/DD HH:mm:ss';

  componentRef: ComponentRef<any>;
  formControl: FormControl = new FormControl(null);

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(ElementRef) private elementRef: ElementRef<HTMLInputElement>,
    private domService: DomService,
    private formatService: FormatService,
    private overlay: Overlay,
    @Optional() private ngControl: NgControl,
  ) {
    if (!this.ngControl) {
      throw createMissingNgModel();
    }
  }

  @HostListener('click')
  onClick() {
    if (!this.datePicker) {
      const width = this.elementRef.nativeElement.getBoundingClientRect().width;
      const config = new OverlayConfig({
        width: `${width + 20}px`,
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
              panelClass: 'mat-datepicker-content'
            }
          ])
      });
      const overlayRef = this.domService.createOverlay(TimePickerComponent, config, this.props());
      overlayRef.backdropClick().subscribe(() => {
        this.viewToModel();
        overlayRef.detach();
      });
    }
  }

  ngOnInit(): void {
    // This one should place on top to reset the format based on component
    this.formatService.format = this.format;
    const date = this.deserialize(this.value);
    this.formControl.setValue(date);
    if (this.hasDatePicker()) {
      this.embedTimePicker();
    }
    this.viewToModel();
  }

  get value() {
    return this.ngControl.value;
  }

  set value(value: any) {
    this.ngControl.control.setValue(value);
  }

  private props() {
    if (!this.formControl.value) {
      this.formControl.setValue(moment().locale(this.formatService.locale));
    }
    return {
      formControl: this.formControl,
      datePickerId: this.datePicker?.id
    };
  }

  private viewToModel() {
    const date = this.formControl.value;
    if (!date) {
      return;
    }

    let value;
    if (!this.hasDatePicker()) {
      value = date.format(this.format);
    } else {
      value = date.toISOString();
    }
    this.value = value;
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
          const formControlDate = this.formControl.value as moment.Moment;
          const originValue = this.value;
          const date = this.deserialize(originValue ? originValue : moment().locale(this.formatService.locale));
          date.hours(formControlDate.hours());
          date.minutes(formControlDate.minutes());
          this.formControl.setValue(date);
          this.domService.detachComponent(this.componentRef);
          this.viewToModel();
        }
      );
  }

  private hasDatePicker(): boolean {
    return !!this.datePicker;
  }

  private deserialize(value: any): moment.Moment | null {
    if (!value) {
      return null;
    }

    let date;
    if (moment.isMoment(value)) {
      return value.clone();
    }

    const typeOfValue = typeof value;
    if (typeOfValue === 'number') {
      return moment(value).locale(this.formatService.locale);
    }

    if (value instanceof Date || typeOfValue === 'string') {
      date = this.formatService.toMoment(value);
    }

    if (date && date.isValid()) {
      return date;
    }

    if (!this.hasDatePicker()) {
      return moment(value, this.format).locale(this.formatService.locale);
    }

    return moment.invalid();
  }
}
