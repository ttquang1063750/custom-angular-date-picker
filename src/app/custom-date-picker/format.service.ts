import {Inject, Injectable, Optional} from '@angular/core';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateAdapterOptions} from '@angular/material-moment-adapter';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class FormatService {
  constructor(
    @Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string,
    @Optional() @Inject(MAT_MOMENT_DATE_ADAPTER_OPTIONS) private _options?: MatMomentDateAdapterOptions,
  ) {
    this.locale = dateLocale || moment.locale();
  }

  private _format: string;
  private _locale: string;

  get locale(): string {
    return this._locale;
  }

  set locale(locale: string) {
    this._locale = locale;
  }

  get format(): string {
    return this._format || 'YYYY/MM/DD';
  }

  set format(value: string) {
    this._format = value;
  }

  toMoment(date: moment.MomentInput): moment.Moment {
    const {strict, useUtc}: MatMomentDateAdapterOptions = this._options || {};

    return useUtc
      ? moment.utc(date, this.format, this.locale, strict)
      : moment(date, this.format, this.locale, strict);
  }
}
