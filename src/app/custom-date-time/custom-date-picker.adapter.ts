import {Inject, Injectable, Optional} from '@angular/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import {DateTimeService} from './date-time.service';
import * as moment from 'moment';

@Injectable()
export class CustomDatePickerAdapter extends MomentDateAdapter {

  constructor(
    private dateTimeService: DateTimeService,
    @Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string
  ) {
    super(dateLocale);
  }

  format(date: moment.Moment, displayFormat: string): string {
    const format = this.dateTimeService.getFormat(); // This service need to place in local component, don't make it global
    return super.format(date, format);
  }
}
