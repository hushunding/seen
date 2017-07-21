// ## Materials
// #### Surface material properties
// ------------------

// `Material` objects hold the attributes that desribe the color and finish of a surface.
import { Color, Colors } from "./color";
import { Shader } from "./shaders";
import { Light } from "./light";

export class Material {
  public shader: Shader;
  public specularExponent: number;
  public specularColor: Color;
  public metallic: boolean;
  public color: Color;
  public static create(value?: Material | Color | string) {
    if (value instanceof Material) {
      return value;
    } else if (value instanceof Color) {
      return new Material(value);
    } else if (typeof value === 'string') {
      return new Material(Colors.parse(value));
    } else {
      return new Material();
    }
  }
  // The base color of the material.
  // color            : Colors.gray()

  // The `metallic` attribute determines how the specular highlights are
  // calculated. Normally, specular highlights are the color of the light
  // source. If metallic is true, specular highlight colors are determined
  // from the `specularColor` attribute.
  // metallic         : false

  // The color used for specular highlights when `metallic` is true.
  // specularColor    : Colors.white()

  // The `specularExponent` determines how "shiny" the material is. A low
  // exponent will create a low-intesity, diffuse specular shine. A high
  // exponent will create an intense, point-like specular shine.
  // specularExponent : 15

  // A `Shader` object may be supplied to override the shader used for this
  // material. For example, if you want to apply a flat color to text or
  // other shapes, set this value to `Shaders.Flat`.
  // shader           : null

  constructor(color1: Color = Colors.gray(), {
        color = Colors.gray(),
    metallic = false,
    specularColor = Colors.white(),
    specularExponent = 15,
    shader = null }: {
      color?: Color;
      metallic?: boolean;
      specularColor?: Color;
      specularExponent?: number;
      shader?: Shader;
    } = {}) {
    this.color = color1;
    this.color = color;
    this.metallic = metallic;
    this.specularColor = specularColor;
    this.specularExponent = specularExponent;
    this.shader = shader;
  }
  // Apply the shader's shading to this material, with the option to override
  // the shader with the material's shader (if defined).
   public render(lights: Light[], shader: Shader, renderData) {
    const renderShader = this.shader != null ? this.shader : shader;
    const color = renderShader.shade(lights, renderData, this);
    color.a = this.color.a;
    return color;
  }
}
