import * as THREE from 'three';
import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Vector2 } from 'three';
import imageUrl from '../../assets/11.png'
import { InputEmitter } from './Input'
import { RectTool } from './tools/RectTool'

type Props = {
  width: number;
  height: number;
}
import Renderer from './Renderer';
import Rect2D from './Rect2D';
import { useImage } from './useImage';
function ThreeDeeRender(props: Props): JSX.Element {
  const { width, height } = props
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const imageInfo = useImage(imageUrl)

  const renderer = useMemo(() => {
    if (canvas) {
      return new Renderer(canvas);
    }
    return null

  }, [canvas])


  let clickedMouse = false;

  useEffect(() => {
    if (renderer && imageInfo?.imagePlane) {
      renderer.add(imageInfo.imagePlane)

      const input = new InputEmitter(canvas!, imageInfo, renderer);

      const rectTool = new RectTool(input, renderer)
      rectTool.init()

      const camera = renderer.getCamera()
      const editHalfWidth = imageInfo?.area?.width / 2
      camera.left = 0
      camera.right = imageInfo?.area?.width
      camera.top = 0
      camera.bottom = -imageInfo?.area?.width

      camera.updateProjectionMatrix()
      renderer.render()
    }

  }, [renderer, imageInfo])



  // const objects: THREE.Object3D<THREE.Event>[] | (THREE.LineLoop<THREE.BufferGeometry, THREE.MeshBasicMaterial> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>)[] = []
  // line
  // const raycaster = new THREE.Raycaster()


  // function onMouseMove(event: MouseEvent) {
  //   //event.preventDefault();
  //   const mouse: { x: number; y: number } = { x: 0, y: 0 };
  //   mouse.x = (event.offsetX / width) * 2 - 1;
  //   mouse.y = - (event.offsetY / height) * 2 + 1;

  //   const stdVector = new THREE.Vector3(mouse.x, mouse.y, 0);
  //   const wo = stdVector.unproject(renderer!.getCamera())
  //   console.log(wo)

  //   raycaster.setFromCamera(mouse, renderer.getCamera());

  //   const intersections = raycaster.intersectObjects(objects, true);

  //   if (intersections.length > 0) {
  //   }

  //   console.log("clickedMouse", clickedMouse)
  //   if (clickedMouse) {
  //     event.preventDefault();
  //     const camera = renderer!.getCamera()

  //     camera.left = camera.left - event.movementX;
  //     camera.right = camera.right - event.movementX
  //     camera.top = camera.top + event.movementY
  //     camera.bottom = camera.bottom + event.movementY

  //     camera.updateProjectionMatrix();
  //     renderer!.render()
  //   }
  // }


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
export default ThreeDeeRender
