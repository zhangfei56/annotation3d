
import * as THREE from 'three'
import { InputEmitter, Point2D } from '../Input';
import Renderer from '../Renderer';
import { BaseShape } from '../Shapes/BaseShape';

 // 面的法线顺序 右 左 上 下 前 后
  // 0, 8, 16
  // camera 
  //camera.rotateY(Math.PI / 2) 
  //camera.rotateX(-Math.PI / 2)
  // without rotation
export enum BoxFaceEnum {
  Left,
  Right,
  Up,
  Down,
  Front,
  Back
}
const DashedMaterial = new THREE.LineDashedMaterial( {
	color: 'yellow',
	linewidth: 1,
	scale: 1,
	dashSize: 3,
	gapSize: 1,
} );

export class EditBoxTools {
  private _box: THREE.Mesh;
  private _mainRenderer: Renderer;
  private _level: number;
  private _camera: THREE.OrthographicCamera
  private _boxFace: BoxFaceEnum;
  private _canvas: HTMLCanvasElement
  private _gl : THREE.WebGLRenderer
  private _input: InputEmitter

  private upHelpLine: DashedHelperLine

  constructor(box: THREE.Mesh, canvas: HTMLCanvasElement, renderer: Renderer, level: number, boxFace: BoxFaceEnum){
    this._box = box;
    this._level=  level;
    this._mainRenderer = renderer;
    this._boxFace   = boxFace;
    this._canvas = canvas;


    this._camera = new THREE.OrthographicCamera()
    this._camera.near = 1
    this._camera.far = 10
    // this._camera.layers.enable(this._level)
    this._input = new InputEmitter(canvas, this._camera)


    const points = [];
    points.push( new THREE.Vector3( - 10, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 10, 0 ) );
    
    this.upHelpLine = new DashedHelperLine(points)

    this._input.addListerObject(this.upHelpLine.getLine())
    
    renderer.add(this.upHelpLine.getLine())
    renderer.render()
    

    const cameraHelper = new THREE.CameraHelper(this._camera);
    this._mainRenderer.add(cameraHelper)

    this._gl = new THREE.WebGLRenderer({
      canvas: this._canvas,
      alpha: true,
      antialias: true,
    });

    this.render()
  }

  private getFaceToCameraSides(): number[]{
    let sides = [this._box.scale.x, this._box.scale.y]
    switch (this._boxFace) {
      case BoxFaceEnum.Left:
        
        break;
      case BoxFaceEnum.Up:
        
        break
      case BoxFaceEnum.Front:
        
      break
      default:
    }
    return sides
  }

  public render() {
    // this._box.updateMatrix()
    this._box.updateMatrixWorld()
    const boxWorldNormalMatrix = new THREE.Matrix3().getNormalMatrix(this._box.matrixWorld)

    // set camera position
    const tempVector3 = new THREE.Vector3()
    tempVector3.fromBufferAttribute(this._box.geometry.attributes.normal, this._boxFace.valueOf()*4)
    const boxPosition = this._box.position.clone()
    // debugger
    tempVector3.applyMatrix3(boxWorldNormalMatrix).normalize().multiplyScalar(5).add(boxPosition)
    this._camera.position.set(tempVector3.x, tempVector3.y, tempVector3.z)

    // update direction
    this._camera.setRotationFromQuaternion(this._box.quaternion)
    switch (this._boxFace) {
      case BoxFaceEnum.Left:
        this._camera.rotateY(Math.PI / 2) 
        break;
      case BoxFaceEnum.Up:
        this._camera.rotateX(-Math.PI / 2)
        break
      case BoxFaceEnum.Front:

      break
      default:
    }

    const faceSides = this.getFaceToCameraSides()
    const maxLineSize = Math.max(...faceSides)
    this._camera.left = -maxLineSize
    this._camera.right = maxLineSize
    this._camera.top = maxLineSize
    this._camera.bottom = -maxLineSize
    
    this._camera.updateProjectionMatrix()
    // this._camera.updateMatrix()

    this._camera.updateMatrixWorld()

    this.updateAuxiliaryLine()

    this._gl.render(this._mainRenderer.scene, this._camera)
  }


  // 辅助线
  private updateAuxiliaryLine(){
    const cameraZ = (this._camera.near + this._camera.far) / (this._camera.near - this._camera.far)
    const faceSides = this.getFaceToCameraSides()
    const maxLineSize = Math.max(...faceSides)

    const cameraY = faceSides[1]/(2*maxLineSize)
    const cameraX = faceSides[0]/(2*maxLineSize)

    // up help line
    const v1 = new THREE.Vector3(-1, cameraY, 0)
    const v2 = new THREE.Vector3(1 , cameraY, 0)
    v1.unproject(this._camera)
    v2.unproject(this._camera)
    this.upHelpLine.updatePoints([v1, v2])
  }

}

class DashedHelperLine extends BaseShape {
  private _line: THREE.Line
  constructor(points: THREE.Vector3[] ){

    super()
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    this._line = new THREE.Line( geometry, DashedMaterial );
    this._line.userData.selfClass = this

  }

  public getLine(): THREE.Line{
    return this._line;
  }

  public updatePoints(points: THREE.Vector3[]): void{
    this._line.geometry.setFromPoints(points);
    this._line.geometry.getAttribute('position').needsUpdate = true;
    this._line.geometry.computeBoundingSphere()
  }

  public mouseMoveHandler(point: Point2D){
    // console.log('mouseMoveHandler', point);
  }


}
