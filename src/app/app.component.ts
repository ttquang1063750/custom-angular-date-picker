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

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      date: new FormControl((new Date()).toISOString()),
      date1: new FormControl(new Date()),
      date2: new FormControl(Date.now()),
      date3: new FormControl(moment()),
      range: new FormGroup({
        start: new FormControl(Date.now()),
        end: new FormControl(Date.now())
      })
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
