import { Vector3 } from "three";
import { ToPosition } from "../src/utils/common";

const size: Vector3 = new Vector3(2, 2, 2);
const size2: Vector3 = new Vector3(2, 2, 2);
console.log(ToPosition(size, 3));

console.log(size.equals(size2));