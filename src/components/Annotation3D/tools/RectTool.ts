import { InputEmitter, EventType, Point2D, MouseLevel } from "../Input";
import  Rect2D  from "../Shapes/Rect2D"
import Renderer from "../Renderer";

export class RectTool {
  private input: InputEmitter
  private selectedOne: boolean = false
  private rect2d: Rect2D | null = null
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
    if(!this.rect2d){
      this.rect2d = new Rect2D(point.x, point.y, point.x, point.y, this.renderer, this.input)
    }
  }


  onMouseMove(point: Point2D){
    if(this.rect2d){
      this.rect2d.changeMaxPoint( point.x, point.y)
    }
  }

  onMouseUp(point: Point2D){
      // save
      // this.rect2d?.hideAssistPoint()

      this.rect2d =null
  }

}
