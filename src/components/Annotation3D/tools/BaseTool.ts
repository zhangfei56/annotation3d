import EventEmitter from 'eventemitter3';

abstract class BaseTool {
  public enabled = false;

  // 激活快捷键
  public abstract activeKeyCode: string;

  public abstract active(): void;

  public abstract deative(): void;
}

export default BaseTool;
