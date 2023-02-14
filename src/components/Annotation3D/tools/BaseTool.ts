import EventEmitter from 'eventemitter3'

abstract class BaseTool {
  public abstract shortcut: string;

  public abstract active(): void

  public abstract deative(): void
}

export default BaseTool
