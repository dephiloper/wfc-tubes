import { TpChangeEvent, TpEvent } from "@tweakpane/core";
import { Pane } from "tweakpane";
import { RandomSeed } from "./common";

const SEED_OPTS = {
    seed: ""
}

const GEN_OPTS = {
    title: 'Generate'
}

export class UI {
    public onGenerate: (config: GenConfig) => void;
    private pane: Pane;
    private config: GenConfig;
    private seedInput: any;
    private genButton: any;

    constructor() {
        const parent = document.createElement("div");
        parent.style.position = "absolute";
        parent.style.top = "0";
        parent.style.right = "0.5";
        document.body.appendChild(parent);
        this.config = { seed: "", gridSize: 5, speed: 1, fixedSeed: false } as GenConfig;

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

        this.seedInput = tab.pages[0].addInput(SEED_OPTS, 'seed', {
            disabled: true,
            step: 1,
            min: 2,
            max: 20
        });

        const customSeedToggle = tab.pages[1].addInput({ customSeed: false }, 'customSeed', {
            label: 'Custom Seed?'
        });

        this.genButton = tab.pages[0].addButton(GEN_OPTS);

        this.genButton.on("click", (_: TpEvent) => {
            this.genButton.disabled = true;
            GEN_OPTS.title = "Generating...";
            if (this.seedInput.disabled) {
                SEED_OPTS.seed = RandomSeed();
                this.config.seed = SEED_OPTS.seed;
                this.seedInput.refresh();
            }

            this.onGenerate(this.config);
        });


        this.seedInput.on("change", (event: TpChangeEvent<string>) => this.config.seed = event.value);
        customSeedToggle.on("change", (event: TpChangeEvent<boolean>) => this.seedInput.disabled = !event.value);


        tab.pages[0].addInput({ gridSize: this.config.gridSize }, 'gridSize', { step: 1, min: 2, max: 20 })
            .on("change", (event: TpChangeEvent<number>) => this.config.gridSize = event.value);
    }

    public generationCompleted() {
        this.genButton.disabled = false;
        GEN_OPTS.title = "Generate";
    }
}

export class GenConfig {
    seed: string;
    gridSize: number;
}