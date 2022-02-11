import { TpChangeEvent, TpEvent } from "@tweakpane/core";
import { Pane } from "tweakpane";
import { RandomSeed } from "./common";

export class UI {
    public onGenerate: (config: GenConfig) => void;
    private pane: Pane;
    private config: GenConfig;

    constructor() {
        const parent = document.createElement("div");
        parent.style.position = "absolute";
        parent.style.top = "0";
        parent.style.right = "0.5";
        document.body.appendChild(parent);
        this.config = { seed: "", gridSize: 5, speed: 1, fixedSeed: false } as GenConfig;

        const INPUTS = {
            seed: ""
        }

        this.pane = new Pane({
            container: parent
        });

        const prefs = this.pane.addFolder({
            title: 'Preferences',
        });

        const tab = prefs.addTab({
            pages: [
                { title: 'Parameters' },
                { title: 'Advanced' },
            ],
        });

        const seedInput = tab.pages[0].addInput(INPUTS, 'seed', {
            disabled: true,
            step: 1,
            min: 2,
            max: 20
        });

        const customSeedToggle = tab.pages[1].addInput({ customSeed: false }, 'customSeed', {
            label: 'Custom Seed?'
        });

        const generateBtn = tab.pages[0].addButton({ title: 'Generate' });

        generateBtn.on("click", (_: TpEvent) => {
            if (seedInput.disabled) {
                INPUTS.seed = RandomSeed();
                this.config.seed = INPUTS.seed;
                seedInput.refresh();
            }
            
            this.onGenerate(this.config);
        });


        seedInput.on("change", (event: TpChangeEvent<string>) => this.config.seed = event.value);
        customSeedToggle.on("change", (event: TpChangeEvent<boolean>) => seedInput.disabled = !event.value);


        tab.pages[0].addInput({ gridSize: this.config.gridSize }, 'gridSize', { step: 1, min: 2, max: 20 })
            .on("change", (event: TpChangeEvent<number>) => this.config.gridSize = event.value);
        // tab.pages[0].addInput({ speed: this.config.speed }, 'speed', { step: 0.05, min: 0, max: 1 })
        //     .on("change", (event: TpChangeEvent<number>) => this.config.speed = event.value);
    }
}

export class GenConfig {
    seed: string;
    gridSize: number;
    speed: number;
}