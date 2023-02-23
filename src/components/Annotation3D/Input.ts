import EventEmitter from 'eventemitter3';
import { KeyboardEvent } from 'react';
import * as THREE from 'three';

import Renderder from './Renderer';
import SceneManager from './SceneManager';
import CubeObject from './Shapes/CubeObject';
export const EventType = {
  PointerDownEvent: 'PointerDownEvent',
  PointerUpEvent: 'PointerUpEvent',
  PointerMoveEvent: 'PointerMoveEvent',
  WheelEvent: 'WheelEvent',
  KeyDownEvent: 'KeyDownEvent',
  ObjectChooseEvent: 'ObjectChooseEvent',
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

const XY_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
export class InputEmitter extends EventEmitter {
  private canvas: HTMLCanvasElement;
  private camera: THREE.Camera;

  private raycaster: THREE.Raycaster;

  // [-1, 1]
  private unitCursorCoords = new THREE.Vector2();
  private worldSpaceCursorCoords?: THREE.Vector3;

  private lastDownTarget: EventTarget | null | undefined;

  private sceneManager: SceneManager;

  public constructor(
    canvas: HTMLCanvasElement,
    camera: THREE.Camera,
    sceneManager: SceneManager,
  ) {
    super();
    this.canvas = canvas;
    this.camera = camera;
    this.sceneManager = sceneManager;

    this.canvas.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerdown', this.onPointerDown);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('wheel', this.onMouseWheel, { passive: false });
    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Line!.threshold = 0.02;

    //
    // this.tools.push(new OrbitControlTool(this, renderer,  this.camera, canvas))
  }

  private setCurrentPosition(event: MouseEvent) {
    this.unitCursorCoords.x = (event.offsetX / this.canvas.width) * 2 - 1;
    this.unitCursorCoords.y = -(event.offsetY / this.canvas.height) * 2 + 1;

    this.worldSpaceCursorCoords =
      this.raycaster.ray.intersectPlane(
        XY_PLANE,
        this.worldSpaceCursorCoords ?? new THREE.Vector3(),
      ) ?? undefined;

    this.raycaster.setFromCamera(this.unitCursorCoords, this.camera);
  }

  public getRaycaster() {
    return this.raycaster;
  }

  private onPointerMove = (event: PointerEvent) => {
    event.preventDefault();
    this.setCurrentPosition(event);

    this.emit(
      EventType.PointerMoveEvent,
      this.unitCursorCoords,
      this.worldSpaceCursorCoords,
      event,
    );
  };

  private onPointerDown = (event: PointerEvent) => {
    if (event.target == this.canvas) {
      event.preventDefault();
      this.setCurrentPosition(event);

      this.emit(
        EventType.PointerDownEvent,
        this.unitCursorCoords,
        this.worldSpaceCursorCoords,
        event,
      );

      this.canvas.setPointerCapture(event.pointerId);
      this.canvas.addEventListener('pointerup', this.onPointerUp);
      this.sceneManager.getMovedListers().forEach((listenerObj) => {
        const result = this.raycaster.intersectObject(listenerObj);
        if (result.length) {
          this.emit(EventType.ObjectChooseEvent, listenerObj);
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
      EventType.PointerUpEvent,
      this.unitCursorCoords,
      this.worldSpaceCursorCoords,
      event,
    );
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (this.lastDownTarget == this.canvas) {
      event.preventDefault();

      this.emit(EventType.KeyDownEvent, event);
    }
  };

  private onMouseWheel = (event: WheelEvent) => {
    event.preventDefault();

    this.emit(EventType.WheelEvent, event);
  };
}
