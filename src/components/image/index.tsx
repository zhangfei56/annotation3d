import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Vector2 } from 'three';
type Props = {
  width: number;
  height: number;
};
import Annotation2D from '../Annotation2D';

function ImageAnnotation(props: Props): JSX.Element {
  const { width, height } = props;

  return (
    <>
      <p>header</p>
      <Annotation2D height={height} width={width} />
    </>
  );
}
export default ImageAnnotation;
