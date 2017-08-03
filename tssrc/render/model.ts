// ## RenderModels
// ------------------

import { Surface } from "../surface";
import { Points } from "../Point";
import { Util } from "../util";
import { Matrix } from "../matrix";

const DEFAULT_NORMAL = Points.Z()

// The `RenderModel` object contains the transformed and projected points as
// well as various data needed to shade and paint a `Surface`.
//
// Once initialized, the object will have a constant memory footprint down to
// `Number` primitives. Also, we compare each transform and projection to
// prevent unnecessary re-computation.
//
// If you need to force a re-computation, mark the surface as 'dirty'.
export class RenderModel {
  constructor(public surface: Surface, public transform: Matrix, public projection, public viewport){
    this.points      = this.surface.points;
    this.transformed = this._initRenderData()
    this.projected   = this._initRenderData()
    this._update()
}
  public update(transform, projection, viewport){
    if (!this.surface.dirty && Util.arraysEqual(transform.m, this.transform.m) && Util.arraysEqual(projection.m, this.projection.m) && Util.arraysEqual(viewport.m, this.viewport.m)){
      return
    }
    else
      this.transform  = transform
      this.projection = projection
      this.viewport   = viewport
      this._update()
}
  public _update(){
    // Apply model transforms to surface points
    this._math(this.transformed, this.points, this.transform, false)
    // Project into camera space
    cameraSpace = this.transformed.points.map (p) => p.copy().transform(this.projection)
    this.inFrustrum = this._checkFrustrum(cameraSpace)
    // Project into screen space
    this._math(this.projected, cameraSpace, this.viewport, true)
    this.surface.dirty = false
}
  public _checkFrustrum(points){
    for p in points
      return false if (p.z <= -2)
    return true
}
  _initRenderData: ->
    return {
      points     : (p.copy() for p in this.points)
      bounds     : new Bounds()
      barycenter : P()
      normal     : P()
      v0         : P()
      v1         : P()
    }

  public _math(set, points, transform, applyClip = false){
    // Apply transform to points
    for p,i in points
      sp = set.points[i]
      sp.set(p).transform(transform)
      // Applying the clip is what ultimately scales the x and y coordinates in
      // a perpsective projection
      if applyClip then sp.divide(sp.w)
}
    // Compute barycenter, which is used in aligning shapes in the painters
    // algorithm
    set.barycenter.multiply(0)
    for p in set.points
      set.barycenter.add(p)
    set.barycenter.divide(set.points.length)

    // Compute the bounding box of the points
    set.bounds.reset()
    for p in set.points
      set.bounds.add(p)

    // Compute normal, which is used for backface culling (when enabled)
    if set.points.length < 2
      set.v0.set(DEFAULT_NORMAL)
      set.v1.set(DEFAULT_NORMAL)
      set.normal.set(DEFAULT_NORMAL)
    else
      set.v0.set(set.points[1]).subtract(set.points[0])
      set.v1.set(set.points[points.length - 1]).subtract(set.points[0])
      set.normal.set(set.v0).cross(set.v1).normalize()
}
// The `LightRenderModel` stores pre-computed values necessary for shading
// surfaces with the supplied `Light`.
export class LightRenderModel
  constructor: (this.light, transform) ->
    this.colorIntensity = this.light.color.copy().scale(this.light.intensity)
    this.type           = this.light.type
    this.intensity      = this.light.intensity
    this.point          = this.light.point.copy().transform(transform)
    origin          = Points.ZERO().transform(transform)
    this.normal         = this.light.normal.copy().transform(transform).subtract(origin).normalize()
