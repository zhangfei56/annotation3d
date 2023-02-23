import EventEmitter from 'eventemitter3';
import { Vector3 } from 'three';

import { EventType, InputEmitter, MouseLevel, Point2D } from '../Input';
import Renderer from '../Renderer';
import SceneManager from '../SceneManager';
import CubeObject from '../Shapes/CubeObject';
import BaseTool from './BaseTool';
import { EditBoxFace } from './EditBoxFace';

export class EditOneBoxTool extends BaseTool {
  // 非快捷键触发
  public activeKeyCode = 'KeyEE';

  private input: InputEmitter;
  private _cubeObject: CubeObject | null = null;
  private renderer: Renderer;
  private parentBus: EventEmitter;
  private sceneManager: SceneManager;
  private _multiEditViews: EditBoxFace[];

  constructor(
    input: InputEmitter,
    renderer: Renderer,
    eventBus: EventEmitter,
    sceneManager: SceneManager,
    multiEditViews: EditBoxFace[]
  ) {
    super();
    this.input = input;
    this.renderer = renderer;
    this.parentBus = eventBus;
    this.sceneManager = sceneManager;
    this._multiEditViews = multiEditViews
  }

  public active(): void {
    this.input.on(EventType.PointerDownEvent, this.onMouseDown);
    this.enabled = true;
  }
  public setSelected(_box: CubeObject): void {
    this._cubeObject = _box;
    this._multiEditViews.forEach(view => view.setBox(_box))

  }
  public deative(): void {
    this.input.removeListener(EventType.PointerDownEvent, this.onMouseDown);
    this.enabled = false;
  }

  onMouseDown = (point: Point2D, worldPosition: THREE.Vector3) => {
    console.log('onMouseDown', point);
    if (!this._cubeObject) {
      this.renderer.render();

      this.input.on(EventType.PointerUpEvent, this.onMouseUp);
      this.input.on(EventType.PointerMoveEvent, this.onMouseMove);
    }
  };

  onMouseMove = (point: Point2D, worldPosition: THREE.Vector3) => {
    if (this._cubeObject) {

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
  };
}
