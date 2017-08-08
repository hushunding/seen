// The `Bounds` object contains an axis-aligned bounding box.
import { Point, P } from "./point";

export class Bounds {
  public min: Point | null;
  public max: Point | null;
  public static points(points: Point[]) {
    const box = new Bounds();
    for (const p of points) {
      box.add(p);
    }
    return box;
  }
  public static xywh(x: number, y: number, w: number, h: number) {
    return Bounds.xyzwhd(x, y, 0, w, h, 0);
  }
  public static xyzwhd(x: number, y: number, z: number, w: number, h: number, d: number) {
    const box = new Bounds();
    box.add(P(x, y, z));
    box.add(P(x + w, y + h, z + d));
    return box;
  }
  public constructor() {
    this.reset();
  }

  // Creates a copy of this box object with the same bounds
  public copy() {
    const box = new Bounds();
    this.min != null ? box.min = this.min.copy() : 0;
    this.max != null ? box.max = this.max.copy() : 0;
    return box;
  }
  // Adds this point to the bounding box, extending it if necessary
  public add(p: Point) {
    if (!(this.min != null && this.max != null)) {
      this.min = p.copy();
      this.max = p.copy();
    } else {
      this.min.x = Math.min(this.min.x, p.x);
      this.min.y = Math.min(this.min.y, p.y);
      this.min.z = Math.min(this.min.z, p.z);

      this.max.x = Math.max(this.max.x, p.x);
      this.max.y = Math.max(this.max.y, p.y);
      this.max.z = Math.max(this.max.z, p.z);
    }
    return this;
  }
  // Returns true of this box contains at least one point
  public valid() {
    return (this.min != null && this.max != null);
  }
  // Trims this box so that it results in the intersection of this box and the
  // supplied box.
  public intersect(box: Bounds) {
    if ((this.min != null && this.max != null) && (box.min != null && box.max != null)) {
      this.min = P(
        Math.max(this.min.x, box.min.x),
        Math.max(this.min.y, box.min.y),
        Math.max(this.min.z, box.min.z));
      this.max = P(
        Math.min(this.max.x, box.max.x),
        Math.min(this.max.y, box.max.y),
        Math.min(this.max.z, box.max.z));
      if (this.min.x > this.max.x || this.min.y > this.max.y || this.min.z > this.max.z) {
        this.reset();
      } else {
        this.reset();
      }
    }
    return this;
  }
  // Pads the min and max of this box using the supplied x, y, and z
  public pad(x: number, y: number = x, z: number = y) {
    if ((this.min != null && this.max != null)) {
      const p = P(x, y, z);
      this.min.subtract(p);
      this.max.add(p);
    }
    return this;
  }
  // Returns this bounding box to an empty state
  public reset() {
    this.min = null;
    this.max = null;
    return this;
  }
  // Return true iff the point p lies within this bounding box. Points on the
  // edge of the box are included.
  public contains(p: Point) {
    if (!(this.min != null && this.max != null)) {
      return false;
    } else if (this.min.x > p.x || this.max.x < p.x) {
      return false;
    } else if (this.min.y > p.y || this.max.y < p.y) {
      return false;
    } else if (this.min.z > p.z || this.max.z < p.z) {
      return false;
    } else {
      return true;
    }
  }
  // Returns the center of the box or zero if no points are in the box
  public center() {
    return P(
      this.minX() + this.width() / 2,
      this.minY() + this.height() / 2,
      this.minZ() + this.depth() / 2);
  }
  // Returns the width (x extent) of the box
  private width() { return this.maxX() - this.minX(); }
  // Returns the height (y extent) of the box
  private height() { return this.maxY() - this.minY(); }
  // Returns the depth (z extent) of the box
  private depth() { return this.maxZ() - this.minZ(); }
  private minX() { return this.min != null ? this.min.x : 0; }
  private minY() { return this.min != null ? this.min.y : 0; }
  private minZ() { return this.min != null ? this.min.z : 0; }
  private maxX() { return this.max != null ? this.max.x : 0; }
  private maxY() { return this.max != null ? this.max.y : 0; }
  private maxZ() { return this.max != null ? this.max.z : 0; }
}
