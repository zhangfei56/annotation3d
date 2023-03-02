import * as THREE from 'three';
import {
  Camera,
  EventDispatcher,
  Matrix4,
  MOUSE,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Spherical,
  TOUCH,
  Vector2,
  Vector3,
} from 'three';

import { MouseAndKeyEvent, InputEmitter } from '../Input';
import Renderer from '../Renderer';
import BaseTool from './BaseTool';

const STATE = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6,
};

const EPS = 0.000001;

// current position in spherical coordinates
const spherical = new Spherical();
const sphericalDelta = new Spherical();

let scale = 1;
const panOffset = new Vector3();
let zoomChanged = false;

const rotateStart = new Vector2();
const rotateEnd = new Vector2();
const rotateDelta = new Vector2();

const panStart = new Vector2();
const panEnd = new Vector2();
const panDelta = new Vector2();

const dollyStart = new Vector2();
const dollyEnd = new Vector2();
const dollyDelta = new Vector2();

export class OrbitControlTool extends BaseTool {
  public activeKeyCode: string;
  private state = STATE.NONE;
  private _mainRenderer;

  private object: OrthographicCamera | PerspectiveCamera;
  private domElement;
  // this.domElement.style.touchAction = 'none'; // disable touch scroll

  // Set to false to disable this control
  public enabled = true;

  // "target" sets the location of focus, where the object orbits around
  private target = new THREE.Vector3();

  // How far you can dolly in and out ( PerspectiveCamera only )
  private minDistance = 0;
  private maxDistance = Infinity;

  // How far you can zoom in and out ( OrthographicCamera only )
  private minZoom = 0;
  private maxZoom = Infinity;

  // How far you can orbit vertically, upper and lower limits.
  // Range is 0 to Math.PI radians.
  private minPolarAngle = 0; // radians
  private maxPolarAngle = Math.PI; // radians

  // How far you can orbit horizontally, upper and lower limits.
  // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
  private minAzimuthAngle = -Infinity; // radians
  private maxAzimuthAngle = Infinity; // radians

  // Set to true to enable damping (inertia)
  // If damping is enabled, you must call controls.update() in your animation loop
  private enableDamping = false;
  private dampingFactor = 0.05;

  // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
  // Set to false to disable zooming
  private enableZoom = true;
  private zoomSpeed = 1.0;

  // Set to false to disable rotating
  private enableRotate = true;
  private rotateSpeed = 1.0;

  // Set to false to disable panning
  private enablePan = true;
  private panSpeed = 1.0;
  private screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
  private keyPanSpeed = 7.0; // pixels moved per arrow key push

  // Set to true to automatically rotate around the target
  // If auto-rotate is enabled, you must call controls.update() in your animation loop
  private autoRotate = false;
  private autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

  // Mouse buttons
  private mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

  // for reset
  private target0;
  private position0;
  private zoom0;
  private update;

  private input;

  public constructor(
    input: InputEmitter,
    renderer: Renderer,
    _camera: OrthographicCamera | PerspectiveCamera,
    canvas: HTMLCanvasElement,
  ) {
    super();
    this.input = input;
    this.activeKeyCode = 'KeyO';
    this.object = _camera;
    this._mainRenderer = renderer;
    this.domElement = canvas;

    // Set to false to disable this control
    this.enabled = true;
    // "target" sets the location of focus, where the object orbits around
    this.target = new THREE.Vector3();

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = Infinity;

    // How far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0;
    this.maxZoom = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
    this.minAzimuthAngle = -Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = false;
    this.dampingFactor = 0.05;

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    this.enableZoom = true;
    this.zoomSpeed = 1.0;

    // Set to false to disable rotating
    this.enableRotate = true;
    this.rotateSpeed = 1.0;

    // Set to false to disable panning
    this.enablePan = true;
    this.panSpeed = 1.0;
    this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
    this.keyPanSpeed = 7.0; // pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

    // Mouse buttons
    this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;

    this.update = (() => {
      const offset = new Vector3();

      // so camera.up is the orbit axis
      const quat = new Quaternion().setFromUnitVectors(
        this.object.up,
        new Vector3(0, 1, 0),
      );
      const quatInverse = quat.clone().invert();

      const lastPosition = new Vector3();
      const lastQuaternion = new Quaternion();

      const twoPI = 2 * Math.PI;

      return () => {
        const position = this.object.position;

        offset.copy(position).sub(this.target);

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat);

        // angle from z-axis around y-axis
        spherical.setFromVector3(offset);

        if (this.autoRotate && this.state === STATE.NONE) {
          this.rotateLeft(this.getAutoRotationAngle());
        }

        if (this.enableDamping) {
          spherical.theta += sphericalDelta.theta * this.dampingFactor;
          spherical.phi += sphericalDelta.phi * this.dampingFactor;
        } else {
          spherical.theta += sphericalDelta.theta;
          spherical.phi += sphericalDelta.phi;
        }

        // restrict theta to be between desired limits

        let min = this.minAzimuthAngle;
        let max = this.maxAzimuthAngle;

        if (isFinite(min) && isFinite(max)) {
          if (min < -Math.PI) min += twoPI;
          else if (min > Math.PI) min -= twoPI;

          if (max < -Math.PI) max += twoPI;
          else if (max > Math.PI) max -= twoPI;

          if (min <= max) {
            spherical.theta = Math.max(min, Math.min(max, spherical.theta));
          } else {
            spherical.theta =
              spherical.theta > (min + max) / 2
                ? Math.max(min, spherical.theta)
                : Math.min(max, spherical.theta);
          }
        }

        // restrict phi to be between desired limits
        spherical.phi = Math.max(
          this.minPolarAngle,
          Math.min(this.maxPolarAngle, spherical.phi),
        );

        spherical.makeSafe();

        spherical.radius *= scale;

        // restrict radius to be between desired limits
        spherical.radius = Math.max(
          this.minDistance,
          Math.min(this.maxDistance, spherical.radius),
        );

        // move target to panned location

        if (this.enableDamping === true) {
          this.target.addScaledVector(panOffset, this.dampingFactor);
        } else {
          this.target.add(panOffset);
        }

        offset.setFromSpherical(spherical);

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse);

        position.copy(this.target).add(offset);

        this.object.lookAt(this.target);

        if (this.enableDamping === true) {
          sphericalDelta.theta *= 1 - this.dampingFactor;
          sphericalDelta.phi *= 1 - this.dampingFactor;

          panOffset.multiplyScalar(1 - this.dampingFactor);
        } else {
          sphericalDelta.set(0, 0, 0);

          panOffset.set(0, 0, 0);
        }

        scale = 1;

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if (
          zoomChanged ||
          lastPosition.distanceToSquared(this.object.position) > EPS ||
          8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS
        ) {
          lastPosition.copy(this.object.position);
          lastQuaternion.copy(this.object.quaternion);
          zoomChanged = false;
          this._mainRenderer.render();

          return true;
        }
        this._mainRenderer.render();
        return false;
      };
    })();
  }

  public mouseDownHandle = (_p1, _p2, event: PointerEvent) => {
    let mouseAction;

    switch (event.button) {
      case 0:
        mouseAction = this.mouseButtons.LEFT;
        break;

      case 1:
        mouseAction = this.mouseButtons.MIDDLE;
        break;

      case 2:
        mouseAction = this.mouseButtons.RIGHT;
        break;

      default:
        mouseAction = -1;
    }

    switch (mouseAction) {
      case MOUSE.DOLLY:
        if (this.enableZoom === false) return;

        this.handleMouseDownDolly(event);

        this.state = STATE.DOLLY;

        break;

      case MOUSE.ROTATE:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enablePan === false) return;

          this.handleMouseDownPan(event);

          this.state = STATE.PAN;
        } else {
          if (this.enableRotate === false) return;

          this.handleMouseDownRotate(event);

          this.state = STATE.ROTATE;
        }

        break;

      case MOUSE.PAN:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate === false) return;

          this.handleMouseDownRotate(event);

          this.state = STATE.ROTATE;
        } else {
          if (this.enablePan === false) return;

          this.handleMouseDownPan(event);

          this.state = STATE.PAN;
        }

        break;

      default:
        this.state = STATE.NONE;
    }
  };

  mouseMoveHandle = (_p1, _p2, event: PointerEvent) => {
    console.log('onMouseMove');
    switch (this.state) {
      case STATE.ROTATE:
        if (this.enableRotate === false) return;

        this.handleMouseMoveRotate(event);

        break;

      case STATE.DOLLY:
        if (this.enableZoom === false) return;

        this.handleMouseMoveDolly(event);

        break;

      case STATE.PAN:
        if (this.enablePan === false) return;

        this.handleMouseMovePan(event);

        break;
    }
  };

  public mouseUpHandle(
    _unitCoord: THREE.Vector2,
    _worldPosition: THREE.Vector3,
    _event: PointerEvent,
  ): void {
    this.state = STATE.NONE;
  }

  wheelHandle = (event: WheelEvent) => {
    if (this.enabled === false || this.enableZoom === false || this.state !== STATE.NONE)
      return;
    this.handleMouseWheel(event);
  };

  getAutoRotationAngle = () => {
    return ((2 * Math.PI) / 60 / 60) * this.autoRotateSpeed;
  };

  getZoomScale() {
    return Math.pow(0.95, this.zoomSpeed);
  }

  rotateLeft(angle: number) {
    sphericalDelta.theta -= angle;
  }

  rotateUp(angle: number) {
    sphericalDelta.phi -= angle;
  }

  panLeft = (function () {
    const v = new Vector3();

    return function panLeft(distance: number, objectMatrix: Matrix4) {
      v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
      v.multiplyScalar(-distance);

      panOffset.add(v);
    };
  })();

  panUp = (() => {
    const v = new Vector3();

    return (distance: number, objectMatrix: Matrix4) => {
      if (this.screenSpacePanning === true) {
        v.setFromMatrixColumn(objectMatrix, 1);
      } else {
        v.setFromMatrixColumn(objectMatrix, 0);
        v.crossVectors(this.object.up, v);
      }
      v.multiplyScalar(distance);

      panOffset.add(v);
    };
  })();

  // deltaX and deltaY are in pixels; right and down are positive
  pan = (() => {
    const offset = new Vector3();

    return (deltaX: number, deltaY: number) => {
      const element = this.domElement;
      // @ts-ignore
      if (this.object.isPerspectiveCamera) {
        const camera = this.object as PerspectiveCamera;
        // perspective
        const position = this.object.position;
        offset.copy(position).sub(this.target);
        let targetDistance = offset.length();

        // half of the fov is center to top of screen
        targetDistance *= Math.tan(((camera.fov / 2) * Math.PI) / 180.0);

        // we use only clientHeight here so aspect ratio does not distort speed
        this.panLeft(
          (2 * deltaX * targetDistance) / element.clientHeight,
          this.object.matrix,
        );
        this.panUp(
          (2 * deltaY * targetDistance) / element.clientHeight,
          this.object.matrix,
        );
        //@ts-ignore
      } else if (this.object.isOrthographicCamera) {
        const camera = this.object as OrthographicCamera;

        // orthographic
        this.panLeft(
          (deltaX * (camera.right - camera.left)) /
            this.object.zoom /
            element.clientWidth,
          this.object.matrix,
        );
        this.panUp(
          (deltaY * (camera.top - camera.bottom)) /
            this.object.zoom /
            element.clientHeight,
          this.object.matrix,
        );
      } else {
        // camera neither orthographic nor perspective
        console.warn(
          'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.',
        );
        this.enablePan = false;
      }
    };
  })();

  dollyOut = (dollyScale: number) => {
    if (this.object.isPerspectiveCamera) {
      scale /= dollyScale;
    } else if (this.object.isOrthographicCamera) {
      this.object.zoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, this.object.zoom * dollyScale),
      );
      this.object.updateProjectionMatrix();
      zoomChanged = true;
    } else {
      console.warn(
        'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.',
      );
      this.enableZoom = false;
    }
  };

  dollyIn = (dollyScale: number) => {
    if (this.object.isPerspectiveCamera) {
      scale *= dollyScale;
    } else if (this.object.isOrthographicCamera) {
      this.object.zoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, this.object.zoom / dollyScale),
      );
      this.object.updateProjectionMatrix();
      zoomChanged = true;
    } else {
      console.warn(
        'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.',
      );
      this.enableZoom = false;
    }
  };

  //
  // event callbacks - update the object state
  //

  handleMouseDownRotate = (event: PointerEvent) => {
    rotateStart.set(event.clientX, event.clientY);
  };

  handleMouseDownDolly = (event: PointerEvent) => {
    dollyStart.set(event.clientX, event.clientY);
  };

  handleMouseDownPan = (event: PointerEvent) => {
    panStart.set(event.clientX, event.clientY);
  };

  handleMouseMoveRotate = (event: PointerEvent) => {
    rotateEnd.set(event.clientX, event.clientY);

    rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(this.rotateSpeed);

    const element = this.domElement;

    this.rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientHeight); // yes, height

    this.rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight);

    rotateStart.copy(rotateEnd);

    this.update();
  };

  handleMouseMoveDolly = (event: PointerEvent) => {
    dollyEnd.set(event.clientX, event.clientY);

    dollyDelta.subVectors(dollyEnd, dollyStart);

    if (dollyDelta.y > 0) {
      this.dollyOut(this.getZoomScale());
    } else if (dollyDelta.y < 0) {
      this.dollyIn(this.getZoomScale());
    }

    dollyStart.copy(dollyEnd);

    this.update();
  };

  handleMouseMovePan = (event: PointerEvent) => {
    panEnd.set(event.clientX, event.clientY);

    panDelta.subVectors(panEnd, panStart).multiplyScalar(this.panSpeed);

    this.pan(panDelta.x, panDelta.y);

    panStart.copy(panEnd);

    this.update();
  };

  handleMouseWheel = (event: WheelEvent) => {
    if (event.deltaY < 0) {
      this.dollyIn(this.getZoomScale());
    } else if (event.deltaY > 0) {
      this.dollyOut(this.getZoomScale());
    }

    this.update();
  };
}
