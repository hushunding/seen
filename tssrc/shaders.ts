// ## Shaders
// ------------------

import { Points, Point } from "./Point";
import { Light } from "./light";
import { Material } from "./materials";
import { Color } from "./color";

const EYE_NORMAL = Points.Z();

// These shading functions compute the shading for a surface. To reduce code
// duplication, we aggregate them in a utils object.
export let ShaderUtils = {
  applyDiffuse: (c: Color, light: Light, lightNormal: Point, surfaceNormal: Point, material: Material) => {
    const dot = lightNormal.dot(surfaceNormal);

    if (dot > 0) {
      // Apply diffuse phong shading
      c.addChannels(light.colorIntensity.copy().scale(dot));
    }
  },
  applyDiffuseAndSpecular: (c: Color, light: Light, lightNormal: Point, surfaceNormal: Point, material: Material) => {
    const dot = lightNormal.dot(surfaceNormal);

    if (dot > 0) {
      // Apply diffuse phong shading
      c.addChannels(light.colorIntensity.copy().scale(dot));
    }

    // Compute and apply specular phong shading
    const reflectionNormal = surfaceNormal.copy().multiply(dot * 2).subtract(lightNormal);
    const specularIntensity = Math.pow(0.5 + reflectionNormal.dot(EYE_NORMAL), material.specularExponent);
    const specularColor = material.specularColor.copy().scale(specularIntensity * light.intensity / 255.0);
    c.addChannels(specularColor);
  },
  applyAmbient: (c: Color, light: Light) => {
    // Apply ambient shading
    c.addChannels(light.colorIntensity);
  },
};

// The `Shader` class is the base class for all shader objects.
export abstract class Shader {
  // Every `Shader` implementation must override the `shade` method.
  //
  // `lights` is an object containing the ambient, point, and directional light sources.
  // `renderModel` is an instance of `RenderModel` and contains the transformed and projected surface data.
  // `material` is an instance of `Material` and contains the color and other attributes for determining how light reflects off the surface.
  abstract protected shade(lights: Light[], renderModel: RenderModel, material: Material): Color; // Override this
}
// The `Phong` shader implements the Phong shading model with a diffuse,
// specular, and ambient term.
//
// See https://en.wikipedia.org/wiki/Phong_reflection_model for more information
export class Phong extends Shader {
  public shade(lights: Light[], renderModel: RenderModel, material: Material): Color {
    const c = new Color();
    for (const light of lights) {
      switch (light.type) {
        case 'point':
          const lightNormal = light.point.copy().subtract(renderModel.barycenter).normalize();
          ShaderUtils.applyDiffuseAndSpecular(c, light, lightNormal, renderModel.normal, material);
          break;
        case 'directional':
          ShaderUtils.applyDiffuseAndSpecular(c, light, light.normal, renderModel.normal, material);
          break;
        case 'ambient':
          ShaderUtils.applyAmbient(c, light);
      }
    }

    c.multiplyChannels(material.color);

    if (material.metallic) {
      c.minChannels(material.specularColor);
    }

    c.clamp(0, 0xFF);
    return c;
  }
}
// The `DiffusePhong` shader implements the Phong shading model with a diffuse
// and ambient term (no specular).
export class DiffusePhong extends Shader {
  public shade(lights: Light[], renderModel: RenderModel, material: Material): Color {
    const c = new Color();

    for (const light of lights) {
      switch (light.type) {
        case 'point':
          const lightNormal = light.point.copy().subtract(renderModel.barycenter).normalize();
          ShaderUtils.applyDiffuse(c, light, lightNormal, renderModel.normal, material);
          break;
        case 'directional':
          ShaderUtils.applyDiffuse(c, light, light.normal, renderModel.normal, material);
          break;
        case 'ambient':
          ShaderUtils.applyAmbient(c, light);
      }
    }

    c.multiplyChannels(material.color).clamp(0, 0xFF);
    return c;
  }
}
// The `Ambient` shader colors surfaces from ambient light only.
export class Ambient extends Shader {
  public shade(lights: Light[], renderModel: RenderModel, material: Material): Color {
    const c = new Color();

    for (const light of lights) {
      switch (light.type) {
        case 'ambient':
          ShaderUtils.applyAmbient(c, light);
      }
    }

    c.multiplyChannels(material.color).clamp(0, 0xFF);
    return c;
  }
}
// The `Flat` shader colors surfaces with the material color, disregarding all
// light sources.
export class Flat extends Shader {
  public shade(lights: Light[], renderModel: RenderModel, material: Material): Color {
    return material.color;
  }
}
export let Shaders = {
  phong: () => new Phong(),
  diffuse: () => new DiffusePhong(),
  ambient: () => new Ambient(),
  flat: () => new Flat(),
};
