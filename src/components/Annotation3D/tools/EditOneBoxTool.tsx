import EventEmitter from 'eventemitter3';
import { ArrowHelper, Matrix4, Vector2, Vector3 } from 'three';

import { EventType, InputEmitter, MouseLevel, Point2D } from '../Input';
import Renderer from '../Renderer';
import SceneManager from '../SceneManager';
import { BaseShape } from '../Shapes/BaseShape';
import CubeObject from '../Shapes/CubeObject';
import BaseTool from './BaseTool';
import { EditBoxFace } from './EditBoxFace';

export class EditOneBoxTool extends BaseTool {
  // 非快捷键触发
  public activeKeyCode = 'KeyEE';

  private input: InputEmitter;
  private _cubeObject: CubeObject | null = null;
  private renderer: Renderer;
  private sceneManager: SceneManager;
  private _multiEditViews: EditBoxFace[];

  private _clickedCubeAxes: ArrowHelper | undefined;

  private _startedClickedLocalPosition: Vector3 | undefined;
  private _startedLocalToWorldMatrix: Matrix4 | undefined;
  private _startedWorldToLocalMatrix: Matrix4 | undefined;

  constructor(
    input: InputEmitter,
    renderer: Renderer,
    sceneManager: SceneManager,
    multiEditViews: EditBoxFace[],
  ) {
    super();
    this.input = input;
    this.renderer = renderer;
    this.sceneManager = sceneManager;
    this._multiEditViews = multiEditViews;
  }

  public setSelected(_box: CubeObject): void {
    this._cubeObject = _box;
    this._multiEditViews.forEach((view) => view.setBox(_box));
  }

  mouseDownHandle = (point: Point2D, worldPosition: THREE.Vector3) => {
    if (this._cubeObject) {
      const axesArr = this._cubeObject.axesArr;
      const results = this.input.getRaycaster().intersectObjects(axesArr);
      if (results.length > 0) {
        this._clickedCubeAxes = results![0].object.parent as ArrowHelper;
        this._cubeObject.updateWorldMatrix(true, true);
        this._startedLocalToWorldMatrix = this._cubeObject.matrixWorld.clone();
        this._startedWorldToLocalMatrix = this._startedLocalToWorldMatrix
          .clone()
          .invert();

        const worldPositionTemp = worldPosition.clone();
        this._startedClickedLocalPosition = worldPositionTemp.applyMatrix4(
          this._startedWorldToLocalMatrix,
        );
        console.log('_startedClickedLocalPosition', this._startedClickedLocalPosition);
        console.log('worldPosition', worldPosition);
      }
    }
  };

  // onObjectClicked = (_clickedObject: BaseShape, childThreeObjects: THREE.Object3D[]) => {
  //   debugger;
  // };

  mouseMoveHandle = (
    point: Point2D,
    worldPosition: THREE.Vector3,
    event: PointerEvent & { stopHandleNext: boolean },
  ) => {
    if (this._cubeObject) {
      if (this._clickedCubeAxes) {
        event.stopHandleNext = true;
        // this._clickedCubeAxes.
        console.log('moved worldPosition', worldPosition);

        const worldTemp = worldPosition.clone();
        const currentMovedPosition = worldTemp.applyMatrix4(
          this._startedWorldToLocalMatrix!,
        );

        console.log('moved currentMovedPosition', currentMovedPosition);

        const temp = new Vector3();
        console.log('_startedBoxCenterPosition', temp);
        if (this._clickedCubeAxes.name === 'xAxes') {
          temp.x = currentMovedPosition.x - this._startedClickedLocalPosition!.x;
        } else if (this._clickedCubeAxes.name === 'yAxes') {
          temp.y = currentMovedPosition.y - this._startedClickedLocalPosition!.y;
        } else if (this._clickedCubeAxes.name === 'zAxes') {
          temp.z = currentMovedPosition.z - this._startedClickedLocalPosition!.z;
        }
        console.log('moved after moved local', temp);

        temp.applyMatrix4(this._startedLocalToWorldMatrix!);
        console.log('applyMatrix4', temp);

        this._cubeObject.position.set(temp.x, temp.y, temp.z);

        this.renderer.render();
      }

      const axesArr = this._cubeObject.axesArr;
      const results = this.input.getRaycaster().intersectObjects(axesArr);
      if (results.length > 0) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = '';
      }
    }
  };

  mouseUpHandle = (point: Point2D) => {
    // save
    // this.sceneManager.addShape(this.box3d!);
    // this.box3d = null;
    // this.startPoint = null;
    this._clickedCubeAxes = undefined;
  };
  public wheelHandle(_event: WheelEvent): void {
    return;
  }
}
