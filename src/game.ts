import { Input, IInput } from './input';
import * as THREE from 'three';
import { Camera, Clock } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import YAML from 'yaml';

class Game {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  clock: Clock = new Clock();
  camera: Camera;
  input: IInput;
  group: THREE.Group;
  loader: GLTFLoader;

  public async Init(): Promise<void> {
    this.scene = new THREE.Scene();
    this.loader = new GLTFLoader();
    this.group = new THREE.Group();
    this.input = Input.Instance;

    const ratio: number = window.innerHeight / window.innerWidth;
    const width: number = 40;
    const height: number = width * ratio;

    this.camera = new THREE.OrthographicCamera(
      width / - 2,
      width / 2,
      height / 2,
      height / - 2,
      -1000,
      1000
    );

    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(this.camera);

    this.setupLight();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
    document.body.appendChild(this.renderer.domElement);

    this.renderer.setAnimationLoop(() => this.process());

    this.loader.load('models/tube.gltf', (gltf: GLTF): void => {
      this.group.add(gltf.scene);
      console.log("added");
    },
      // called while loading is progressing
      (xhr: ProgressEvent) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
      // called when loading has errors
      (error: ErrorEvent) => console.log('An error happened while loading the mesh', error)
    );

    this.scene.add(this.group);

    const yaml = await fetch('./prototypes.yaml');
    console.log(YAML.parse(await yaml.text()));

  }

  private setupLight(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.castShadow = true;
    directionalLight.position.set(20, 40, 10);
    this.scene.add(directionalLight);

  }

  private process(): void {
    this.renderer.setClearColor(0xffffff, 1);
    const delta = this.clock.getDelta();
    this.renderer.render(this.scene, this.camera);

    if (this.input.mouseDown) {
      //const dir: number = (this.input.prevMousePos.x - this.input.mousePos.x) / window.innerWidth;

    }

    this.group.rotation.y += delta * 0.5;

    // if (this.input.mouseDown) {
    //   const dir: number = (this.input.prevMousePos.x - this.input.mousePos.x) / window.innerWidth;

    //   let moveDir = new THREE.Vector3(
    //     - this.camera.position.x,
    //     - this.camera.position.y,
    //     - this.camera.position.z
    //   );

    //   moveDir.normalize();

    //   const moveDist = this.camera.position.distanceTo(new Vector3());
    //   this.camera.translateOnAxis(moveDir, moveDist);
    //   /// step 3: rotate camera
    //   this.camera.rotateY(dir);
    //   /// step4: move camera along the opposite direction
    //   moveDir.multiplyScalar(-1);
    //   this.camera.translateOnAxis(moveDir, moveDist);
    // }
  }
}

const game = new Game();
game.Init();
