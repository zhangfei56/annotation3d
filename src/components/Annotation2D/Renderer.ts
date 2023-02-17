import * as THREE from 'three';
import { Vector3 } from 'three';

export default class Renderer {
  private readonly canvas: HTMLCanvasElement;
  public readonly gl: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  private camera;

  public constructor(canvas: HTMLCanvasElement) {
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
    this.canvas = canvas;
    this.gl = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera();
    this.camera.position.set(0, 0, -100);

    this.camera.lookAt(new THREE.Vector3(0, 1, 1));
    this.camera.updateMatrixWorld();

    this.gl.render(this.scene, this.camera);
  }

  public add(obj: THREE.Object3D) {
    this.scene.add(obj);
  }

  public render() {
    // if has performance issue use throttle instead

    this.gl.render(this.scene, this.camera);
  }

  public remove(obj: THREE.Object3D) {
    this.scene.remove(obj);
  }

  public getCamera() {
    return this.camera;
  }
}
