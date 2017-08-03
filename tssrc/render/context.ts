// ## Render Contexts
// ------------------

// The `RenderContext` uses `RenderModel`s produced by the scene's render method to paint the shapes into an HTML element.
// Since we support both SVG and Canvas painters, the `RenderContext` and `RenderLayerContext` define a common interface.
import { RenderAnimator } from "../animator";
import { Util } from "../util";
import { CanvasRenderContext } from "./canvas";

export interface IRenderContextLayer {

  context: RenderContext;
}
export class RenderContext {
  public layers: IRenderContextLayer[];
  constructor() {
    this.layers = []
  }
  public render() {
    this.reset()
    for (const layer of this.layers) {
      layer.context.reset()
      layer.layer.render(layer.context)
      layer.context.cleanup()
    }
    this.cleanup();
    return this;
  }

  // Returns a new `Animator` with this context's render method pre-registered.
  public animate() {
    return new RenderAnimator(this);
  }

  // Add a new `RenderLayerContext` to this context. This allows us to easily stack paintable components such as
  // a fill backdrop, or even multiple scenes in one context.
  public layer(layer) {
    this.layers.push({
      layer: layer,
      context: this
    });
    return this;
  }

  public sceneLayer(scene) {
    this.layer(new SceneLayer(scene));
    return this;
  }

  public reset() {}
  public cleanup() {}
}
// The `RenderLayerContext` defines the interface for producing painters that can paint various things into the current layer.
export class RenderLayerContext {
  public path() {} // Return a path painter
  public rect() {} // Return a rect painter
  public circle() {} // Return a circle painter
  public text() {} // Return a text painter

  public reset() {}
  public cleanup() {}
}
// Create a render context for the element with the specified `elementId`. elementId
// should correspond to either an SVG or Canvas element.
export let Context = (elementId: string, scene = null) {
  const ref = Util.element(elementId);
  const tag = ref != null ? ref.tagName.toUpperCase() : "";
  let context: (CanvasRenderContext|null) = null;
  switch (tag) {
    case 'SVG':
    case 'G':
      context = new SvgRenderContext(elementId);
      break;
    case 'CANVAS':
      context = new CanvasRenderContext(elementId);
  }
  if (context != null && scene != null) {
    context.sceneLayer(scene);
  }

  return context;
};