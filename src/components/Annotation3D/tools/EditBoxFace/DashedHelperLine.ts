import * as THREE from 'three';

export const HelperLineConfig = {
  Up: {
    x: undefined,
    y: 1,
  },
  Down: {
    x: undefined,
    y: -1,
  },
  Left: {
    x: -1,
    y: undefined,
  },
  Right: {
    x: 1,
    y: undefined,
  },
};
export class DashedHelperLine {
  private _line: THREE.Line;
  private _points: THREE.Vector3[];

  public direction: keyof typeof HelperLineConfig;

  constructor(
    direction: keyof typeof HelperLineConfig,
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
