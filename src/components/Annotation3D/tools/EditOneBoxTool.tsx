import EventEmitter from 'eventemitter3';
import { Vector3 } from 'three';

import { EventType, InputEmitter, MouseLevel, Point2D } from '../Input';
import Renderer from '../Renderer';
import SceneManager from '../SceneManager';
import Box3D from '../Shapes/Box3D';
import BaseTool from './BaseTool';

export class EditOneBoxTool extends BaseTool {
  // 非快捷键触发
  public activeKeyCode = 'KeyEE';

  private input: InputEmitter;
  private box3d: Box3D | null = null;
  private renderer: Renderer;
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

  public active(_box: Box3D): void {
    this.box3d = _box;
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

      // this.box3d = new Box3D(worldPosition, new Vector3(0.1, 0.1, 1));
      // this.sceneManager.addShape(this.box3d);

      this.renderer.render();

      this.input.on(EventType.PointerUpEvent, this.onMouseUp);
      this.input.on(EventType.PointerMoveEvent, this.onMouseMove);
    }
  };

  onMouseMove = (point: Point2D, worldPosition: THREE.Vector3) => {
    if (this.box3d) {

      // this.box3d.changeSize({
      //   x: Math.abs(worldPosition.x - this.startPoint!.x),
      //   y: Math.abs(worldPosition.y - this.startPoint!.y),
      //   z: 1,
      // });

      this.renderer.render();
    }
  };

  onMouseUp = (point: Point2D) => {
    // save
    // this.sceneManager.addShape(this.box3d!);

    // this.box3d = null;
    // this.startPoint = null;

    this.input.removeListener(EventType.PointerUpEvent, this.onMouseUp);
    this.input.removeListener(EventType.PointerMoveEvent, this.onMouseMove);
    this.parentBus.emit('deactive');
  };
}
