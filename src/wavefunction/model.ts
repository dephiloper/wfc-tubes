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
    console.log("prototypes", this.wf.prototypes);

    while (!this.wf.isFullyCollapsed()) {
      this.iterate();
    }
    // TODO return wave function
  }

  private iterate() {
    const index = this.minEntropyId();
    this.wf.collapse(index);
    this.propagate(index);
  }

  private propagate(index: number) {
    console.log("propagate", [...this.wf.grid]);
    const stack: number[] = [index];

    while (stack.length > 0) {
      const cIdx = stack.pop()!;
      // contains all available tiles 
      // on this position within the grid
      const currentTiles: number[] = this.wf.grid[cIdx];

      const neighbors: number[] = this.findNeighbors(cIdx);
      for (let nIdx of neighbors) {
        const neighborTiles = this.wf.grid[nIdx];

        for (let neighborTile of neighborTiles) {
          const tileAllowed = currentTiles.some((currentTile: number) => { return this.checkCompatibility(cIdx, currentTile, nIdx, neighborTile) });

          if (!tileAllowed) {
            console.log("current", cIdx);
            console.log("constrain", nIdx, neighborTile);
            console.log("grid", this.wf.grid);
            debugger;

            if (neighborTiles.length === 1) {
              debugger;
            }
            this.wf.constrain(nIdx, neighborTile);
            stack.push(nIdx);
            debugger;
          }
        }
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

  private checkCompatibility(idA: number, tileA: number, idB: number, tileB: number): boolean {
    const posA: Vector3 = ToPosition(this.size, idA);
    const posB: Vector3 = ToPosition(this.size, idB);
    const dir: Vector3 = posB.clone().sub(posA).normalize();
    const pA: Prototype = this.wf.prototypes[tileA];
    const pB: Prototype = this.wf.prototypes[tileB];

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

      const simpleEntropy = this.wf.simpleEntropy(i);
      const noisedEntropy: number = simpleEntropy - (Math.random() / 1000);
      if (noisedEntropy < minEntropy) {
        minEntropy = noisedEntropy;
        minEntropyId = i;
      }
    }

    if (minEntropyId === -1) throw new Error("No min entropy id found!");
    return minEntropyId;
  }
}