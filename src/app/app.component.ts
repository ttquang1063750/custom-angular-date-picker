import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
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
      dateNull: new FormControl(null, Validators.required),
      dateMoment: new FormControl(moment(), Validators.required),
      timePicker: new FormControl('jcadlcjlajcadCJA', Validators.required),
      range: new FormGroup({
        start: new FormControl(moment()),
        end: new FormControl(moment())
      })
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    console.log(this.form);
  }
}
