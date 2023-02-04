
import { Point2D, } from '../Input';

export abstract class BaseShape {
  protected clicked: boolean = false;
  public abstract mouseMoveHandler(point: Point2D): void

  public abstract mouseDownHandler(point: Point2D): void

  public abstract mouseUpHandler(point: Point2D): void

  public mouseEnterHandler(): void{}
  public mouseLeaveHandler(): void{}
}

