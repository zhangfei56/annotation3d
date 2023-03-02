import * as THREE from 'three';
import { Object3D } from 'three';

import { BaseShape } from './Shapes/BaseShape';
import CubeObject from './Shapes/CubeObject';
import { PointCloud } from './Shapes/PointCloud';

export default class SceneManager {
  public scene: THREE.Scene;

  private annotationBoxes: CubeObject[];

  private pointCouldShapes: PointCloud[];

  private helperShapes: Object3D[] = [];

  public constructor() {
    this.scene = new THREE.Scene();
    this.annotationBoxes = [];
    this.pointCouldShapes = [];
  }

  public addHelperObject(helperObject) {
    this.addShape(helperObject);
  }

  public addAnnotationBox(box3d: CubeObject) {
    this.annotationBoxes.push(box3d);
    this.addShape(box3d);
  }
  public addPointCloud(pointCloud: PointCloud) {
    this.pointCouldShapes.push(pointCloud);
    this.addShape(pointCloud);
  }
  public addHelperShapes(helperShape: Object3D) {
    this.helperShapes.push(helperShape);
    this.addShape(helperShape);
  }

  private addShape(shape: Object3D) {
    this.scene.add(shape);
  }

  public generateShapeFromFrame() {}

  public getMovedListers() {
    return [...this.annotationBoxes, ...this.helperShapes];
  }

  public getAnnotationBoxes() {
    return this.annotationBoxes;
  }
}
