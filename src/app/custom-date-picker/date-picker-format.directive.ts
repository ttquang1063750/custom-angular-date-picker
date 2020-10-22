import {Directive, Inject, Input, Optional} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {CustomDatePickerAdapter} from './custom-date-picker.adapter';
import {CustomDateFormat, DateDisplay, DateParse} from './custom-date-format';
import {NgControl} from '@angular/forms';

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
    if (this.configDateParse) {
      this.customDateFormat.updateDateFormat(this.configDateParse, this.configDateDisplay);
    } else {
      this.customDateFormat.updateDateFormat({dateInput: format});
    }

    const value = this.ngControl.value;
    this.ngControl.valueAccessor.writeValue(value);
  }

  constructor(
    @Inject(MAT_DATE_FORMATS) public customDateFormat: CustomDateFormat,
    @Optional() private ngControl: NgControl,
  ) {
  }
}
