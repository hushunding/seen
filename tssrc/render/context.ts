// ## Render Contexts
// ------------------

// The `RenderContext` uses `RenderModel`s produced by the scene's render method to paint the shapes into an HTML element.
// Since we support both SVG and Canvas painters, the `RenderContext` and `RenderLayerContext` define a common interface.
import { RenderAnimator } from "../animator";
import { Util } from "../util";
import { CanvasRenderContext } from "./canvas";
import { Point } from "../Point";
import { RenderLayer, SceneLayer } from "./layers";
import { IDrawStlyle, IFillStlyle, ITextStlyle } from "./styler";
import { Scene } from "../scene";

export interface IRenderContextLayer {
  layer: RenderLayer;
  context: RenderContext | IRenderLayerContext;
}
export abstract class RenderContext {
  public layers: IRenderContextLayer[];
  constructor() {
    this.layers = [];
  }
  public render() {
    this.reset();
    for (const layer of this.layers) {
      layer.context.reset();
      layer.layer.render(layer.context);
      layer.context.cleanup();
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
  public layer(layer: RenderLayer) {
    this.layers.push({
      layer,
      context: this,
    });
    return this;
  }

  public sceneLayer(scene: Scene) {
    this.layer(new SceneLayer(scene));
    return this;
  }

  // tslint:disable-next-line:no-empty
  public reset() {}
  // tslint:disable-next-line:no-empty
  public cleanup() {}
}

export interface IRenderContextStyler {
  draw(style: IDrawStlyle): IRenderContextStyler;
  fill(style: IFillStlyle): IRenderContextStyler;
}
export interface IpathPainter {
  path(points: Point[]): IpathPainter  & IRenderContextStyler;
}
export interface IrectPainter {
  rect(width: number, height: number): IrectPainter & IRenderContextStyler;
}
export interface IcirclePainter {
  circle(center: Point, radius: number): IcirclePainter & IRenderContextStyler;
}
export interface ItextPainter {
  fillText(m: number[], text: string, style: ITextStlyle): ItextPainter;
}

// The `RenderLayerContext` defines the interface for producing painters that can paint various things into the current layer.
export interface IRenderLayerContext {
  path(): (IpathPainter & IRenderContextStyler); // Return a path painter
  rect(): (IrectPainter & IRenderContextStyler); // Return a rect painter
  circle(): (IcirclePainter & IRenderContextStyler); // Return a circle painter
  text(): ItextPainter; // Return a text painter

  reset(): void;
  cleanup(): void;
}
// Create a render context for the element with the specified `elementId`. elementId
// should correspond to either an SVG or Canvas element.
export let Context = (elementId: string, scene: Scene = null) => {
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
