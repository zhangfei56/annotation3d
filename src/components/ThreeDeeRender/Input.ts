
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
  private selected: THREE.Object3D | undefined;
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

      const listerIntersections = this.raycaster.intersectObjects(this.listenerObjects, true);

      if (listerIntersections.length > 0) {
        listerIntersections[0].object.userData.selfClass?.showAssistPoint?.()
        if(this.selected?.userData.pointMove){
          this.selected.userData.pointMove({
            x: this.currentPosition!.x,
            y:  this.currentPosition!.y
          })
          return
        }

      }else {
        this.listenerObjects.forEach(obj => obj.userData?.selfClass?.hideAssistPoint())
      }


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
        this.selected = listerIntersections[0].object
        return
      }

      this.emit(EventType.MouseDownEvent, {
        x: this.currentPosition!.x,
        y: this.currentPosition!.y,
      })
  
    }
    // const wo = this.getMousePosition(event);

    // this.emit(EventType.MouseDownEvent, {
    //   x: wo.x,
    //   y: wo.y,
    // })
  }

  onMouseUp(event: MouseEvent) {
    this.selected = undefined;
    this.setCurrentPosition(event);

    this.emit(EventType.MouseUpEvent, {
      x: this.currentPosition!.x,
      y: this.currentPosition!.y,
    })
  }
  
}
