// ## Lights
// ------------------

// This model object holds the attributes and transformation of a light source.
import { Colors, Color } from "./color";
import { P, Point } from "./Point";
import { Util } from "./util";
import { Matrix } from "./matrix";

export class Light extends Matrix {
  public colorIntensity: Color;
  public enabled: boolean;
  public normal: Point;
  public intensity: number;
  public color: Color;
  public point: Point;
  private id: string;

  // defaults :
  //   point     : P()
  //   color     : Colors.white()
  //   intensity : 0.01
  //   normal    : P(1, -1, -1).normalize()
  //   enabled   : true

  constructor(public type: string, {
    point = P(),
    color = Colors.white(),
    intensity = 0.01,
    normal = P(1, -1, -1).normalize(),
    enabled = true }) {
    super();
    this.point = point;
    this.color = color;
    this.intensity = intensity;
    this.normal = normal;
    this.enabled = enabled;
    this.id = Util.uniqueId('l');
  }
  public render() {
    this.colorIntensity = this.color.copy().scale(this.intensity);
  }
}
export let Lights = {
  // A point light emits light eminating in all directions from a single point.
  // The `point` property determines the location of the point light. Note,
  // though, that it may also be moved through the transformation of the light.
  point: (opts = {}) => new Light('point', opts),

  // A directional lights emit light in parallel lines, not eminating from any
  // single point. For these lights, only the `normal` property is used to
  // determine the direction of the light. This may also be transformed.
  directional: (opts: object) => new Light('directional', opts),

  // Ambient lights emit a constant amount of light everywhere at once.
  // Transformation of the light has no effect.
  ambient: (opts: object) => new Light('ambient', opts),
};
