import * as THREE from 'three';
import { Clock, OrthographicCamera, Vector3 } from 'three';
import { Model } from './wavefunction/model';
import { ToPosition } from './utils/common';
import log from 'loglevel';
import Loader from './utils/loader';
import { throttle } from 'throttle-debounce';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GenConfig, PresConfig, UI } from './utils/ui';
import { AssertionError } from 'assert';

// red:   x
// green: y
// blue:  z
class Main {
  private readonly CAMERA_SIZE: number = 40;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private clock: Clock = new Clock();
  private camera: OrthographicCamera;
  private parent: THREE.Group;
  private ui: UI;
  private model: Model;
  private modelGroup: THREE.Group;
  private presConf: PresConfig = new PresConfig();

  public async init(): Promise<void> {
    log.setLevel(log.levels.DEBUG);
    window.addEventListener('resize', throttle(100, () => game.resize()));

    this.ui = new UI();
    this.scene = new THREE.Scene();
    this.parent = new THREE.Group();
    this.modelGroup = new THREE.Group();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.setupCamera();
    this.renderer.render(this.scene, this.camera);

    new OrbitControls(this.camera, this.renderer.domElement);

    const axesHelper = new THREE.AxesHelper(5);
    this.parent.add(axesHelper);

    this.setupLight();

    this.renderer.setAnimationLoop(async () => await this.process());
    this.scene.add(this.parent);

    this.ui.onGenerate = async (config: GenConfig) => await this.generate(config);
    this.ui.onGenButton();

    this.ui.onPresentationChanged = async (partial: Partial<PresConfig>) => {
      this.presConf = {
        ...this.presConf,
        ...partial
      };
    }
  }

  private setupCamera() {
    const aspect: number = window.innerWidth / window.innerHeight;

    this.camera = new THREE.OrthographicCamera(
      (this.CAMERA_SIZE * aspect) / -2,
      (this.CAMERA_SIZE * aspect) / 2,
      this.CAMERA_SIZE / 2,
      this.CAMERA_SIZE / -2,
      -1000,
      1000
    );

    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);
    this.camera.zoom = 1.0;
    this.camera.updateProjectionMatrix();

    this.scene.add(this.camera);
  }

  public async generate(config: GenConfig): Promise<void> {
    document.body.style.backgroundColor = this.presConf.backgroundColor;

    log.info(`- Generation process started.`);
    const startTime: number = + new Date();

    if (this.model) this.disposeModel();
    this.model = new Model(config.seed, new Vector3(config.gridSize, config.gridSize, config.gridSize));

    let grid: number[];
    let iterativeGrid: [number, number][];

    for (let i = 0; i < 5; i++) {
      try {
        log.info(`Starting iteration #${i + 1}`);
        [grid, iterativeGrid] = await this.model.run(config);
        if (config.renderSpeed === 1)
          await this.renderModel(this.model, grid);
        else
          await this.renderModelIterative(this.model, iterativeGrid, config.renderSpeed);
        break;
      } catch (error: any) {
        if (error instanceof AssertionError) {
          log.info(`Collision happened! Restarting generation.`);
          log.debug("Error", error);
        }
      }
    }

    this.ui.generationCompleted();
    log.debug(`- Generation process completed in ${new Date((+ new Date()) - startTime).toISOString().slice(14, -1)}.`);
  }

  public resize(): void {
    const aspect: number = window.innerWidth / window.innerHeight;
    this.camera.left = (this.CAMERA_SIZE * aspect) / -2;
    this.camera.right = (this.CAMERA_SIZE * aspect) / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private setupLight(): void {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
    hemiLight.position.set(300, 300, 300);
    this.camera.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(75, 300, -75);
    this.camera.add(dirLight);
  }

  private async renderModel(model: Model, grid: number[]): Promise<void> {
    const spacing: number = 2;

    for (let i = 0; i < grid.length; i++) {
      const prototype = model.prototypes[grid[i]];
      if (prototype.mesh === "") continue;
      const mesh = await Loader.Instance.loadMesh(`models/${prototype.mesh}`, prototype.rotation);
      if (this.presConf.tint) (mesh.material as THREE.MeshBasicMaterial).color = new THREE.Color(this.presConf.tint);
      const p = ToPosition(model.size, i);
      mesh.position.add(p.multiplyScalar(spacing));
      mesh.position.sub(new Vector3((model.size.x * spacing) / 2, (model.size.y * spacing) / 2, (model.size.z * spacing) / 2).subScalar(spacing / 2));
      this.modelGroup.add(mesh);
    }
    this.parent.add(this.modelGroup);
  }
  
  private async renderModelIterative(model: Model, iterativeGrid: [number, number][], renderSpeed: number): Promise<void> {
    const spacing: number = 2;
    
    for (let i = 0; i < iterativeGrid.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 10 / renderSpeed));
      const index = iterativeGrid[i][0];
      const tile = iterativeGrid[i][1];
      const prototype = model.prototypes[tile];
      if (prototype.mesh === "") continue;
      const mesh = await Loader.Instance.loadMesh(`models/${prototype.mesh}`, prototype.rotation);
      if (this.presConf.tint) (mesh.material as THREE.MeshBasicMaterial).color = new THREE.Color(this.presConf.tint);
      const p = ToPosition(model.size, index);
      mesh.position.add(p.multiplyScalar(spacing));
      mesh.position.sub(new Vector3((model.size.x * spacing) / 2, (model.size.y * spacing) / 2, (model.size.z * spacing) / 2).subScalar(spacing / 2));
      this.modelGroup.add(mesh);
      this.parent.add(this.modelGroup);
    }
  }

  private disposeModel() {
    this.parent.remove(this.modelGroup);
    this.modelGroup = new THREE.Group();
  }

  private async process(): Promise<void> {
    const delta = this.clock.getDelta();
    this.renderer.render(this.scene, this.camera);
    if (this.presConf.autoRotate) this.parent.rotation.y += delta * 0.05;

  }
}

const game = new Main();
game.init();