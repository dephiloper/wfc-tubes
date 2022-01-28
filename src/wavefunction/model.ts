import { Prototype } from "./../prototype";
import { Vector3 } from "three";
import { prng, ToIndex, ToPosition } from "./helper";
import { WaveFunction } from "./wavefunction";
import seedrandom from "seedrandom";

export class Model {
  public wf: WaveFunction;
  public size: Vector3;
  private rng: prng;

  constructor(size: Vector3) {
    // const seed = "0.48397949242158544";
    const seed = Math.random().toString();
    console.log("Seed is", seed);
    this.rng = seedrandom.alea(seed);
    this.size = size;
    this.wf = new WaveFunction(size, this.rng);
  }

  public async run(): Promise<number[]> {
    await this.wf.initGrid();

    while (!this.wf.isFullyCollapsed()) {
      this.iterate();
    }

    console.log("done");
    return this.wf.grid.reduce((prev, next) => { return prev.concat(next); });
    // TODO return wave function
  }

  private iterate() {
    const index = this.minEntropyId();
    this.wf.collapse(index);
    this.propagate(index);
  }

  private propagate(index: number) {
    const stack: number[] = [index];

    while (stack.length > 0) {
      const cIdx = stack.pop()!;
      // contains all available tiles 
      // on this position within the grid
      const currentTiles: number[] = this.wf.grid[cIdx];

      const neighbors: number[] = this.findNeighbors(cIdx);
      for (let nIdx of neighbors) {
        // console.log("checking neighbor", nIdx, "of neighbors", neighbors);
        const neighborTiles = [...this.wf.grid[nIdx]];

        for (let neighborTile of neighborTiles) {
          // console.log("checking neighbor tile", neighborTile, "with current tiles", currentTiles);
          const tileAllowed = this.checkTileCompatibility(cIdx, currentTiles, nIdx, neighborTile);

          if (!tileAllowed) {
            if (neighborTiles.length === 1) {
              debugger;
            }
            this.wf.constrain(nIdx, neighborTile);
            stack.push(nIdx);

            // console.log("current", cIdx);
            // console.log("constrain", neighborTile, "on", nIdx);
            // console.log("grid", this.wf.grid.toString());
          }
        }
        // console.log("done checking neighbor", nIdx);
      }

    }
  }
  private checkTileCompatibility(cIdx: number, currentTiles: number[], nIdx: number, neighborTile: number): boolean {
    return currentTiles.some((currentTile: number) => { return this.checkCompatibility(cIdx, currentTile, nIdx, neighborTile) });
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

  private checkCompatibility(id0: number, tile0: number, id1: number, tile1: number): boolean {
    const pos0: Vector3 = ToPosition(this.size, id0);
    const pos1: Vector3 = ToPosition(this.size, id1);
    const dirVec: Vector3 = pos1.clone().sub(pos0).normalize();
    const dir: number = Prototype.Vec3ToIndex(dirVec);
    const proto0: Prototype = this.wf.prototypes[tile0];
    const proto1: Prototype = this.wf.prototypes[tile1];

    return proto0.isNeighbor(proto1, dir);
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
      const noisedEntropy: number = simpleEntropy - (this.rng() / 1000);
      if (noisedEntropy < minEntropy) {
        minEntropy = noisedEntropy;
        minEntropyId = i;
      }
    }

    if (minEntropyId === -1) throw new Error("No min entropy id found!");
    return minEntropyId;
  }
}