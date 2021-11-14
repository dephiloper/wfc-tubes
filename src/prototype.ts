import { Vector3 } from "three";

export class Prototype {
  mesh: string;
  rotation: Vector3;

  constructor(mesh?: string, rotation?: Vector3) {
    this.mesh = mesh ?? "";
    this.rotation = rotation ?? new Vector3();;
  }
}