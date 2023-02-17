
import * as THREE from "three";
import { BaseShape } from "./Shapes/BaseShape";

export default class SceneManager{
  public scene: THREE.Scene;

  private shapes: BaseShape[]

  private helperObject

  public constructor(){
    this.scene = new THREE.Scene()
    this.shapes = []
  }


  public addHelperObject(){
    
  }

  public addShape(shape: BaseShape){
    this.shapes.push(shape)
    this.scene.add(shape.getThreeObject())
  }

  public generateShapeFromFrame(){

  }

}
