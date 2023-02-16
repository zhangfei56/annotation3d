import * as THREE from 'three';
import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { CameraHelper, Vector2 } from 'three';
import imageUrl from '../../assets/11.png'
import { InputEmitter } from './Input'
import { CreateBoxTool } from './tools/CreateBoxTool'
import { loadPcd } from './loadPcd'
import { VertexNormalsHelper } from './ThreeDee/VertexNormalsHelper'
import { ClipContextProvider } from './providers/ClipContextProvider'


import Renderer from './Renderer';
import Box3D from './Shapes/Box3D';
import { BoxFaceEnum, EditBoxFace } from './tools/EditBoxFace';
import { ToolsManager } from './toolsManager';
import MultiProvider from '../MultiProvider';
import ClipContext from './context/ClipContext';
import Sidebar from '../Sidebar';



function Annotation3D(): JSX.Element {
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
      new ToolsManager(input, renderer)
      loadPcd(renderer)

      renderer.render()
    }

  }, [renderer])


  let rect2d: Box3D | undefined;
  let editBoxTool


  function addRect() {
    if (renderer) {
      rect2d = new Box3D();
      renderer.add(rect2d.box);
      const helper = new VertexNormalsHelper(rect2d.box, 2, 0x00ff00, 1)
      renderer.add(helper)
      editBoxTool = new EditBoxFace(rect2d, canvas2, renderer, 1, BoxFaceEnum.Left)
      editBoxTool.render()

    }
  }


  return <MultiProvider
    providers={[
      <ClipContextProvider />
    ]}
  >
    <div className="main">
      <Sidebar></Sidebar>
      <div>
        {/* <canvas ref={setCanvas} width={window.innerWidth / 2} height={window.innerHeight / 2}></canvas>
        <button onClick={addRect}>click</button>
        <canvas ref={setCanvas2} width={window.innerWidth / 2} height={window.innerHeight / 2}></canvas> */}
      </div>
    </div>


  </MultiProvider>
}
export default Annotation3D

