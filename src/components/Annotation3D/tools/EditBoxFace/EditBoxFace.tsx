import EventEmitter from 'eventemitter3';
import * as THREE from 'three';
import { CameraHelper, Vector2, Vector3 } from 'three';

import SceneManager from '../../SceneManager';
import CubeObject, { NegativeXUnit, NegativeYUnit, ZUnit } from '../../Shapes/CubeObject';
import { ObjectBusEvent } from '../../types/Messages';
import { DashedHelperLine } from './DashedHelperLine';
import { InputEmitter, MouseEvent, Point2D } from './Input';

export enum BoxFaceEnum {
  Right, // 0 4 7 3
  Left,
  Back,
  Front, // 1 0 3 2
  Up, // 0 1 5 4
  Down,
}

type HelperLinePosition = 'Up' | 'Down' | 'Left' | 'Right';

const RedDashedMaterial = new THREE.LineDashedMaterial({
  color: 'red',
  linewidth: 0.05,
  scale: 1,
  dashSize: 0.05,
  gapSize: 0.02,
});

const ZeroVector3 = new THREE.Vector3();

type xyz = 'x' | 'y' | 'z';

type MouseAction = 'Rotate' | 'Scale' | 'None';
const DistanceBetweenCamera = 15;

export class EditBoxFace {
  private _annotation3DObject?: CubeObject;
  private _level: number;
  private _camera: THREE.OrthographicCamera;
  private _boxFace: BoxFaceEnum;
  private _canvas: HTMLCanvasElement;
  private _gl: THREE.WebGLRenderer;
  private _input: InputEmitter;
  private _tempHelperLine: DashedHelperLine;
  private _sceneManager: SceneManager;
  private _eventBus: EventEmitter<ObjectBusEvent>;

  private _cameraViewSize: number;
  private _mouseAction: MouseAction;
  private _mousePrepareAction: MouseAction;
  private _startRotateAngle = 0;

  constructor(
    canvas: HTMLCanvasElement,
    eventBus: EventEmitter<ObjectBusEvent>,
    level: number,
    boxFace: BoxFaceEnum,
    sceneManager: SceneManager,
  ) {
    this._level = level;
    this._boxFace = boxFace;

    this._canvas = canvas;

    this._sceneManager = sceneManager;
    this._cameraViewSize = 1;
    this._mouseAction = 'None';
    this._mousePrepareAction = 'None';
    this._eventBus = eventBus;

    this._camera = new THREE.OrthographicCamera();
    this._camera.near = 1;
    this._camera.far = 500;
    // this._camera.layers.enable(this._level)

    const cameraHelper = new CameraHelper(this._camera);
    this._sceneManager.addHelperObject(cameraHelper);
    this._input = new InputEmitter(this._canvas, this._camera);

    // const cameraHelper = new THREE.CameraHelper(this._camera);
    // this._mainRenderer.add(cameraHelper)
    this._tempHelperLine = new DashedHelperLine(
      'Up',
      [ZeroVector3, ZeroVector3],
      RedDashedMaterial,
    );
    this._tempHelperLine.getLine().visible = false;
    this._sceneManager.addHelperObject(this._tempHelperLine.getLine());

    this._gl = new THREE.WebGLRenderer({
      canvas: this._canvas,
      alpha: true,
      antialias: true,
    });

    this._input.addListener(MouseEvent.MouseUpEvent, this.handleMouseUp);
    this._input.addListener(MouseEvent.MouseDownEvent, this.handleMouseDown);
    this._input.addListener(MouseEvent.MouseMoveEvent, this.handleMouseMove);
    this._eventBus.on(ObjectBusEvent.ClickedBox3D, this.setBox);
    this._eventBus.on(ObjectBusEvent.RenderAll, this.render);
  }

  private setBox = (box: CubeObject): void => {
    this._annotation3DObject = box;
    this.adaptCameraViewToBox();
    this.render();
  };

  private adaptCameraViewToBox() {
    const sideSizes = this.getFaceLengthAndWidth();

    this._cameraViewSize = Math.max(...sideSizes);
  }

  private getHelperLinePoints(direction: HelperLinePosition) {
    const v1 = new THREE.Vector3(0, 0, -1);
    const v2 = new THREE.Vector3(0, 0, -1);
    const faceSides = this.getFaceLengthAndWidth();
    const x = (faceSides[0] ?? 0) / (2 * this._cameraViewSize);
    const y = (faceSides[1] ?? 0) / (2 * this._cameraViewSize);

    switch (direction) {
      case 'Up':
        v1.x = -1;
        v2.x = 1;
        v1.y = y;
        v2.y = y;
        break;
      case 'Down':
        v1.x = -1;
        v2.x = 1;
        v1.y = -y;
        v2.y = -y;
        break;
      case 'Left':
        v1.x = -x;
        v2.x = -x;
        v1.y = 1;
        v2.y = -1;
        break;
      case 'Right':
        v1.x = x;
        v2.x = x;
        v1.y = 1;
        v2.y = -1;
        break;
    }
    return [v1, v2];
  }

  private handleMouseDown = (
    unitCursorCoords: THREE.Vector2,
    worldPosition: THREE.Vector3,
    event: PointerEvent,
  ) => {
    this._mouseAction = 'None';
    if (this._mousePrepareAction === 'Scale') {
      const scaleResult = this._input
        .getRaycaster()
        .intersectObject(this._annotation3DObject!.getSideLines(), false);
      if (scaleResult.length > 0) {
        this._mouseAction = 'Scale';
        const firstLineResult = scaleResult[0];
        const directionSide = this.getDirectionByIndex(firstLineResult.index ?? 0);
        if (['Up', 'Down'].includes(directionSide)) {
          document.body.style.cursor = 'row-resize';
        } else {
          document.body.style.cursor = 'col-resize';
        }
        const points = this.getHelperLinePoints(directionSide);
        this._tempHelperLine.direction = directionSide;
        this._tempHelperLine.getLine().visible = true;
        this._tempHelperLine.updatePoints(points);
        this._gl.render(this._sceneManager.scene, this._camera);
      }
    } else if (this._mousePrepareAction === 'Rotate') {
      const surfaceResult = this._input
        .getRaycaster()
        .intersectObject(this._annotation3DObject!.getSurface(), false);
      if (surfaceResult.length > 0) {
        this._startRotateAngle = Math.atan2(unitCursorCoords.y, unitCursorCoords.x);
        this._mouseAction = 'Rotate';
      }
    }
  };

  private rotate(screenCoords: Vector2): void {
    const angle = Math.atan2(screenCoords.y, screenCoords.x);
    const axis = this.getRotateAxis();
    this._annotation3DObject?.rotateOnAxis2(axis, angle - this._startRotateAngle);
    this._startRotateAngle = angle;

    this.updateSelf();
  }

  private scale(screenCoords: Vector2): void {
    const direction = this._tempHelperLine.direction;
    const cameraX = screenCoords.x;
    const cameraY = screenCoords.y;

    const v1 = new THREE.Vector3(cameraX, cameraY, -1);
    const v2 = new THREE.Vector3(cameraX, cameraY, -1);
    if (['Up', 'Down'].includes(direction)) {
      v1.x = -1;
      v2.x = 1;
    } else {
      v1.y = -1;
      v2.y = 1;
    }

    v1.unproject(this._camera);
    v2.unproject(this._camera);
    this._tempHelperLine.updatePoints([v1, v2]);
    this.updateSelf();
  }

  private showMouseCursor() {
    const result = this._input
      .getRaycaster()
      .intersectObject(this._annotation3DObject?.getSideLines(), false);
    const surfaceResult = this._input
      .getRaycaster()
      .intersectObject(this._annotation3DObject!.getSurface(), false);
    if (result.length > 0) {
      this._mousePrepareAction = 'Scale';
      const firstLineResult = result[0];
      const directionSide = this.getDirectionByIndex(firstLineResult.index);
      if (['Up', 'Down'].includes(directionSide)) {
        document.body.style.cursor = 'row-resize';
      } else {
        document.body.style.cursor = 'col-resize';
      }

      console.log(firstLineResult.index);
    } else if (surfaceResult.length > 0) {
      document.body.style.cursor = 'grab';
      this._mousePrepareAction = 'Rotate';
    } else {
      document.body.style.cursor = '';
      this._mousePrepareAction = 'None';
    }
  }

  private handleMouseMove = (
    unitCursorCoords: THREE.Vector2,
    worldPosition: THREE.Vector3,
    event: PointerEvent,
  ) => {
    switch (this._mouseAction) {
      case 'Rotate':
        this.rotate(unitCursorCoords);
        break;
      case 'Scale':
        this.scale(unitCursorCoords);
        break;
      default:
        this.showMouseCursor();
        break;
    }
  };

  private handleMouseUp = (
    unitCursorCoords: THREE.Vector2,
    worldPosition: THREE.Vector3,
    event: PointerEvent,
  ) => {
    if (!this._annotation3DObject) {
      return;
    }
    if (this._mouseAction === 'Scale') {
      const faceSides = this.getFaceLengthAndWidth();
      const direction = this._tempHelperLine.direction;

      let delta;
      const moveDirection = this.getMovingDirection(direction);

      switch (direction) {
        case 'Left':
          delta = -faceSides[0] / 2 - unitCursorCoords.x * this._cameraViewSize;
          break;
        case 'Right':
          delta = -faceSides[0] / 2 + unitCursorCoords.x * this._cameraViewSize;
          break;
        case 'Up':
          delta = -faceSides[1] / 2 + unitCursorCoords.y * this._cameraViewSize;
          break;
        case 'Down':
          delta = -faceSides[1] / 2 - unitCursorCoords.y * this._cameraViewSize;
          break;
      }

      this._annotation3DObject.scaleDistanceByDirection(moveDirection, delta);

      this._tempHelperLine.getLine().visible = false;
    }
    this._eventBus.emit(ObjectBusEvent.RenderAll);
    this._mouseAction = 'None';
  };

  private getDirectionByIndex(index: number): HelperLinePosition {
    let indexArr;
    switch (this._boxFace) {
      case BoxFaceEnum.Front:
        indexArr = [0, 2, 4, 6];
        break;
      case BoxFaceEnum.Up:
        indexArr = [8, 18, 0, 16];
        break;
      case BoxFaceEnum.Left:
        indexArr = [18, 10, 20, 2];
        break;
      default:
        indexArr = [0, 0, 0, 0];
        break;
    }
    const positionIndex = indexArr.indexOf(index);
    const direction: HelperLinePosition = ['Up', 'Left', 'Down', 'Right'][
      positionIndex
    ] as HelperLinePosition;
    return direction;
  }

  private getRotateAxis(): THREE.Vector3 {
    let axis: THREE.Vector3 = ZUnit;
    switch (this._boxFace) {
      case BoxFaceEnum.Front:
        axis = NegativeYUnit;
        break;
      case BoxFaceEnum.Left:
        axis = NegativeXUnit;
        break;
    }

    return axis;
  }

  private getMovingDirection(direction: HelperLinePosition): THREE.Vector3 {
    const move = new THREE.Vector3();
    switch (this._boxFace) {
      case BoxFaceEnum.Front:
        switch (direction) {
          case 'Up':
            move.z = 1;
            break;
          case 'Down':
            move.z = -1;
            break;
          case 'Left':
            move.x = -1;
            break;
          case 'Right':
            move.x = 1;
            break;
        }
        break;
      case BoxFaceEnum.Up:
        switch (direction) {
          case 'Up':
            move.y = 1;
            break;
          case 'Down':
            move.y = -1;
            break;
          case 'Left':
            move.x = -1;
            break;
          case 'Right':
            move.x = 1;
            break;
        }
        break;
      case BoxFaceEnum.Left:
        switch (direction) {
          case 'Up':
            move.z = 1;
            break;
          case 'Down':
            move.z = -1;
            break;
          case 'Left':
            move.y = 1;
            break;
          case 'Right':
            move.y = -1;
            break;
        }
        break;
    }

    return move;
  }

  private getFaceAttributes(): xyz[] {
    let result: xyz[] = ['x', 'z'];
    switch (this._boxFace) {
      case BoxFaceEnum.Left:
      case BoxFaceEnum.Right:
        result = ['y', 'z'];
        break;
      case BoxFaceEnum.Up:
      case BoxFaceEnum.Down:
        result = ['x', 'y'];
        break;
      default:
    }
    return result;
  }

  private getFaceLengthAndWidth(): number[] {
    if (!this._annotation3DObject) {
      return [];
    }
    const attributes = this.getFaceAttributes();
    const sides = [
      this._annotation3DObject.scale[attributes[0]],
      this._annotation3DObject.scale[attributes[1]],
    ];

    return sides;
  }

  private recalculateCameraPosition(): void {
    const boxWorldNormalMatrix = new THREE.Matrix3().getNormalMatrix(
      this._annotation3DObject!.matrixWorld,
    );

    // set camera position
    const tempVector3 = new THREE.Vector3();
    const geometry = this._annotation3DObject!.geometry;
    tempVector3.fromBufferAttribute(
      geometry.attributes.normal,
      geometry.index!.array[geometry.groups[this._boxFace.valueOf()].start],
    );
    const boxPosition = this._annotation3DObject!.position.clone();
    tempVector3
      .applyMatrix3(boxWorldNormalMatrix)
      .normalize()
      .multiplyScalar(DistanceBetweenCamera)
      .add(boxPosition);
    this._camera.position.set(tempVector3.x, tempVector3.y, tempVector3.z);
  }

  private recalculateRotation() {
    this._camera.setRotationFromQuaternion(this._annotation3DObject!.quaternion);
    switch (this._boxFace) {
      case BoxFaceEnum.Left:
        this._camera.rotateY(-Math.PI / 2);
        this._camera.rotateZ(-Math.PI / 2);
        break;
      case BoxFaceEnum.Up:
        // this._camera.rotateX(-Math.PI / 2);
        break;
      case BoxFaceEnum.Front:
        // this._camera.rotateY(Math.PI);
        this._camera.rotateX(Math.PI / 2);
        break;
      default:
    }

    this._camera.left = -this._cameraViewSize;
    this._camera.right = this._cameraViewSize;
    this._camera.top = this._cameraViewSize;
    this._camera.bottom = -this._cameraViewSize;

    this._camera.updateProjectionMatrix();
  }

  private recalculateCamera(): void {
    this.recalculateCameraPosition();
    this.recalculateRotation();
  }

  private updateSelf = (): void => {
    this._gl.render(this._sceneManager.scene, this._camera);
  };

  public render = () => {
    if (!this._annotation3DObject) {
      return;
    }

    this.recalculateCamera();

    this.updateSelf();
  };
}
