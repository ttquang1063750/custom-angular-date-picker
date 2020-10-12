import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  InjectionToken,
  Injector
} from '@angular/core';
import {ComponentPortal, PortalInjector} from '@angular/cdk/portal';
import {OverlayRef} from '@angular/cdk/overlay/overlay-ref';
import {Overlay, OverlayConfig} from '@angular/cdk/overlay';
export const TIME_PICKER_FOR = new InjectionToken<{}>('TIME_PICKER_FOR');

@Injectable({
  providedIn: 'root'
})
export class DomService {

  constructor(
    private overlay: Overlay,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {
  }

  private _createInjector(dataToPass): PortalInjector {
    const injectorTokens = new WeakMap();
    injectorTokens.set(TIME_PICKER_FOR, dataToPass);
    return new PortalInjector(this.injector, injectorTokens);
  }

  createOverlay(component: any, config: OverlayConfig, componentProps?: object): OverlayRef {
    const overlayRef = this.overlay.create(config);
    const timePickerComponent = new ComponentPortal(component, null, this._createInjector(componentProps));
    overlayRef.attach(timePickerComponent);
    return overlayRef;
  }

  createComponent(component: any, appendTo: Element, componentProps?: object): ComponentRef<unknown> {
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this._createInjector(componentProps));

    this.appRef.attachView(componentRef.hostView);

    // 3. Get DOM element from component
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    // 4. Append DOM element to the body
    appendTo.appendChild(domElem);

    return componentRef;
  }

  detachComponent(componentRef: ComponentRef<unknown>): void {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }
}
