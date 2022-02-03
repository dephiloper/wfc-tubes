import assert from "assert";
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

export function IsBorderPosition(s: Vector3, p: Vector3): boolean {
  return p.x === 0 || p.x === s.x - 1 || p.y === 0 || p.y === s.y - 1 || p.z === 0 || p.z === s.z - 1
}

export function outOfBounds(s: Vector3, p: Vector3): boolean {
  return p.x < 0 || p.x > s.x - 1 || p.y < 0 || p.y > s.y - 1 || p.z < 0 || p.z > s.z - 1
}

// index = 1
// 1 % 2 = 1
// 1 * -2 = -2
// 2 + 1 = -1
export function InvertDirection(index: number): number {
  return index + (index % 2) * -2 + 1;
}

export function IndexToDirection(index: number): Vector3 {
  switch (index) {
    case 0:
      return new Vector3(-1, 0, 0);
    case 1:
      return new Vector3(1, 0,  0);
    case 2:
      return new Vector3(0, -1, 0);
    case 3:
      return new Vector3(0, 1,  0);
    case 4:
      return new Vector3(0, 0, -1);
    case 5:
      return new Vector3(0, 0,  1);
    default:
      return new Vector3();
  }
}

// 0 -   -1,   0,   0
// 1 -    1,   0,   0
// 2 -    0,  -1,   0
// 3 -    0,   1,   0
// 4 -    0,   0,  -1
// 5 -    0,   0,   1
export function DirectionToIndex(vec3: Vector3): number {
  assert(vec3.length() === 1, "Vector should have length of 1.")

  if (vec3.x < 0) return 0;
  if (vec3.x > 0) return 1;
  if (vec3.y < 0) return 2;
  if (vec3.y > 0) return 3;
  if (vec3.z < 0) return 4;
  if (vec3.z > 0) return 5;

  assert.fail("No matching index found.");
}

