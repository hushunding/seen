// The `Point` object contains x,y,z, and w coordinates. `Point`s support
// various arithmetic operations with other `Points`, scalars, or `Matrices`.
//
// Most of the methods on `Point` are destructive, so be sure to use `.copy()`
// when you want to preserve an object's value.
import { Matrix } from "./matrix";

export class Point {
  constructor(public x = 0, public y = 0, public z = 0, public w = 1) { }

  // Creates and returns a new `Point` with the same values as this object.
  public copy() {
    return new Point(this.x, this.y, this.z, this.w);
  }
  // Copies the values of the supplied `Point` into this object.
  public set(p: Point) {
    this.x = p.x;
    this.y = p.y;
    this.z = p.z;
    this.w = p.w;
    return this;
  }
  // Performs parameter-wise addition with the supplied `Point`. Excludes `this.w`.
  public add(q: Point) {
    this.x += q.x;
    this.y += q.y;
    this.z += q.z;
    return this;
  }
  // Performs parameter-wise subtraction with the supplied `Point`. Excludes `this.w`.
  public subtract(q: Point) {
    this.x -= q.x;
    this.y -= q.y;
    this.z -= q.z;
    return this;
  }
  // Apply a translation.  Excludes `this.w`.
  public translate(x: number, y: number, z: number) {
    this.x += x;
    this.y += y;
    this.z += z;
    return this;
  }
  // Multiplies each parameters by the supplied scalar value. Excludes `this.w`.
  public multiply(n: number) {
    this.x *= n;
    this.y *= n;
    this.z *= n;
    return this;
  }
  // Divides each parameters by the supplied scalar value. Excludes `this.w`.
  public divide(n: number) {

    this.x /= n;
    this.y /= n;
    this.z /= n;
    return this;
  }
  // Rounds each coordinate to the nearest integer. Excludes `this.w`.
  public round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
  }
  // Divides this `Point` by its magnitude. If the point is (0,0,0) we return (0,0,1).
  public normalize() {
    const n = this.magnitude();
    if (n === 0) {// Strict; zero; comparison--; may; be; worth; using; an; epsilon;
      this.set(Points.Z());
    } else {
      this.divide(n);
    }
    return this;
  }
  // Returns a new point that is perpendicular to this point
  public perpendicular() {
    const n = this.copy().cross(Points.Z());
    const mag = n.magnitude();
    // tslint:disable-next-line:triple-equals
    if (mag != 0) { return n.divide(mag); }
    return this.copy().cross(Points.X()).normalize();
  }
  // Apply a transformation from the supplied `Matrix`.
  public transform(matrix: Matrix) {
    const r = POINT_POOL;
    r.x = this.x * matrix.m[0] + this.y * matrix.m[1] + this.z * matrix.m[2] + this.w * matrix.m[3];
    r.y = this.x * matrix.m[4] + this.y * matrix.m[5] + this.z * matrix.m[6] + this.w * matrix.m[7];
    r.z = this.x * matrix.m[8] + this.y * matrix.m[9] + this.z * matrix.m[10] + this.w * matrix.m[11];
    r.w = this.x * matrix.m[12] + this.y * matrix.m[13] + this.z * matrix.m[14] + this.w * matrix.m[15];
    this.set(r);
    return this;
  }
  // Returns this `Point`s magnitude squared. Excludes `this.w`.
  public magnitudeSquared() {
    return this.dot(this);
  }
  // Returns this `Point`s magnitude. Excludes `this.w`.
  public magnitude() {
    return Math.sqrt(this.magnitudeSquared());
  }
  // Computes the dot product with the supplied `Point`.
  public dot(q: Point) {
    return this.x * q.x + this.y * q.y + this.z * q.z;
  }
  // Computes the cross product with the supplied `Point`.
  public cross(q: Point) {
    const r = POINT_POOL;
    r.x = this.y * q.z - this.z * q.y;
    r.y = this.z * q.x - this.x * q.z;
    r.z = this.x * q.y - this.y * q.x;
    this.set(r);
    return this;
  }
}
// Convenience method for creating `Points`.
export let P = (x = 0, y = 0, z = 0, w = 1) => new Point(x, y, z, w);

// A pool object which prevents us from having to create new `Point` objects
// for various calculations, which vastly improves performance.
const POINT_POOL = P();

// A few useful `Point` objects. Be sure that you don't invoke destructive
// methods on these objects.
export let Points = {
  X: () => P(1, 0, 0),
  Y: () => P(0, 1, 0),
  Z: () => P(0, 0, 1),
  ZERO: () => P(0, 0, 0),
};
