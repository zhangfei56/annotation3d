import * as THREE from 'three';
import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Vector2 } from 'three';
import imageUrl from '../../assets/11.png'
import { InputEmitter } from './Input'
import { RectTool } from './tools/RectTool'
import { loadPcd } from './loadPcd'

type Props = {
  width: number;
  height: number;
}
import Renderer from './Renderer';
import Rect2D from './Shapes/Rect2D';
function Annotation3D(props: Props): JSX.Element {
  const { width, height } = props
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  const renderer = useMemo(() => {
    if (canvas) {
      return new Renderer(canvas);
    }
    return null

  }, [canvas])


  let clickedMouse = false;

  useEffect(() => {
    if (renderer) {

      const input = new InputEmitter(canvas!, renderer);
      loadPcd()
      // const rectTool = new RectTool(input, renderer)
      // rectTool.init()




      renderer.render()
    }

  }, [renderer])


  let rect2d: Rect2D | undefined;

  function addRect() {
    if (renderer) {
      // rect2d = new Rect2D(1, 1, 4, 4, renderer);
    }
  }

  return <>
    <canvas ref={setCanvas} width={window.innerWidth} height={window.innerHeight}></canvas>
    <button onClick={addRect}>click</button>
  </>
}
export default Annotation3D
