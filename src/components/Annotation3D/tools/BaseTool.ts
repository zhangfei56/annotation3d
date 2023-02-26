import { BaseShape } from '../Shapes/BaseShape';

abstract class BaseTool {
  public enabled = false;

  // 激活快捷键
  public abstract activeKeyCode: string;

  public abstract mouseDownHandle(
    _unitCoord: THREE.Vector2,
    _worldPosition: THREE.Vector3,
    _event: PointerEvent,
  ): void;

  public abstract mouseMoveHandle(
    _unitCoord: THREE.Vector2,
    _worldPosition: THREE.Vector3,
    _event: PointerEvent,
  ): void;
  public abstract mouseUpHandle(
    _unitCoord: THREE.Vector2,
    _worldPosition: THREE.Vector3,
    _event: PointerEvent,
  ): void;

  public abstract wheelHandle(_event: WheelEvent): void;

  public onObjectClicked(
    clickedObject: BaseShape,
    childThreeObjects: THREE.Object3D[],
  ): void {
    return;
  }
}

export default BaseTool;
