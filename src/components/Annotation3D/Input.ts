import EventEmitter from 'eventemitter3';
import { throttle } from 'lodash';
import { KeyboardEvent } from 'react';
import * as THREE from 'three';

import Renderder from './Renderer';
import SceneManager from './SceneManager';
import CubeObject from './Shapes/CubeObject';
import { ObjectBusEvent } from './types/Messages';

export const MouseAndKeyEvent = {
  PointerDownEvent: 'PointerDownEvent',
  PointerUpEvent: 'PointerUpEvent',
  PointerMoveEvent: 'PointerMoveEvent',
  WheelEvent: 'WheelEvent',
  KeyDownEvent: 'KeyDownEvent',
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

const cameraNormal = new THREE.Vector3(0, 0, 1);
const CROSS_PLANE = new THREE.Plane(cameraNormal, 0);
export class InputEmitter extends EventEmitter {
  private canvas: HTMLCanvasElement;
  private camera: THREE.Camera;

  private raycaster: THREE.Raycaster;

  // [-1, 1]
  private unitCursorCoords = new THREE.Vector2();
  private worldSpaceCursorCoords?: THREE.Vector3;

  private lastDownTarget: EventTarget | null | undefined;

  private sceneManager: SceneManager;
  private _eventBus: EventEmitter<ObjectBusEvent>;

  public constructor(
    canvas: HTMLCanvasElement,
    camera: THREE.Camera,
    sceneManager: SceneManager,
    eventBus: EventEmitter<ObjectBusEvent>,
  ) {
    super();
    this._eventBus = eventBus;
    this.canvas = canvas;
    this.camera = camera;
    this.sceneManager = sceneManager;

    this.canvas.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerdown', this.onPointerDown);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('wheel', this.onMouseWheel, { passive: false });
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Line!.threshold = 0.1;

    //
    // this.tools.push(new OrbitControlTool(this, renderer,  this.camera, canvas))
  }

  private setCurrentPosition(event: MouseEvent) {
    this.unitCursorCoords.x = (event.offsetX / this.canvas.width) * 2 - 1;
    this.unitCursorCoords.y = -(event.offsetY / this.canvas.height) * 2 + 1;

    this.camera.getWorldDirection(cameraNormal);
    CROSS_PLANE.set(cameraNormal, 0);
    this.worldSpaceCursorCoords =
      this.raycaster.ray.intersectPlane(
        CROSS_PLANE,
        this.worldSpaceCursorCoords ?? new THREE.Vector3(),
      ) ?? undefined;

    this.raycaster.setFromCamera(this.unitCursorCoords, this.camera);
  }

  public getRaycaster() {
    return this.raycaster;
  }

  private throttlePointMove = throttle((event: PointerEvent) => {
    this.setCurrentPosition(event);

    this.emit(
      MouseAndKeyEvent.PointerMoveEvent,
      this.unitCursorCoords,
      this.worldSpaceCursorCoords,
      event,
    );
  }, 50);

  private onPointerMove = (event: PointerEvent) => {
    event.preventDefault();
    this.throttlePointMove(event);
  };

  private onPointerDown = (event: PointerEvent) => {
    event.preventDefault();

    if (event.target == this.canvas) {
      event.preventDefault();
      this.setCurrentPosition(event);

      this.emit(
        MouseAndKeyEvent.PointerDownEvent,
        this.unitCursorCoords,
        this.worldSpaceCursorCoords,
        event,
      );

      this.canvas.setPointerCapture(event.pointerId);
      this.canvas.addEventListener('pointerup', this.onPointerUp);
      this.sceneManager.getAnnotationBoxes().forEach((listenerObj) => {
        const result = this.raycaster.intersectObject(listenerObj);
        if (result.length) {
          this._eventBus.emit(ObjectBusEvent.ClickedBox3D, listenerObj, result);
        }
      });
    }
    this.lastDownTarget = event.target;
  };

  private onPointerUp = (event: PointerEvent) => {
    event.preventDefault();

    this.setCurrentPosition(event);
    this.canvas.releasePointerCapture(event.pointerId);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.emit(
      MouseAndKeyEvent.PointerUpEvent,
      this.unitCursorCoords,
      this.worldSpaceCursorCoords,
      event,
    );
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (this.lastDownTarget == this.canvas) {
      event.preventDefault();

      this.emit(MouseAndKeyEvent.KeyDownEvent, event);
    }
  };

  private onMouseWheel = (event: WheelEvent) => {
    event.preventDefault();
    // throttle(() => {
    this.emit(MouseAndKeyEvent.WheelEvent, event);
    // }, 100);
  };
}
