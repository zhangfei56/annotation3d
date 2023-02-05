import * as THREE from 'three';
import { Vector3 } from 'three';

import { OrbitControls } from './ThreeDee/OrbitControls';
export default class Renderer {

  private readonly canvas: HTMLCanvasElement;
  public readonly gl: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  private camera;


  public constructor(canvas: HTMLCanvasElement) {
    THREE.Object3D.DefaultUp = new THREE.Vector3(0,0,1)
    this.canvas = canvas;
    this.gl = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.scene = new THREE.Scene();
    this.camera =  new THREE.PerspectiveCamera( 50, canvas.width / canvas.height, 0.1, 1000 );
    // this.camera = new THREE.OrthographicCamera()
    this.camera.position.set(0,0, 40)

    // this.camera.lookAt(new THREE.Vector3(0,1,1))
    this.camera.updateMatrixWorld()
    // const box =  new THREE.BoxGeometry(1,1,1)
    // const mater = new THREE.MeshBasicMaterial( {color: 'red'})
    // const s = new THREE.Mesh(box, mater)
    // this.scene.add(s)

    const controls = new OrbitControls( this.camera, this.gl.domElement );
    controls.addEventListener( 'change', this.render.bind(this) ); // call this only in static scenes (i.e., if there is no animation loop)

    this.gl.render(this.scene, this.camera);

    // const camera2 = new THREE.PerspectiveCamera(170, window.innerWidth / window.innerHeight, 0.1, 1000 )
    // const gl2 = new THREE.WebGL1Renderer();
    // gl2.setSize(window.innerWidth , window.innerHeight)
    // camera2.position.set(0,0,10)
    // camera2.updateProjectionMatrix()
    // gl2.render(this.scene, camera2)


    // document.body.appendChild( gl2.domElement );

  }

  public add(obj: THREE.Object3D){
    this.scene.add(obj)
  }

  public render(){
    // if has performance issue use throttle instead
    
    this.gl.render(this.scene, this.camera);
  }

  public remove(obj: THREE.Object3D){
    this.scene.remove(obj)
  }

  public getCamera(){
    return this.camera;
  }
}
