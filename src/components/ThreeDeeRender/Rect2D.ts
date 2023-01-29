import { Renderable } from './Renderable'
import Renderer from './Renderer';
import * as THREE from 'three';
import { InputEmitter, Point2D } from './Input';
import AssistPoint, { AssistDirectionEnum } from './AssistPoint';
import { DoubleSide } from 'three';
import { generateUUID } from 'three/src/math/MathUtils';



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

class Rect2D  {
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

  private faceMaterial: THREE.MeshBasicMaterial

  private rectFace?: THREE.Object3D;

  public constructor(minX: number, minY: number, maxX: number, maxY: number, renderder: Renderer, input: InputEmitter) {
    this.assistPointMap = new Map()
    this.input = input;
    this.keyPoint = { minX, minY, maxX, maxY };

    this.faceMaterial = new THREE.MeshBasicMaterial({ color: this.color, side: THREE.DoubleSide })
    this.faceMaterial.depthTest =  false
    this.faceMaterial.transparent = true
    this.faceMaterial.opacity = 0.5 


    const anchor = this.getFourAnchor()
    this.sideGeometry = new THREE.BufferGeometry().setFromPoints(anchor);
    
    // const positionAttribute = new THREE.BufferAttribute(new Float32Array(4 * 3), 3); // allocate large enough buffer
    // positionAttribute.setUsage(THREE.DynamicDrawUsage);
    // this.sideGeometry.setAttribute('position', positionAttribute);

    const lineMaterial = new THREE.LineBasicMaterial({

      color: this.color,
      side: THREE.DoubleSide
    });
    this.rectLine = new THREE.LineLoop(this.sideGeometry, lineMaterial)

    this.renderder = renderder;
    this.renderder.add(this.rectLine);

    this.rectLine.userData.selfClass = this


    // assist point
    this.createAssistPoints()
    this.render()
  }

  public changeMaxPoint(maxX: number, maxY: number) :void {
    this.keyPoint.maxX = maxX
    this.keyPoint.maxY = maxY


    //
    this.updateAssistPoints()

    this.render()
  }

  private getFourAnchor(){
    return [
      new THREE.Vector3(this.keyPoint.minX, this.keyPoint.minY, 0),
      new THREE.Vector3(this.keyPoint.minX, this.keyPoint.maxY, 0),
      new THREE.Vector3(this.keyPoint.maxX, this.keyPoint.maxY, 0),
      new THREE.Vector3(this.keyPoint.maxX, this.keyPoint.minY, 0)
    ]
  }

  public render() {
    this.renderSideLine()
    this.renderFace()
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
        this.input, this, this.assistPointMove(positionDefined).bind(this) )
      this.renderder.add(assistPoint.getPoint())
      this.assistPointMap.set(key, assistPoint)
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

  private renderSideLine(){
    // this.updatePosition();

    const fourPoint = this.getFourAnchor()
    this.sideGeometry.setFromPoints(fourPoint)
    this.rectLine.geometry.computeBoundingBox()
    this.rectLine.geometry.computeBoundingSphere()
    
  }

  private renderFace(){
    if(this.rectFace){
      this.renderder.remove(this.rectFace)
      // this.input.removeListerObject(this.rectFace)
    }
    // face
    const faceGeometry = new THREE.PlaneGeometry(Math.abs(this.keyPoint.maxX - this.keyPoint.minX),Math.abs(this.keyPoint.maxY - this.keyPoint.minY ), 3, 3);
    
    this.rectFace = new THREE.Mesh(faceGeometry, this.faceMaterial)
    this.rectFace.position.x = (this.keyPoint.maxX+this.keyPoint.minX) /2;
    this.rectFace.position.y = (this.keyPoint.maxY+this.keyPoint.minY) /2;
    this.rectFace.userData.selfClass = this
    this.renderder.add(this.rectFace)

    // this.input.addListerObject(this.rectFace)
  }

  public addMoveEvent(){
    if(this.rectFace){
      this.input.addListerObject(this.rectFace)
    }
    this.assistPointMap.forEach(( point, key) => {
      this.input.addListerObject(point.getPoint())
    })
  }

}
export default Rect2D;
