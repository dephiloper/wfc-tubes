import { Prototype } from "./../prototype";
import { Vector3 } from "three";
import prng from " @types/prng";
import assert from "assert";

export class WaveFunction {
  public grid: number[][];
  private prototypes: Prototype[];
  private tiles: number[];
  private weights: number[];
  private rng: prng;

  public gridChanged: (index: number, tile: number) => void;

  constructor(prototypes: Prototype[], rng: prng, weights?: number[]) {
    this.prototypes = prototypes;
    this.rng = rng;
    this.weights = weights ?? new Array<number>();
  }

  public async initGrid(size: Vector3): Promise<void> {
    this.grid = new Array<number[]>();

    // represent the prototypes as individual ids
    // filled with values ranging from 0 to the number of prototypes - 1
    this.tiles = [...Array(this.prototypes.length).keys()];

    // prepare the voxel grid by entering all super positions 
    for (let i = 0; i < size.x * size.y * size.z; i++) this.grid[i] = [...this.tiles];
  }

  public restrictTiles(start: number, restrictCount: number) {
    this.tiles.splice(start, restrictCount);
    this.grid = this.grid.map(tiles => tiles.length > 1 ? tiles.filter(tile => this.tiles.includes(tile)) : tiles);
  }

  public initWeights(noWhiteSpace: boolean) {
    if (this.weights.length !== this.tiles.length) this.weights = new Array(this.prototypes.length).fill(1);

    // if no whitespace should be enabled, set the wheight for the white space tile to 0
    if (noWhiteSpace) this.weights[0] = 0;
  }

  public isFullyCollapsed(): boolean {
    return this.countCollapsed() === this.grid.length;
  }

  public countCollapsed(): number {
    return this.grid.filter((tiles) => tiles.length === 1).length;
  }

  public simpleEntropy(id: number): number {
    return this.grid[id].length / this.tiles.length;
  }

  public shannonEntropy(id: number): number {
    // normally get the weight from a previous build
    // this shortcut gives all the weights the same value of 1
    let sumWeights: number = 0;
    let sumWeightsLog: number = 0;

    for (let option of this.grid[id]) {
      const weight: number = this.weights[option];
      sumWeights += weight;
      sumWeightsLog += weight * Math.log(weight);
    }

    const entropy = Math.log(sumWeights) - (sumWeightsLog / sumWeights);
    return entropy;
  }

  public collapse(index: number, preSelectedTile?: number): void {
    let pick: number = preSelectedTile ?? -1;
    if (pick === -1) {
      const tiles = this.grid[index];
      let weightSum = 0;

      // generate map out of possible to select tiles
      // and their weights
      // + add up the weights to their total sum
      const validWeights = new Map(tiles.map(tile => {
        weightSum += this.weights[tile];
        return [tile, this.weights[tile]];
      }));

      // pick random tile based on weight propability
      let rnd: number = this.rng() * weightSum;

      for (let [tile, weight] of validWeights) {
        rnd -= weight;
        if (rnd < 0) {
          pick = tile;
          break;
        }
      }
    }



    assert(pick !== -1, "The picked tile should not be -1.");
    assert(this.grid[index].includes(pick), `The picked tile (${pick}) does not exist in the grid at position ${index} (${this.grid[index]}).`);
    this.grid[index] = [pick];

    // call interactive update
    this.gridChanged(index, pick);
  }

  public constrain(index: number, tile: number): void {
    const i = this.grid[index].indexOf(tile);
    assert(i !== -1, `Tile ${tile} that has to be constrained was not found on index ${index}.`);
    
    this.grid[index].splice(i, 1);
    
    assert(this.grid[index].length !== 0, `Grid at index ${index} is empty after constraining.`);

    // call interactive update
    if (this.grid[index].length === 1) this.gridChanged(index, this.grid[index][0]);

  }
}