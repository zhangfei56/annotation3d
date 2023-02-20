import EventEmitter from 'eventemitter3';

import { EventType, InputEmitter } from './Input';
import Renderer from './Renderer';
import SceneManager from './SceneManager';
import { BaseShape } from './Shapes/BaseShape';
import Box3D from './Shapes/Box3D';
import BaseTool from './tools/BaseTool';
import { CreateBoxTool } from './tools/CreateBoxTool';
import { EditOneBoxTool } from './tools/EditOneBoxTool';
import { OrbitControlTool } from './tools/OrbitControlTool';

export class ToolsManager {
  private input;
  private defaultTool;

  private tools: BaseTool[] = [];
  private eventBus: EventEmitter;
  // The four arrow keys
  private keys = {
    LEFT: 'ArrowLeft',
    UP: 'ArrowUp',
    RIGHT: 'ArrowRight',
    BOTTOM: 'ArrowDown',
  };
  private editOneBoxTool;

  constructor(input: InputEmitter, renderder: Renderer, sceneManager: SceneManager) {
    this.input = input;
    this.eventBus = new EventEmitter();
    this.defaultTool = new OrbitControlTool(
      input,
      renderder,
      renderder.getCamera(),
      renderder.getDomElement(),
    );
    this.defaultTool.active();

    this.tools.push(this.defaultTool);
    const createTool = new CreateBoxTool(input, renderder, this.eventBus, sceneManager);
    this.tools.push(createTool);
    this.editOneBoxTool = new EditOneBoxTool(
      input,
      renderder,
      this.eventBus,
      sceneManager,
    );
    this.tools.push(this.editOneBoxTool);

    this.input.addListener(EventType.KeyDownEvent, this.onKeyDown);
    this.input.addListener(EventType.ObjectChooseEvent, this.onObjectChooseEvent);

    this.eventBus.addListener('deactive', this.onDeactiveEvent);
  }

  onKeyDown = (event: KeyboardEvent) => {
    const keyCode = event.code;
    const keyTool = this.tools.find((item) => item.activeKeyCode === keyCode);
    if (keyTool) {
      this.activeTool(keyCode, keyTool);
    }
  };

  activeTool = (keyCode: string, tool: BaseTool) => {
    const activeTool = this.tools.find((tool) => tool.enabled);
    if (activeTool) {
      if (keyCode === activeTool.activeKeyCode) {
        return;
      }
      activeTool.deative();
    }
    tool.active();
  };

  onObjectChooseEvent = (clickedObject: BaseShape) => {
    if (this.getActiveTool() == this.defaultTool && clickedObject instanceof Box3D) {
      this.activeTool(this.editOneBoxTool.activeKeyCode, this.editOneBoxTool);
    }
  };

  onDeactiveEvent = () => {
    const activeTool = this.tools.find((tool) => tool.enabled);
    if (activeTool) {
      activeTool.deative();
    }
    this.defaultTool.active();
  };

  getActiveTool = () => {
    const activeTool = this.tools.find((tool) => tool.enabled);
    if (activeTool) {
      return activeTool;
    }
    this.defaultTool.active();
    return this.defaultTool;
  };
}
