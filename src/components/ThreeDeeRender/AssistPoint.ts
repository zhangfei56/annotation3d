import * as THREE from 'three'
import { Spherical } from 'three';
import { InputEmitter, EventType, Point2D, MouseLevel } from './Input';
import Renderer from './Renderer';

export enum AssistDirectionEnum {
  Horizontal,
  Vertical,
  Full,
  
}

export default class AssistPoint {
  // private position: THREE.Vector3
  // private direction;
  private sphere;
  private input;
  private pointMoveCallback;

  public constructor(position: THREE.Vector3, input: InputEmitter, parent: any, fn: any){
    const geometry = new THREE.SphereGeometry( 8, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    this.sphere = new THREE.Mesh( geometry, material );
    this.sphere.position.set(position.x, position.y, position.z)
    this.input = input
    this.sphere.userData.selfClass = parent
    this.sphere.userData.pointMove = this.pointMove.bind(this)
    this.pointMoveCallback = fn
  }

  public pointMove(point: Point2D){
    this.pointMoveCallback(point)
  }

  public getPoint(): THREE.Mesh {
    return this.sphere
  }

  public hide(): void {
    this.sphere.visible = false
  }
  public show(): void {
    this.sphere.visible = true
  }

  public updatePosition(position: THREE.Vector3): void{
    this.sphere.position.set(position.x, position.y, position.z);
  }


}
