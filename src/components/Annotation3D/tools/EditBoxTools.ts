
import * as THREE from 'three'
import Renderer from '../Renderer';

 // 面的法线顺序 右 左 上 下 前 后
  // 0, 8, 16
  // camera 
  //camera.rotateY(Math.PI / 2) 
  //camera.rotateX(-Math.PI / 2)
  // without rotation
export enum BoxFaceEnum {
  Left,
  Right,
  Up,
  Down,
  Front,
  Back
}

export class EditBoxTools {
  private _box: THREE.Mesh;
  private _mainRenderer: Renderer;
  private _level: number;
  private _camera: THREE.OrthographicCamera
  private _boxFace: BoxFaceEnum;
  private _canvas: HTMLCanvasElement
  private _gl : THREE.WebGLRenderer

  private testLine: THREE.Line

  constructor(box: THREE.Mesh, canvas: HTMLCanvasElement, renderer: Renderer, level: number, boxFace: BoxFaceEnum){
    this._box = box;
    this._level=  level;
    this._mainRenderer = renderer;
    this._boxFace   = boxFace;
    this._canvas = canvas;


    this._camera = new THREE.OrthographicCamera()
    this._camera.near = 0.1
    this._camera.far = 10
    // this._camera.layers.enable(this._level)

    const material = new THREE.LineBasicMaterial({
      color: 'red',
      side: THREE.DoubleSide
    });
    
    const points = [];
    points.push( new THREE.Vector3( - 10, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 10, 0 ) );
    // points.push( new THREE.Vector3( 10, 0, 0 ) );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    
    this.testLine = new THREE.Line( geometry, material );
    
    renderer.add(this.testLine)
    renderer.render()
    

    const cameraHelper = new THREE.CameraHelper(this._camera);
    this._mainRenderer.add(cameraHelper)

    this._gl = new THREE.WebGLRenderer({
      canvas: this._canvas,
      alpha: true,
      antialias: true,
    });
  }


  public render() {
    // this._box.updateMatrix()
    this._box.updateMatrixWorld()
    const boxWorldNormalMatrix = new THREE.Matrix3().getNormalMatrix(this._box.matrixWorld)

    // set camera position
    const tempVector3 = new THREE.Vector3()
    tempVector3.fromBufferAttribute(this._box.geometry.attributes.normal, this._boxFace.valueOf()*4)
    const boxPosition = this._box.position.clone()
    // debugger
    tempVector3.applyMatrix3(boxWorldNormalMatrix).normalize().multiplyScalar(5).add(boxPosition)
    this._camera.position.set(tempVector3.x, tempVector3.y, tempVector3.z)

    // update direction
    this._camera.setRotationFromQuaternion(this._box.quaternion)
    switch (this._boxFace) {
      case BoxFaceEnum.Left:
        this._camera.rotateY(Math.PI / 2) 
        break;
      case BoxFaceEnum.Up:
        this._camera.rotateX(-Math.PI / 2)
        break
      default:
    }

    

    this._camera.updateProjectionMatrix()
    // this._camera.updateMatrix()

    // this._camera.updateMatrixWorld()
    let v1 = new THREE.Vector3( -0.5, 0.2,  (this._camera.near + this._camera.far-1) / (this._camera.near - this._camera.far));
    v1.unproject(this._camera)
    const v2 = new THREE.Vector3(0.5, 0.2,  (this._camera.near + this._camera.far-1) / (this._camera.near - this._camera.far))
    v2.unproject(this._camera)
    const p = this.testLine.geometry.getAttribute('position');
    p.setXYZ(0, v1.x, v1.y, v1.z)
    p.setXYZ(1, v2.x, v2.y, v2.z)
    this.testLine.geometry.getAttribute('position').needsUpdate = true;
    this.testLine.updateMatrix();


    this._gl.render(this._mainRenderer.scene, this._camera)
  }
}
