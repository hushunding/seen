
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

export class Transformable extends Matrix {
  constructor() {
    super();
  }

  // Apply a transformation from the supplied `Matrix`. see `Matrix.multiply`
  public transform(m: Matrix) {
    this.multiply(m);
    return this;
  }
}
