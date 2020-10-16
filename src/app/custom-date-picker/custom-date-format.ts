export interface DateParse { dateInput: string; }
export type DateDisplay = DateParse & {
  monthYearLabel?: string,
  dateA11yLabel?: string,
  monthYearA11yLabel?: string,
};
export class CustomDateFormat {
  private _parse: DateParse = {
    dateInput: 'YYYY/MM/DD'
  };
  private _display: DateDisplay = {
    dateInput: 'YYYY/MM/DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMM YYYY'
  };

  set parse(parse: DateParse) {
    this._parse = Object.assign({}, this._parse, parse);
  }

  get parse(): DateParse {
    return this._parse;
  }

  set display(display: DateDisplay) {
    this._display = Object.assign({}, this._display, display);
  }

  get display(): DateDisplay {
    return this._display;
  }

  updateDateFormat(parse: DateParse, display?: DateDisplay) {
    this.parse = parse;
    if (!display) {
      display = parse;
    }
    this.display = display;
  }
}
