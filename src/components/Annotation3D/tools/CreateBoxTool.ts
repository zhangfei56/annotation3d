import { InputEmitter, EventType, Point2D, MouseLevel } from "../Input";
import  Box3D  from "../Shapes/Box3D"
import Renderer from "../Renderer";
import BaseTool from "./BaseTool";
import { Vector3  } from "three";
import EventEmitter from "eventemitter3";
import SceneManager from "../SceneManager";

export class CreateBoxTool extends BaseTool {
  public activeKeyCode ='KeyA';

  private input: InputEmitter
  private box3d: Box3D | null = null
  private renderer: Renderer
  private startPoint: Point2D | null = null
  private parentBus: EventEmitter;
  private sceneManager: SceneManager

  constructor(input: InputEmitter, renderer: Renderer, eventBus: EventEmitter, sceneManager: SceneManager) {
    super()
    this.input = input
    this.renderer = renderer
    this.parentBus = eventBus
    this.sceneManager = sceneManager
  }

  public active(): void {
    this.input.on(EventType.PointerDownEvent, this.onMouseDown)
    this.enabled =true
  }
  public deative(): void {
    this.input.removeListener(EventType.PointerDownEvent, this.onMouseDown)
    this.enabled = false
  }


  onMouseDown = (point: Point2D, worldPosition: THREE.Vector3)=>{
    console.log("onMouseDown", point)
    if(!this.box3d){
      this.startPoint = {
        x: worldPosition.x,
        y: worldPosition.y
      }
      worldPosition.z = 0;
      this.box3d = new Box3D(worldPosition, new Vector3(0.1, 0.1, 1))
      this.sceneManager.addShape(this.box3d)

      this.renderer.render()

      this.input.on(EventType.PointerUpEvent, this.onMouseUp)
      this.input.on(EventType.PointerMoveEvent, this.onMouseMove)

    }
  }


  onMouseMove = (point: Point2D, worldPosition: THREE.Vector3) => {

    if(this.box3d){
      this.box3d.box.position.set((this.startPoint!.x+ worldPosition.x)/2, (this.startPoint!.y+ worldPosition.y)/2, 0)
      this.box3d.changeSize({
        x: Math.abs(worldPosition.x-this.startPoint!.x),
        y: Math.abs(worldPosition.y - this.startPoint!.y),
        z: 1
      })
      // this.box3d.changeSize({
      //   x: this.box3d.box.scale.x + 0.1,
      //   y: this.box3d.box.scale.y + 0.1,
      //   z: 1
      // })
      this.renderer.render()
  
    }
  }

  onMouseUp = (point: Point2D)=>{
      // save
      // this.box3d =null
      this.input.addListerObject(this.box3d!)
      this.input.removeListener(EventType.PointerUpEvent, this.onMouseUp)
      this.input.removeListener(EventType.PointerMoveEvent, this.onMouseMove)
      this.parentBus.emit("deactive")
  }

}
