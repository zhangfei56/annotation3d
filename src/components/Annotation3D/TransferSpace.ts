import SceneManager from './SceneManager';
import { BaseShape } from './Shapes/BaseShape';
import CubeObject from './Shapes/CubeObject';
import { Clip, Frame } from './types/Messages';

export class TransferSpace {
  private _frameAnnotationToShape: Map<string, BaseShape>;

  private _clipInfo: Clip;
  private _currentFrame: Frame;

  private shapeSettings;
  private tagSettings;
  private _sceneManager: SceneManager;

  constructor(sceneManager: SceneManager) {
    // this._clipInfo = clipInfo;
    this._frameAnnotationToShape = new Map();
    this._sceneManager = sceneManager;
  }

  setClipInfo(): void {}

  updateFrame(frame?: Frame): void {
    frame?.annotations.forEach((rowAnnotation) => {
      const existed = this._frameAnnotationToShape.get(rowAnnotation.id);
      if (existed) {
        // existed.update()
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
    });
  }

  addAnnotationToFrame(): void {}

  updateAnnotation(): void {}
}
