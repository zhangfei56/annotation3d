
import type { Point2D, } from '../Input';

export abstract class BaseShape {

  protected clicked: boolean = false;
  public mouseMoveHandler(point: Point2D): void {}

  public mouseDownHandler(point: Point2D): void{}

  public mouseUpHandler(point: Point2D): void{}

  public mouseEnterHandler(): void{}
  public mouseLeaveHandler(): void{}

  public abstract getThreeObject(): THREE.Object3D;
}

