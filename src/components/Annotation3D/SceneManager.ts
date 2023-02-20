import * as THREE from 'three';

import { BaseShape } from './Shapes/BaseShape';
import Box3D from './Shapes/Box3D';
import { PointCloud } from './Shapes/PointCloud';

export default class SceneManager {
  public scene: THREE.Scene;

  private annotationBoxes: Box3D[];

  private pointCouldShapes: PointCloud[];

  private helperShapes: BaseShape[] = [];

  public constructor() {
    this.scene = new THREE.Scene();
    this.annotationBoxes = [];
    this.pointCouldShapes = [];
  }

  public addHelperObject() {}

  public addAnnotationBox(box3d: Box3D) {
    this.annotationBoxes.push(box3d);
    this.addShape(box3d);
  }
  public addPointCloud(pointCloud: PointCloud) {
    this.pointCouldShapes.push(pointCloud);
    this.addShape(pointCloud);
  }
  public addHelperShapes(helperShape: BaseShape) {
    this.helperShapes.push(helperShape);
    this.addShape(helperShape);
  }

  private addShape(shape: BaseShape) {
    this.scene.add(shape.getThreeObject());
  }

  public generateShapeFromFrame() {}

  public getMovedListers() {
    return [...this.annotationBoxes, ...this.helperShapes, ...this.pointCouldShapes];
  }
}
