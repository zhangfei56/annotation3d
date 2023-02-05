import * as THREE from 'three';
import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Vector2 } from 'three';
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

      input = new InputEmitter(canvas!, renderer);
      loadPcd(renderer)
      // const rectTool = new RectTool(input, renderer)
      // rectTool.init()




      renderer.render()
    }

  }, [renderer])


  let rect2d: Box3D | undefined;

  function addRect() {
    if (renderer) {
      rect2d = new Box3D( renderer, input);
      const helper = new VertexNormalsHelper(rect2d.box, 2, 0x00ff00, 1)
      renderer.add(helper)
      const camera = new THREE.OrthographicCamera()
      camera.position.set(rect2d.box.position.x,rect2d.box.position.y, rect2d.box.position.z+20)

      // rect2d.box.layers.set(1)
      camera.lookAt(rect2d.box.position)
      camera.updateMatrixWorld()

      camera.layers.enable(1)
      camera.layers.enable(2)
      const g2 =  new THREE.WebGLRenderer({
        canvas: canvas2!,
        alpha: true,
        antialias: true,
      });
      g2.render(renderer.scene, camera)
    }
  }
  function change(){
    if(rect2d) {
      rect2d.changeSize(new THREE.Vector3(1,2,3))
    }
  }

  return <>
    <canvas ref={setCanvas} width={window.innerWidth/2} height={window.innerHeight/2}></canvas>
    <button onClick={addRect}>click</button>
    <button onClick={change}>change</button>
    <canvas ref={setCanvas2} width={window.innerWidth/2} height={window.innerHeight/2}></canvas>
  </>
}
export default Annotation3D
