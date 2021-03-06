// ## Shapes
// #### Shape primitives and shape-making methods
// ------------------

// Map to points in the surfaces of a tetrahedron
import { P, Point } from "../point";
import { Shape, Surface } from "../surface";
import { Quaternion } from "../quaternion";

const TETRAHEDRON_COORDINATE_MAP = [
  [0, 2, 1],
  [0, 1, 3],
  [3, 2, 0],
  [1, 2, 3],
];

// Map to points in the surfaces of a cube
const CUBE_COORDINATE_MAP = [
  [0, 1, 3, 2], // left
  [5, 4, 6, 7], // right
  [1, 0, 4, 5], // bottom
  [2, 3, 7, 6], // top
  [3, 1, 5, 7], // front
  [0, 2, 6, 4], // back
];

// Map to points in the surfaces of a rectangular pyramid
const PYRAMID_COORDINATE_MAP = [
  [1, 0, 2, 3], // bottom
  [0, 1, 4], // left
  [2, 0, 4], // rear
  [3, 2, 4], // right
  [1, 3, 4], // front
];

// Altitude of eqiulateral triangle for computing triangular patch size
const EQUILATERAL_TRIANGLE_ALTITUDE = Math.sqrt(3.0) / 2.0;

// Points array of an icosahedron
const ICOS_X = 0.525731112119133606;
const ICOS_Z = 0.850650808352039932;
const ICOSAHEDRON_POINTS = [
  P(-ICOS_X, 0.0,     -ICOS_Z),
  P(ICOS_X,  0.0,     -ICOS_Z),
  P(-ICOS_X, 0.0,     ICOS_Z),
  P(ICOS_X,  0.0,     ICOS_Z),
  P(0.0,     ICOS_Z,  -ICOS_X),
  P(0.0,     ICOS_Z,  ICOS_X),
  P(0.0,     -ICOS_Z, -ICOS_X),
  P(0.0,     -ICOS_Z, ICOS_X),
  P(ICOS_Z,  ICOS_X,  0.0),
  P(-ICOS_Z, ICOS_X,  0.0),
  P(ICOS_Z,  -ICOS_X, 0.0),
  P(-ICOS_Z, -ICOS_X, 0.0),
];

// Map to points in the surfaces of an icosahedron
const ICOSAHEDRON_COORDINATE_MAP = [
  [0, 4, 1],
  [0, 9, 4],
  [9, 5, 4],
  [4, 5, 8],
  [4, 8, 1],
  [8, 10, 1],
  [8, 3, 10],
  [5, 3, 8],
  [5, 2, 3],
  [2, 7, 3],
  [7, 10, 3],
  [7, 6, 10],
  [7, 11, 6],
  [11, 0, 6],
  [0, 1, 6],
  [6, 1, 10],
  [9, 0, 11],
  [9, 11, 2],
  [9, 2, 5],
  [7, 2, 11],
];

export let Shapes = {
  // Returns a 2x2x2 cube, centered on the origin.
  cube: () => {
    const points = [
      P(-1, -1, -1),
      P(-1, -1,  1),
      P(-1,  1, -1),
      P(-1,  1,  1),
      P( 1, -1, -1),
      P( 1, -1,  1),
      P( 1,  1, -1),
      P( 1,  1,  1),
    ];

    return new Shape('cube', Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP));
  },
  // Returns a 1x1x1 cube from the origin to [1, 1, 1].
  unitcube: () => {
    const points = [
      P(0, 0, 0),
      P(0, 0, 1),
      P(0, 1, 0),
      P(0, 1, 1),
      P(1, 0, 0),
      P(1, 0, 1),
      P(1, 1, 0),
      P(1, 1, 1),
    ];

    return new Shape('unitcube', Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP));
  },
  // Returns an axis-aligned 3D rectangle whose boundaries are defined by the
  // two supplied points.
  rectangle : (point1: Point, point2: Point) => {
    const compose = (x: (a: number, b: number) => number,
                     y: (a: number, b: number) => number,
                     z: (a: number, b: number) => number) => P(
        x(point1.x, point2.x),
        y(point1.y, point2.y),
        z(point1.z, point2.z),
      );

    const points = [
      compose(Math.min, Math.min, Math.min),
      compose(Math.min, Math.min, Math.max),
      compose(Math.min, Math.max, Math.min),
      compose(Math.min, Math.max, Math.max),
      compose(Math.max, Math.min, Math.min),
      compose(Math.max, Math.min, Math.max),
      compose(Math.max, Math.max, Math.min),
      compose(Math.max, Math.max, Math.max),
    ];

    return new Shape('rect', Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP));
  },
  // Returns a square pyramid inside a unit cube
  pyramid : () => {
    const points = [
      P(0, 0, 0),
      P(0, 0, 1),
      P(1, 0, 0),
      P(1, 0, 1),
      P(0.5, 1, 0.5),
    ];

    return new Shape('pyramid', Shapes.mapPointsToSurfaces(points, PYRAMID_COORDINATE_MAP));
  },
  // Returns a tetrahedron that fits inside a 2x2x2 cube.
  tetrahedron: () => {
    const points = [
      P( 1,  1,  1),
      P(-1, -1,  1),
      P(-1,  1, -1),
      P( 1, -1, -1)];

    return new Shape('tetrahedron', Shapes.mapPointsToSurfaces(points, TETRAHEDRON_COORDINATE_MAP));
  },
  // Returns an icosahedron that fits within a 2x2x2 cube, centered on the
  // origin.
  icosahedron : () => new Shape('icosahedron', Shapes.mapPointsToSurfaces(ICOSAHEDRON_POINTS, ICOSAHEDRON_COORDINATE_MAP))
  ,
  // Returns a sub-divided icosahedron, which approximates a sphere with
  // triangles of equal size.
  sphere : (subdivisions = 2) => {
    let triangles = ICOSAHEDRON_COORDINATE_MAP.map((coords) => coords.map ((c) => ICOSAHEDRON_POINTS[c]));
    for (let i = 0; i < subdivisions; i++) {
      triangles = Shapes._subdivideTriangles(triangles);
    }
    return new Shape('sphere', triangles.map( (triangle) => new Surface(triangle.map((v) => v.copy()))));
  },
  // Returns a cylinder whose main axis is aligned from point1 to point2
  pipe : (point1: Point, point2: Point, radius = 1, segments = 8) => {

    // Compute a normal perpendicular to the axis point1->point2 and define the
    // rotations about the axis as a quaternion
    const axis  = point2.copy().subtract(point1);
    const perp  = axis.perpendicular().multiply(radius);
    const theta = -Math.PI * 2.0 / segments;
    const quat  = Quaternion.pointAngle(axis.copy().normalize(), theta).toMatrix();

    // Apply the quaternion rotations to create one face
    const points = ((n: number) => {
      const tmp: number[] = [];
      for (let i = 0; i < n; i++) {
        tmp.push(i);
      }
      return tmp;
    })(segments).map((i) => {
      const p = point1.copy().add(perp);
      perp.transform(quat);
      return p;
    });
    return Shapes.extrude(points, axis);
  },
  // Returns a planar triangular patch. The supplied arguments determine the
  // number of triangle in the patch.
  patch: (nx = 20, ny = 20) => {
    nx = Math.round(nx);
    ny = Math.round(ny);
    let surfaces: Point[][] = [];
    for (let x = 0; x < nx; x++) {
      const column: Point[][] = [];
      for (let y = 0; y < ny; y++) {
        const pts0 = [
          P(x, y),
          P(x + 1, y - 0.5),
          P(x + 1, y + 0.5),
        ];
        const pts1 = [
          P(x, y),
          P(x + 1, y + 0.5),
          P(x, y + 1),
        ];

        for (const pts of [pts0, pts1]){
          for (const p of pts){
            p.x *= EQUILATERAL_TRIANGLE_ALTITUDE;
            p.y +=  x % 2 === 0 ? 0.5 : 0;
          }
          column.push(pts);
        }
    }
      if (x % 2 !== 0){
        for (const p of column[0]){
          p.y += ny;
        }
        column.push(column.shift());
      }
      surfaces = surfaces.concat(column);
}
    return new Shape('patch', surfaces.map((s) => new Surface(s)));
  },
  // Return a text surface that can render 3D text using an affine transform estimate of the projection
  text : (text, surfaceOptions = {}) => {
    const surface = new Surface(Affine.ORTHONORMAL_BASIS(), Painters.text);
    surface.text = text;
    for (key in surfaceOptions) {
        surface[key] = surfaceOptions[key];
      }
    return new Shape('text', [surface]);
  },
  // Returns a shape that is an extrusion of the supplied points into the z axis.
  extrude : (points: Point[], offset: Point) => {
    const surfaces: Surface[] = [];
    const front = new Surface (points.map((p: Point) => p.copy()));
    const back  = new Surface (points.map((p: Point) => p.add(offset)));

    for (let  i = 1; i < points.length; i++) {
      surfaces.push (new Surface ([
        front.points[i - 1].copy(),
        back.points[i - 1].copy(),
        back.points[i].copy(),
        front.points[i].copy(),
      ]));
}
    const len = points.length;
    surfaces.push (new Surface ([
      front.points[len - 1].copy(),
      back.points[len - 1].copy(),
      back.points[0].copy(),
      front.points[0].copy(),
    ]));

    back.points.reverse();
    surfaces.push (front);
    surfaces.push (back);
    return new Shape('extrusion', surfaces);
  },
  // Returns an extruded block arrow shape.
  arrow : (thickness = 1, tailLength = 1, tailWidth = 1, headLength = 1, headPointiness = 0) => {
    const htw = tailWidth / 2;
    const points = [
      P(0, 0, 0),
      P(headLength + headPointiness, 1, 0),
      P(headLength, htw, 0),
      P(headLength + tailLength, htw, 0),
      P(headLength + tailLength, -htw, 0),
      P(headLength, -htw, 0),
      P(headLength + headPointiness, -1, 0)];
    return Shapes.extrude(points, P(0, 0, thickness));
  },
  // Returns a shape with a single surface using the supplied points array
  path : (points: Point[]) => new Shape('path', [new Surface(points)]),

  // Accepts a 2-dimensional array of tuples, returns a shape where the tuples
  // represent points of a planar surface.
  custom : (s: {surfaces: number[][][]}) => {
    const surfaces: Surface[] = [];
    for (const f of s.surfaces){
      surfaces.push (new Surface(f.map((p: number[]) => P(...p))));
    }
    return new Shape('custom', surfaces);
  },
  // Joins the points into surfaces using the coordinate map, which is an
  // 2-dimensional array of index integers.
  mapPointsToSurfaces : (points: Point[], coordinateMap: number[][]) => {
    const surfaces: Surface[] = [];
    for (const coords of coordinateMap){
      const spts = coords.map((c) => points[c].copy());
      surfaces.push(new Surface(spts));
    }
    return surfaces;
  },
  // Accepts an array of 3-tuples and returns an array of 3-tuples representing
  // the triangular subdivision of the surface.
  _subdivideTriangles : (triangles: Point[][]) => {
    const newTriangles: Point[][] = [];
    for (const tri of triangles){
      const v01 = tri[0].copy().add(tri[1]).normalize();
      const v12 = tri[1].copy().add(tri[2]).normalize();
      const v20 = tri[2].copy().add(tri[0]).normalize();
      newTriangles.push([tri[0], v01, v20]);
      newTriangles.push([tri[1], v12, v01]);
      newTriangles.push([tri[2], v20, v12]);
      newTriangles.push([v01,    v12, v20]);
    }
    return newTriangles;
  },
};
