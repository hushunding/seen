// ## Surfaces and Shapes
// ------------------

// A `Surface` is a defined as a planar object in 3D space. These paths don't
// necessarily need to be convex, but they should be non-degenerate. This
// library does not support shapes with holes.
import { Point } from "./Point";
import { C, Colors, Color } from "./color";
import { Util } from "./util";
import { Material } from "./materials";
import { Painters } from "./render/painters";
import { Matrix } from "./matrix";

export class Surface {
  public id: string;
  // When 'false' this will override backface culling, which is useful if your
  // material is transparent. See comment in `Scene`.
  public cullBackfaces = true;

  // Fill and stroke may be `Material` objects, which define the color and
  // finish of the object and are rendered using the scene's shader.
  public fillMaterial = new Material(Colors.gray());
  public strokeMaterial =  new Material(Colors.black());

  constructor(public points: Point[], public painter = Painters.path) {
    // We store a unique id for every surface so we can look them up quickly
    // with the `renderModel` cache.
    this.id = 's' + Util.uniqueId();
  }
  public fill(fill: Material | Color) {
    this.fillMaterial = Material.create(fill);
    return this;
  }
  public stroke(stroke: Material | Color) {
    this.strokeMaterial = Material.create(stroke);
    return this;
  }
}
// A `Shape` contains a collection of surface. They may create a closed 3D
// shape, but not necessarily. For example, a cube is a closed shape, but a
// patch is not.
export class Shape extends Matrix {
  public constructor(public type: string, public surfaces: Surface[]) {
    super();
  }
  // Visit each surface
  // tslint:disable-next-line:ban-types
  public eachSurface(f: (value: Surface, index: number, array: Surface[]) => void) {
    this.surfaces.forEach(f);
    return this;
  }
  // Apply the supplied fill `Material` to each surface
  public fill(fill: Material | Color ) {
    this.eachSurface((s: Surface) => s.fill(fill));
    return this;
  }
  // Apply the supplied stroke `Material` to each surface
  public stroke(stroke: Material | Color) {
    this.eachSurface((s: Surface) => s.stroke(stroke));
    return this;
  }
}
