import { Renderable } from './Renderable'
import Renderer from './Renderer';
import * as THREE from 'three';

class Rect2D  {
  private vertext;
  private renderder: Renderer;
  private rectLine: THREE.LineLoop;
  private rectGeometry: THREE.BufferGeometry;

  private rectFace: THREE.Object3D;

  public constructor(minX: number, minY: number, maxX: number, maxY: number, renderder: Renderer) {
    this.vertext = this.getVertex(minX, minY, maxX, maxY);
    this.rectGeometry = new THREE.BufferGeometry().setFromPoints(this.vertext);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });
    this.rectLine = new THREE.LineLoop(this.rectGeometry, lineMaterial)
    this.renderder = renderder;
    this.renderder.add( this.rectLine);

    // face
    const faceGeo = new THREE.PlaneGeometry(maxX - minX, maxY - minY);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    this.rectFace = new THREE.Mesh(faceGeo, material)
    this.rectFace.position.x = 1;
    renderder.add(this.rectFace)

  }

  private getVertex(minX: number, minY: number, maxX: number, maxY: number){
    return [
      new THREE.Vector3(minX, minY, 0),
      new THREE.Vector3(minX, maxY, 0),
      new THREE.Vector3(maxX, maxY, 0),
      new THREE.Vector3(maxX, minY, 0)
    ]
  }

  public changePosition(minX: number, minY: number, maxX: number, maxY: number){
    this.vertext = this.getVertex(minX, minY, maxX, maxY);
    this.rectGeometry.setFromPoints(this.vertext)

    this.renderder.render()
  }

  // render(){

  // }


}
export default Rect2D;
