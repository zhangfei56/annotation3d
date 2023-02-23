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
  private parentBus: EventEmitter;
  private sceneManager: SceneManager;

  constructor(
    input: InputEmitter,
    renderer: Renderer,
    eventBus: EventEmitter,
    sceneManager: SceneManager,
  ) {
    super();
    this.input = input;
    this.renderer = renderer;
    this.parentBus = eventBus;
    this.sceneManager = sceneManager;
  }

  public active(): void {
    this.input.on(EventType.PointerDownEvent, this.onMouseDown);
    this.enabled = true;
  }
  public deative(): void {
    this.input.removeListener(EventType.PointerDownEvent, this.onMouseDown);
    this.enabled = false;
  }

  onMouseDown = (point: Point2D, worldPosition: THREE.Vector3) => {
    console.log('onMouseDown', point);
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
        w: 0,
      });
      this.sceneManager.addAnnotationBox(this.box3d);

      this.renderer.render();

      this.input.on(EventType.PointerUpEvent, this.onMouseUp);
      this.input.on(EventType.PointerMoveEvent, this.onMouseMove);
    }
  };

  onMouseMove = (point: Point2D, worldPosition: THREE.Vector3) => {
    if (this.box3d) {
      this.box3d.updateMinMaxPoint(this.startPoint, worldPosition);

      this.renderer.render();
    }
  };

  onMouseUp = (point: Point2D) => {
    // save
    this.sceneManager.addAnnotationBox(this.box3d!);

    this.box3d = null;
    this.startPoint = null;

    this.input.removeListener(EventType.PointerUpEvent, this.onMouseUp);
    this.input.removeListener(EventType.PointerMoveEvent, this.onMouseMove);
    this.parentBus.emit('deactive');
  };
}
