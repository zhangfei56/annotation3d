import * as THREE from 'three';
import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { CameraHelper, Vector2 } from 'three';
import imageUrl from '../../assets/11.png'
import { InputEmitter } from './Input'
import { RectTool } from './tools/RectTool'
import { loadPcd } from './loadPcd'
import { VertexNormalsHelper } from './ThreeDee/VertexNormalsHelper'

type Props = {
  width: number;
  height: number;
}
import Renderer from './Renderer';
import Rect2D from './Shapes/Rect2D';
import Box3D from './Shapes/Box3D';
import { OrbitControls } from './ThreeDee/OrbitControls';
import { BoxFaceEnum, EditBoxTools } from './tools/EditBoxTools';
function Annotation3D(props: Props): JSX.Element {
  const { width, height } = props
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [canvas2, setCanvas2] = useState<HTMLCanvasElement | null>(null)

  const renderer = useMemo(() => {
    if (canvas) {
      return new Renderer(canvas);
    }
    return null

  }, [canvas])


  let clickedMouse = false;

  let input
  useEffect(() => {
    if (renderer) {

      // input = new InputEmitter(canvas!, renderer);
      // loadPcd(renderer)
      // const rectTool = new RectTool(input, renderer)
      // rectTool.init()


      renderer.render()
    }

  }, [renderer])


  let rect2d: Box3D | undefined;
  let editBoxTool


  // 面的法线顺序 左 右 上 下 前 后
  // 0, 8, 16
  // camera 
  //camera.rotateY(Math.PI / 2) 
  //camera.rotateX(-Math.PI / 2)
  //
  function addRect() {
    if (renderer) {
      rect2d = new Box3D();
      renderer.add(rect2d.box);
      const helper = new VertexNormalsHelper(rect2d.box, 2, 0x00ff00, 1)
      renderer.add(helper)
      editBoxTool = new EditBoxTools(rect2d.box, canvas2, renderer, 1, BoxFaceEnum.Front)
      editBoxTool.render()

    }
  }
  function change() {
    if (rect2d) {
      rect2d.changeSize(new THREE.Vector3(1, 2, 3))
      // rect2d.box.rotateX(1)
      // rect2d.box.rotateY(1)
      // rect2d.box.rotateZ(1)

      // rect2d.box.updateWorldMatrix(false, true)
      editBoxTool.render()
      renderer.render()
    }
  }

  return <>
    <canvas ref={setCanvas} width={window.innerWidth / 2} height={window.innerHeight / 2}></canvas>
    <button onClick={addRect}>click</button>
    <button onClick={change}>change</button>
    <canvas ref={setCanvas2} width={window.innerWidth / 2} height={window.innerHeight / 2}></canvas>
  </>
}
export default Annotation3D

