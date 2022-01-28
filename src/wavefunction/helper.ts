import seedrandom from "seedrandom";
import { Vector3 } from "three";

/**
 * s: size
 * p: position
 * returns index
 */
export function ToIndex(s: Vector3, p: Vector3): number { return p.x + p.y * s.x + p.z * s.x * s.y }

/**
 * s: size
 * i: index
 * returns position
 */
export function ToPosition(s: Vector3, i: number): Vector3 {
  const p = new Vector3();
  p.z = Math.floor(i / (s.x * s.y));
  i = i % (s.x * s.y);
  p.y = Math.floor(i / s.x);
  p.x = i % s.x;

  return p;
}

export interface prng {
  (): number;
  double(): number;
  int32(): number;
  quick(): number;
  state(): seedrandom.State;
}