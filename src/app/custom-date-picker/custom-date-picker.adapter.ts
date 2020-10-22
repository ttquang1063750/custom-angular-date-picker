import {Injectable} from '@angular/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import * as moment from 'moment';

@Injectable()
export class CustomDatePickerAdapter extends MomentDateAdapter {

  constructor() {
    super(moment.locale());
  }

  sameDate(first: moment.Moment | null, second: moment.Moment | null): boolean {
    if (first && second) {
      return first.isSame(second);
    }
    return first === second;
  }
}
