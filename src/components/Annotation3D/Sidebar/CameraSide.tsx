import React, { useEffect } from "react";
import { PropsWithChildren, useState, useRef, useMemo, useCallback } from "react";
import { useResizeDetector } from "react-resize-detector";
import imageUrl from '../../../assets/11.png'

function AutoCanvas({ width, url }): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const image = useMemo(() => {
    const imageTag = new Image()
    imageTag.src = url
    imageTag.onload = (data) => {
      setNaturalSize({
        width: data.target?.naturalWidth ?? 100,
        height: data.target?.naturalHeight ?? 100
      });
    }
    return imageTag
  }, [])
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: width, height: 100 });


  useEffect(() => {
    if (canvasRef.current) {
      const canvasHeight = (naturalSize.height / naturalSize.width) * width
      canvasRef.current.width = width
      canvasRef.current.height = canvasHeight
      const context = canvasRef.current.getContext("2d")
      context?.drawImage(image, 0, 0, width, canvasHeight)
    }

  }, [naturalSize, width])


  return <canvas ref={canvasRef}></canvas>
}


export function CameraSide(): JSX.Element {
  const {
    width,
    height,
    ref: rootRef,
  } = useResizeDetector({
    refreshRate: 0,
    refreshMode: "debounce",
  });

  const autos = [imageUrl].map(item => <AutoCanvas width={width ?? 100} url={item}></AutoCanvas>)



  // TS requires our return type to be Element instead of Node
  return <div ref={rootRef} id="camera-side-body">
    {autos}
  </div>;
}
