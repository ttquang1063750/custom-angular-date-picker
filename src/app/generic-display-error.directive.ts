import {AfterViewInit, Directive, HostListener, Inject, InjectionToken, Input, OnDestroy, OnInit, Optional} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {NgControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {MatError} from '@angular/material/form-field';

type ParamObject = { [key: string]: any };
type ErrorType = { [key: string]: (obj: ParamObject) => string };
export const FORM_CUSTOM_DISPLAY_ERRORS = new InjectionToken('FORM_CUSTOM_DISPLAY_ERRORS', {
  providedIn: 'root',
  factory: () => {
    const customErrors: ErrorType = {
      required: ({controlName}) => `This ${controlName} is required`,
      email: ({controlName}) => `This ${controlName} invalid email`,
      alreadyExists: ({controlName}) => `This ${controlName} already exists`,
      min: ({min, actual}) => `Expect a minimum value of ${min} but got ${actual}`,
      max: ({max, actual}) => `Expect a maximum value of ${max} but got ${actual}`,
      minlength: ({requiredLength, actualLength}) => `Expect a minimum of ${requiredLength} characters but got ${actualLength}`,
      maxlength: ({requiredLength, actualLength}) => `Expect a maximum of ${requiredLength} characters but got ${actualLength}`,
    };

    return customErrors;
  }
});
export function renderDefault({controlName, ...arg}) {
  return `
      The ${controlName} error with ${Object.keys(arg).map(k => k + ' is ' + arg[k]).join(' and ')}
      `;
}

@Directive({
  selector: '[coreGenericDisplayError]'
})
export class GenericDisplayErrorDirective implements OnInit, AfterViewInit, OnDestroy {
  @Input() customErrors: ParamObject;
  @Input('coreGenericDisplayError') for: MatError;

  stateChange: Subject<boolean> = new Subject<boolean>();
  destroy$: Subject<boolean> = new Subject<boolean>();

  @HostListener('blur') onBlur() {
    this.stateChange.next(true);
  }

  @HostListener('input') onInput() {
    this.stateChange.next(true);
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(FORM_CUSTOM_DISPLAY_ERRORS) private defaultCustomErrors: ErrorType,
    @Optional() private ngControl: NgControl,
  ) {
  }

  ngOnInit(): void {
    this.stateChange
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(150)
      )
      .subscribe(
        () => this.render()
      );
  }

  ngAfterViewInit(): void {
    this.stateChange.next(true);
  }

  render() {
    const element = this.document.getElementById(this.for.id);
    if (element) {
      const messages = this.handleError();
      element.innerHTML = messages.pop();
    }
  }

  handleError(): string[] {
    const messages: string[] = [];
    const controlErrors = this.ngControl.errors;
    const controlName = this.ngControl.name;
    if (controlErrors) {
      const keys = Object.keys(controlErrors);
      keys.forEach(key => {
        if (this.customErrors) {
          messages.push(this.customErrors[key]);
        } else {
          const o = this.toObject(key, controlErrors[key]);
          let fn = this.defaultCustomErrors[key];
          if (!fn) {
            fn = renderDefault;
          }

          messages.push(fn({controlName, ...o}));
        }
      });
    }
    return messages;
  }

  toObject(key: string, value: any) {
    if (typeof value !== 'object') {
      const o = {};
      o[key] = value;
      return o;
    }

    return value;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
