
import * as THREE from 'three'
import { EventType, InputEmitter, Point2D } from './Input';
import Renderer from '../../Renderer';
import Box3D from '../../Shapes/Box3D';
import { HelperLineConfig, DashedHelperLine } from './DashedHelperLine'

 // 面的法线顺序 右 左 上 下 前 后
  // 0, 8, 16
  // camera 
  //camera.rotateY(Math.PI / 2) 
  //camera.rotateX(-Math.PI / 2)
  // without rotation
export enum BoxFaceEnum {
  Right,
  Left,
  Up,
  Down,
  Front,
  Back
}
const DashedMaterial = new THREE.LineDashedMaterial( {
	color: '#000',
	linewidth: 0.05,
	scale: 1,
	dashSize: 0.05,
	gapSize: 0.02,
} );

const RedDashedMaterial = new THREE.LineDashedMaterial( {
	color: 'red',
	linewidth: 0.05,
	scale: 1,
	dashSize: 0.05,
	gapSize: 0.02,
} );

const ZeroVector3  = new THREE.Vector3()

type FaceDirect = keyof typeof HelperLineConfig

type xyz = 'x' | 'y' | 'z' 

export class EditBoxTool {
  private _box: Box3D;
  private _mainRenderer: Renderer;
  private _level: number;
  private _camera: THREE.OrthographicCamera
  private _boxFace: BoxFaceEnum;
  private _canvas: HTMLCanvasElement
  private _gl : THREE.WebGLRenderer
  private _input: InputEmitter
  private _tempHelperLine: DashedHelperLine

  private helperLines: DashedHelperLine[] = []

  constructor(box: Box3D, canvas: HTMLCanvasElement, renderer: Renderer, level: number, boxFace: BoxFaceEnum){
    this._box = box;
    this._level=  level;
    this._mainRenderer = renderer;
    this._boxFace   = boxFace;
    this._canvas = canvas;


    this._camera = new THREE.OrthographicCamera()
    this._camera.near = 1
    this._camera.far = 30
    // this._camera.layers.enable(this._level)
    this._input = new InputEmitter(canvas, this._camera)


    const cameraHelper = new THREE.CameraHelper(this._camera);
    this._mainRenderer.add(cameraHelper)
    this._tempHelperLine = new DashedHelperLine('Up', [ZeroVector3, ZeroVector3], RedDashedMaterial)
    this._tempHelperLine.getLine().visible = false
    this._mainRenderer.scene.add(this._tempHelperLine.getLine())

    this.createHelperLine()
    this._gl = new THREE.WebGLRenderer({
      canvas: this._canvas,
      alpha: true,
      antialias: true,
    });

    this.render()

    this._input.addListener(EventType.MouseUpEvent, this.handleMouseUp)
    this._input.addListener(EventType.MouseDownEvent, this.handleMouseDown)
    this._input.addListener(EventType.MouseMoveEvent, this.handleMouseMove)
  }

  private clicked: boolean = false;

  private createHelperLine() {
    Object.keys(HelperLineConfig).forEach((key) =>{
      const helperLine=new DashedHelperLine(key as FaceDirect, [ZeroVector3, ZeroVector3], DashedMaterial)
      this._mainRenderer.scene.add(helperLine.getLine())
      this.helperLines.push(helperLine)
    })
  }

  private updateHelperLine(){
    const faceSides = this.getFaceLengthAndWidth()
    const maxLineSize = Math.max(...faceSides)

    const cameraY = faceSides[1]/(2*maxLineSize)
    const cameraX = faceSides[0]/(2*maxLineSize)

    this.helperLines.forEach(helperLine =>{
      const helperConfig = HelperLineConfig[helperLine.direction];
      const v1 = new THREE.Vector3(0, 0, -1)
      const v2 = new THREE.Vector3(0 , 0, -1)
      v1.x = helperConfig.x === undefined ? 1 : helperConfig.x * cameraX
      v2.x = helperConfig.x === undefined ? -1 : helperConfig.x * cameraX
      v1.y = helperConfig.y === undefined ? 1 : helperConfig.y *cameraY
      v2.y = helperConfig.y === undefined ? -1 : helperConfig.y *cameraY
      v1.unproject(this._camera)
      v2.unproject(this._camera)
      helperLine.updatePoints([v1, v2])
    })

  }



  private handleMouseDown = (unitCursorCoords: THREE.Vector2, worldPosition: THREE.Vector3, event: PointerEvent) => {
    for(let i = 0; i < this.helperLines.length; i++){
      const helperLine = this.helperLines[i]
      const intersects = this._input.getRaycaster().intersectObject(helperLine.getLine())
      if(intersects.length > 0) {
        this.clicked = true
        this._tempHelperLine.direction = helperLine.direction
        this._tempHelperLine.getLine().visible = true
        this._tempHelperLine.updatePoints(helperLine.getPoints())
        this._gl.render(this._mainRenderer.scene, this._camera)
        // this._mainRenderer.render()
        break
      }
    }
  }

  private handleMouseMove = (unitCursorCoords: THREE.Vector2, worldPosition: THREE.Vector3, event: PointerEvent) => {
    if(this.clicked){
      const direction = this._tempHelperLine.direction;
      const helperConfig = HelperLineConfig[direction];
      const cameraX= unitCursorCoords.x
      const cameraY= unitCursorCoords.y;

      const v1 = new THREE.Vector3(0, 0, -1)
      const v2 = new THREE.Vector3(0, 0, -1)
      v1.x = helperConfig.x === undefined ? 1 : cameraX
      v2.x = helperConfig.x === undefined ? -1 :  cameraX
      v1.y = helperConfig.y === undefined ? 1 : cameraY
      v2.y = helperConfig.y === undefined ? -1 : cameraY

      v1.unproject(this._camera)
      v2.unproject(this._camera)
      this._tempHelperLine.updatePoints([v1, v2])
      this._gl.render(this._mainRenderer.scene, this._camera)
      return
    }


    const helperLines = this.helperLines.map(line=> line.getLine())
    const intersects = this._input.getRaycaster().intersectObjects(helperLines)
    if(intersects.length > 0) {
      intersects[0].object.visible = true
      const visibleLine = this.helperLines.find(item => item.getLine().visible)
      if(['Up', 'Down'].includes(visibleLine!.direction)){
        document.body.style.cursor = 'row-resize'
      }else{
        document.body.style.cursor = 'col-resize'
      }
      this._gl.render(this._mainRenderer.scene, this._camera)
    }else{
      const visibleLines= this.helperLines.filter(line=> line.getLine().visible)
      visibleLines.forEach(line=>{
        line.getLine().visible = false
      })
      document.body.style.cursor = ''
      this._gl.render(this._mainRenderer.scene, this._camera)
    }
  }

  private handleMouseUp = (unitCursorCoords: THREE.Vector2, worldPosition: THREE.Vector3, event: PointerEvent)=> {
    if(this.clicked){
      const faceSides = this.getFaceLengthAndWidth()
      const maxLineSize = Math.max(...faceSides)
      const direction = this._tempHelperLine.direction;
      const helperConfig = HelperLineConfig[direction];

      const boxAttributes = this.getFaceAttributes()
      
      const changeHalf = helperConfig.x == undefined? helperConfig.y! * unitCursorCoords.y * maxLineSize : helperConfig.x!* unitCursorCoords.x* maxLineSize

      const changeAttribute = helperConfig.x == undefined? boxAttributes[1] : boxAttributes[0]


      const attributeSize  = changeHalf + this._box.box.scale[changeAttribute]/2

      const move = this.getMovingDirection(direction)

      const boxPosition = this.getBoxMovePosition(move, (changeHalf-this._box.box.scale[changeAttribute]/2)/2 )
      
      this._box.box.position.set(boxPosition.x, boxPosition.y, boxPosition.z)
      const updateScale = this._box.box.scale.clone()
      updateScale[changeAttribute] = attributeSize
      this._box.changeSize(updateScale)

      this._tempHelperLine.getLine().visible = false

      this.render()
      this._mainRenderer.render()
    }
    this.clicked = false;
  }

  private getMovingDirection(direction: keyof typeof HelperLineConfig){
    let move = BoxFaceEnum.Up
    switch(this._boxFace){
      case BoxFaceEnum.Front:
        switch(direction){
          case 'Up':
            move = BoxFaceEnum.Up
          break
          case 'Down':
            move = BoxFaceEnum.Down
          break
          case 'Left':
            move= BoxFaceEnum.Left
            break
          case 'Right':
            move= BoxFaceEnum.Right
            break
        }
        break
      case BoxFaceEnum.Up:
        switch(direction){
          case 'Up':
            move = BoxFaceEnum.Back
          break
          case 'Down':
            move = BoxFaceEnum.Front
          break
          case 'Left':
            move= BoxFaceEnum.Left
            break
          case 'Right':
            move= BoxFaceEnum.Right
            break
        }
        break
      case BoxFaceEnum.Left:
        switch(direction){
          case 'Up':
            move = BoxFaceEnum.Up
          break
          case 'Down':
            move = BoxFaceEnum.Down
          break
          case 'Left':
            move= BoxFaceEnum.Back
            break
          case 'Right':
            move= BoxFaceEnum.Front
            break
        }
        break
    }

    return move
  }

  private getFaceAttributes(): xyz[]{
    let result:  xyz[] = ['x', 'y']
    switch (this._boxFace) {
      case BoxFaceEnum.Left:
        result = ['z', 'y']
        break;
      case BoxFaceEnum.Up:
        result = ['x', 'z']
        break
      case BoxFaceEnum.Front:
        
      break
      default:
    }
    return result
  }

  private getFaceLengthAndWidth(): number[]{
    const attributes = this.getFaceAttributes()
    let sides = [this._box.box.scale[attributes[0]], this._box.box.scale[attributes[1]]]
    
    return sides
  }

  private getBoxMovePosition(face: BoxFaceEnum, distance: number): THREE.Vector3  {
    const boxWorldNormalMatrix = new THREE.Matrix3().getNormalMatrix(this._box.box.matrixWorld)

    // set camera position
    const tempVector3 = new THREE.Vector3()
    tempVector3.fromBufferAttribute(this._box.box.geometry.attributes.normal, face.valueOf()*4)
    const boxPosition = this._box.box.position.clone()
    tempVector3.applyMatrix3(boxWorldNormalMatrix).normalize().multiplyScalar(distance).add(boxPosition)
    return tempVector3
  }

  public render() {
    // this._box.updateMatrix()
    const tempVector3 = this.getBoxMovePosition(this._boxFace, 15)
    this._camera.position.set(tempVector3.x, tempVector3.y, tempVector3.z)

    // update direction
    this._camera.setRotationFromQuaternion(this._box.box.quaternion)
    switch (this._boxFace) {
      case BoxFaceEnum.Left:
        this._camera.rotateY(-Math.PI / 2) 
        break;
      case BoxFaceEnum.Up:
        this._camera.rotateX(-Math.PI / 2)
        break
      case BoxFaceEnum.Front:

      break
      default:
    }

    const faceSides = this.getFaceLengthAndWidth()
    const maxLineSize = Math.max(...faceSides)
    this._camera.left = -maxLineSize
    this._camera.right = maxLineSize
    this._camera.top = maxLineSize
    this._camera.bottom = -maxLineSize
    
    this._camera.updateProjectionMatrix()
    // this._camera.updateMatrix()

    this._camera.updateMatrixWorld()

    this.updateHelperLine()

    this._gl.render(this._mainRenderer.scene, this._camera)
    this._mainRenderer.render()
  }
}

