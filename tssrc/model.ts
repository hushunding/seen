// ## Models
// ------------------

// The object model class. It stores `Shapes`, `Lights`, and other `Models` as
// well as a transformation matrix.
//
// Notably, models are hierarchical, like a tree. This means you can isolate
// the transformation of groups of shapes in the scene, as well as create
// chains of transformations for creating, for example, articulated skeletons.

import { Colors } from "./color";
import { P } from "./Point";
import { Shape } from './surface';
import { Light, Lights } from "./light";
import { Matrix } from "./matrix";

export type ChildType = Shape | Model | Light;
export class Model extends Matrix {
  public lights: Light[];
  public children: Array<Shape | Model>;
  public constructor() {
    super();
    this.children = [];
    this.lights = [];
  }
  // Add a `Shape`, `Light`, and other `Model` as a child of this `Model`
  // Any number of children can by supplied as arguments.
  public add(...childs: ChildType[]) {
    for (const child of childs) {
      if (child instanceof Shape || child instanceof Model) {
        this.children.push(child);
      } else if (child instanceof Light) {
        this.lights.push(child);
      }
    }
    return this;
  }
  // Remove a shape, model, or light from the model. NOTE: the scene may still
  // contain a renderModel in its cache. If you are adding and removing many items,
  // consider calling `.flush()` on the scene to flush its renderModel cache.
  public remove(...childs: ChildType[]) {
    let i = -1;
    for (const child of childs) {
      // tslint:disable-next-line:no-conditional-assignment
      while ((i = this.children.indexOf(child as Shape | Model)) >= 0) {

        this.children.splice(i, 1);
      }
      // tslint:disable-next-line:no-conditional-assignment
      while ((i = this.lights.indexOf(child as Light)) >= 0) {
        this.lights.splice(i, 1);
      }
    }
  }
  // Create a new child model and return it.
  public append() {
    const model = new Model();
    this.add(model);
    return model;
  }
  // Visit each `Shape` in this `Model` and all recursive child `Model`s.
  // tslint:disable-next-line:ban-types
  public eachShape(f: Function) {
    for (const child of this.children) {
      if (child instanceof Shape) {
        f.call(this, child);
      }
      if (child instanceof Model) {
        child.eachShape(f);
      }
    }
  }
  // Visit each `Light` and `Shape`, accumulating the recursive transformation
  // matrices along the way. The light callback will be called with each light
  // and its accumulated transform and it should return a `LightModel`. Each
  // shape callback with be called with each shape and its accumulated
  // transform as well as the list of light models that apply to that shape.
  // tslint:disable-next-line:ban-types
  public eachRenderable(lightFn: Function, shapeFn: Function) {
    this._eachRenderable(lightFn, shapeFn, [], this);
  }
  // tslint:disable-next-line:ban-types
  public _eachRenderable(lightFn: Function, shapeFn: Function, lightModels: Light[], transform: Matrix) {
    if (this.lights.length > 0) {
      lightModels = lightModels.slice();
    }
    for (const light of this.lights) {
      if (!light.enabled) {
        continue;
      }
      lightModels.push(lightFn.call(this, light, light.copy().multiply(transform)));
    }
    for (const child of this.children) {
      if (child instanceof Shape) {
        shapeFn.call(this, child, lightModels, child.copy().multiply(transform));
      }
      if (child instanceof Model) {
        child._eachRenderable(lightFn, shapeFn, lightModels, child.copy().multiply(transform));
      }
    }
  }
}
export let Models = {
  // The default model contains standard Hollywood-style 3-part lighting
  default: () => {
    const model = new Model();

    // Key light
    model.add (Lights.directional({
    normal: P(-1, 1, 1).normalize(),
    color: Colors.hsl(0.1, 0.3, 0.7),
    intensity: 0.004}));

    // Back light
    model.add (Lights.directional({
    normal: P(1, 1, -1).normalize(),
    intensity: 0.003}));

    // Fill light
    model.add (Lights.ambient({
    intensity: 0.0015}));

    return model;
  },
};
