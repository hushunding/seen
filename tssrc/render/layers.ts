// ## Layers
// ------------------

import { RenderLayerContext } from "./context";

export abstract class RenderLayer {
  public abstract render(context: RenderLayerContext);
}
export class SceneLayer extends RenderLayer {
  constructor(public scene) {
    super()
  }

  public render(context: RenderLayerContext) {
    for (const renderModel of this.scene.render()) {
      renderModel.surface.painter.paint(renderModel, context)
    }
  }
}
export class FillLayer extends RenderLayer {
  constructor(public width = 500, public height = 500, public fill = '#EEE') {
    super()
  }

  public render(context) {
    context.rect()
      .rect(this.width, this.height)
      .fill({ fill: this.fill })
  }
}
