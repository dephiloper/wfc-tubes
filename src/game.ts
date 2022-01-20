import { Input, IInput } from './input';
import * as THREE from 'three';
import { Clock, OrthographicCamera, Vector3 } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Prototype } from './prototype';
import { Model } from './wavefunction/model';

// red:   x
// green: y
// blue:  z
class Game {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  clock: Clock = new Clock();
  camera: OrthographicCamera;
  input: IInput;
  group: THREE.Group;
  loader: GLTFLoader;
  prots: Prototype[];
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
  timePassed: number = 0;
  index: number = 0;

  public async Init(): Promise<void> {
    this.scene = new THREE.Scene();
    this.loader = new GLTFLoader();
    this.group = new THREE.Group();
    this.input = Input.Instance;

    const ratio: number = window.innerHeight / window.innerWidth;
    const width: number = 40;
    const height: number = width * ratio;
    // const gridSize: number = 3;

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
    this.group.add(axesHelper);

    this.setupLight();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
    document.body.appendChild(this.renderer.domElement);

    // const yaml = await fetch('./prototypes.yaml');
    // this.prots = Prototype.parseFromObject(YAML.parse(await yaml.text()));

    // const offset: number = (gridSize % 2 == 0) ? 0 : 0.5;
    // const spacing: number = 2;

    // for (let x = 0; x < gridSize; x++) {
    //   const dx = x - gridSize / 2 + offset;
    //   for (let y = 0; y < gridSize; y++) {
    //     const dy = y - gridSize / 2 + offset;
    //     for (let z = 0; z < gridSize; z++) {
    //       const dz = z - gridSize / 2 + offset;
    //       const mesh = await this.loadMesh(`models/${this.prots[0].mesh}`, this.prots[0].rotation);
    //       mesh.position.add(new Vector3(dx * spacing, dy * spacing, dz * spacing));
    //       this.group.add(mesh);
    //     }
    //   }
    // }

    const model = new Model(new Vector3(2, 2, 2));
    model.run();

    this.renderer.setAnimationLoop(async () => await this.process());
    this.scene.add(this.group);
  }

  private setupLight(): void {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 300, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(75, 300, -75);
    this.scene.add(dirLight);
  }

  private async process(): Promise<void> {
    const delta = this.clock.getDelta();
    this.timePassed += delta;
    this.renderer.render(this.scene, this.camera);
    this.group.rotation.y += delta * 0.05;
  }

  // @ts-ignore
  private async loadMesh(mesh: string, rotation: Vector3): Promise<THREE.Mesh> {
    return new Promise<THREE.Mesh>((resolve, reject) => {
      this.loader.load(mesh, (gltf: GLTF): void => {
        // TODO there is no other way of typing here
        const mesh: THREE.Mesh = gltf.scene.children[0] as THREE.Mesh;
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
