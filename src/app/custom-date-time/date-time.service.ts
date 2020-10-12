import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {
  private _format: string;

  getFormat(): string {
    return this._format || 'YYYY/MM/DD';
  }

  setFormat(value: string) {
    this._format = value;
  }
}
