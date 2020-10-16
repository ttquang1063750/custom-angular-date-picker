import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TimePickerComponent} from './time-picker/time-picker.component';
import {TimePickerForDirective} from './time-picker-for.directive';
import {MaterialModule} from '../material.module';
import {ReactiveFormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import { DatePickerFormatDirective } from './date-picker-format.directive';


@NgModule({
  declarations: [
    TimePickerComponent,
    TimePickerForDirective,
    DatePickerFormatDirective
  ],
  exports: [
    TimePickerForDirective,
    DatePickerFormatDirective,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule,
  ]
})
export class CustomDatePickerModule {
}
