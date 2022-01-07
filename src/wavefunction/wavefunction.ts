import { Prototype } from "./../prototype";
import { Vector3 } from "three";
import YAML from 'yaml';

export class WaveFunction {
  public grid: number[][];
  private size: Vector3;
  private elements: number[];
  private weights: number[];
  prototypes: Prototype[];

  constructor(size: Vector3, weights?: number[]) {
    this.size = size;
    this.weights = weights ?? new Array(this.size.x * this.size.y * this.size.z).fill(1);
  }

  public async initGrid(): Promise<void> {
    const yaml = await fetch('./prototypes.yaml');

    // load the prototypes
    this.prototypes = Prototype.ParseFromObject(YAML.parse(await yaml.text()));

    // represent the prototypes as individual ids
    // filled with values ranging from 0 to the number of prototypes
    this.elements = [...Array(this.prototypes.length).keys()];

    this.grid = new Array<number[]>();

    // prepare the voxel grid by entering all super positions 
    for (let i = 0; i < this.size.x * this.size.y * this.size.z; i++)
      this.grid[i] = this.elements;
  }

  public isFullyCollapsed(): boolean {
    return this.grid.every((voxel) => voxel.length === 1);
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

    return Math.log(sumWeights) - (sumWeightsLog / sumWeights);
  }

  public collapse(index: number): void {
    const voxel = this.grid[index];
    let weightSum = 0;

    // generate map out of possible to select elements
    // and their weights
    // + add up the weights to their total sum
    const validWeights = new Map(voxel.map(element => {
      weightSum += this.weights[element];
      return [element, this.weights[element]];
    }));

    // pick random element based on weight propability
    let pick: number = -1;
    let rnd: number = Math.random() * weightSum;

    for (let [element, weight] of validWeights) {
      rnd -= weight;
      if (rnd < 0) {
        pick = element;
        break;
      }
    }

    if (pick === -1) throw new Error("The picked element should not be -1.");
    this.grid[index] = [pick];
  }
}