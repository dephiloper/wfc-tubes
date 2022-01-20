import { Prototype } from "./../prototype";
import { Vector3 } from "three";
import YAML from 'yaml';

export class WaveFunction {
  public grid: number[][];
  private size: Vector3;
  private tiles: number[];
  private weights: number[];
  prototypes: Prototype[];

  constructor(size: Vector3, weights?: number[]) {
    this.size = size;
    this.weights = weights ?? new Array<number>();
  }

  public async initGrid(): Promise<void> {
    const yaml = await fetch('./prototypes.yaml');

    // load the prototypes
    this.prototypes = Prototype.ParseFromObject(YAML.parse(await yaml.text()));

    // represent the prototypes as individual ids
    // filled with values ranging from 0 to the number of prototypes - 1
    this.tiles = [...Array(this.prototypes.length).keys()];

    this.grid = new Array<number[]>();

    if (this.weights.length === 0) this.weights = new Array(this.tiles.length).fill(2);

    // prepare the voxel grid by entering all super positions 
    for (let i = 0; i < this.size.x * this.size.y * this.size.z; i++)
      this.grid[i] = [...this.tiles];
  }

  public isFullyCollapsed(): boolean {
    console.log("fully collapsed?", this.grid.filter(tiles => tiles.length === 1).length);

    return this.grid.every((tiles) => tiles.length === 1);
  }

  public simpleEntropy(id: number): number {
    return this.grid[id].length / this.prototypes.length;
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

  public collapse(index: number): void {
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
    let pick: number = -1;
    let rnd: number = Math.random() * weightSum;

    for (let [tile, weight] of validWeights) {
      rnd -= weight;
      if (rnd < 0) {
        pick = tile;
        break;
      }
    }

    if (pick === -1) throw new Error("The picked tile should not be -1.");
    this.grid[index] = [pick];
  }

  public constrain(index: number, tile: number): void {
    const i = this.grid[index].indexOf(tile);
    if (i == -1) {
      throw new Error("The tile that has to be constrained was not found.")
    }

    this.grid[index].splice(i, 1);

    if (this.grid[index].length === 0) {
    }

  }
}