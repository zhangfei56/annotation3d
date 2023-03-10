import EventEmitter from 'eventemitter3';
import * as THREE from 'three';

export const MouseEvent = {
  MouseDownEvent: 'MouseDownEvent',
  MouseUpEvent: 'MouseUpEvent',
  MouseMoveEvent: 'MouseMoveEvent',
};

export type Point2D = {
  x: number;
  y: number;
};

export enum MouseLevel {
  Normal,
  Plugin,
  AssistPoint,
}
export class InputEmitter extends EventEmitter {
  private canvas: HTMLCanvasElement;
  private camera: THREE.Camera;

  private raycaster: THREE.Raycaster;
  private listenerObjects: THREE.Object3D[] = [];

  // [-1, 1]
  private unitCursorCoords = new THREE.Vector2();
  private worldSpaceCursorCoords?: THREE.Vector3;

  private worldPosition: THREE.Vector3 | undefined;

  public constructor(canvas: HTMLCanvasElement, camera: THREE.Camera) {
    super();
    this.canvas = canvas;

    this.camera = camera;

    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    // this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Line!.threshold = 0.02;
  }

  public removeListerObject(obj: THREE.Object3D) {
    const index = this.listenerObjects.indexOf(obj);
    if (index !== -1) {
      this.listenerObjects.splice(this.listenerObjects.indexOf(obj), 1);
    }
  }

  private setCurrentPosition(event: MouseEvent) {
    this.unitCursorCoords.x = (event.offsetX / this.canvas.width) * 2 - 1;
    this.unitCursorCoords.y = -(event.offsetY / this.canvas.height) * 2 + 1;
    const mouseZ = -1;
    if (this.camera instanceof THREE.OrthographicCamera) {
      // mouseZ = (this.camera.near + this.camera.far) / (this.camera.near - this.camera.far)
    }
    const stdVector = new THREE.Vector3(
      this.unitCursorCoords.x,
      this.unitCursorCoords.y,
      mouseZ,
    );
    this.worldPosition = stdVector.unproject(this.camera);
    this.raycaster.setFromCamera(this.unitCursorCoords, this.camera);
  }

  public getRaycaster() {
    return this.raycaster;
  }

  private onPointerMove = (event: PointerEvent) => {
    //event.preventDefault();

    this.setCurrentPosition(event);

    this.emit(
      MouseEvent.MouseMoveEvent,
      this.unitCursorCoords,
      this.worldPosition,
      event,
    );
  };

  private onPointerDown = (event: PointerEvent) => {
    this.setCurrentPosition(event);

    this.emit(
      MouseEvent.MouseDownEvent,
      this.unitCursorCoords,
      this.worldPosition,
      event,
    );

    this.canvas.setPointerCapture(event.pointerId);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
  };

  private onPointerUp = (event: PointerEvent) => {
    this.setCurrentPosition(event);
    this.canvas.releasePointerCapture(event.pointerId);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.emit(MouseEvent.MouseUpEvent, this.unitCursorCoords, this.worldPosition, event);
  };
}
