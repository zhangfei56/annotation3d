import { InputEmitter, EventType, Point2D } from "../Input";


export class RectTool {
  private input: InputEmitter
  constructor(input: InputEmitter) {
    this.input = input
  }

  public init(){
    this.input.on(EventType.MouseDownEvent, this.onMouseDown)
  }

  onMouseDown(point: Point2D){
    console.log("onMouseDown", point)
  }


  onMouseMove(point: Point2D){
    console.log("onMouseMove", point)
  }

}
