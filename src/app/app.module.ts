import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from './material.module';
import {CustomDatePickerModule} from './custom-date-picker/custom-date-picker.module';
import {GenericDisplayErrorDirective} from './generic-display-error.directive';

@NgModule({
  declarations: [
    AppComponent,
    GenericDisplayErrorDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    CustomDatePickerModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
