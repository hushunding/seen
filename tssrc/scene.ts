// ## Scene
// ------------------

// A `Scene` is the main object for a view of a scene.
import { Model } from "./model";
import { Camera, Viewports, Viewport } from "./camera";
import { Matrix } from "./matrix";
import { Shaders, Shader } from "./shaders";
import { Light } from "./light";
import { Transformable } from "./transformable";
import { Shape, Surface } from "./surface";

export class Scene {
  public shader: Shader;
  public viewport: Viewport;
  public camera: Camera;
  public cullBackfaces: boolean;
  public fractionalPoints: boolean;
  public cache: boolean;
  public model: Model;

  // The root model for the scene, which contains `Shape`s, `Light`s, and
  // other `Model`s


  // The `Camera`, which defines the projection transformation. The default
  // projection is perspective.


  // The `Viewport`, which defines the projection from shape-space to
  // projection-space then to screen-space. The default viewport is on a
  // space from (0,0,0) to (1,1,1). To map more naturally to pixels, create a
  // viewport with the same width/height as the DOM element.


  // The scene's shader determines which lighting model is used.


  // The `cullBackfaces` boolean can be used to turn off backface-culling
  // for the whole scene. Beware, turning this off can slow down a scene's
  // rendering by a factor of 2. You can also turn off backface-culling for
  // individual surfaces with a boolean on those objects.


  // The `fractionalPoints` boolean determines if we round the surface
  // coordinates to the nearest integer. Rounding the coordinates before
  // display speeds up path drawing  especially when using an SVG context
  // since it cuts down on the length of path data. Anecdotally, my speedup
  // on a complex demo scene was 10 FPS. However, it does introduce a slight
  // jittering effect when animating.


  // The `cache` boolean (default : true) enables a simple cache for
  // renderModels, which are generated for each surface in the scene. The
  // cache is a simple Object keyed by the surface's unique id. The cache has
  // no eviction policy. To flush the cache, call `.flushCache()`



  constructor({ model = new Model(),
    camera = new Camera(),
    viewport = Viewports.origin(1, 1),
    shader = Shaders.phong(),
    cullBackfaces = true,
    fractionalPoints = false,
    cache = true }) {

    this.model = model;
    this.camera = camera;
    this.viewport = viewport;
    this.shader = shader;
    this.cullBackfaces = cullBackfaces;
    this.fractionalPoints = fractionalPoints;
    this.cache = cache;
    this._renderModelCache = {}
  }
  // The primary method that produces the render models, which are then used
  // by the `RenderContext` to paint the scene.
  public render() {
    // Compute the projection matrix including the viewport and camera
    // transformation matrices.
    const projection = this.camera.m.copy()
      .multiply(this.viewport.prescale)
      .multiply(this.camera.projection);
    const viewport = this.viewport.postscale;

    const renderModels = [];
    this.model.eachRenderable(
      (light: Light, transform: Transformable) => {
        // Compute light model data.
        new LightRenderModel(light, transform)
      },
      (shape: Shape, lights: Light[], transform: Transformable) => {
        for (const surface of shape.surfaces) {
          // Compute transformed and projected geometry.
          const renderModel = this._renderSurface(surface, transform, projection, viewport);

          // Test projected normal's z-coordinate for culling (if enabled).
          if (!this.cullBackfaces || !surface.cullBackfaces || renderModel.projected.normal.z < 0) and renderModel.inFrustrum
          // Render fill and stroke using material and shader.
          renderModel.fill = surface.fillMaterial.render(lights, this.shader, renderModel.transformed)
          renderModel.stroke = surface.strokeMaterial.render(lights, this.shader, renderModel.transformed)

          // Round coordinates (if enabled)
          if (!this.fractionalPoints) {
            for (const p of renderModel.projected.points) {
              p.round();
            }
          }

          renderModels.push(renderModel);
        }
      });

    // Sort render models by projected z coordinate. This ensures that the surfaces
    // farthest from the eye are painted first. (Painter's Algorithm)
    renderModels.sort((a, b) => b.projected.barycenter.z - a.projected.barycenter.z);
    return renderModels;
  }
  // Get or create the rendermodel for the given surface. If `this.cache` is true, we cache these models
  // to reduce object creation and recomputation.
  public _renderSurface(surface: Surface, transform: Transformable, projection, viewport: Viewport) {
    if (!this.cache) {
      return new RenderModel(surface, transform, projection, viewport);
    }

    const renderModel = this._renderModelCache[surface.id];
    if (renderModel == null) {
      renderModel = this._renderModelCache[surface.id] = new RenderModel(surface, transform, projection, viewport);
    } else {
      renderModel.update(transform, projection, viewport);
    }
    return renderModel;
  }
  // Removes all elements from the cache. This may be necessary if you add and
  // remove many shapes from the scene's models since this cache has no
  // eviction policy.
  public flushCache() {
    this._renderModelCache = {};
  }
}
