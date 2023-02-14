import { InputEmitter, EventType, Point2D, MouseLevel } from "../Input";
import  Box3D  from "../Shapes/Box3D"
import Renderer from "../Renderer";

export class CreateBoxTool {
  private input: InputEmitter
  private selectedOne: boolean = false
  private box3d: Box3D | null = null
  private renderer: Renderer

  private saved = []

  constructor(input: InputEmitter, renderer: Renderer) {
    this.input = input
    this.renderer = renderer
  }

  public init(){
    this.input.on(EventType.MouseDownEvent, this.onMouseDown.bind(this))
    this.input.on(EventType.MouseMoveEvent, this.onMouseMove.bind(this))
    this.input.on(EventType.MouseUpEvent, this.onMouseUp.bind(this),)
  }

  onMouseDown(point: Point2D){
    console.log("onMouseDown", point)
    if(!this.box3d){
      this.box3d = new Box3D(point.x, point.y, point.x, point.y, this.renderer, this.input)
    }
  }


  onMouseMove(point: Point2D){
    if(this.box3d){
      // this.box3d.changeMaxPoint( point.x, point.y)
    }
  }

  onMouseUp(point: Point2D){
      // save
      // this.rect2d?.hideAssistPoint()

      this.box3d =null
  }

}
