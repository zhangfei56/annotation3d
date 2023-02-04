import { Renderable } from '../Renderable'
import Renderer from '../Renderer';
import * as THREE from 'three';
import { InputEmitter, Point2D } from '../Input';
import AssistPoint, { AssistDirectionEnum } from './AssistPoint';
import { DoubleSide } from 'three';
import { generateUUID } from 'three/src/math/MathUtils';
import { BaseShape } from './BaseShape';



const AssistPointDefined: Record<string, {x: 'minX' | 'maxX'; y: 'minY' | 'maxY'}> = {
  LeftUp: {
    x: 'minX',
    y: 'minY',
  },
  RightBottom: {
    x: 'maxX',
    y: 'maxY',
  }
}

class Rect2D extends BaseShape {

  private id = generateUUID()
  private renderder: Renderer;
  private input: InputEmitter;

  private sideGeometry: THREE.BufferGeometry;
  private color = 0x0000ff;
  private rectLine

  // 矩形对角点
  public keyPoint: {
    minX: number, minY: number, maxX: number, maxY: number
  };

  private assistPointMap: Map<keyof typeof AssistPointDefined, AssistPoint>


  private rectFace: THREE.Object3D;

  public constructor(minX: number, minY: number, maxX: number, maxY: number, renderder: Renderer, input: InputEmitter) {
    super();
    this.input = input;
    this.renderder = renderder;
    this.keyPoint = { minX, minY, maxX, maxY };

    this.assistPointMap = new Map()

    const anchor = this.getFaceAnchor()
    this.sideGeometry = new THREE.BufferGeometry().setFromPoints(anchor);
    // const normals = [0,0,1]
    // const colors = [];
    // colors.push( 0.5, 0.5, 1 );
    // this.sideGeometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 6 ))
    // this.sideGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    // const positionAttribute = new THREE.BufferAttribute(new Float32Array(4 * 3), 3); // allocate large enough buffer
    // positionAttribute.setUsage(THREE.DynamicDrawUsage);
    // this.sideGeometry.setAttribute('position', positionAttribute);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: this.color,
      side: THREE.DoubleSide
    });
    this.rectLine = new THREE.LineLoop(this.sideGeometry, lineMaterial)

    this.renderder.add(this.rectLine);

    // this.rectLine.userData.selfClass = this

    const faceMaterial = new THREE.MeshBasicMaterial({ color: this.color, side: THREE.DoubleSide , vertexColors: false})
    faceMaterial.depthTest =  false
    faceMaterial.transparent = true
    faceMaterial.opacity = 0.5 

    this.rectFace = new THREE.Mesh(this.sideGeometry, faceMaterial)
    this.input.addListerObject(this.rectFace)

    this.rectFace.userData.selfClass = this
    this.renderder.add(this.rectFace)


    // assist point
    this.createAssistPoints()
    this.renderder.render()
  }

  public changeMaxPoint(maxX: number, maxY: number) :void {
    this.keyPoint.maxX = maxX
    this.keyPoint.maxY = maxY
    //
    this.updateAssistPoints()

    this.render()
  }

  private getFaceAnchor(){
    return [
      new THREE.Vector3(this.keyPoint.minX, this.keyPoint.minY, 0),
      new THREE.Vector3(this.keyPoint.minX, this.keyPoint.maxY, 0),
      new THREE.Vector3(this.keyPoint.maxX, this.keyPoint.maxY, 0),
      new THREE.Vector3(this.keyPoint.maxX, this.keyPoint.maxY, 0),
      new THREE.Vector3(this.keyPoint.maxX, this.keyPoint.minY, 0),
      new THREE.Vector3(this.keyPoint.minX, this.keyPoint.minY, 0),
    ]
  }

  public render() {
    const fourPoint = this.getFaceAnchor()
    this.sideGeometry.setFromPoints(fourPoint)
    // this.rectLine.geometry.computeBoundingBox()
    this.rectLine.geometry.computeBoundingSphere()

    this.renderder.render()
  }

  public hideAssistPoint() {
    this.assistPointMap.forEach(( point, key) => {
      point.hide()
    })
    this.render()
  }
  
  public showAssistPoint() {
    this.assistPointMap.forEach(( point, key) => {
      point.show()
    })
    this.render()

  }
  
  private createAssistPoints(){
    Object.keys(AssistPointDefined).forEach(key => {
      const positionDefined = AssistPointDefined[key]
      const assistPoint = new AssistPoint(
        new THREE.Vector3(this.keyPoint[positionDefined.x], this.keyPoint[positionDefined.y], 0), 
        this, this.assistPointMove(positionDefined).bind(this) )
      this.renderder.add(assistPoint.getPoint())
      this.assistPointMap.set(key, assistPoint)
      this.input.addListerObject(assistPoint.getPoint())
    })
  }

  private updateAssistPoints(){
    Object.keys(AssistPointDefined).forEach(key => {
      const positionDefined = AssistPointDefined[key]
      const assistPoint = this.assistPointMap.get(key)
      assistPoint?.updatePosition(new THREE.Vector3(this.keyPoint[positionDefined.x], this.keyPoint[positionDefined.y], 0))
    })
  }

  public assistPointMove(positionDefined: {
    x: "minX" | "maxX";
    y: "minY" | "maxY";
}){

    return (point: Point2D)=> {
      this.keyPoint[positionDefined.x] = point.x
      this.keyPoint[positionDefined.y] = point.y
      this.updateAssistPoints()
      this.render()
    }
  }

  public mouseMoveHandler(point: Point2D): void {
    this.showAssistPoint()
  }
  public mouseDownHandler(point: Point2D): void {
    this.clicked = true
  }
  public mouseUpHandler(point: Point2D): void {
    this.clicked = false
  }
  public mouseEnterHandler(){
    this.showAssistPoint()
  }
  public mouseLeaveHandler(){
    this.hideAssistPoint()
  }
}
export default Rect2D;
