import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TimePickerComponent} from './time-picker/time-picker.component';
import {TimePickerForDirective} from './time-picker-for.directive';
import {MaterialModule} from '../material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import { DatePickerFormatDirective } from './date-picker-format.directive';
import {DateTimePickerForDirective} from './date-time-picker-for.directive';

@NgModule({
  declarations: [
    TimePickerComponent,
    TimePickerForDirective,
    DateTimePickerForDirective,
    DatePickerFormatDirective,
  ],
  exports: [
    TimePickerForDirective,
    DateTimePickerForDirective,
    DatePickerFormatDirective,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule,
  ]
})
export class CustomDatePickerModule {
}
