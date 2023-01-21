
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

export class InputEmitter extends EventEmitter{
  private canvas: HTMLCanvasElement;
  private imageInfo: ImageExport
  private renderer: Renderer
  private raycaster: THREE.Raycaster;

  public constructor(canvas: HTMLCanvasElement, imageInfo: ImageExport, renderer: Renderer){
    super()
    this.canvas = canvas;

    this.imageInfo = imageInfo
    this.renderer = renderer;

    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this))
    this.raycaster = new THREE.Raycaster()

  }


  
  onMouseMove(event: MouseEvent) {
    //event.preventDefault();
    const mouse: { x: number; y: number } = { x: 0, y: 0 };
    mouse.x = (event.offsetX / this.canvas.width) * 2 - 1;
    mouse.y = - (event.offsetY / this.canvas.height) * 2 + 1;

    const stdVector = new THREE.Vector3(mouse.x, mouse.y, 0);
    const wo = stdVector.unproject(this.renderer!.getCamera())
    // console.log(wo)
    this.emit(EventType.MouseMoveEvent, {
      x: wo.x,
      y: wo.y,
    })

    this.raycaster.setFromCamera(mouse, this.renderer!.getCamera());

    const imageIntersections = this.raycaster.intersectObject(this.imageInfo.imagePlane);

    if (imageIntersections.length > 0) {
      // this.emit("", )
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
    // console.log("onMouseDown", event)
     const mouse: { x: number; y: number } = { x: 0, y: 0 };
    mouse.x = (event.offsetX / this.canvas.width) * 2 - 1;
    mouse.y = - (event.offsetY / this.canvas.height) * 2 + 1;

    const stdVector = new THREE.Vector3(mouse.x, mouse.y, 0);
    const wo = stdVector.unproject(this.renderer!.getCamera())

    this.emit(EventType.MouseDownEvent, {
      x: wo.x,
      y: wo.y,
    })
  }
  onMouseUp(event: MouseEvent) {
    // clickedMouse = false
  }
  
}
