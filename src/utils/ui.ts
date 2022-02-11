import { ButtonApi, InputBindingApi, TpChangeEvent, TpEvent } from "@tweakpane/core";
import { Pane } from "tweakpane";
import { RandomSeed } from "./common";

const SEED_OPTS = { seed: "" }

export class GenConfig {
    seed: string;
    gridSize: number;

    noWhiteSpace: boolean;
    constrainBorder: boolean;
    fullyConnected: boolean;
    terminalAtBorder: boolean;
}

export class PresConfig {
    autoRotate: boolean;
}

export class UI {
    public onGenerate: (config: GenConfig) => void;
    public onPresentationChanged: (config: Partial<PresConfig>) => void;
    private pane: Pane;
    public genConf: GenConfig;
    private seedInput: InputBindingApi<any, any>;
    private genButton: ButtonApi;

    constructor() {
        const parent = document.createElement("div");
        parent.style.position = "absolute";
        parent.style.top = "0";
        parent.style.right = "0.5";
        document.body.appendChild(parent);

        this.genConf = {
            seed: "",
            gridSize: 5,
            autoRotate: false,
            fixedSeed: false,
            noWhiteSpace: true,
            constrainBorder: true,
            fullyConnected: true,
            terminalAtBorder: true
        } as GenConfig;

        this.pane = new Pane({ container: parent });
        const prefs = this.pane.addFolder({ title: 'Preferences' });

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

        const autoRotateToggle = tab.pages[0].addInput({ autoRotate: false }, 'autoRotate', {
            label: 'enable auto rotate'
        });

        const noWhiteSpaceToggle = tab.pages[1].addInput({ noWhiteSpace: true }, 'noWhiteSpace', {
            label: 'no whitespace'
        });
        const constrainBorderToggle = tab.pages[1].addInput({ constrainBorder: true }, 'constrainBorder', {
            label: 'closed structures'
        });
        const fullyConnectedToggle = tab.pages[1].addInput({ fullyConnected: true }, 'fullyConnected', {
            label: 'maze fully connected'
        });
        const terminalAtBorderToggle = tab.pages[1].addInput({ terminalAtBorder: true }, 'terminalAtBorder', {
            label: 'terminal tubes at border'
        });
        const customSeedToggle = tab.pages[1].addInput({ customSeed: false }, 'customSeed', {
            label: 'enable custom seed'
        });

        this.genButton = tab.pages[0].addButton({ title: 'Generate' });
        this.genButton.on("click", (_: TpEvent) => this.onGenButton());

        this.seedInput.on("change", (event: TpChangeEvent<string>) => this.genConf.seed = event.value);
        customSeedToggle.on("change", (event: TpChangeEvent<boolean>) => this.seedInput.disabled = !event.value);
        noWhiteSpaceToggle.on("change", (event: TpChangeEvent<boolean>) => this.genConf.noWhiteSpace = event.value);
        constrainBorderToggle.on("change", (event: TpChangeEvent<boolean>) => this.genConf.constrainBorder = event.value);
        fullyConnectedToggle.on("change", (event: TpChangeEvent<boolean>) => this.genConf.fullyConnected = event.value);
        terminalAtBorderToggle.on("change", (event: TpChangeEvent<boolean>) => this.genConf.terminalAtBorder = event.value);
        autoRotateToggle.on("change", (event: TpChangeEvent<boolean>) => {
            this.onPresentationChanged({ autoRotate: event.value });
        });
        tab.pages[0].addInput({ gridSize: this.genConf.gridSize }, 'gridSize', { step: 1, min: 2, max: 20 })
            .on("change", (event: TpChangeEvent<number>) => this.genConf.gridSize = event.value);
    }

    public onGenButton() {
        this.genButton.disabled = true;
        if (this.seedInput.disabled) {
            SEED_OPTS.seed = RandomSeed();
            this.genConf.seed = SEED_OPTS.seed;
            this.seedInput.refresh();
        }

        this.onGenerate(this.genConf);
    }

    public generationCompleted() {
        this.genButton.disabled = false;
    }
}