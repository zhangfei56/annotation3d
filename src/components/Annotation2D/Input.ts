
import EventEmitter from 'eventemitter3'
import * as THREE from 'three'
import Renderer from './Renderer';
import {ImageExport } from './useImage'

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
  private imageInfo: ImageExport
  private renderer: Renderer
  private raycaster: THREE.Raycaster;
  private listenerObjects: THREE.Object3D[] = [];
  private clickedObjects: THREE.Object3D[] | undefined;
  private movedObjects: THREE.Object3D[] =[]

  private currentPosition:  THREE.Vector3 | undefined

  public constructor(canvas: HTMLCanvasElement, imageInfo: ImageExport, renderer: Renderer){
    super()
    this.canvas = canvas;

    this.imageInfo = imageInfo
    this.renderer = renderer;

    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this))
    this.raycaster = new THREE.Raycaster()
    // this.raycaster.params.Line.threshold = 3;
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
    const mouse: { x: number; y: number } = { x: 0, y: 0 };
    mouse.x = (event.offsetX / this.canvas.width) * 2 - 1;
    mouse.y = - (event.offsetY / this.canvas.height) * 2 + 1;
    const stdVector = new THREE.Vector3(mouse.x, mouse.y, 0);
    this.currentPosition = stdVector.unproject(this.renderer!.getCamera())
    
    this.raycaster.setFromCamera(mouse, this.renderer!.getCamera());
  }
  
  onMouseMove(event: MouseEvent) {
    //event.preventDefault();
    
    this.setCurrentPosition(event)

    const imageIntersections = this.raycaster.intersectObject(this.imageInfo.imagePlane);

    if (imageIntersections.length > 0) {
      if((this.clickedObjects?.length??0)>0){
        this.clickedObjects!.forEach(item => item.userData.selfClass.mouseMoveHandler(this.currentPosition))
        return
      }

      const listerIntersections = this.raycaster.intersectObjects(this.listenerObjects, true);

      let enterObjects = []
      let leaveObjects = []
      let movingObjects: THREE.Object3D[] = []
      if (listerIntersections.length > 0) {
        movingObjects = listerIntersections.map(item => item.object)
        movingObjects.forEach(item => item.userData.selfClass.mouseMoveHandler(this.currentPosition))
      }

      enterObjects = movingObjects.filter(item => !this.movedObjects.includes(item))
      enterObjects.forEach(item => item.userData.selfClass.mouseEnterHandler(this.currentPosition))

      leaveObjects = this.movedObjects.filter(item => !movingObjects.includes(item))
      leaveObjects.forEach(item => item.userData.selfClass.mouseLeaveHandler(this.currentPosition))

      this.movedObjects = movingObjects

      this.emit(EventType.MouseMoveEvent, {
        x:  this.currentPosition!.x,
        y:  this.currentPosition!.y,
      })
  
    }
    // console.log("clickedMouse", clickedMouse)
    // if (clickedMouse) {
    //   event.preventDefault();
    //   const camera = this.renderer!.getCamera()

    //   camera.left = camera.left - event.movementX;
    //   camera.right = camera.right - event.movementX
    //   camera.top = camera.top + event.movementY
    //   camera.bottom = camera.bottom + event.movementY

    //   camera.updateProjectionMatrix();
    //   this.renderer!.render()
    // }
  }

  private onMouseDown(event: MouseEvent) {
    this.setCurrentPosition(event)

    const imageIntersections = this.raycaster.intersectObject(this.imageInfo.imagePlane);

    if (imageIntersections.length > 0) {

      const listerIntersections = this.raycaster.intersectObjects(this.listenerObjects, true);

      if (listerIntersections.length > 0) {
        this.clickedObjects = listerIntersections.map(item => item.object)
        this.clickedObjects.forEach(item => item.userData.selfClass.mouseDownHandler(this.currentPosition))
        return
      }

      this.emit(EventType.MouseDownEvent, {
        x: this.currentPosition!.x,
        y: this.currentPosition!.y,
      })
  
    }
  }

  onMouseUp(event: MouseEvent) {
    this.setCurrentPosition(event);
    if((this.clickedObjects?.length??0)>0){
      this.clickedObjects!.forEach(item => item.userData.selfClass.mouseUpHandler(this.currentPosition))
      this.clickedObjects = undefined;
      return
    }

    this.emit(EventType.MouseUpEvent, {
      x: this.currentPosition!.x,
      y: this.currentPosition!.y,
    })
  }
  
}
