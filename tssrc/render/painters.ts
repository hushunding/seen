
// ## Painters
// #### Surface painters
// ------------------

// Each `Painter` overrides the paint method. It uses the supplied
// `RenderLayerContext`'s builders to create and style the geometry on screen.
import { RenderLayerContext } from "./context";

export abstract class Painter {
  public abstract paint (renderModel, context: RenderLayerContext);
}
export class PathPainter extends Painter{
  public paint(renderModel, context: RenderLayerContext) {
    const painter = context.path().path(renderModel.projected.points)

    if (renderModel.fill != null){
      painter.fill({
        'fill'         : renderModel.fill.hex(),
        'fill-opacity' : (renderModel.fill.a == null) ? 1.0 : (renderModel.fill.a / 255.0),
      })
    }

    if (renderModel.stroke != null){
      painter.draw({
        'fill'           : 'none',
        'stroke'         : renderModel.stroke.hex(),
        'stroke-width' :  renderModel.surface['stroke-width'] != null ? renderModel.surface['stroke-width']:1
      })
    }
}
  }
export class TextPainter extends Painter{
  public paint (renderModel, context: RenderLayerContext) {
    const style = {
      'fill'          : renderModel.fill == null ? 'none':renderModel.fill.hex(),
      'font'          : renderModel.surface.font,
      'text-anchor' : renderModel.surface.anchor == null ? 'middle':renderModel.surface.anchor
    }
 
    const xform = Affine.solveForAffineTransform(renderModel.projected.points)
    context.text().fillText(xform, renderModel.surface.text, style)
    }
}
export let Painters = {
  path : new PathPainter(),
  text : new TextPainter()
}
