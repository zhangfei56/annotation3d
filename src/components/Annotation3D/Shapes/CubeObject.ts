import * as THREE from 'three';
import {
  ArrowHelper,
  AxesHelper,
  Box3,
  BoxGeometry,
  BoxHelper,
  DoubleSide,
  Object3D,
  Vector3,
} from 'three';

import Renderer from '../Renderer';
import CubeLines from '../ThreeDee/CubeLines';
import SurfaceMesh from '../ThreeDee/SurfaceMesh';
import { Point3D, Quaternion } from '../types/Messages';
import AssistPoint, { AssistDirectionEnum } from './AssistPoint';
import { BaseShape } from './BaseShape';

const ScaleUnit = new THREE.Vector3(1, 1, 1);
const ZeroVector = new THREE.Vector3(0, 0, 0);
export const XUnit = new THREE.Vector3(1, 0, 0);
export const NegativeXUnit = new THREE.Vector3(-1, 0, 0);
export const YUnit = new THREE.Vector3(0, 1, 0);
export const NegativeYUnit = new THREE.Vector3(0, -1, 0);
export const ZUnit = new THREE.Vector3(0, 0, 1);

const XNegativeQuat = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(0, 0, 1),
  Math.PI,
);

class CubeObject extends Object3D implements BaseShape {
  private _color: number;

  private surface: SurfaceMesh;
  private _lines: CubeLines;

  public axesArr: ArrowHelper[];

  public geometry: BoxGeometry;

  public constructor(
    position: THREE.Vector3 = ZeroVector,
    scale: Point3D = ScaleUnit,
    orientation: Quaternion,
    color = 0x0000ff,
  ) {
    super();
    this.type = 'Annotation3DBox';

    this.geometry = new THREE.BoxGeometry(1, 1, 1);

    this._color = color;

    this._lines = new CubeLines(color);
    this.add(this._lines);
    this.axesArr = [];

    const xArrow = new ArrowHelper(XUnit, ZeroVector, 1.5, 'red');
    xArrow.name = 'xAxes';
    this.add(xArrow);
    this.axesArr.push(xArrow);

    const yArrow = new ArrowHelper(YUnit, ZeroVector, 1.5, 'green');
    yArrow.name = 'yAxes';
    this.add(yArrow);
    this.axesArr.push(yArrow);

    const zArrow = new ArrowHelper(ZUnit, ZeroVector, 1.5, 'blue');
    zArrow.name = 'zAxes';
    this.add(zArrow);
    this.axesArr.push(zArrow);

    this.surface = new SurfaceMesh(this._color);
    // this.surface.position.set(position.x, position.y, position.z);
    this.add(this.surface);

    this.position.set(position.x, position.y, position.z);
    this.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);
    this.scale.set(scale.x, scale.y, scale.z);
  }

  public changeSize(scale: { x: number; y: number; z: number }): void {
    //

    this.scale.set(scale.x, scale.y, scale.z);
    this.updateMatrix();
    // this.surface.scale.set(scale.x, scale.y, scale.z);
    // this.surface.updateMatrix();
    // this.surface.updateMatrixWorld();
  }

  // 向某个方向延展
  public scaleDistanceByDirection(direction: Vector3, delta: number): void {
    this.translateOnAxis(direction, delta / 2);

    const deltaDirection = direction
      .clone()
      .set(Math.abs(direction.x), Math.abs(direction.y), Math.abs(direction.z))
      .multiplyScalar(delta);
    this.scale.add(deltaDirection);
    this.updateMatrix();
  }

  public rotateOnAxis2(axis: Vector3, angle: number): void {
    this.rotateOnAxis(axis, angle);
  }

  public updateMinMaxPoint(start: Point3D, end: Point3D) {
    const positionX = (end.x + start.x) / 2;
    const positionY = (end.y + start.y) / 2;
    this.position.set(positionX, positionY, 0);
    if (start.x > end.x) {
      this.quaternion.copy(XNegativeQuat);
    }

    this.scale.set(Math.abs(end.x - start.x), Math.abs(end.y - start.y), 2);
    this.updateMatrix();
    this.updateWorldMatrix(true, true);

    // this._lines.update(this._box);
    console.log('max', end);
  }

  public getSideLines() {
    return this._lines;
  }

  public getSurface() {
    return this.surface;
  }

  public dispose(): void {
    this.geometry.dispose();
    this._lines.dispose();
    this.surface.dispose();
  }

  public mouseDownHandler() {}

  public render() {
    // this.renderder.render()
  }
}
export default CubeObject;
