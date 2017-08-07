// ## Layers
// ------------------

import { IRenderLayerContext, RenderContext } from "./context";
import { Scene } from "../scene";

export abstract class RenderLayer {
  public abstract render(context: IRenderLayerContext | RenderContext): any;
}

export class SceneLayer extends RenderLayer {
  constructor(public scene: Scene) {
    super();
  }

  public render(context: IRenderLayerContext) {
    for (const renderModel of this.scene.render()) {
      renderModel.surface.painter.paint(renderModel, context);
    }
  }
}
export class FillLayer extends RenderLayer {
  constructor(public width = 500, public height = 500, public fill = '#EEE') {
    super();
  }

  public render(context: IRenderLayerContext) {
    context.rect()
      .rect(this.width, this.height)
      .fill({ fill: this.fill });
  }
}
