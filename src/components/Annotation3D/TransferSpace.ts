import EventEmitter from 'eventemitter3';

import { loadPcd } from './loadPcd';
import SceneManager from './SceneManager';
import { BaseShape } from './Shapes/BaseShape';
import CubeShape from './Shapes/CubeShape';
import { PointCloud } from './Shapes/PointCloud';
import {
  AnnotationType,
  Clip,
  CubeRowAnnotation,
  Frame,
  ObjectBusEvent,
  RowAnnotation,
} from './types/Messages';

function getShapeUpdateAttributeFromRawMessage(rowMessage: RowAnnotation) {
  let result: Record<string, any>;
  switch (rowMessage.shapeType) {
    case AnnotationType.Cube:
      result = {
        position: {
          x: rowMessage.position.x,
          y: rowMessage.position.y,
          z: rowMessage.position.z,
        },
        scale: {
          x: rowMessage.length,
          y: rowMessage.width,
          z: rowMessage.height,
        },
        orientation: {
          x: rowMessage.orientation.x,
          y: rowMessage.orientation.y,
          z: rowMessage.orientation.z,
          w: rowMessage.orientation.w,
        },
      };
      break;
  }

  return result;
}

function getCubeRawAttributeFromShape(cubeShape: CubeShape) {
  const attributes = cubeShape.getRowAnnotationAttributes();
  return {
    length: attributes.scale.x,
    width: attributes.scale.y,
    height: attributes.scale.z,
    orientation: attributes.orientation,
    position: attributes.position,
  };
}

function createCubeRowFromSharp(cubeShape: CubeShape): CubeRowAnnotation {
  const rawAttribute = cubeShape.getRowAnnotationAttributes();
  return {
    id: cubeShape.uuid,
    shapeType: AnnotationType.Cube,
    position: rawAttribute.position,
    length: rawAttribute.scale.x,
    width: rawAttribute.scale.y,
    height: rawAttribute.scale.z,
    orientation: rawAttribute.orientation,
  };
}

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

  updateFrame(frame: Frame): void {
    this._currentFrame = frame;
    if (frame?.pcd) {
      loadPcd(frame.pcd, this._pointCloud);
    }
    const existedSharpIds = Array.from(this._frameAnnotationToShape.keys());
    const currentFrameIds = frame?.annotations.map((item) => item.id) ?? [];
    const needRemoveIds = existedSharpIds.filter(
      (item) => !currentFrameIds.includes(item),
    );
    needRemoveIds.forEach((removeItem) => {
      this._frameAnnotationToShape.get(removeItem)?.dispose();
      this._frameAnnotationToShape.delete(removeItem);
    });

    frame?.annotations.forEach((rowAnnotation) => {
      const updateAttributes = getShapeUpdateAttributeFromRawMessage(rowAnnotation);
      const existedAnnotation = this._frameAnnotationToShape.get(rowAnnotation.id);
      if (existedAnnotation) {
        // existed.update()
        existedAnnotation.update(updateAttributes);
      } else {
        if (rowAnnotation.shapeType === 'Cube') {
          const newShape = new CubeShape(updateAttributes);
          this._frameAnnotationToShape.set(rowAnnotation.id, newShape);
          this._sceneManager.addAnnotationBox(newShape);
        }
      }
      this._eventBus.emit(ObjectBusEvent.RenderAll);
    });
  }

  addAnnotationToFrame(shape: BaseShape): void {
    if (shape.type === 'SharpCube') {
      const cubeShape = shape as CubeShape;
      this._sceneManager.addAnnotationBox(cubeShape);
      const rawAnnotation = createCubeRowFromSharp(cubeShape);

      this._frameAnnotationToShape.set(rawAnnotation.id, shape);
      this._currentFrame.annotations.push(rawAnnotation);
    }
    this._eventBus.emit(ObjectBusEvent.RenderAll);
  }

  updateAnnotation(shape: BaseShape): void {
    if (shape.type === 'SharpCube') {
      const rawMessage = this._currentFrame.annotations.find(
        (item) => item.id === shape.uuid,
      );
      const attributes = getCubeRawAttributeFromShape(shape as CubeShape);
      for (const attribute in attributes) {
        rawMessage[attribute] = attributes[attribute];
      }
      // rawMessage = {
      //   ...rawMessage,
      //   ...attributes,
      // };
    }
    this._eventBus.emit(ObjectBusEvent.RenderAll);
  }
}
