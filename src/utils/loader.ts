import { Prototype } from '../prototype';
import * as THREE from 'three';
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as YAML from 'yaml';

export default class Loader {
    private static instance: Loader;
    private loader: GLTFLoader;
    private prototypes: Prototype[];

    private constructor() {
        this.loader = new GLTFLoader();
    }

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    public async loadMesh(mesh: string, rotation: THREE.Vector3): Promise<THREE.Mesh> {
        return new Promise<THREE.Mesh>((resolve, reject) => {
            this.loader.load(mesh, (gltf: GLTF): void => {
                const mesh: THREE.Mesh = gltf.scene.children[0] as THREE.Mesh;
                mesh.material = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });

                mesh.rotateX(THREE.MathUtils.degToRad(rotation.x));
                mesh.rotateY(THREE.MathUtils.degToRad(rotation.y));
                mesh.rotateZ(THREE.MathUtils.degToRad(rotation.z));
                resolve(mesh);
            },
                (xhr: ProgressEvent) => { },
                (error: ErrorEvent) => reject(new Error(`An error happened while loading the mesh ${error}`)))
        });
    }

    public async loadPrototypes() {
        if (!this.prototypes) {
            const yaml = await fetch('./prototypes.yaml');
            this.prototypes = Prototype.ParseFromObject(YAML.parse(await yaml.text()));
        }

        return this.prototypes;
    }
}