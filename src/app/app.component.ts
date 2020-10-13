import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  form: FormGroup;
  date = new FormControl((new Date()).toISOString());

  constructor(private fb: FormBuilder) {
    const date = new Date();
    this.form = this.fb.group({
      date1: new FormControl(null),
      date2: new FormControl(null),
      date3: new FormControl(null),
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    const value = this.form.value;
    // const date: moment.Moment = value.date;
    console.log(this);
    console.log(value);
  }
}
