import assert from "assert";
import { Vector3 } from "three";
import { InvertDirection, DirectionToIndex } from "./utils/common";

export class Prototype {
  id: number;
  mesh: string;
  rotation: Vector3;
  openings: number[];
  neighboringSides: number[][];

  constructor(mesh?: string, rotation?: Vector3, openings?: number[]) {
    this.mesh = mesh ?? "";
    this.rotation = rotation ?? new Vector3();
    this.openings = openings ?? new Array<number>();
    this.neighboringSides = new Array<number[]>();

    // create six neighboring sides objects for six sides of the voxel tiles
    for (let i = 0; i < 6; i++) this.neighboringSides.push(new Array<number>());
  }

  public isNeighbor(prototype: Prototype, direction: number) {
    return this.neighboringSides[direction].includes(prototype.id);
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
        let index: number = DirectionToIndex(new Vector3(opening.x, opening.y, opening.z));
        prototype.openings.push(index);
      }
      prototypes.push(prototype);
    }

    for (const p0 of prototypes) {
      for (const p1 of prototypes) {
        for (const o0 of p0.openings) {
          for (const o1 of p1.openings) {
            // if the opening of one prototype matches the opening of another prototype -
            // for this task we invert the opening direction of one prototype and compare
            // it with the other opening direction
            if (InvertDirection(o0) === o1) Prototype.AddUniqueNeighbor(p0, p1, o0);
          }
        }
      }

      // TODO add description
      p0.neighboringSides.forEach((neighbors: number[], dir: number) => {
        if (neighbors.length === 0) {
          const invertedDir: number = InvertDirection(dir);
          for (const prototype of prototypes) {
            if (!prototype.openings.includes(invertedDir)) {
              Prototype.AddUniqueNeighbor(p0, prototype, dir);
              Prototype.AddUniqueNeighbor(prototype, p0, invertedDir);
            }
          }
        }
      });
    }

    // check with assertion if created neighbors have a fitting counterpart
    for (const p0 of prototypes) {
      p0.neighboringSides.forEach((side: number[], direction) => {
        for (const neighbor of side) {
          assert(prototypes[neighbor].neighboringSides[InvertDirection(direction)].includes(p0.id),
            `Mismatch in prototype generation. ${p0} and ${prototypes[neighbor]} in direction ${direction}.`);
        }
      });
    }

    return prototypes;
  }

  private static AddUniqueNeighbor(p0: Prototype, p1: Prototype, dir: number) {
    // check whether p0 does not already has p1 as a neighbor
    assert(!p0.neighboringSides[dir].includes(p1.id), `Prototype ${p1.id} does already exist as neighbor for ${p0.id}`);

    // add reference of p1 to p0
    p0.neighboringSides[dir].push(p1.id);

  }
}


