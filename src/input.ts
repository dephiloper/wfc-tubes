import { Vector2 } from "three";

export interface IInput {
  forward: boolean;
  left: boolean;
  backward: boolean;
  right: boolean;
  jump: boolean;

  mousePos: Vector2;
  prevMousePos: Vector2;
  mouseDown: boolean;
}

export class Input implements IInput {
  private static _instance: IInput;

  forward: boolean;
  left: boolean;
  backward: boolean;
  right: boolean;
  jump: boolean;

  mousePos: Vector2;
  prevMousePos: Vector2;
  mouseDown: boolean;

  public static get Instance() {
    if (!Input._instance) {
      Input._instance = new Input();
    }

    return Input._instance;
  }

  private constructor() {
    this.init();
    this.mousePos = new Vector2();
    this.prevMousePos = new Vector2();
  }

  private init(): void {
    document.addEventListener("keydown", (event: KeyboardEvent) => this.onKeyChanged(event, true), false);
    document.addEventListener("keyup", (event: KeyboardEvent) => this.onKeyChanged(event, false), false);

    document.addEventListener("mousemove", (event: MouseEvent) => this.onMouseMoved(event), false);
    document.addEventListener("mousedown", (event: MouseEvent) => this.onMouseDown(event, true), false);
    document.addEventListener("mouseup", (event: MouseEvent) => this.onMouseDown(event, false), false);
  }

  private onKeyChanged(event: KeyboardEvent, down: boolean): void {
    switch (event.key) {
      case 'w':
        this.forward = down;
        break;
      case 'a':
        this.left = down;
        break;
      case 's':
        this.backward = down;
        break;
      case 'd':
        this.right = down;
        break;
      case ' ':
        this.jump = down;
        break;
    }
  };

  private onMouseMoved(event: MouseEvent): void {
    this.prevMousePos.copy(this.mousePos);

    this.mousePos.x = event.clientX;
    this.mousePos.y = event.clientY;
  }

  private onMouseDown(event: MouseEvent, down: boolean): void {
    if (event.button === 0) {
      this.mouseDown = down;
    }
  }
}