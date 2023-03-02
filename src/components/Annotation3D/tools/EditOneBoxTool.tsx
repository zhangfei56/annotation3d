import EventEmitter from 'eventemitter3';
import * as ReactDOM from 'react-dom/client';
import { ArrowHelper, Matrix4, Vector2, Vector3 } from 'three';

import { InputEmitter, MouseAndKeyEvent, MouseLevel, Point2D } from '../Input';
import SceneManager from '../SceneManager';
import CubeObject from '../Shapes/CubeObject';
import { ObjectBusEvent } from '../types/Messages';
import BaseTool from './BaseTool';
import { BoxFaceEnum, EditBoxFace } from './EditBoxFace/EditBoxFace';
import BoxFaceContainer from './EditBoxFace/index';

export class EditOneBoxTool extends BaseTool {
  // 非快捷键触发
  public activeKeyCode = 'KeyEE';

  private input: InputEmitter;
  private _cubeObject: CubeObject | null = null;
  private _eventBus: EventEmitter<ObjectBusEvent>;
  private sceneManager: SceneManager;
  private _multiEditViews: EditBoxFace[];

  private _clickedCubeAxes: ArrowHelper | undefined;

  private _startedClickedLocalPosition: Vector3 | undefined;
  private _startedLocalToWorldMatrix: Matrix4 | undefined;
  private _startedWorldToLocalMatrix: Matrix4 | undefined;

  constructor(
    input: InputEmitter,
    eventBus: EventEmitter<ObjectBusEvent>,
    sceneManager: SceneManager,
    // multiEditViews: EditBoxFace[],
  ) {
    super();
    this.input = input;
    this._eventBus = eventBus;
    this.sceneManager = sceneManager;
    this._multiEditViews = [];
    this.createThreeView();
  }

  private createThreeView() {
    const containerDom = document.getElementById('three-view-id');
    if (containerDom) {
      const combine = (
        <>
          {/* <BoxFaceContainer
            eventBus={this._eventBus}
            boxFace={BoxFaceEnum.Left}
            sceneManager={this.sceneManager}
          ></BoxFaceContainer> */}
          {/* <BoxFaceContainer
            eventBus={this._eventBus}
            boxFace={BoxFaceEnum.Up}
            sceneManager={this.sceneManager}
          ></BoxFaceContainer> */}
          <BoxFaceContainer
            eventBus={this._eventBus}
            boxFace={BoxFaceEnum.Front}
            sceneManager={this.sceneManager}
          ></BoxFaceContainer>
        </>
      );
      const r = ReactDOM.createRoot(containerDom);
      r.render(combine);
    }
  }

  public setSelected(_box: CubeObject): void {
    this._cubeObject = _box;
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
      }
    }
  };

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

        // this._eventBus.on();
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
