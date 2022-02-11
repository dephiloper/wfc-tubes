import assert from "assert";
import { Vector3 } from "three";

// declare global {
//   interface Vector3 {
//     LEFT: Vector3;
//     RIGHT: Vector3;
//     BOTTOM: Vector3;
//     TOP: Vector3;
//     BACK: Vector3;
//     FRONT: Vector3;
//   }
// }

export const DIR_VECTORS: Vector3[] = [
  new Vector3(-1, 0, 0),
  new Vector3(1, 0, 0),
  new Vector3(0, -1, 0),
  new Vector3(0, 1, 0),
  new Vector3(0, 0, -1),
  new Vector3(0, 0, 1)
];

export const DIR_INDICES: number[] = [...Array(DIR_VECTORS.length).keys()];

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

export function IsBorderPosition(s: Vector3, p: Vector3): boolean {
  return p.x === 0 || p.x === s.x - 1 || p.y === 0 || p.y === s.y - 1 || p.z === 0 || p.z === s.z - 1
}

export function OutOfBounds(s: Vector3, p: Vector3): boolean {
  return p.x < 0 || p.x > s.x - 1 || p.y < 0 || p.y > s.y - 1 || p.z < 0 || p.z > s.z - 1
}

// index = 1
// 1 % 2 = 1
// 1 * -2 = -2
// 2 + 1 = -1
export function InvertDirection(index: number): number { return index + (index % 2) * -2 + 1; }

export function IndexToDirection(index: number): Vector3 { return DIR_VECTORS[index] };

// 0 -   -1,   0,   0
// 1 -    1,   0,   0
// 2 -    0,  -1,   0
// 3 -    0,   1,   0
// 4 -    0,   0,  -1
// 5 -    0,   0,   1
export function DirectionToIndex(dir: Vector3): number {
  assert(dir.length() === 1, "Vector should have length of 1.")

  const index: number = DIR_VECTORS.findIndex(direction => direction.equals(dir));
  assert.notEqual(index, -1, "No matching index found.");
  return index;
}

export const RandomSeed = (): string => Math.random().toString(16).substring(2, 8);

