import * as THREE from 'three'
import { Spherical } from 'three';
import { Point2D, } from '../Input';
import { BaseShape } from './BaseShape';

export enum AssistDirectionEnum {
  Horizontal,
  Vertical,
  Full,
  
}

export default class AssistPoint extends BaseShape {
  protected mouseMoveHandler(): void {
    throw new Error('Method not implemented.');
  }
  protected mouseDownHandler(): void {
    throw new Error('Method not implemented.');
  }
  protected mouseUpHandler(): void {
    throw new Error('Method not implemented.');
  }

  private sphere;
  private pointMoveCallback;

  public constructor(position: THREE.Vector3, parent: any, fn: any){
    super();
    const geometry = new THREE.SphereGeometry( 8, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    this.sphere = new THREE.Mesh( geometry, material );
    this.sphere.position.set(position.x, position.y, position.z)
    this.sphere.userData.selfClass = parent
    this.sphere.userData.pointMove = this.pointMove.bind(this)
    this.sphere.visible =false
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
