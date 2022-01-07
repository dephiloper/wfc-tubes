import { Prototype } from "./../prototype";
import { Vector3 } from "three";
import { ToIndex, ToPosition } from "./helper";
import { WaveFunction } from "./wavefunction";

export class Model {
  private wf: WaveFunction;
  private size: Vector3;

  constructor(size: Vector3) {
    this.size = size;
    this.wf = new WaveFunction(size);
  }

  // @ts-ignore
  public async run(): void {
    await this.wf.initGrid();

    //while (this.wf.isFullyCollapsed()) {
    this.iterate();
    //}

    // TODO return wave function
  }

  // @ts-ignore
  private iterate() {
    const index = this.minEntropyId();
    this.wf.collapse(index);
    this.propagate(index);
  }

  // @ts-ignore
  private propagate(index: number) {
    const stack: number[] = [index];

    while (stack.length > 0) {
      const cIdx = stack.pop()!;
      // contains all possible elements 
      // on this position within the grid
      const currentVoxel: number[] = this.wf.grid[cIdx];

      const neighbors: number[] = this.findNeighbors(cIdx);
      for (let nIdx of neighbors) {
        const neighborVoxel = this.wf.grid[nIdx];
        const some = currentVoxel.some((cElement: number) => { neighborVoxel.map((nElement: number) => { return this.checkCompatibility(cIdx, cElement, nIdx, nElement); }) });
        console.log(some);
      }
    }

  }

  private findNeighbors(idx: number): number[] {
    const neighbors = new Array<number>();
    const pos = ToPosition(this.size, idx);
    const x0 = pos.clone().add(new Vector3(-1));
    const x1 = pos.clone().add(new Vector3(1));
    const y0 = pos.clone().add(new Vector3(0, -1));
    const y1 = pos.clone().add(new Vector3(0, 1));
    const z0 = pos.clone().add(new Vector3(0, 0, -1));
    const z1 = pos.clone().add(new Vector3(0, 0, 1));

    if (x0.x >= 0) neighbors.push(ToIndex(this.size, x0));
    if (x1.x < this.size.x) neighbors.push(ToIndex(this.size, x1));

    if (y0.y >= 0) neighbors.push(ToIndex(this.size, y0));
    if (y1.y < this.size.y) neighbors.push(ToIndex(this.size, y1));

    if (z0.z >= 0) neighbors.push(ToIndex(this.size, z0));
    if (z1.z < this.size.z) neighbors.push(ToIndex(this.size, z1));

    return neighbors;
  }

  private checkCompatibility(idA: number, elemenA: number, idB: number, elementB: number): boolean {
    const posA: Vector3 = ToPosition(this.size, idA);
    const posB: Vector3 = ToPosition(this.size, idB);
    const dir: Vector3 = posB.clone().sub(posA).normalize();
    const pA: Prototype = this.wf.prototypes[elemenA];
    const pB: Prototype = this.wf.prototypes[elementB];

    const compatibilty: boolean = Prototype.CheckCompatibility(pA, pB, dir);
    return compatibilty;
  }

  /**
   * Returns the index (coordinate) with the minimum
   * entropy within the voxel grid.
   */
  private minEntropyId(): number {
    let minEntropyId: number = -1;
    let minEntropy: number = Number.MAX_VALUE;

    for (let i = 0; i < this.size.x * this.size.y * this.size.z; i++) {
      if (this.wf.grid[i].length === 1) continue; // skip over already collapsed grid positions

      const noisedEntropy: number = this.wf.shannonEntropy(i) - (Math.random() / 1000);

      if (noisedEntropy < minEntropy) {
        minEntropy = noisedEntropy;
        minEntropyId = i;
      }
    }

    if (minEntropyId === -1) throw new Error("No min entropy id found!");
    return minEntropyId;
  }
}