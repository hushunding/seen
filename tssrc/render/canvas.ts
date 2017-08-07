// ## HTML5 Canvas Context
// ------------------
import { Point } from "../Point";
import { Util } from "../util";
import { RenderContext, IRenderContextLayer, IRenderLayerContext, IpathPainter, IrectPainter, IcirclePainter, ItextPainter, IRenderContextStyler} from "./context";
import { IFillStlyle, IDrawStlyle, ITextStlyle } from "./styler";
import { Scene } from "../scene";
import { RenderLayer } from "./layers";

export class CanvasStyler implements IRenderContextStyler {
  constructor(public ctx: CanvasRenderingContext2D) { }
  public draw(style: IDrawStlyle = {}) {
    // Copy over SVG CSS attributes
    if (style.stroke != null) {
      this.ctx.strokeStyle = style.stroke;
    }
    if (style['stroke-width'] != null) {
      this.ctx.lineWidth = style['stroke-width'];
    }
    if (style['text-anchor'] != null) {
      this.ctx.textAlign = style['text-anchor'];
    }

    this.ctx.stroke();
    return this;
  }
  public fill(style: IFillStlyle = {}) {
    // Copy over SVG CSS attributes
    if (style.fill != null) {
      this.ctx.fillStyle = style.fill;
    }
    if (style['text-anchor'] != null) {
      this.ctx.textAlign = style['text-anchor'];
    }
    if (style['fill-opacity'] != null) {
      this.ctx.globalAlpha = style['fill-opacity'];
    }

    this.ctx.fill();
    return this;
  }
}
export class CanvasPathPainter extends CanvasStyler implements IpathPainter {
  public path(points: Point[]) {
    this.ctx.beginPath();
    let i = 0;
    for (const p of points) {
      if (i === 0) {
        this.ctx.moveTo(p.x, p.y);
      } else {
        this.ctx.lineTo(p.x, p.y);
      }
      i++;
    }
    this.ctx.closePath();
    return this;
  }
}
export class CanvasRectPainter extends CanvasStyler implements IrectPainter {
  public rect(width: number, height: number) {
    this.ctx.rect(0, 0, width, height);
    return this;
  }
}
export class CanvasCirclePainter extends CanvasStyler implements IcirclePainter {
  public circle(center: Point, radius: number) {
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, true);
    return this;
    }
}

export class CanvasTextPainter implements ItextPainter {
  constructor(public ctx: CanvasRenderingContext2D) { }

  public fillText(m: number[], text: string, style: ITextStlyle = {}) {
    this.ctx.save();
    this.ctx.setTransform(m[0], m[3], -m[1], -m[4], m[2], m[5]);

    if (style.font != null) {
      this.ctx.font = style.font;
    }
    if (style.fill != null) {
      this.ctx.fillStyle = style.fill;
    }
    if (style['text-anchor'] != null) {
      this.ctx.textAlign = this._cssToCanvasAnchor(style['text-anchor']);
    }

    this.ctx.fillText(text, 0, 0);
    this.ctx.restore();
    return this;
  }
  public _cssToCanvasAnchor(anchor: string) {
    if (anchor === 'middle') {
      return 'center';
    }
    return anchor;
  }
}
export class CanvasLayerRenderContext implements IRenderLayerContext {
  public rectPainter: CanvasRectPainter;
  public textPainter: CanvasTextPainter;
  public ciclePainter: CanvasCirclePainter;
  public pathPainter: CanvasPathPainter;

  public constructor(public ctx: CanvasRenderingContext2D) {
    this.pathPainter = new CanvasPathPainter(this.ctx);
    this.ciclePainter = new CanvasCirclePainter(this.ctx);
    this.textPainter = new CanvasTextPainter(this.ctx);
    this.rectPainter = new CanvasRectPainter(this.ctx);
  }
  public path() { return this.pathPainter; }
  public rect() { return this.rectPainter; }
  public circle() { return this.ciclePainter; }
  public text() { return this.textPainter; }

  // tslint:disable-next-line:no-empty
  public reset() {}
  // tslint:disable-next-line:no-empty
  public cleanup() {}
}

export class CanvasRenderContext extends RenderContext {
  public ctx: CanvasRenderingContext2D;
  public el: HTMLCanvasElement;
  constructor(el: HTMLCanvasElement | string) {
    super();
    this.el = Util.element(el) as HTMLCanvasElement;
    this.ctx = this.el.getContext('2d');
  }
  public layer(layer: RenderLayer) {
    this.layers.push({
      layer,
      context: new CanvasLayerRenderContext(this.ctx),
    });
    return this;
  }
  public reset() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.el.width, this.el.height);
  }
}
export let CanvasContext = (elementId: string, scene: Scene = null) => {
  const context = new CanvasRenderContext(elementId);
  if (scene != null) {
    context.sceneLayer(scene);
  }
  return context;
};
