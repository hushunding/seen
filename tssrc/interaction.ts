// ## Interaction
// #### Mouse drag and zoom
// ------------------

// A global window event dispatcher. Attaches listeners only if window is defined.
import { Util } from "./util";
import { Events, Events$Dispatcher, OnDispatcher } from "./events";

export let WindowEvents = (() => {
  const dispatch = Events.dispatch(
    'mouseMove',
    'mouseDown',
    'mouseUp',
    'touchStart',
    'touchMove',
    'touchEnd',
    'touchCancel',
  );

  if (typeof window !== "undefined" && window !== null) {
    window.addEventListener('mouseup', dispatch.mouseUp, true);
    window.addEventListener('mousedown', dispatch.mouseDown, true);
    window.addEventListener('mousemove', dispatch.mouseMove, true);
    window.addEventListener('touchstart', dispatch.touchStart, true);
    window.addEventListener('touchmove', dispatch.touchMove, true);
    window.addEventListener('touchend', dispatch.touchEnd, true);
    window.addEventListener('touchcancel', dispatch.touchCancel, true);
  }
  return { on: dispatch.on };
})();

// An event dispatcher for mouse and drag events on a single dom element. The
// available events are `'dragStart', 'drag', 'dragEnd', 'mouseMove',
// 'mouseDown', 'mouseUp', 'mouseWheel'`
export class MouseEvents {
  public on: OnDispatcher;
  public el: HTMLElement;
  private _mouseDown: boolean;
  public dispatch: Events$Dispatcher;
  private _uid: string;
  constructor(el: string | HTMLElement, options = {}) {
    // Util.defaults(this., options, this.defaults)

    this.el = Util.element(el);

    this._uid = Util.uniqueId('mouser-');

    this.dispatch = Events.dispatch(
      'dragStart',
      'drag',
      'dragEnd',
      'mouseMove',
      'mouseDown',
      'mouseUp',
      'mouseWheel');
    this.on = this.dispatch.on;

    this._mouseDown = false;
    this.attach();
  }
  // Attaches listeners to the element
  public attach() {
    this.el.addEventListener('touchstart', this._onMouseDown);
    this.el.addEventListener('mousedown', this._onMouseDown);
    this.el.addEventListener('mousewheel', this._onMouseWheel);
  }
  // Dettaches listeners to the element
  public detach() {
    this.el.removeEventListener('touchstart', this._onMouseDown);
    this.el.removeEventListener('mousedown', this._onMouseDown);
    this.el.removeEventListener('mousewheel', this._onMouseWheel);
  }
  private _onMouseMove(e: MouseEvent & TouchEvent) {
    this.dispatch.mouseMove(e);
    e.preventDefault();
    e.stopPropagation();
    if (this._mouseDown) {
      this.dispatch.drag(e);
    }
  }
  private _onMouseDown(e: MouseEvent & TouchEvent) {
    this._mouseDown = true;
    WindowEvents.on(`mouseUp.${this._uid}`, this._onMouseUp);
    WindowEvents.on(`mouseMove.${this._uid}`, this._onMouseMove);
    WindowEvents.on(`touchEnd.${this._uid}`, this._onMouseUp);
    WindowEvents.on(`touchCancel.${this._uid}`, this._onMouseUp);
    WindowEvents.on(`touchMove.${this._uid}`, this._onMouseMove);
    this.dispatch.mouseDown(e);
    this.dispatch.dragStart(e);
  }
  private _onMouseUp(e: MouseEvent & TouchEvent) {
    this._mouseDown = false;
    WindowEvents.on(`mouseUp.${this._uid}`, null);
    WindowEvents.on(`mouseMove.${this._uid}`, null);
    WindowEvents.on(`touchEnd.${this._uid}`, null);
    WindowEvents.on(`touchCancel.${this._uid}`, null);
    WindowEvents.on(`touchMove.${this._uid}`, null);
    this.dispatch.mouseUp(e);
    this.dispatch.dragEnd(e);
  }
  private _onMouseWheel(e: MouseEvent & TouchEvent) {
    this.dispatch.mouseWheel(e);
  }
}
// A export class for computing mouse interia for interial scrolling
export class InertialMouse {
  public y: number;
  public x: number;
  public lastUpdate: Date;
  public xy: number[];
  public static readonly inertiaExtinction = 0.1;
  public static readonly smoothingTimeout = 300;
  public static readonly inertiaMsecDelay = 30;

  constructor() {
    this.reset();
  }
  public get() {
    const scale = 1000 / InertialMouse.inertiaMsecDelay;
    return [this.x * scale, this.y * scale];
  }
  public reset() {
    this.xy = [0, 0];
    return this;
  }

  public update(xy: number[]) {
    if (this.lastUpdate != null) {
      const msec = new Date().getTime() - this.lastUpdate.getTime(); // # Time passed
      xy = xy.map((x: number) => x / Math.max(msec, 1)); // # Pixels per milliseconds
      const t = Math.min(1, msec / InertialMouse.smoothingTimeout); // # Interpolation based on time between measurements
      this.x = t * xy[0] + (1.0 - t) * this.x;
      this.y = t * xy[1] + (1.0 - t) * this.y;
    } else {
      [this.x, this.y] = xy;
    }

    this.lastUpdate = new Date();
    return this;
  }
  // Apply damping to slow the motion once the user has stopped dragging.
  public damp() {
    this.x *= (1.0 - InertialMouse.inertiaExtinction);
    this.y *= (1.0 - InertialMouse.inertiaExtinction);
    return this;
  }
}
// Adds simple mouse drag eventing to a DOM element. A 'drag' event is emitted
// as the user is dragging their mouse. This is the easiest way to add mouse-
// look or mouse-rotate to a scene.
interface IdragState { dragging: boolean; origin: number[]; last: number[]; inertia: InertialMouse; }
export class Drag {
  public on: OnDispatcher;
  public dispatch: Events$Dispatcher;
  private _dragState: IdragState;
  private _inertiaRunning: boolean;
  private _uid: string;
  public el: HTMLElement;
  public inertia = false;

  public constructor(el: string | HTMLElement, { inertia = false }) {
    this.inertia = inertia;
    this.el = Util.element(el);
    this._uid = Util.uniqueId('dragger-');

    this._inertiaRunning = false;
    this._dragState = {
      dragging: false,
      origin: [],
      last: [],
      inertia: new InertialMouse(),
    };

    this.dispatch = Events.dispatch('drag', 'dragStart', 'dragEnd', 'dragEndInertia');
    this.on = this.dispatch.on;

    const mouser = new MouseEvents(this.el);
    mouser.on(`dragStart.${this._uid}`, this._onDragStart);
    mouser.on(`dragEnd.${this._uid}`, this._onDragEnd);
    mouser.on(`drag.${this._uid}`, this._onDrag);
  }
  private _getPageCoords(e: MouseEvent & TouchEvent) {
    if (e.touches != null && e.touches.length > 0) {
      return [e.touches[0].pageX, e.touches[0].pageY];
    } else if (e.changedTouches != null && e.changedTouches.length > 0) {
      return [e.changedTouches[0].pageX, e.changedTouches[0].pageY];
    } else {
      return [e.pageX, e.pageY];
    }
  }
  private _onDragStart(e: MouseEvent & TouchEvent) {
    this._stopInertia();
    this._dragState.dragging = true;
    this._dragState.origin = this._getPageCoords(e);
    this._dragState.last = this._getPageCoords(e);
    this.dispatch.dragStart(e);
  }
  private _onDragEnd(e: MouseEvent & TouchEvent) {
    this._dragState.dragging = false;

    if (this.inertia) {
      const page = this._getPageCoords(e);
      const dragEvent = {
        offset: [page[0] - this._dragState.origin[0], page[1] - this._dragState.origin[1]],
        offsetRelative: [page[0] - this._dragState.last[0], page[1] - this._dragState.last[1]],
      };
      this._dragState.inertia.update(dragEvent.offsetRelative);
      this._startInertia();

      this.dispatch.dragEnd(e);
    }
  }
  private _onDrag(e: MouseEvent & TouchEvent) {
    const page = this._getPageCoords(e);

    const dragEvent = {
      offset: [page[0] - this._dragState.origin[0], page[1] - this._dragState.origin[1]],
      offsetRelative: [page[0] - this._dragState.last[0], page[1] - this._dragState.last[1]],
    };
    this.dispatch.drag(dragEvent);

    if (this.inertia) {
      this._dragState.inertia.update(dragEvent.offsetRelative);
    }
    this._dragState.last = page;
  }
  private _onInertia() {
    if (!this._inertiaRunning) {
      return;
    }

    // Apply damping and get x,y intertia values
    const intertia = this._dragState.inertia.damp().get();

    if (Math.abs(intertia[0]) < 1 && Math.abs(intertia[1]) < 1) {
      this._stopInertia();
      this.dispatch.dragEndInertia();
      return;
    }

    this.dispatch.drag({
      offset: [this._dragState.last[0] - this._dragState.origin[0], this._dragState.last[0] - this._dragState.origin[1]],
      offsetRelative: intertia,
    });
    this._dragState.last = [this._dragState.last[0] + intertia[0], this._dragState.last[1] + intertia[1]];

    this._startInertia();
  }
  private _startInertia() {
    this._inertiaRunning = true;
    setTimeout(this._onInertia, InertialMouse.inertiaMsecDelay);
  }

  private _stopInertia() {
    this._dragState.inertia.reset();
    this._inertiaRunning = false;
  }
}
// Adds simple mouse wheel eventing to a DOM element. A 'zoom' event is emitted
// as the user is scrolls their mouse wheel.
export class Zoom {
  public speed = 0.25;
  public on: OnDispatcher;
  public dispatch: Events$Dispatcher;
  private _uid: string;
  public el: HTMLElement;

  constructor(el: string | HTMLElement, { speed = 0.25 }) {
    this.speed = speed;
    this.el = Util.element(el);
    this._uid = Util.uniqueId('zoomer-');
    this.dispatch = Events.dispatch('zoom');
    this.on = this.dispatch.on;

    const mouser = new MouseEvents(this.el);
    mouser.on(`mouseWheel.${this._uid}`, this._onMouseWheel);
  }
  private _onMouseWheel(e: MouseWheelEvent) {
    // This prevents the page from scrolling when we mousewheel the element
    e.preventDefault();

    const sign = e.wheelDelta / Math.abs(e.wheelDelta);
    const zoomFactor = Math.abs(e.wheelDelta) / 120 * this.speed;
    const zoom = Math.pow(2, sign * zoomFactor);

    this.dispatch.zoom({ zoom });
  }
}
