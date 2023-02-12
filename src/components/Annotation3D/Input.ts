
import EventEmitter from 'eventemitter3'
import * as THREE from 'three'
import Renderer from './Renderer';

export const EventType = {
  ImageMoveEvent: 'ImageMoveEvent',
  MouseDownEvent: 'MouseDownEvent',
  MouseUpEvent: "MouseUpEvent",
  MouseMoveEvent: "MouseMoveEvent",
}

export type Point2D = {
  x: number;
  y: number;
}

export enum MouseLevel {
  Normal,
  Plugin,
  AssistPoint
}
export class InputEmitter extends EventEmitter{
  private canvas: HTMLCanvasElement;
  private camera: THREE.Camera

  private raycaster: THREE.Raycaster;
  private listenerObjects: THREE.Object3D[] = [];

  // [-1, 1]
  private unitCursorCoords = new THREE.Vector2();
  private worldSpaceCursorCoords?: THREE.Vector3;
  
  private worldPosition:  THREE.Vector3 | undefined

  public constructor(canvas: HTMLCanvasElement, camera: THREE.Camera){
    super()
    this.canvas = canvas;

    this.camera = camera;

    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mouseup", this.onMouseUp)
    this.raycaster = new THREE.Raycaster()
    this.raycaster.params.Line!.threshold = 0.2;
  }

  public addListerObject(obj: THREE.Object3D)  {
    this.listenerObjects.push(obj)
  }

  public removeListerObject(obj: THREE.Object3D) {
    const index = this.listenerObjects.indexOf(obj)
    if(index !== -1){
      this.listenerObjects.splice(this.listenerObjects.indexOf(obj), 1)

    }
  }

  private setCurrentPosition(event: MouseEvent) {
    this.unitCursorCoords.x = (event.offsetX / this.canvas.width) * 2 - 1;
    this.unitCursorCoords.y = - (event.offsetY / this.canvas.height) * 2 + 1;
    let mouseZ= -1
    if(this.camera instanceof THREE.OrthographicCamera) {
      // mouseZ = (this.camera.near + this.camera.far) / (this.camera.near - this.camera.far)
    }
    const stdVector = new THREE.Vector3(this.unitCursorCoords.x, this.unitCursorCoords.y, mouseZ);
    this.worldPosition = stdVector.unproject(this.camera)
    this.raycaster.setFromCamera(this.unitCursorCoords, this.camera);
  }

  public getRaycaster(){
    return this.raycaster
  }
  
  private onMouseMove =(event: MouseEvent)=> {
    //event.preventDefault();
    
    this.setCurrentPosition(event)

    this.emit(EventType.MouseMoveEvent, this.unitCursorCoords, this.worldPosition, event)

  }

  private onMouseDown = (event: MouseEvent) =>{
    this.setCurrentPosition(event)

      this.emit(EventType.MouseDownEvent, this.unitCursorCoords, this.worldPosition, event)
  
  }

  private onMouseUp = (event: MouseEvent)=> {
    this.setCurrentPosition(event);
    
    this.emit(EventType.MouseUpEvent, this.unitCursorCoords, this.worldPosition, event)
  }
  
}
