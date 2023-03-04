import * as THREE from 'three';

export type HelperLinePosition = 'Up' | 'Down' | 'Left' | 'Right';


export class DashedHelperLine {
  private _line: THREE.Line;
  private _points: THREE.Vector3[];

  public direction: HelperLinePosition;

  constructor(
    direction: HelperLinePosition,
    points: THREE.Vector3[],
    material: THREE.LineDashedMaterial,
  ) {
    this._points = points;
    this.direction = direction;
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    this._line = new THREE.LineSegments(geometry, material);
    this._line.visible = false;
    this._line.computeLineDistances();
  }

  public getLine(): THREE.Line {
    return this._line;
  }

  public updatePoints(points: THREE.Vector3[]): void {
    this._points = points;
    this._line.geometry.setFromPoints(points);
    this._line.geometry.getAttribute('position').needsUpdate = true;
    this._line.geometry.computeBoundingSphere();
    this._line.geometry.computeBoundingBox();
    this._line.computeLineDistances();
  }

  public getPoints(): THREE.Vector3[] {
    return this._points;
  }
}
