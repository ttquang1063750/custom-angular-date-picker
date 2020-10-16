import {Directive, Inject, Input} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {CustomDatePickerAdapter} from './custom-date-picker.adapter';
import {CustomDateFormat, DateDisplay, DateParse} from './custom-date-format';

@Directive({
  selector: '[coreDatePickerFormat]',
  providers: [
    {
      provide: DateAdapter,
      useClass: CustomDatePickerAdapter
    },
    {
      provide: MAT_DATE_FORMATS,
      useClass: CustomDateFormat,
    },
  ]
})
export class DatePickerFormatDirective {
  @Input() public configDateParse: DateParse;
  @Input() public configDateDisplay: DateDisplay;

  @Input('coreDatePickerFormat')
  set coreDatePickerFormat(format: string) {
    this.format = format;
    if (this.configDateParse) {
      this.matDateFormat.updateDateFormat(this.configDateParse, this.configDateDisplay);
    } else {
      this.matDateFormat.updateDateFormat({dateInput: format});
    }
  }

  public format: string;

  constructor(
    @Inject(MAT_DATE_FORMATS) public matDateFormat: CustomDateFormat,
  ) {
  }
}
