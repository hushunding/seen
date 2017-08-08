// ## RenderModels
// ------------------

import { Surface } from "../surface";
import { Points, Point, P } from "../point";
import { Util } from "../util";
import { Matrix } from "../matrix";
import { Bounds } from "../bounds";
import { Light } from "../light";
import { Color } from "../color";

const DEFAULT_NORMAL = Points.Z();
export interface IRenderData {
  points: Point[];
  bounds: Bounds;
  barycenter: Point;
  normal: Point;
  v0: Point;
  v1: Point;
}

// The `RenderModel` object contains the transformed and projected points as
// well as various data needed to shade and paint a `Surface`.
//
// Once initialized, the object will have a constant memory footprint down to
// `Number` primitives. Also, we compare each transform and projection to
// prevent unnecessary re-computation.
//
// If you need to force a re-computation, mark the surface as 'dirty'.

export class RenderModel {
  public inFrustrum: boolean;
  public projected: IRenderData;
  public transformed: IRenderData;
  public points: Point[];
  public fill: Color;
  public stroke: Color;
  constructor(public surface: Surface, public transform: Matrix, public projection: Matrix, public viewport: Matrix) {
    this.points      = this.surface.points;
    this.transformed = this._initRenderData();
    this.projected   = this._initRenderData();
    this._update();
}
  public update(transform: Matrix, projection: Matrix, viewport: Matrix) {
    if (!this.surface.dirty
      && Util.arraysEqual(transform.m, this.transform.m)
      && Util.arraysEqual(projection.m, this.projection.m)
      && Util.arraysEqual(viewport.m, this.viewport.m)) {
      return;
    }else {
      this.transform  = transform;
      this.projection = projection;
      this.viewport   = viewport;
      this._update();
    }
}
  private _update() {
    // Apply model transforms to surface points
    this._math(this.transformed, this.points, this.transform, false);
    // Project into camera space
    const cameraSpace = this.transformed.points.map ((p) => p.copy().transform(this.projection));
    this.inFrustrum = this._checkFrustrum(cameraSpace);
    // Project into screen space
    this._math(this.projected, cameraSpace, this.viewport, true);
    this.surface.dirty = false;
}
  private _checkFrustrum(points: Point[]) {
    for (const p of points){
      if (p.z <= -2) {
      return false;
      }
    }
    return true;
}
  private _initRenderData(): IRenderData {
    return {
      points     : this.points.map((p: Point) => p.copy() ),
      bounds     : new Bounds(),
      barycenter : P(),
      normal     : P(),
      v0         : P(),
      v1         : P(),
    };
  }
  public _math(set: IRenderData, points: Point[], transform: Matrix, applyClip = false) {
    // Apply transform to points
    let i = 0;
    for (const p of points){
      const sp = set.points[i];
      sp.set(p).transform(transform);
      // Applying the clip is what ultimately scales the x and y coordinates in
      // a perpsective projection
      if (applyClip) {
        sp.divide(sp.w);
      }
      i++;
    }
    // Compute barycenter, which is used in aligning shapes in the painters
    // algorithm
    set.barycenter.multiply(0);
    for (const p of set.points){
      set.barycenter.add(p);
    }
    set.barycenter.divide(set.points.length);

    // Compute the bounding box of the points
    set.bounds.reset();
    for (const p of set.points){
      set.bounds.add(p);
    }
    // Compute normal, which is used for backface culling (when enabled)
    if (set.points.length < 2) {
      set.v0.set(DEFAULT_NORMAL);
      set.v1.set(DEFAULT_NORMAL);
      set.normal.set(DEFAULT_NORMAL);
    }else {
      set.v0.set(set.points[1]).subtract(set.points[0]);
      set.v1.set(set.points[points.length - 1]).subtract(set.points[0]);
      set.normal.set(set.v0).cross(set.v1).normalize();
  }
  }
}
// The `LightRenderModel` stores pre-computed values necessary for shading
// surfaces with the supplied `Light`.
export class LightRenderModel {
  public normal: Point;
  public point: Point;
  public intensity: number;
  public type: string;
  public colorIntensity: Color;
  constructor(public light: Light, transform: Matrix) {
    this.colorIntensity = this.light.color.copy().scale(this.light.intensity);
    this.type           = this.light.type;
    this.intensity      = this.light.intensity;
    this.point          = this.light.point.copy().transform(transform);
    const origin          = Points.ZERO().transform(transform);
    this.normal         = this.light.normal.copy().transform(transform).subtract(origin).normalize();
  }
}
