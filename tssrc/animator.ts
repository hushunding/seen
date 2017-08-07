// ## Animator
// ------------------

// Polyfill requestAnimationFrame
import { Events, OnDispatcher, Events$Dispatcher } from "./events";
import { Util } from "./util";
import { RenderContext } from "./render/context";

// tslint:disable-next-line:interface-name
interface Window {
  mozRequestAnimationFrame(callback: FrameRequestCallback): number;
  msRequestAnimationFrame(callback: FrameRequestCallback): number;
}

let requestAnimationFrame: (callback: FrameRequestCallback) => number;
if (typeof window !== "undefined" && window !== null) {
  requestAnimationFrame =
    window.requestAnimationFrame != null ? window.requestAnimationFrame :
      window.mozRequestAnimationFrame != null ? window.mozRequestAnimationFrame :
        window.webkitRequestAnimationFrame != null ? window.webkitRequestAnimationFrame :
          window.msRequestAnimationFrame;
}
export type FrameHandler = (t: number, td: number) => void;
const DEFAULT_FRAME_DELAY = 30; // msec

// The animator class is useful for creating an animation loop. We supply pre
// and post events for apply animation changes between frames.
export class Animator {
  private _lastTimestamp: number;
  private _msecDelay: number;
  private _timestamp: number;
  private _delayCompensation: number;
  private _lastTime: number;
  public frameDelay: number;
  public timestamp: number;
  public on: OnDispatcher;
  public dispatch: Events$Dispatcher;
  private _running: boolean;
  public constructor() {
    this.dispatch = Events.dispatch('beforeFrame', 'afterFrame', 'frame');
    this.on = this.dispatch.on;
    this.timestamp = 0;
    this._running = false;
    this._msecDelay = 0;
    this.frameDelay = 0;
    this._timestamp = 0;
    this._lastTimestamp = 0;

  }
  // Start the animation loop.
  public start() {
    this._running = true;

    if (this.frameDelay !== 0) {
      this._lastTime = new Date().valueOf();
      this._delayCompensation = 0;
    }

    this.animateFrame();
    return this;
  }
  // Stop the animation loop.
  public stop() {
    this._running = false;
    return this;
  }
  // Use requestAnimationFrame if available and we have no explicit frameDelay.
  // Otherwise, use a delay-compensated timeout.
  public animateFrame() {
    if (requestAnimationFrame != null && this.frameDelay !== 0) {
      requestAnimationFrame(this.frame);
    } else {
      // Perform frame delay compensation to make sure each frame is rendered at
      // the right time. This makes some animations more consistent
      const delta = new Date().valueOf() - this._lastTime;
      this._lastTime += delta;
      this._delayCompensation += delta;

      const frameDelay = this.frameDelay != null ? this.frameDelay : DEFAULT_FRAME_DELAY;
      setTimeout(this.frame, frameDelay - this._delayCompensation);
    }
    return this;
  }
  // The main animation frame method

  public frame(t: number) {
    if (!this._running) {
      return;
    }

    // create timestamp param even if requestAnimationFrame isn't available
    this._timestamp = t != null ? t : (this._timestamp + (this._msecDelay !== 0 ? this._msecDelay : DEFAULT_FRAME_DELAY));
    const deltaTimestamp = this._lastTimestamp !== 0 ? this._timestamp - this._lastTimestamp : this._timestamp;

    this.dispatch.beforeFrame(this._timestamp, deltaTimestamp);
    this.dispatch.frame(this._timestamp, deltaTimestamp);
    this.dispatch.afterFrame(this._timestamp, deltaTimestamp);

    this._lastTimestamp = this._timestamp;

    this.animateFrame();
    return this;
  }
  // Add a callback that will be invoked before the frame
  public onBefore(handler: FrameHandler) {
    this.on(`beforeFrame.${Util.uniqueId('animator-')}`, handler);
    return this;
  }
  // Add a callback that will be invoked after the frame
  public onAfter(handler: FrameHandler) {
    this.on(`afterFrame.${Util.uniqueId('animator-')}`, handler);
    return this;
  }
  // Add a frame callback
  public onFrame(handler: FrameHandler) {
    this.on(`frame.${Util.uniqueId('animator-')}`, handler);
    return this;
  }
}
// A Animator for rendering the Context
export class RenderAnimator extends Animator {
  constructor(context: RenderContext) {
    super();
    this.onFrame(context.render);
  }
}
// A transition object to manage to animation of shapes
class Transition {
  public tFrac: number;
  public t: number;
  public startT: number;
  public duration = 100; // The duration of this transition in msec

  constructor({ duration = 100 } = {}) {
    this.duration = duration;
  }
  public update(t: number) {
    // Setup the first frame before the tick increment
    if (this.t == null) {
      this.firstFrame();
      this.startT = t;
    }

    // Execute a tick and draw a frame
    this.t = t;
    this.tFrac = (this.t - this.startT) / this.duration;
    this.frame();

    // Cleanup or update on last frame after tick
    if (this.tFrac >= 1.0) {
      this.lastFrame();
      return false;
    }

    return true;
  }
  // tslint:disable-next-line:no-empty
  private firstFrame() { }
  // tslint:disable-next-line:no-empty
  private frame() { }
  // tslint:disable-next-line:no-empty
  private lastFrame() { }
}
// A Animator for updating Transtions. We include keyframing to make
// sure we wait for one transition to finish before starting the next one.
class TransitionAnimator extends Animator {
  public transitions: any[];
  public queue: any[];
  constructor() {
    super();
    this.queue = [];
    this.transitions = [];
    this.onFrame(this.update);
  }
  // Adds a transition object to the current set of transitions. Note that
  // transitions will not start until they have been enqueued by invoking
  // `keyframe()` on this object.
  public add(txn: Transition) {
    this.transitions.push(txn);
  }
  // Enqueues the current set of transitions into the keyframe queue and sets
  // up a new set of transitions.
  public keyframe() {
    this.queue.push(this.transitions);
    this.transitions = [];
  }
  // When this animator updates, it invokes `update()` on all of the
  // currently animating transitions. If any of the current transitions are
  // not done, we re-enqueue them at the front. If all transitions are
  // complete, we will start animating the next set of transitions from the
  // keyframe queue on the next update.
  public update(t: number) {
    if (this.queue.length === 0) {
      return;
    }
    let transitions = this.queue.shift();
    transitions = transitions.filter((transition: Transition) => transition.update(t));
    if (transitions.length > 0) {
      this.queue.unshift(transitions);
    }

  }
}
