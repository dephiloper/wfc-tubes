import { Vector3 } from "three";

export class Prototype {
  mesh: string;
  rotation: Vector3;
  openings: Vector3[];
  neighbors: Map<number, Prototype[]>;

  constructor(mesh?: string, rotation?: Vector3, openings?: Array<Vector3>) {
    this.mesh = mesh ?? "";
    this.rotation = rotation ?? new Vector3();
    this.openings = openings ?? new Array<Vector3>();
    this.neighbors = new Map<number, Prototype[]>();

    // create six neighbor objects for six sides of object
    this.neighbors.set(0, new Array<Prototype>());
    this.neighbors.set(1, new Array<Prototype>());
    this.neighbors.set(2, new Array<Prototype>());
    this.neighbors.set(3, new Array<Prototype>());
    this.neighbors.set(4, new Array<Prototype>());
    this.neighbors.set(5, new Array<Prototype>());
  }

  // initial object has to be parsed from object to prototype
  static parseFromObject(objs: Prototype[]): Prototype[] {
    const prototypes = new Array<Prototype>();

    for (const obj of objs) {
      const prototype = new Prototype();
      prototype.mesh = obj.mesh;
      prototype.rotation = new Vector3(obj.rotation.x, obj.rotation.y, obj.rotation.z);
      for (const opening of obj.openings) {
        prototype.openings.push(new Vector3(opening.x, opening.y, opening.z));
      }
      prototypes.push(prototype);
    }

    // find matching/neighboring prototypes
    for (const protoA of prototypes) {
      for (const protoB of prototypes) {
        for (const openingA of protoA.openings) {
          for (const openingB of protoB.openings) {
            // if the opening of one prototype matches the opening of another prototype
            // to check if they match the opening of protoB has to be inverted
            let invertedB: Vector3 = openingB.clone();
            invertedB.multiplyScalar(-1);
            if (openingA.equals(invertedB)) {
              // add protoB to the neighbors of protoA at the side openingA
              // console.log("a", protoA.neighbors.get(new Vector3(1, 0, 0)));
              protoA.neighbors.get(vec3ToIndex(openingA))?.push(protoB);
            }
          }
        }
      }
    }

    return prototypes;
  }
}

// 0 -   1,  0,  0
// 1 -   0,  1,  0
// 2 -   0,  0,  1
// 3 -  -1,  0,  0
// 4 -   0, -1,  0
// 5 -   0,  0, -1
function vec3ToIndex(vec3: Vector3): number {
  if (vec3.length() != 1) throw new Error("Vector should have length of 1.");

  if (vec3.x > 0) return 0;
  if (vec3.y > 0) return 1;
  if (vec3.z > 0) return 2;
  if (vec3.x < 0) return 3;
  if (vec3.y < 0) return 4;
  if (vec3.z < 0) return 5;

  throw new Error("No matching index found.")
}
