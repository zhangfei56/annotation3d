import { EventType, InputEmitter } from "./Input"
import Renderer from "./Renderer"
import { OrbitControlTool } from "./tools/OrbitControlTool"
import { CreateBoxTool } from "./tools/CreateBoxTool"
import BaseTool from "./tools/BaseTool"
import EventEmitter from "eventemitter3"
import SceneManager from "./SceneManager"


export class ToolsManager {
  private input
  private defaultTool

  private tools: BaseTool[]= [];
  private eventBus: EventEmitter
  // The four arrow keys
  private keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };

  constructor(input: InputEmitter, renderder: Renderer, sceneManager: SceneManager){
    this.input = input
    this.eventBus = new EventEmitter()
    this.defaultTool = new OrbitControlTool(input, renderder, renderder.getCamera(), renderder.getDomElement());
    this.defaultTool.active()

    this.tools.push(this.defaultTool);
    const createTool = new CreateBoxTool(input, renderder, this.eventBus, sceneManager)
    this.tools.push(createTool);

    this.input.addListener(EventType.KeyDownEvent, this.onKeyDown)


    this.eventBus.addListener('deactive', this.onDeactiveEvent)
  }

  onKeyDown = (event: KeyboardEvent) => {
    const keyCode = event.code
    const keyTool = this.tools.find(item => item.activeKeyCode=== keyCode);
    if(keyTool){
      this.activeTool(keyCode, keyTool)
    } 
  }


  activeTool = (keyCode: string, tool: BaseTool) => {
    const activeTool = this.tools.find(tool => tool.enabled)
    if(activeTool){
      if(keyCode === activeTool.activeKeyCode){
        return
      }
      activeTool.deative()
    }
    tool.active()
  }

  onDeactiveEvent = ()=> {
    const activeTool = this.tools.find(tool => tool.enabled)
    if(activeTool){
      activeTool.deative()
    }
    this.defaultTool.active()
  }

  getActiveTool = ()=>{
    const activeTool = this.tools.find(tool => tool.enabled)
    if(activeTool){ return activeTool }
    this.defaultTool.active()
    return this.defaultTool
  }
}
 