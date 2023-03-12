import EventEmitter from 'eventemitter3';
import { Vector3 } from 'three';

import { InputEmitter, MouseAndKeyEvent, MouseLevel, Point2D } from '../Input';
import Renderer from '../Renderer';
import SceneManager from '../SceneManager';
import CubeShape from '../Shapes/CubeShape';
import { TransferSpace } from '../TransferSpace';
import BaseTool from './BaseTool';

export class CreateBoxTool extends BaseTool {
  public activeKeyCode = 'KeyA';

  private input: InputEmitter;
  private box3d: CubeShape | null = null;
  private renderer: Renderer;
  private startPoint: Point2D | null = null;
  private _transferSpace: TransferSpace;

  constructor(input: InputEmitter, renderer: Renderer, transferSpace: TransferSpace) {
    super();
    this.input = input;
    this.renderer = renderer;
    this._transferSpace = transferSpace;
  }

  mouseDownHandle = (
    point: Point2D,
    worldPosition: THREE.Vector3,
    event: PointerEvent & { stopHandleNext: boolean },
  ) => {
    event.stopHandleNext = true;
    if (!this.box3d) {
      this.startPoint = {
        x: worldPosition.x,
        y: worldPosition.y,
      };
      worldPosition.z = 0;
      this.box3d = new CubeShape({ position: worldPosition });
      this._transferSpace.addAnnotationToFrame(this.box3d);
    }
  };

  mouseMoveHandle = (
    point: Point2D,
    worldPosition: THREE.Vector3,
    event: PointerEvent & { stopHandleNext: boolean },
  ) => {
    event.stopHandleNext = true;
    if (this.box3d) {
      this.box3d.updateMinMaxPoint(this.startPoint, worldPosition);

      this.renderer.render();
    }
  };

  mouseUpHandle = (
    point: Point2D,
    worldPosition: THREE.Vector3,
    event: PointerEvent & { stopHandleNext: boolean },
  ) => {
    event.stopHandleNext = true;
    // save
    this._transferSpace.updateAnnotation(this.box3d!);

    this.box3d = null;
    this.startPoint = null;
  };

  wheelHandle = () => {
    return;
  };
}
