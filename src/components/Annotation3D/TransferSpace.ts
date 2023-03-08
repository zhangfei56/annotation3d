import EventEmitter from 'eventemitter3';

import SceneManager from './SceneManager';
import { BaseShape } from './Shapes/BaseShape';
import CubeObject from './Shapes/CubeObject';
import { Clip, Frame, ObjectBusEvent } from './types/Messages';

export class TransferSpace {
  private _frameAnnotationToShape: Map<string, BaseShape>;

  private _clipInfo: Clip;
  private _currentFrame: Frame;

  private shapeSettings;
  private tagSettings;
  private _sceneManager: SceneManager;
  private _eventBus: EventEmitter<ObjectBusEvent>;

  constructor(sceneManager: SceneManager, eventBus: EventEmitter<ObjectBusEvent>) {
    // this._clipInfo = clipInfo;
    this._frameAnnotationToShape = new Map();
    this._sceneManager = sceneManager;
    this._eventBus = eventBus;
  }

  setClipInfo(): void {}

  updateFrame(frame?: Frame): void {
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
