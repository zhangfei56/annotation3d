import { EventEmitter } from 'eventemitter3';
import * as THREE from 'three';
import { Vector3 } from 'three';

import { OrbitControls } from './ThreeDee/OrbitControls';
import { ObjectBusEvent } from './types/Messages';
export default class Renderer {
  private readonly canvas: HTMLCanvasElement;
  public readonly gl: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  private camera;
  private _eventBus: EventEmitter<ObjectBusEvent>;

  public constructor(
    canvas: HTMLCanvasElement,
    scene: THREE.Scene,
    eventBus: EventEmitter<ObjectBusEvent>,
  ) {
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
    this.canvas = canvas;
    this._eventBus = eventBus;
    this.gl = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.scene = scene;
    this.camera = new THREE.PerspectiveCamera(
      50,
      canvas.width / canvas.height,
      0.1,
      1000,
    );
    // this.camera = new THREE.OrthographicCamera()
    this.camera.position.set(0, 0, 20);

    // this.camera.lookAt(new THREE.Vector3(0,1,1))
    this.camera.updateMatrixWorld();
    // const box =  new THREE.BoxGeometry(1,1,1)
    // const mater = new THREE.MeshBasicMaterial( {color: 'red'})
    // const s = new THREE.Mesh(box, mater)
    // this.scene.add(s)

    // const controls = new OrbitControls( this.camera, this.gl.domElement );
    // controls.addEventListener( 'change', this.render.bind(this) ); // call this only in static scenes (i.e., if there is no animation loop)

    this.gl.render(this.scene, this.camera);

    this._eventBus.on(ObjectBusEvent.RenderAll, this.render.bind(this));
  }

  public render() {
    // if has performance issue use throttle instead

    this.gl.render(this.scene, this.camera);
  }

  public getCamera() {
    return this.camera;
  }

  public getDomElement() {
    return this.canvas;
  }

  // public setColorScheme(
  //   colorScheme: 'dark' | 'light',
  //   backgroundColor: string | undefined,
  // ): void {
  //   this.colorScheme = colorScheme;

  //   const bgColor = backgroundColor ? stringToRgb(tempColor, backgroundColor) : undefined;

  //   for (const extension of this.sceneExtensions.values()) {
  //     extension.setColorScheme(colorScheme, bgColor);
  //   }

  //   if (colorScheme === 'dark') {
  //     this.gl.setClearColor(bgColor ?? DARK_BACKDROP);
  //     this.outlineMaterial.color.set(DARK_OUTLINE);
  //     this.outlineMaterial.needsUpdate = true;
  //     this.instancedOutlineMaterial.color.set(DARK_OUTLINE);
  //     this.instancedOutlineMaterial.needsUpdate = true;
  //     this.selectionBackdrop.setColor(DARK_BACKDROP, 0.8);
  //   } else {
  //     this.gl.setClearColor(bgColor ?? LIGHT_BACKDROP);
  //     this.outlineMaterial.color.set(LIGHT_OUTLINE);
  //     this.outlineMaterial.needsUpdate = true;
  //     this.instancedOutlineMaterial.color.set(LIGHT_OUTLINE);
  //     this.instancedOutlineMaterial.needsUpdate = true;
  //     this.selectionBackdrop.setColor(LIGHT_BACKDROP, 0.8);
  //   }
  // }

  // /** Translate a CameraState to the three.js coordinate system */
  // private _updateCameras(cameraState: CameraState): void {
  //   const targetOffset = tempVec3;
  //   targetOffset.fromArray(cameraState.targetOffset);

  //   const phi = THREE.MathUtils.degToRad(cameraState.phi);
  //   const theta = -THREE.MathUtils.degToRad(cameraState.thetaOffset);

  //   // Always update the perspective camera even if the current mode is orthographic. This is needed
  //   // to make the OrbitControls work properly since they track the perspective camera.
  //   // https://github.com/foxglove/studio/issues/4138

  //   // Convert the camera spherical coordinates (radius, phi, theta) to Cartesian (X, Y, Z)
  //   tempSpherical.set(cameraState.distance, phi, theta);
  //   this.perspectiveCamera.position
  //     .setFromSpherical(tempSpherical)
  //     .applyAxisAngle(UNIT_X, PI_2);
  //   this.perspectiveCamera.position.add(targetOffset);

  //   // Convert the camera spherical coordinates (phi, theta) to a quaternion rotation
  //   this.perspectiveCamera.quaternion.setFromEuler(tempEuler.set(phi, 0, theta, 'ZYX'));
  //   this.perspectiveCamera.fov = cameraState.fovy;
  //   this.perspectiveCamera.near = cameraState.near;
  //   this.perspectiveCamera.far = cameraState.far;
  //   this.perspectiveCamera.aspect = this.aspect;
  //   this.perspectiveCamera.updateProjectionMatrix();

  //   this.controls.target.copy(targetOffset);

  //   if (cameraState.perspective) {
  //     // Unlock the polar angle (pitch axis)
  //     this.controls.minPolarAngle = 0;
  //     this.controls.maxPolarAngle = Math.PI;
  //   } else {
  //     // Lock the polar angle during 2D mode
  //     const curPolarAngle = THREE.MathUtils.degToRad(this.config.cameraState.phi);
  //     this.controls.minPolarAngle = this.controls.maxPolarAngle = curPolarAngle;

  //     this.orthographicCamera.position.set(
  //       targetOffset.x,
  //       targetOffset.y,
  //       cameraState.far / 2,
  //     );
  //     this.orthographicCamera.quaternion.setFromAxisAngle(UNIT_Z, theta);
  //     this.orthographicCamera.left = (-cameraState.distance / 2) * this.aspect;
  //     this.orthographicCamera.right = (cameraState.distance / 2) * this.aspect;
  //     this.orthographicCamera.top = cameraState.distance / 2;
  //     this.orthographicCamera.bottom = -cameraState.distance / 2;
  //     this.orthographicCamera.near = cameraState.near;
  //     this.orthographicCamera.far = cameraState.far;
  //     this.orthographicCamera.updateProjectionMatrix();
  //   }
  // }

  // public setCameraState(cameraState: CameraState): void {
  //   this._isUpdatingCameraState = true;
  //   this._updateCameras(cameraState);
  //   // only active for follow pose mode because it introduces strange behavior into the other modes
  //   // due to the fact that they are manipulating the camera after update with the `cameraGroup`
  //   if (this.followMode === 'follow-pose') {
  //     this.controls.update();
  //   }
  //   this._isUpdatingCameraState = false;
  // }

  // public getCameraState(): CameraState {
  //   return {
  //     perspective: this.config.cameraState.perspective,
  //     distance: this.controls.getDistance(),
  //     phi: THREE.MathUtils.radToDeg(this.controls.getPolarAngle()),
  //     thetaOffset: THREE.MathUtils.radToDeg(-this.controls.getAzimuthalAngle()),
  //     targetOffset: [
  //       this.controls.target.x,
  //       this.controls.target.y,
  //       this.controls.target.z,
  //     ],
  //     target: this.config.cameraState.target,
  //     targetOrientation: this.config.cameraState.targetOrientation,
  //     fovy: this.config.cameraState.fovy,
  //     near: this.config.cameraState.near,
  //     far: this.config.cameraState.far,
  //   };
  // }
}
