import {Component, Inject, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import * as moment from 'moment';
import {TIME_PICKER_FOR} from '../dom.service';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TimePickerComponent implements OnInit, OnDestroy {
  @Input() formControl: FormControl;

  dateTime: { hours: number, minutes: number };

  constructor(@Inject(TIME_PICKER_FOR) public componentData: any) {
  }

  ngOnInit(): void {
    this.formControl = this.formControl || this.componentData.formControl;

    const date = this.date;
    this.dateTime = {
      hours: date.hours(),
      minutes: date.minutes()
    };
  }

  increase(type: 'hour' | 'minute') {
    if (type === 'hour') {
      this.dateTime.hours++;
      if (this.dateTime.hours > 23) {
        this.dateTime.hours = 0;
      }
    } else {
      this.dateTime.minutes++;
      if (this.dateTime.minutes > 59) {
        this.dateTime.minutes = 0;
      }
    }
    this.updateModel();
  }

  decrease(type: 'hour' | 'minute') {
    if (type === 'hour') {
      this.dateTime.hours--;
      if (this.dateTime.hours < 0) {
        this.dateTime.hours = 23;
      }
    } else {
      this.dateTime.minutes--;
      if (this.dateTime.minutes < 0) {
        this.dateTime.minutes = 59;
      }
    }
    this.updateModel();
  }

  updateModel() {
    const date = this.date;
    date.hours(this.dateTime.hours);
    date.minutes(this.dateTime.minutes);
    this.formControl.setValue(date);
  }

  get date(): moment.Moment {
    return this.formControl.value;
  }

  get hours() {
    return this.date.format('HH');
  }

  get minutes() {
    return this.date.format('mm');
  }

  ngOnDestroy(): void {
    console.log('component destroy');
  }
}
