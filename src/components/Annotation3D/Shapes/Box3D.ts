import { Renderable } from '../Renderable'
import Renderer from '../Renderer';
import * as THREE from 'three';
import { InputEmitter, Point2D } from '../Input';
import AssistPoint, { AssistDirectionEnum } from './AssistPoint';
import { DoubleSide } from 'three';
import { generateUUID } from 'three/src/math/MathUtils';
import { BaseShape } from './BaseShape';


const ScaleUnit = new THREE.Vector3(1, 1, 1);

class Box3D {

  private color = 0x0000ff;

  public box: THREE.Mesh;
  
  public _scale: THREE.Vector3;

  public constructor(scale?: THREE.Vector3) {
    this._scale = scale ?? ScaleUnit;
    const boxGeometry = new THREE.BoxGeometry(1,1,1)

    const faceMaterial = new THREE.MeshBasicMaterial({ color: this.color, side: THREE.DoubleSide , vertexColors: false})
    faceMaterial.depthTest =  false
    faceMaterial.transparent = true
    faceMaterial.opacity = 0.5 

    this.box = new THREE.Mesh(boxGeometry, faceMaterial)
    this.box.scale.set(this._scale.x, this._scale.y, this._scale.z)

    this.box.userData.selfClass = this

  }

  public changeSize(scale: THREE.Vector3) :void {
    //
    this.box.scale.set(scale.x, scale.y, scale.z)

    this.box.updateMatrix()

    this.box.updateMatrixWorld()

  }



  public render() {
    

    // this.renderder.render()
  }

}
export default Box3D;
