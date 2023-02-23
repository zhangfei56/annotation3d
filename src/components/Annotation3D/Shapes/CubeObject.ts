import * as THREE from 'three';
import { ArrowHelper, Box3, BoxGeometry, BoxHelper, DoubleSide, Object3D } from 'three';
import { generateUUID } from 'three/src/math/MathUtils';

import Renderer from '../Renderer';
import AssistPoint, { AssistDirectionEnum } from './AssistPoint';
import { BaseShape } from './BaseShape';
import { Point3D, Quaternion } from '../types/Messages';
import CubeLines from '../ThreeDee/CubeLines';
import SurfaceMesh from '../ThreeDee/SurfaceMesh';

const ScaleUnit = new THREE.Vector3(1, 1, 1);
const ZeroVector = new THREE.Vector3(0, 0, 0);
const XUnit = new THREE.Vector3(1, 0, 0);
const XNegativeUnit = new THREE.Vector3(-1, 0, 0);

const XNegativeQuat = new THREE.Quaternion().setFromUnitVectors(XUnit, XNegativeUnit);

class CubeObject extends Object3D implements BaseShape {
  private _color: number;

  private surface: SurfaceMesh;
  private _lines: CubeLines;

  private _box = new Box3();

  private mainDirectionArrow;
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

    this._box.setFromObject(this);
    this._lines = new CubeLines(this._box, color);
    this.add(this._lines);

    this.mainDirectionArrow = new ArrowHelper(XUnit, ZeroVector, 1.5, this._color);
    this.add(this.mainDirectionArrow);

    this.surface = new SurfaceMesh(this._color);
    // this.surface.position.set(position.x, position.y, position.z);
    this.add(this.surface);

    this.position.set(position.x, position.y, position.z);
    this.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);
    this.scale.set(scale.x, scale.y, scale.z);

    // this.changeSize(scale);
  }

  public changeSize(scale: { x: number; y: number; z: number }): void {
    //

    this.scale.set(scale.x, scale.y, scale.z);
    this.updateMatrix();

    // this.surface.scale.set(scale.x, scale.y, scale.z);
    // this.surface.updateMatrix();
    // this.surface.updateMatrixWorld();
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

    this._lines.update(this._box);
    console.log('max', end);
  }

  public dispose(): void {
    this.geometry.dispose();
    this._lines.dispose();
    this.mainDirectionArrow.dispose();
    this.surface.dispose();
  }

  public mouseDownHandler() {}

  public render() {
    // this.renderder.render()
  }
}
export default CubeObject;
