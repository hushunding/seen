
// `Transformable` base class extended by `Shape` and `Model`.
//
// The advantages of keeping transforms in `Matrix` form are (1) lazy
// computation of point position (2) ability combine hierarchical
// transformations easily (3) ability to reset transformations to an original
// state.
//
// Resetting transformations is especially useful when you want to animate
// interpolated values. Instead of computing the difference at each animation
// step, you can compute the global interpolated value for that time step and
// apply that value directly to a matrix (once it is reset).

import { IDENTITY, Matrix } from "./matrix";

export class Transformable {
  private baked: number[];
  public m: Matrix;

  constructor() {
    this.baked = IDENTITY;
  }
  // Returns a new matrix instances with a copy of the value array
  public copy() {
    this.m.copy();
    return this;
  }

  // Multiply by the 16-value `Array` argument. This method uses the
  // `ARRAY_POOL`, which prevents us from having to re-initialize a new
  // temporary matrix every time. This drastically improves performance.
  public matrix(m: number[]) {
    this.m.matrix(m);
    return this;
  }

  // Resets the matrix to the baked-in (default: identity).
  public reset() {
    this.m.reset();
    return this;
  }

  // Sets the array that this matrix will return to when calling `.reset()`.
  // With no arguments, it uses the current matrix state.
  public bake(m: number[]) {
    this.m.bake(m);
    return this;
  }

  // Multiply by the `Matrix` argument.
  public multiply(b: Matrix) {
    this.m.multiply(b);
    return this;
  }

  // Tranposes this matrix
  public transpose() {
    this.m.transpose();
    return this;
  }
  // Apply a rotation about the X axis. `Theta` is measured in Radians
  public rotx(theta: number) {
    this.m.rotx(theta);
    return this;
  }
  // Apply a rotation about the Y axis. `Theta` is measured in Radians
  public roty(theta: number) {
    this.m.roty(theta);
    return this;
  }
  // Apply a rotation about the Z axis. `Theta` is measured in Radians
  public rotz(theta: number) {
    this.m.rotz(theta);
    return this;
  }
  // Apply a translation. All arguments default to `0`
  public translate(x = 0, y = 0, z = 0) {
    this.m.translate(x, y, z);
    return this;
  }

  // Apply a scale. If not all arguments are supplied, each dimension (x,y,z)
  // is copied from the previous arugment. Therefore, `_scale()` is equivalent
  // to `_scale(1,1,1)`, and `_scale(1,-1)` is equivalent to `_scale(1,-1,-1)`
  public scale(sx = 1, sy = sx, sz = sy) {
    this.m.scale(sx, sy, sz);
    return this;
  }
  // Apply a transformation from the supplied `Matrix`. see `Matrix.multiply`
  public transform(m: Transformable) {
    this.multiply(m.m);
    return this;
  }
}
