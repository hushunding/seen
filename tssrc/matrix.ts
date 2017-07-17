
// ## Math
// #### Matrices, points, and other mathy stuff
// ------------------
namespace seen {
  // Pool object to speed computation and reduce object creation
  export let ARRAY_POOL = new Array(16)

  // Definition of identity matrix values
  export let IDENTITY =
    [1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1]

  // Indices with which to transpose the matrix array
  export let TRANSPOSE_INDICES =
    [0, 4, 8, 12,
      1, 5, 9, 13,
      2, 6, 10, 14,
      3, 7, 11, 15]



  // The `Matrix` class stores transformations in the scene. These include:
  // (1) Camera Projection and Viewport transformations.
  // (2) Transformations of any `Transformable` type object, such as `Shape`s or `Model`s
  //
  // Most of the methods on `Matrix` are destructive, so be sure to use `.copy()`
  // when you want to preserve an object's value.
  class Matrix {
    m: number[];
    baked: number[];
    // Accepts a 16-value `Array`, defaults to the identity matrix.
    constructor(m = null) {
      this.m = (m == null) ? IDENTITY.slice() : m
      this.baked = IDENTITY
    }


    // Returns a new matrix instances with a copy of the value array
    copy() {
      return new Matrix(this.m.slice())
    }


    // Multiply by the 16-value `Array` argument. This method uses the
    // `ARRAY_POOL`, which prevents us from having to re-initialize a new
    // temporary matrix every time. This drastically improves performance.
    matrix(m: number[]): Matrix {
      let c = ARRAY_POOL
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 16; i += 4)
          c[i + j] =
            m[i] * this.m[j] +
            m[i + 1] * this.m[4 + j] +
            m[i + 2] * this.m[8 + j] +
            m[i + 3] * this.m[12 + j]
      ARRAY_POOL = this.m
      this.m = c
      return this
    }


    // Resets the matrix to the baked-in (default: identity).
    reset(): Matrix {
      this.m = this.baked.slice()
      return this
    }


    // Sets the array that this matrix will return to when calling `.reset()`.
    // With no arguments, it uses the current matrix state.
    bake(m: number[]): Matrix {
      this.baked = (m = m != null ? m : this.m).slice()
      return this
    }

    // Multiply by the `Matrix` argument.
    multiply(b: Matrix): Matrix {
      return this.matrix(b.m)
    }


    // Tranposes this matrix
    transpose() {
      let c = ARRAY_POOL
      let i = 0
      for (let ti of TRANSPOSE_INDICES) {
        c[i] = this.m[ti];
        i++
      }
      ARRAY_POOL = this.m
      this.m = c

      return this
    }
    // Apply a rotation about the X axis. `Theta` is measured in Radians
    rotx(theta) {
      let ct = Math.cos(theta)
      let st = Math.sin(theta)
      let rm = [1, 0, 0, 0, 0, ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1]
      return this.matrix(rm)
    }
    // Apply a rotation about the Y axis. `Theta` is measured in Radians
    roty(theta){
    let ct = Math.cos(theta)
    let st = Math.sin(theta)
    let rm = [ct, 0, st, 0, 0, 1, 0, 0, -st, 0, ct, 0, 0, 0, 0, 1]
  return this.matrix(rm)
}
  // Apply a rotation about the Z axis. `Theta` is measured in Radians
  rotz(theta){
  let  ct = Math.cos(theta)
  let st = Math.sin(theta)
  let rm = [ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  return this.matrix(rm)
}
  // Apply a translation. All arguments default to `0`
  translate: (x = 0, y = 0, z = 0) ->
    rm = [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1]
  return this.matrix(rm)

  // Apply a scale. If not all arguments are supplied, each dimension (x,y,z)
  // is copied from the previous arugment. Therefore, `_scale()` is equivalent
  // to `_scale(1,1,1)`, and `_scale(1,-1)` is equivalent to `_scale(1,-1,-1)`
  scale: (sx, sy, sz) ->
    sx ?= 1
    sy ?= sx
    sz ?= sy
    rm = [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1]
  return this.matrix(rm)


  // A convenience method for constructing Matrix objects.
  M = (m) -> new Matrix(m)

  // A few useful Matrix objects.
  Matrices = {
    identity: -> M()
  flipX    : -> M().scale(-1, 1, 1)
  flipY    : -> M().scale(1, -1, 1)
  flipZ    : -> M().scale(1, 1, -1)
  }


}
}