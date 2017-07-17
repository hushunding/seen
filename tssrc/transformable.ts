
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
namespace seen
{
class Transformable
{
  baked: any;
  m: Matrix;
  constructor()
  {
    this.m = new Matrix()
    this.baked = IDENTITY

    // We create shims for all of the matrix transformation methods so they
    // have the same interface.
    for(method of ['scale', 'translate', 'rotx', 'roty', 'rotz', 'matrix', 'reset', 'bake'])
      {
        this.m[method].call(this.m, ...arguments)
      }
      then do (method) =>
    
  }

  // Apply a transformation from the supplied `Matrix`. see `Matrix.multiply`
  transform: (m) ->
    this.m.multiply(m)
    return this
    }
}

