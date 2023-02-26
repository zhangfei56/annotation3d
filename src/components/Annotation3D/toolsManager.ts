import EventEmitter from 'eventemitter3';

import { EventType, InputEmitter } from './Input';
import Renderer from './Renderer';
import SceneManager from './SceneManager';
import { BaseShape } from './Shapes/BaseShape';
import CubeObject from './Shapes/CubeObject';
import BaseTool from './tools/BaseTool';
import { CreateBoxTool } from './tools/CreateBoxTool';
import { EditBoxFace } from './tools/EditBoxFace';
import { EditOneBoxTool } from './tools/EditOneBoxTool';
import { OrbitControlTool } from './tools/OrbitControlTool';

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

  constructor(
    input: InputEmitter,
    renderder: Renderer,
    sceneManager: SceneManager,
    multiEditViews: EditBoxFace[],
  ) {
    this.input = input;
    this.viewTool = new OrbitControlTool(
      input,
      renderder,
      renderder.getCamera(),
      renderder.getDomElement(),
    );

    // this.tools.push(this.viewTool);
    const createTool = new CreateBoxTool(input, renderder, sceneManager);
    this.tools.push(createTool);
    this.editOneBoxTool = new EditOneBoxTool(
      input,
      renderder,
      sceneManager,
      multiEditViews,
    );
    this.tools.push(this.editOneBoxTool);

    this.input.addListener(EventType.KeyDownEvent, this.onKeyDown);
    this.input.on(EventType.PointerUpEvent, this.onMouseHandle('mouseUpHandle'));
    this.input.on(EventType.PointerMoveEvent, this.onMouseHandle('mouseMoveHandle'));
    this.input.on(EventType.PointerDownEvent, this.onMouseHandle('mouseDownHandle'));
    this.input.on(EventType.WheelEvent, this.onWheelHandle);

    this.input.addListener(EventType.ObjectChooseEvent, this.onObjectChooseEvent);
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
    clickedObject: BaseShape,
    childThreeObjects: THREE.Object3D[],
  ) => {
    if (
      this.getActiveTool() == this.viewTool &&
      clickedObject instanceof CubeObject &&
      clickedObject.type === 'Annotation3DBox'
    ) {
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
