import {Component, HostBinding, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import * as moment from 'moment';
import {TIME_PICKER_FOR} from '../dom.service';
import {FormControl} from '@angular/forms';
import {DOCUMENT} from '@angular/common';
import {Subject} from 'rxjs';

@Component({
  selector: 'core-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TimePickerComponent implements OnInit {
  public formControl: FormControl;
  public stepHours: number;
  public stepMinutes: number;
  public stateChange: Subject<boolean>;
  public datePickerId: string;
  private hours: number;
  private minutes: number;

  @HostBinding('class') className = 'core-time-picker';

  @HostBinding('class.invisible')
  get invisible() {
    if (this.datePickerId) {
      const calendar = this.document.getElementById(this.datePickerId);
      return calendar.querySelectorAll('mat-month-view').length === 0;
    }

    return false;
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(TIME_PICKER_FOR) public componentData: any
  ) {
  }

  ngOnInit(): void {
    this.formControl = this.componentData.formControl;
    this.stateChange = this.componentData.stateChange;
    this.stepHours = this.componentData.stepHours;
    this.stepMinutes = this.componentData.stepMinutes;
    this.datePickerId = this.componentData.datePickerId;

    const date = this.date;
    this.hours = date.hours();
    this.minutes = date.minutes();
  }

  addHours(amount: number) {
    this.hours += amount;
    if (this.hours > 23) {
      this.hours = 0;
    }

    if (this.hours < 0) {
      this.hours = 23;
    }

    this.viewToModel();
  }

  addMinutes(amount: number) {
    this.minutes += amount;
    if (this.minutes > 59) {
      this.minutes = 0;
      this.addHours(1);
    }

    if (this.minutes < 0) {
      this.minutes = 59;
      this.addHours(-1);
    }

    this.viewToModel();
  }

  viewToModel() {
    const date = this.date;
    date.hours(this.hours);
    date.minutes(this.minutes);
    this.formControl.setValue(date);
    this.stateChange.next(true);
  }

  get date(): moment.Moment {
    return this.formControl.value;
  }

  get displayHours() {
    return this.date.format('HH');
  }

  get displayMinutes() {
    return this.date.format('mm');
  }
}
