import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef, Inject,
  Injectable,
  InjectionToken,
  Injector
} from '@angular/core';
import {ComponentPortal} from '@angular/cdk/portal';
import {OverlayRef} from '@angular/cdk/overlay/overlay-ref';
import {Overlay, OverlayConfig} from '@angular/cdk/overlay';
import {DOCUMENT} from '@angular/common';

export const TIME_PICKER_FOR = new InjectionToken<{}>('TIME_PICKER_FOR');

@Injectable({
  providedIn: 'root'
})
export class DomService {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private overlay: Overlay,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
  ) {
  }

  private _createInjector(useValue): Injector {
    return Injector.create({
      providers: [{provide: TIME_PICKER_FOR, useValue}]
    });
  }

  createOverlay(component: any, config: OverlayConfig, componentProps?: object): OverlayRef {
    const overlayRef = this.overlay.create(config);
    const timePickerComponent = new ComponentPortal(component, null, this._createInjector(componentProps));
    overlayRef.attach(timePickerComponent);
    return overlayRef;
  }

  createComponent(
    component: any,
    appendTo: Element,
    componentProps: {},
    wrapperClass: string
  ): ComponentRef<unknown> {
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this._createInjector(componentProps));

    this.appRef.attachView(componentRef.hostView);

    // 3. Get DOM element from component
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    // 4. Append DOM element to the body
    if (wrapperClass) {
      const hasWrapper = appendTo.querySelector(`.${wrapperClass}`);
      if (!hasWrapper) {
        const divTag = this.document.createElement('div');
        divTag.className = wrapperClass;
        appendTo.appendChild(divTag);
      }

      appendTo = appendTo.querySelector(`.${wrapperClass}`);
    }

    appendTo.appendChild(domElem);

    return componentRef;
  }

  detachComponent(componentRef: ComponentRef<unknown>): void {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }
}
