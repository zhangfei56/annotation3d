import EventEmitter from 'eventemitter3';

import { InputEmitter, MouseAndKeyEvent } from './Input';
import Renderer from './Renderer';
import SceneManager from './SceneManager';
import { BaseShape } from './Shapes/BaseShape';
import CubeObject from './Shapes/CubeObject';
import BaseTool from './tools/BaseTool';
import { CreateBoxTool } from './tools/CreateBoxTool';
import { EditBoxFace } from './tools/EditBoxFace/EditBoxFace';
import { EditOneBoxTool } from './tools/EditOneBoxTool';
import { OrbitControlTool } from './tools/OrbitControlTool';
import { ObjectBusEvent } from './types/Messages';

type ToolMouseHandleType =
  | 'mouseDownHandle'
  | 'mouseMoveHandle'
  | 'mouseUpHandle'
  | 'wheelHandle';
export class ToolsManager {
  private input;
  private viewTool;

  private tools: BaseTool[] = [];
  // The four arrow keys
  private keys = {
    LEFT: 'ArrowLeft',
    UP: 'ArrowUp',
    RIGHT: 'ArrowRight',
    BOTTOM: 'ArrowDown',
  };
  private editOneBoxTool;
  private _eventBus: EventEmitter<ObjectBusEvent>;

  constructor(
    input: InputEmitter,
    renderder: Renderer,
    sceneManager: SceneManager,
    // multiEditViews: EditBoxFace[],
    eventBus: EventEmitter<ObjectBusEvent>,
  ) {
    this._eventBus = eventBus;
    this.input = input;
    this.viewTool = new OrbitControlTool(
      input,
      renderder,
      renderder.getCamera(),
      renderder.getDomElement(),
    );

    const createTool = new CreateBoxTool(input, renderder, sceneManager);
    this.tools.push(createTool);
    this.editOneBoxTool = new EditOneBoxTool(
      input,
      eventBus,
      sceneManager,
      // multiEditViews,
    );
    this.tools.push(this.editOneBoxTool);

    this.input.addListener(MouseAndKeyEvent.KeyDownEvent, this.onKeyDown);
    this.input.on(MouseAndKeyEvent.PointerUpEvent, this.onMouseHandle('mouseUpHandle'));
    this.input.on(
      MouseAndKeyEvent.PointerMoveEvent,
      this.onMouseHandle('mouseMoveHandle'),
    );
    this.input.on(
      MouseAndKeyEvent.PointerDownEvent,
      this.onMouseHandle('mouseDownHandle'),
    );
    this.input.on(MouseAndKeyEvent.WheelEvent, this.onWheelHandle);

    this._eventBus.on(ObjectBusEvent.ClickedBox3D, this.onObjectChooseEvent);
  }

  onKeyDown = (event: KeyboardEvent) => {
    const keyCode = event.code;
    if (keyCode === 'Escape') {
      this.tools.map((item) => (item.enabled = false));
      return;
    }
    const keyTool = this.tools.find((item) => item.activeKeyCode === keyCode);
    if (keyTool) {
      this.activeTool(keyCode, keyTool);
    }
  };

  onMouseHandle = (mouseHandleStr: ToolMouseHandleType) => {
    return (
      unitCoord: THREE.Vector2,
      worldPosition: THREE.Vector3,
      event: PointerEvent & { stopHandleNext: boolean },
    ) => {
      const activeTools = this.getActiveTools();
      for (let i = activeTools.length - 1; i >= 0; i--) {
        if (event.stopHandleNext) {
          break;
        }
        const currentTool = activeTools[i];
        currentTool[mouseHandleStr](unitCoord, worldPosition, event);
      }
    };
  };

  onWheelHandle = (event: WheelEvent & { stopHandleNext: boolean }) => {
    const activeTools = this.getActiveTools();
    for (let i = activeTools.length - 1; i >= 0; i--) {
      if (event.stopHandleNext) {
        break;
      }
      const currentTool = activeTools[i];
      currentTool.wheelHandle(event);
    }
  };

  getActiveTools: () => BaseTool[] = () => {
    const activeTools = this.tools.filter((item) => item.enabled);
    return [this.viewTool, ...activeTools];
  };

  activeTool = (keyCode: string, tool: BaseTool) => {
    const activeTool = this.tools.find((tool) => tool.enabled);
    if (activeTool) {
      if (keyCode === activeTool.activeKeyCode) {
        return;
      }
      activeTool.enabled = false;
    }
    tool.enabled = true;
  };

  onObjectChooseEvent = (
    clickedObject: CubeObject,
    childThreeObjects: THREE.Object3D[],
  ) => {
    if (this.getActiveTool() == this.viewTool) {
      this.activeTool(this.editOneBoxTool.activeKeyCode, this.editOneBoxTool);
      this.editOneBoxTool.setSelected(clickedObject);
    }
  };

  getActiveTool = () => {
    const activeTool = this.tools.find((tool) => tool.enabled);
    if (activeTool) {
      return activeTool;
    }
    return this.viewTool;
  };
}
