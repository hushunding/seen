// Parser for Wavefront .obj files
//
// Note: Wavefront .obj array indicies are 1-based.
import { P, Point } from "../point";
import { Shape, Surface } from "../surface";
import { Shapes } from "./primitives";

export class ObjParser {
  public faces: number[][];
  public vertices: number[][];
  public commands: any;
  public constructor() {
    this.vertices = [];
    this.faces = [];
    this.commands = {
      v: (data: string[]) => this.vertices.push(data.map(((d: string) => parseFloat(d)))),
      f: (data: string[]) => this.faces.push(data.map((d: string) => parseInt(d))),
    };
  }
  public parse(contents: string) {
    let data;
    for (const line of contents.split(/[\r\n]+/)) {
      data = line.trim().split(/[ ]+/);

      if (data.length < 2) {// Check line parsing
        continue;
      }

      const command = data.slice(0, 1)[0];
      data = data.slice(1);

      if (command.charAt(0) === '#') {// Check for comments
        continue;
      }
      if (this.commands[command] == null) {// Check that we know how the handle this command
        console.log(`OBJ Parser: Skipping unknown command '#{command}'`);
        continue;
      }
      this.commands[command](data); // Execute command
    }
  }
  public mapFacePoints(faceMap: (points: Point[]) => Surface) {
    return this.faces.map((face) => faceMap.call(this,
      face.map((v: number) => P(...this.vertices[v - 1]))));
  }
}
