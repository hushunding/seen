
import { Animator } from "../animator";
import { Shapes } from "./primitives";
import { P, Point } from "../Point";
import { Model } from "../model";
import { M, Matrix } from "../matrix";
import { BvhParser } from "../ext/bvh-parser";

export class MocapModel {
  constructor(public model, public frames, public frameDelay) 
  {
  }

  public applyFrameTransforms(frameIndex: number) {
    const frame = this.frames[frameIndex]
    for(const transform of frame){
      transform.shape.reset().transform(transform.transform)
    }
    return (frameIndex + 1) % this.frames.length;
  }
}

export class MocapAnimator extends Animator{
  frameIndex: number;
  constructor(public mocap: Mocap) {
    super()
    this.frameIndex = 0
    this.frameDelay = this.mocap.frameDelay
    this.onFrame(this.renderFrame)
  }

  public renderFrame(){
    this.frameIndex = this.mocap.applyFrameTransforms(this.frameIndex)
  }

}
export class Mocap{
  public static DEFAULT_SHAPE_FACTORY(joint, endpoint: Point){
    return Shapes.pipe(P(), endpoint)
  }
  public static parse(source) {
    return new Mocap(BvhParser.parse(source))
  }
  constructor(public bvh) {}

  public createMocapModel(shapeFactory = Mocap.DEFAULT_SHAPE_FACTORY) {
    const model = new Model();
    joints = [];
    this._attachJoint(model, this.bvh.root, joints, shapeFactory);
    frames = this.bvh.motion.frames.map((frame) => this._generateFrameTransforms(frame, joints));
    return new MocapModel(model, frames, this.bvh.motion.frameTime * 1000);
}
  private _generateFrameTransforms(frame, joints) {
    let fi = 0;
    const transforms = joints.map ((joint) => {

      // Apply channel actions in reverse order
      const m  = M();
      let ai = joint.channels.length;
      while (ai > 0){
        ai -= 1;
        this._applyChannelTransform(joint.channels[ai], m, frame[fi + ai]);
      }
      fi += joint.channels.length;

      // Include offset as final tranform
      m.multiply(joint.offset);

      return {
        shape     : joint.shape,
        transform : m,
      };
    })
    return transforms;
}
 private _applyChannelTransform(channel: string, m: Matrix, v: number) {
    switch (channel) {
      case 'Xposition':
        m.translate(v, 0, 0);
        break;
      case 'Yposition':
        m.translate(0, v, 0);
        break;
      case 'Zposition':
        m.translate(0, 0, v);
        break;
      case 'Xrotation':
        m.rotx(v * Math.PI / 180.0);
        break;
      case 'Yrotation':
        m.roty(v * Math.PI / 180.0);
        break;
      case 'Zrotation':
        m.rotz(v * Math.PI / 180.0);
    }
    return m;
 }
private _attachJoint(model: Model, joint, joints, shapeFactory){
    // Save joint offset
  const offset = M().translate(
    joint.offset != null ? joint.offset.x : null,
    joint.offset != null ? joint.offset.y : null,
    joint.offset != null ? joint.offset.z : null,
  );
  model.m.multiply(offset);

    // Create channel actions
  if (joint.channels != null) {
    joints.push({
      shape: model,
      offset: offset,
      channels: joint.channels,
    });
  }

  if (joint.joints != null) {
    // Append a model to store the child shapes
    const childShapes = model.append();

    for (const child of joint.joints) {
      // Generate the child shape with the supplied shape factory
      const p = P(child.offset != null ? child.offset.x : null,
        child.offset != null ? child.offset.y : null,
        child.offset != null ? child.offset.z : null);
      childShapes.add(shapeFactory(joint, p));

      // Recurse with a new model for any child joints
      if (child.type === 'JOINT') {
        this._attachJoint(childShapes.append(), child, joints, shapeFactory);
      }
    }
  }
  return;
  }
}
