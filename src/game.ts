import { Input, IInput } from './input';
import * as THREE from 'three';
import { Clock, OrthographicCamera, Vector3 } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Prototype } from './prototype';
import YAML from 'yaml';
// import { Prototype } from 'prototype';

class Game {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  clock: Clock = new Clock();
  camera: OrthographicCamera;
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
    this.camera.zoom = 2;
    this.camera.updateProjectionMatrix();


    this.scene.add(this.camera);

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    this.setupLight();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
    document.body.appendChild(this.renderer.domElement);

    const yaml = await fetch('./prototypes.yaml');
    const prots = YAML.parse(await yaml.text()) as Array<Prototype>;

    // for (let x = 0; x < 3; x++) {
    //   for (let y = 0; y < 3; y++) {
    //     const prot = prots[x + 3 * y];
    //     const mesh = await this.loadMesh(`models/${prot.mesh}`, prot.rotation);
    //     mesh.position.copy(new Vector3(x - 1, y - 1, 0));
    //     this.group.add(mesh);
    //   }
    // }

    const mesh = await this.loadMesh(`models/${prots[2].mesh}`, prots[2].rotation);
    this.group.add(mesh);

    this.renderer.setAnimationLoop(() => this.process());

    this.scene.add(this.group);
  }

  private setupLight(): void {
    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    // this.scene.add(ambientLight);

    // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    // directionalLight.castShadow = true;
    // directionalLight.position.set(20, 40, 10);
    // this.scene.add(directionalLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 300, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(75, 300, -75);
    this.scene.add(dirLight);

  }

  private process(): void {
    // this.renderer.setClearColor(0xffffff, 1);
    const delta = this.clock.getDelta();
    this.renderer.render(this.scene, this.camera);

    if (this.input.mouseDown) {
      //const dir: number = (this.input.prevMousePos.x - this.input.mousePos.x) / window.innerWidth;

    }

    this.group.rotation.y += delta * 0.;

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

  private async loadMesh(mesh: string, rotation: Vector3): Promise<THREE.Mesh> {
    return new Promise<THREE.Mesh>((resolve, reject) => {
      this.loader.load(mesh, (gltf: GLTF): void => {
        // TODO there is no other way of typing here
        //@ts-ignore
        const mesh: THREE.Mesh = gltf.scene.children[0];
        mesh.material = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });

        // TODO check if rotation works
        mesh.rotateX(THREE.MathUtils.degToRad(rotation.x));
        mesh.rotateY(THREE.MathUtils.degToRad(rotation.y));
        mesh.rotateZ(THREE.MathUtils.degToRad(rotation.z));
        resolve(mesh);
      },
        (xhr: ProgressEvent) => { },
        (error: ErrorEvent) => reject(new Error(`An error happened while loading the mesh ${error}`)))
    })
  }
}

const game = new Game();
game.Init();
