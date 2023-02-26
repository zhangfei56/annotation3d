import EventEmitter from 'eventemitter3';
import { Vector3 } from 'three';

import { EventType, InputEmitter, MouseLevel, Point2D } from '../Input';
import Renderer from '../Renderer';
import SceneManager from '../SceneManager';
import CubeObject from '../Shapes/CubeObject';
import BaseTool from './BaseTool';

export class CreateBoxTool extends BaseTool {
  public activeKeyCode = 'KeyA';

  private input: InputEmitter;
  private box3d: CubeObject | null = null;
  private renderer: Renderer;
  private startPoint: Point2D | null = null;
  private sceneManager: SceneManager;

  constructor(input: InputEmitter, renderer: Renderer, sceneManager: SceneManager) {
    super();
    this.input = input;
    this.renderer = renderer;
    this.sceneManager = sceneManager;
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
      this.box3d = new CubeObject(worldPosition, new Vector3(1, 1, 1), {
        x: 0,
        y: 0,
        z: 0,
        w: 1,
      });
      this.sceneManager.addAnnotationBox(this.box3d);

      this.renderer.render();
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
    this.sceneManager.addAnnotationBox(this.box3d!);

    this.box3d = null;
    this.startPoint = null;
  };

  wheelHandle = () => {
    return;
  };
}
