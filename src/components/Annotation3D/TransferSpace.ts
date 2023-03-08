import EventEmitter from 'eventemitter3';

import { loadPcd } from './loadPcd';
import SceneManager from './SceneManager';
import { BaseShape } from './Shapes/BaseShape';
import CubeObject from './Shapes/CubeObject';
import { PointCloud } from './Shapes/PointCloud';
import { Clip, Frame, ObjectBusEvent } from './types/Messages';

export class TransferSpace {
  private _frameAnnotationToShape: Map<string, BaseShape>;

  private _clipInfo: Clip;
  private _currentFrame: Frame;

  private shapeSettings;
  private tagSettings;
  private _sceneManager: SceneManager;
  private _eventBus: EventEmitter<ObjectBusEvent>;
  private _pointCloud: PointCloud;

  constructor(sceneManager: SceneManager, eventBus: EventEmitter<ObjectBusEvent>) {
    // this._clipInfo = clipInfo;
    this._frameAnnotationToShape = new Map();
    this._sceneManager = sceneManager;
    this._eventBus = eventBus;
    this._pointCloud = new PointCloud();
    sceneManager.addPointCloud(this._pointCloud);
  }

  setClipInfo(): void {}

  updateFrame(frame?: Frame): void {
    if (frame?.pcd) {
      loadPcd(frame.pcd, this._pointCloud);
    }
    const existedSharpIds = Array.from(this._frameAnnotationToShape.keys());
    const currentFrameIds = frame?.annotations.map((item) => item.id) ?? [];
    const needRemoveIds = existedSharpIds.filter(
      (item) => !currentFrameIds.includes(item),
    );
    frame?.annotations.forEach((rowAnnotation) => {
      const existedCube = this._frameAnnotationToShape.get(rowAnnotation.id);
      if (existedCube) {
        // existed.update()
        existedCube.update({
          position: {
            x: rowAnnotation.position.x,
            y: rowAnnotation.position.y,
            z: rowAnnotation.position.z,
          },
          scale: {
            x: rowAnnotation.length,
            y: rowAnnotation.width,
            z: rowAnnotation.height,
          },
          orientation: {
            x: rowAnnotation.orientation.x,
            y: rowAnnotation.orientation.y,
            z: rowAnnotation.orientation.z,
            w: rowAnnotation.orientation.w,
          },
        });
      } else {
        if (rowAnnotation.shapeType === 'Cube') {
          const newShape = new CubeObject(
            {
              x: rowAnnotation.position.x,
              y: rowAnnotation.position.y,
              z: rowAnnotation.position.z,
            },
            {
              x: rowAnnotation.length,
              y: rowAnnotation.width,
              z: rowAnnotation.height,
            },
            {
              x: rowAnnotation.orientation.x,
              y: rowAnnotation.orientation.y,
              z: rowAnnotation.orientation.z,
              w: rowAnnotation.orientation.w,
            },
          );
          this._frameAnnotationToShape.set(rowAnnotation.id, newShape);
          this._sceneManager.addAnnotationBox(newShape);
        }
      }
      this._eventBus.emit(ObjectBusEvent.RenderAll);
    });
  }

  addAnnotationToFrame(): void {}

  updateAnnotation(): void {}
}
