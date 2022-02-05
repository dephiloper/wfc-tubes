import * as THREE from 'three';
import { Clock, OrthographicCamera, Vector3 } from 'three';
import { Model } from './wavefunction/model';
import { ToPosition } from './utils/common';
import log from 'loglevel';
import Loader from './utils/loader';
import { throttle } from 'throttle-debounce';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// red:   x
// green: y
// blue:  z
class Main {
  private readonly GRID_SIZE: number = 10;
  private readonly CAMERA_SIZE: number = 40;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private clock: Clock = new Clock();
  private camera: OrthographicCamera;
  private group: THREE.Group;

  public async init(): Promise<void> {
    log.setLevel(log.levels.DEBUG);
    window.addEventListener('resize', throttle(100, () => game.resize()));

    this.scene = new THREE.Scene();
    this.group = new THREE.Group();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

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
    this.renderer.render(this.scene, this.camera);

    const axesHelper = new THREE.AxesHelper(5);
    new OrbitControls(this.camera, this.renderer.domElement);

    this.group.add(axesHelper);

    this.setupLight();

    const model = new Model(new Vector3(this.GRID_SIZE, this.GRID_SIZE, this.GRID_SIZE));
    this.renderGrid(model.size);

    const grid = await model.run();
    await this.renderModel(model, grid);

    this.renderer.setAnimationLoop(async () => await this.process());
    this.scene.add(this.group);
  }

  public resize(): void {
    const aspect: number = window.innerWidth / window.innerHeight;
    this.camera.left = (this.CAMERA_SIZE * aspect) / -2;
    this.camera.right = (this.CAMERA_SIZE * aspect) / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private setupLight(): void {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 300, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(75, 300, -75);
    this.scene.add(dirLight);
  }

  private renderGrid(size: THREE.Vector3) {
    const spacing: number = 2;

    for (let i = 0; i < size.x * size.y * size.z; i++) {
      const geometry = new THREE.BoxBufferGeometry(1.9, 1.9, 1.9);
      const material = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide, opacity: 0.05, transparent: true });
      const mesh = new THREE.Mesh(geometry, material);
      const p = ToPosition(size, i);
      mesh.position.add(p.multiplyScalar(spacing));
      mesh.position.sub(new Vector3((size.x * spacing) / 2, (size.y * spacing) / 2, (size.z * spacing) / 2).subScalar(spacing/2));
      this.group.add(mesh);
    }
  }

  private async renderModel(model: Model, grid: number[]): Promise<void> {
    const spacing: number = 2;

    // grid = grid.map(id => id < 10 ? 0 : id);

    for (let i = 0; i < grid.length; i++) {
      const prototype = model.prototypes[grid[i]];
      if (prototype.mesh === "") continue;
      const mesh = await Loader.Instance.loadMesh(`models/${prototype.mesh}`, prototype.rotation);
      const p = ToPosition(model.size, i);
      mesh.position.add(p.multiplyScalar(spacing));
      mesh.position.sub(new Vector3((model.size.x * spacing) / 2, (model.size.y * spacing) / 2, (model.size.z * spacing) / 2).subScalar(spacing/2));
      this.group.add(mesh);
    }

    console.log("group", this.group);
  }

  private async process(): Promise<void> {
    const delta = this.clock.getDelta();
    this.renderer.render(this.scene, this.camera);
    // this.group.rotation.y += delta * 0.05;
  }
}

const game = new Main();
game.init();
