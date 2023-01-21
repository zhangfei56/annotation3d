import * as THREE from 'three';
import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Vector2 } from 'three';
type Props = {
  width: number;
  height: number;
}
import ThreeDeeRender from '../ThreeDeeRender'

function ImageAnnotation(props: Props): JSX.Element {
  const { width, height } = props



  return <>
    <p>header</p>
    <ThreeDeeRender height={height} width={width} />
  </>
}
export default ImageAnnotation
