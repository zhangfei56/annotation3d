import { Renderable } from '../Renderable'
import Renderer from '../Renderer';
import * as THREE from 'three';
import { InputEmitter, Point2D } from '../Input';
import AssistPoint, { AssistDirectionEnum } from './AssistPoint';
import { DoubleSide } from 'three';
import { generateUUID } from 'three/src/math/MathUtils';
import { BaseShape } from './BaseShape';



class Box3D {

  private renderder: Renderer;
  private input: InputEmitter;

  private color = 0x0000ff;

  public box: THREE.Object3D;

  public constructor( renderder: Renderer, input: InputEmitter) {
    this.input = input;
    this.renderder = renderder;

    const boxGeometry = new THREE.BoxGeometry(1,1,1)

    const faceMaterial = new THREE.MeshBasicMaterial({ color: this.color, side: THREE.DoubleSide , vertexColors: false})
    faceMaterial.depthTest =  false
    faceMaterial.transparent = true
    faceMaterial.opacity = 0.5 

    this.box = new THREE.Mesh(boxGeometry, faceMaterial)
    // this.box.applyQuaternion(new THREE.Quaternion(1,3,4,1))
    this.box.rotateX(1)
    this.box.rotateY(1)
    this.box.rotateZ(1)
    this.input.addListerObject(this.box)

    this.box.userData.selfClass = this
    this.renderder.add(this.box)

    this.renderder.render()
  }

  public changeSize(scale: THREE.Vector3) :void {
    //
    this.box.scale.set(scale.x, scale.y, scale.z)

    this.render()
  }



  public render() {
    

    this.renderder.render()
  }

}
export default Box3D;
