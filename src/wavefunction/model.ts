import { Prototype } from "./../prototype";
import { Vector3 } from "three";
import { ToIndex, ToPosition, DirectionToIndex, IsBorderPosition, IndexToDirection, OutOfBounds } from "../utils/common";
import { WaveFunction } from "./wavefunction";
import seedrandom from "seedrandom";
import prng from " @types/prng";
import assert from "assert";
import log from "loglevel";
import Loader from "../utils/loader";

export class Model {
  public size: Vector3;
  public prototypes: Prototype[];
  private wf: WaveFunction;
  private rng: prng;

  constructor(size: Vector3) {
    const seed = Math.random().toString();
    log.info(`Seed generated: ${seed}`);

    this.size = size;
    this.rng = seedrandom.alea(seed);
  }

  public async run(noWhiteSpace: boolean = false, constrainBorder: boolean = true, fullyConnected: boolean = true, terminalAtBorder: boolean = false): Promise<number[]> {
    this.prototypes = await Loader.Instance.loadPrototypes();
    this.wf = new WaveFunction(this.prototypes, this.rng);
    await this.wf.initGrid(this.size);

    if (constrainBorder) this.constrainBorderTiles();

    if (fullyConnected) {
      this.defineTerminalPositions(terminalAtBorder);
      // if all tubes should be connected, only allow connecting tubes
      // removing prototype 4 to 9
      this.wf.restrictTiles(4, 6);
    }

    this.wf.initWeights(noWhiteSpace);

    while (!this.wf.isFullyCollapsed()) {
      this.iterate();
    }

    log.info(`Generation process completed.`)
    return this.wf.grid.reduce((prev, next) => { return prev.concat(next); });
  }

  private constrainBorderTiles() {
    let constraining: Map<number, Set<number>> = new Map<number, Set<number>>();

    for (let i = 0; i < this.wf.grid.length; i++) {
      const pos: Vector3 = ToPosition(this.size, i);

      // check all positions in the grid that are on the border
      if (IsBorderPosition(this.size, pos)) {
        // go through all the tiles and check their openings
        for (const tile of this.wf.grid[i]) {
          const proto: Prototype = this.prototypes[tile];
          for (const opening of proto.openings) {
            const dir = IndexToDirection(opening);
            const neighbor = pos.clone().add(dir);

            // check if on the current position a possible tile would
            // have an opening pointing to the border
            // constrain the tile if so
            if (OutOfBounds(this.size, neighbor)) {
              if (!constraining.get(i))
                constraining.set(i, new Set<number>());
              constraining.get(i)!.add(tile);
            }
          }
        }
      }
    }

    constraining.forEach((tiles, index) => tiles.forEach(tile => this.wf.constrain(index, tile)));
    constraining.forEach((_, index) => this.propagate(index));
  }

  private defineTerminalPositions(terminalAtBorder: boolean, terminalCount: number = 2) {
    const terminalPositions: number[] = Array.from({ length: terminalCount }, () => Math.floor(this.rng() * this.wf.grid.length));
    const terminalTiles: number[] = [...this.prototypes.slice(4, 10)].map(p => p.id);

    for (const p of terminalPositions) {
      const possibleTiles: number[] = terminalTiles.filter(tile => this.wf.grid[p].includes(tile));
      let tile: number = possibleTiles[Math.floor(Math.random() * possibleTiles.length)];
      this.wf.collapse(p, tile!);
      this.propagate(p);
    }

    const collapsedCount: number = this.wf.countCollapsed();
    assert( collapsedCount === terminalCount, `The number of collapsed positions (${collapsedCount}) should match the terminal count (${terminalCount}).`);
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
        const neighborTiles = [...this.wf.grid[nIdx]];

        for (let neighborTile of neighborTiles) {
          const tileAllowed = this.checkTileCompatibility(cIdx, currentTiles, nIdx, neighborTile);

          if (!tileAllowed) {
            assert(neighborTiles.length > 1, `The tile ${neighborTile} at position ${nIdx} is about to be constrained.`)
            this.wf.constrain(nIdx, neighborTile);
            stack.push(nIdx);
          }
        }
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
    const dir: number = DirectionToIndex(dirVec);
    const proto0: Prototype = this.prototypes[tile0];
    const proto1: Prototype = this.prototypes[tile1];

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

    assert(minEntropyId !== -1, "No min entropy id found!");
    return minEntropyId;
  }
}