import {
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {FormControl, NgControl} from '@angular/forms';
import {Overlay, OverlayConfig} from '@angular/cdk/overlay';
import * as moment from 'moment';
import {DomService} from './dom.service';
import {TimePickerComponent} from './time-picker/time-picker.component';
import {Subject} from 'rxjs';
import {createMissingNgModel, TimePicker} from './common';
import {MatInput} from '@angular/material/input';

@Directive({
  selector: '[coreTimePickerFor]'
})
export class TimePickerForDirective implements OnInit, OnDestroy, TimePicker<any> {
  @Input('coreTimePickerFor') public format = 'HH:mm';
  @Input() public locale: string;
  @Input() public stepHours = 1;
  @Input() public stepMinutes = 1;

  formControl: FormControl = new FormControl(null);
  stateChange = new Subject<boolean>();
  destroy$: Subject<boolean> = new Subject<boolean>();

  @HostListener('click')
  onClick() {
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

    const overlayRef = this.domService.createOverlay(TimePickerComponent, config, this.getProps());
    overlayRef
      .backdropClick()
      .subscribe(() => {
        const value = this.inputElementRef.nativeElement.value;
        if (value) {
          this.viewToModel();
        } else {
          this.value = value;
        }

        overlayRef.detach();
      });
  }

  @HostListener('input', ['$event'])
  onInput(event) {
    this.updateFormControl(event.target.value);
  }

  constructor(
    @Inject(ElementRef) private inputElementRef: ElementRef<HTMLInputElement>,
    @Inject(MatInput) private matInput: MatInput,
    private domService: DomService,
    private overlay: Overlay,
    private ngControl: NgControl,
  ) {
    if (!this.ngControl) {
      throw createMissingNgModel();
    }
  }

  ngOnInit(): void {
    this.locale = this.locale || moment.locale();
    this.updateFormControl(this.value);
    this.viewToModel();

    // Update time when user increase/decrease time
    this.stateChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((isChange) => {
        if (isChange) {
          this.viewToModel();
        }
      });
  }

  get value() {
    return this.ngControl.value;
  }

  set value(value: any) {
    this.ngControl.control.setValue(value);
  }

  private updateFormControl(value) {
    const date = this.deserialize(value);
    this.formControl.setValue(date);
  }

  getProps() {
    this.updateFormControl(this.value);
    return {
      formControl: this.formControl,
      stepHours: this.stepHours,
      stepMinutes: this.stepMinutes,
      stateChange: this.stateChange
    };
  }

  viewToModel() {
    const date = this.formControl.value;
    if (!date) {
      return;
    }

    this.value = date.format(this.format);
  }

  deserialize(value: any): moment.Moment | null {
    const format = this.format;
    const date = moment(value, format).locale(this.locale);
    if (date.isValid()) {
      return date;
    }

    return moment('00:00', format).locale(this.locale);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
