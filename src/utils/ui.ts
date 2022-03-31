import { ButtonApi, InputBindingApi, TpChangeEvent, TpEvent } from "@tweakpane/core";
import { Pane } from "tweakpane";
import { RandomSeed } from "./common";

const SEED_OPTS = { seed: "" }

const COLOR_OPTS = {
    background: '#000',
    tint: '#fff',
  };

export class GenConfig {
    seed: string;
    gridSize: number;
    renderSpeed: number;

    noWhiteSpace: boolean;
    constrainBorder: boolean;
    fullyConnectedPath: boolean;
    terminalAtBorder: boolean;
}

export class PresConfig {
    autoRotate: boolean;
    backgroundColor: string;
    tint: string;
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
            renderSpeed: 1,
            autoRotate: false,
            fixedSeed: false,
            noWhiteSpace: true,
            constrainBorder: true,
            fullyConnectedPath: true,
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

        const backgroundColorPicker = tab.pages[0].addInput(COLOR_OPTS , 'background', {
            label: 'background color'
        });

        const labyrinthTintPicker = tab.pages[0].addInput(COLOR_OPTS, 'tint', {
            label: 'labyrinth tint'
        });

        const autoRotateToggle = tab.pages[0].addInput({ autoRotate: false }, 'autoRotate', {
            label: 'enable auto rotate'
        });

        const constrainBorderToggle = tab.pages[1].addInput({ constrainBorder: true }, 'constrainBorder', {
            label: 'constrain border tiles'
        });
        const noWhiteSpaceToggle = tab.pages[1].addInput({ noWhiteSpace: true }, 'noWhiteSpace', {
            label: 'no whitespace'
        });
        const fullyConnectedPathToggle = tab.pages[1].addInput({ fullyConnected: true }, 'fullyConnected', {
            label: 'fully connected path'
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
        backgroundColorPicker.on("change", (event) => this.onPresentationChanged({ backgroundColor: event.value }));
        labyrinthTintPicker.on("change", (event) => this.onPresentationChanged({ tint: event.value }));
        customSeedToggle.on("change", (event: TpChangeEvent<boolean>) => this.seedInput.disabled = !event.value);
        noWhiteSpaceToggle.on("change", (event: TpChangeEvent<boolean>) => this.genConf.noWhiteSpace = event.value);
        constrainBorderToggle.on("change", (event: TpChangeEvent<boolean>) => this.genConf.constrainBorder = event.value);
        fullyConnectedPathToggle.on("change", (event: TpChangeEvent<boolean>) => this.genConf.fullyConnectedPath = event.value);
        terminalAtBorderToggle.on("change", (event: TpChangeEvent<boolean>) => this.genConf.terminalAtBorder = event.value);
        autoRotateToggle.on("change", (event: TpChangeEvent<boolean>) => {
            this.onPresentationChanged({ autoRotate: event.value });
        });
        tab.pages[0].addInput({ gridSize: this.genConf.gridSize }, 'gridSize', { step: 1, min: 2, max: 20 })
            .on("change", (event: TpChangeEvent<number>) => this.genConf.gridSize = event.value);

        tab.pages[0].addInput({ renderSpeed: this.genConf.renderSpeed }, 'renderSpeed', { step: 0.05, min: 0.1, max: 1 })
            .on("change", (event: TpChangeEvent<number>) => this.genConf.renderSpeed = event.value);
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