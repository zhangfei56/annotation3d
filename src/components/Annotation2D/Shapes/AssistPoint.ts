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
  private sphere;
  private pointMoveCallback;
  private parent

  public constructor(position: THREE.Vector3, parent: any, fn: any){
    super();
    const geometry = new THREE.SphereGeometry( 8, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    this.sphere = new THREE.Mesh( geometry, material );
    this.sphere.position.set(position.x, position.y, position.z)
    this.parent = parent
    this.sphere.visible =false
    this.pointMoveCallback = fn
    this.sphere.userData.selfClass = this

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

  public mouseMoveHandler(point: Point2D): void {
    if(this.clicked) {
      this.pointMoveCallback(point)
    }else{
      this.parent.showAssistPoint()
    }
  }

  public mouseDownHandler(point: Point2D): void {
    this.clicked = true
  }
  public mouseUpHandler(point: Point2D): void {
    this.clicked = false
  }

  public mouseEnterHandler(){
    this.parent.showAssistPoint()
  }
  public mouseLeaveHandler(){

  }
}
