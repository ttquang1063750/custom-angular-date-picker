import {Inject, Injectable, Optional} from '@angular/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import * as moment from 'moment';
import {FormatService} from './format.service';

@Injectable()
export class CustomDatePickerAdapter extends MomentDateAdapter {

  constructor(
    private formatService: FormatService,
    @Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string
  ) {
    super(dateLocale);
  }

  format(date: moment.Moment, displayFormat: string): string {
    const format = this.formatService.format; // This service need to place in local component, don't make it global
    return super.format(date, format);
  }
}
