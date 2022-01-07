import { Vector3 } from "three";

export class Prototype {
  id: number;
  mesh: string;
  rotation: Vector3;
  openings: Vector3[];
  neighbors: Map<number, number[]>;

  constructor(mesh?: string, rotation?: Vector3, openings?: Vector3[]) {
    this.mesh = mesh ?? "";
    this.rotation = rotation ?? new Vector3();
    this.openings = openings ?? new Array<Vector3>();
    this.neighbors = new Map<number, number[]>();

    // create six neighbor objects for six sides of the voxel element
    this.neighbors.set(0, new Array<number>());
    this.neighbors.set(1, new Array<number>());
    this.neighbors.set(2, new Array<number>());
    this.neighbors.set(3, new Array<number>());
    this.neighbors.set(4, new Array<number>());
    this.neighbors.set(5, new Array<number>());
  }

  // initial object has to be parsed from object to prototype
  public static ParseFromObject(objs: any[]): Prototype[] {
    const prototypes = new Array<Prototype>();

    for (let i = 0; i < objs.length; i++) {
      const prototype = new Prototype();
      prototype.id = i;
      prototype.mesh = objs[i].mesh;
      prototype.rotation = new Vector3(objs[i].rotation.x, objs[i].rotation.y, objs[i].rotation.z);
      for (const opening of objs[i].openings) {
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
              protoA.neighbors.get(Prototype.Vec3ToIndex(openingA))?.push(protoB.id);
            }
          }
        }

        for (let i = 0; i < 6; i++) {
          // add empty field if there are no neighbors for a prototype
          if (protoA.neighbors.get(i)?.length === 0) {
            protoA.neighbors.get(i)?.push(0);
          }
        }
      }
    }

    return prototypes;
  }

  public static IndexToVec3(index: number): Vector3 {
    switch (index) {
      case 0:
        return new Vector3(1, 0, 0);
      case 1:
        return new Vector3(0, 1, 0);
      case 2:
        return new Vector3(0, 0, 1);
      case 3:
        return new Vector3(-1, 0, 0);
      case 4:
        return new Vector3(0, -1, 0);
      case 5:
        return new Vector3(0, 0, -1);
      default:
        return new Vector3();
    }
  }

  // 0 -   1,  0,  0
  // 1 -   0,  1,  0
  // 2 -   0,  0,  1
  // 3 -  -1,  0,  0
  // 4 -   0, -1,  0
  // 5 -   0,  0, -1
  public static Vec3ToIndex(vec3: Vector3): number {
    if (vec3.length() != 1) throw new Error("Vector should have length of 1.");

    if (vec3.x > 0) return 0;
    if (vec3.y > 0) return 1;
    if (vec3.z > 0) return 2;
    if (vec3.x < 0) return 3;
    if (vec3.y < 0) return 4;
    if (vec3.z < 0) return 5;

    throw new Error("No matching index found.")
  }

  public static CheckCompatibility(a: Prototype, b: Prototype, dir: Vector3): boolean {
    const index = this.Vec3ToIndex(dir);

    return a.neighbors.get(index)!.includes(b.id);
  }
}


