import * as THREE from 'three';
import { CameraHelper, Vector3 } from 'three';

import Renderer from '../../Renderer';
import SceneManager from '../../SceneManager';
import CubeObject from '../../Shapes/CubeObject';
import { DashedHelperLine, HelperLineConfig } from './DashedHelperLine';
import { EventType, InputEmitter, Point2D } from './Input';

export enum BoxFaceEnum {
  Right, // 0 4 7 3
  Left,
  Back,
  Front, // 1 0 3 2
  Up, // 0 1 5 4
  Down,
}

type HelperLinePosition = 'Up' | 'Down' | 'Left' | 'Right';

const DashedMaterial = new THREE.LineDashedMaterial({
  color: '#000',
  linewidth: 0.05,
  scale: 1,
  dashSize: 0.05,
  gapSize: 0.02,
});

const RedDashedMaterial = new THREE.LineDashedMaterial({
  color: 'red',
  linewidth: 0.05,
  scale: 1,
  dashSize: 0.05,
  gapSize: 0.02,
});

const ZeroVector3 = new THREE.Vector3();

type FaceDirect = keyof typeof HelperLineConfig;

type xyz = 'x' | 'y' | 'z';

export class EditBoxFace {
  private _box?: CubeObject;
  private _mainRenderer: Renderer;
  private _level: number;
  private _camera: THREE.OrthographicCamera;
  private _boxFace: BoxFaceEnum;
  private _canvas: HTMLCanvasElement;
  private _gl: THREE.WebGLRenderer;
  private _input: InputEmitter;
  private _tempHelperLine: DashedHelperLine;
  private _sceneManager: SceneManager;

  private _cameraViewSize: number;

  private helperLines: DashedHelperLine[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    renderer: Renderer,
    level: number,
    boxFace: BoxFaceEnum,
    sceneManager: SceneManager,
  ) {
    this._level = level;
    this._mainRenderer = renderer;
    this._boxFace = boxFace;
    this._canvas = canvas;
    this._sceneManager = sceneManager;
    this._cameraViewSize = 1;

    this._camera = new THREE.OrthographicCamera();
    this._camera.near = 1;
    this._camera.far = 500;
    // this._camera.layers.enable(this._level)

    const cameraHelper = new CameraHelper(this._camera);
    this._sceneManager.addHelperObject(cameraHelper);
    this._input = new InputEmitter(canvas, this._camera);

    // const cameraHelper = new THREE.CameraHelper(this._camera);
    // this._mainRenderer.add(cameraHelper)
    this._tempHelperLine = new DashedHelperLine(
      'Up',
      [ZeroVector3, ZeroVector3],
      RedDashedMaterial,
    );
    this._tempHelperLine.getLine().visible = false;
    this._mainRenderer.scene.add(this._tempHelperLine.getLine());

    this._gl = new THREE.WebGLRenderer({
      canvas: this._canvas,
      alpha: true,
      antialias: true,
    });

    this._input.addListener(EventType.MouseUpEvent, this.handleMouseUp);
    this._input.addListener(EventType.MouseDownEvent, this.handleMouseDown);
    this._input.addListener(EventType.MouseMoveEvent, this.handleMouseMove);
  }

  public setBox(box: CubeObject) {
    this._box = box;
    this.adaptCameraViewToBox();
    this.render();
  }

  private adaptCameraViewToBox() {
    const sideSizes = this.getFaceLengthAndWidth();

    this._cameraViewSize = Math.max(...sideSizes);
  }

  private clicked = false;

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
    const result = this._input
      .getRaycaster()
      .intersectObject(this._box!.getSideLines(), false);
    if (result.length > 0) {
      const firstLineResult = result[0];
      const directionSide = this.getDirectionByIndex(firstLineResult.index ?? 0);
      if (['Up', 'Down'].includes(directionSide)) {
        document.body.style.cursor = 'row-resize';
      } else {
        document.body.style.cursor = 'col-resize';
      }
      const points = this.getHelperLinePoints(directionSide);
      this.clicked = true;
      this._tempHelperLine.direction = directionSide;
      this._tempHelperLine.getLine().visible = true;
      this._tempHelperLine.updatePoints(points);
      this._gl.render(this._mainRenderer.scene, this._camera);
    }
  };

  private handleMouseMove = (
    unitCursorCoords: THREE.Vector2,
    worldPosition: THREE.Vector3,
    event: PointerEvent,
  ) => {
    if (this.clicked) {
      const direction = this._tempHelperLine.direction;
      const cameraX = unitCursorCoords.x;
      const cameraY = unitCursorCoords.y;

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
      this._gl.render(this._mainRenderer.scene, this._camera);
      return;
    }

    const result = this._input
      .getRaycaster()
      .intersectObject(this._box?.getSideLines(), false);
    if (result.length > 0) {
      const firstLineResult = result[0];
      const directionSide = this.getDirectionByIndex(firstLineResult.index);
      if (['Up', 'Down'].includes(directionSide)) {
        document.body.style.cursor = 'row-resize';
      } else {
        document.body.style.cursor = 'col-resize';
      }

      console.log(firstLineResult.index);
    } else {
      document.body.style.cursor = '';
    }
  };

  private handleMouseUp = (
    unitCursorCoords: THREE.Vector2,
    worldPosition: THREE.Vector3,
    event: PointerEvent,
  ) => {
    if (!this._box) {
      return;
    }
    if (this.clicked) {
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

      this._box.scaleDistanceByDirection(moveDirection, delta);

      this._tempHelperLine.getLine().visible = false;

      this.render();
      this._mainRenderer.render();
    }
    this.clicked = false;
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
        result = ['z', 'y'];
        break;
      case BoxFaceEnum.Up:
      case BoxFaceEnum.Down:
        result = ['y', 'x'];
        break;
      default:
    }
    return result;
  }

  private getFaceLengthAndWidth(): number[] {
    if (!this._box) {
      return [];
    }
    const attributes = this.getFaceAttributes();
    const sides = [this._box.scale[attributes[0]], this._box.scale[attributes[1]]];

    return sides;
  }

  private getBoxMovePosition(face: BoxFaceEnum, distance: number): THREE.Vector3 {
    const boxWorldNormalMatrix = new THREE.Matrix3().getNormalMatrix(
      this._box!.matrixWorld,
    );

    // set camera position
    const tempVector3 = new THREE.Vector3();
    const geometry = this._box!.geometry;
    tempVector3.fromBufferAttribute(
      geometry.attributes.normal,
      geometry.index!.array[geometry.groups[face.valueOf()].start],
    );
    const boxPosition = this._box!.position.clone();
    tempVector3
      .applyMatrix3(boxWorldNormalMatrix)
      .normalize()
      .multiplyScalar(distance)
      .add(boxPosition);
    return tempVector3;
  }

  public render() {
    if (!this._box) {
      return;
    }

    // this._box.updateMatrix()
    const tempVector3 = this.getBoxMovePosition(this._boxFace, 15);
    this._camera.position.set(tempVector3.x, tempVector3.y, tempVector3.z);

    // update direction
    this._camera.setRotationFromQuaternion(this._box.quaternion);
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
    // this._camera.updateMatrix()

    this._camera.updateMatrixWorld();

    this._gl.render(this._mainRenderer.scene, this._camera);
    this._mainRenderer.render();
  }
}
