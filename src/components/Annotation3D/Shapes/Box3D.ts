import Renderer from '../Renderer';
import * as THREE from 'three';
import { InputEmitter, Point2D } from '../Input';
import AssistPoint, { AssistDirectionEnum } from './AssistPoint';
import { DoubleSide } from 'three';
import { generateUUID } from 'three/src/math/MathUtils';
import { BaseShape } from './BaseShape';


const ScaleUnit = new THREE.Vector3(1, 1, 1);
const ZeroVector = new THREE.Vector3(0,0,0)

class Box3D extends BaseShape{

  private color = 0x0000ff;

  public box: THREE.Mesh;
  
  public constructor(position: THREE.Vector3 = ZeroVector, scale: THREE.Vector3 =ScaleUnit) {
    super()
    const boxGeometry = new THREE.BoxGeometry(1,1,1)

    const faceMaterial = new THREE.MeshBasicMaterial({ color: this.color, side: THREE.DoubleSide , vertexColors: false})
    faceMaterial.depthTest =  false
    faceMaterial.transparent = true
    faceMaterial.opacity = 0.5 

    this.box = new THREE.Mesh(boxGeometry, faceMaterial)
    this.box.position.set(position.x, position.y, position.z)
    this.changeSize(scale)

    this.box.userData.selfClass = this
  }

  public changeSize(scale: { x: number; y: number; z: number}) :void {
    this.box.scale.set(scale.x, scale.y, scale.z)

    // this.box.rotateX(1)

    this.box.updateMatrix()
    this.box.updateMatrixWorld()
  }

  public mouseDownHandler(){

  }

  public render() {
    

    // this.renderder.render()
  }

  public getThreeObject(){
    return this.box
  }

  

}
export default Box3D;
