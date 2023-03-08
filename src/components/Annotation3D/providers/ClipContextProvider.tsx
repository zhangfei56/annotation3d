import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { useAsync } from 'react-use';

import useShallowMemo from '../../../utils/useShallowMemo';
import ClipContext, { ClipContent } from '../context/ClipContext';
import { Clip, Frame } from '../types/Messages';
const mockData: Clip = {
  id: '1',
  frameSize: 2,
  frames: [
    {
      id: '1',
      index: 1,
      pcd: '/src/assets/frm.pcd',
      frontImage: '',
      leftImage: '',
      annotations: [
        {
          id: '1',
          shapeType: 'Cube',
          position: { x: 1, y: 1, z: 1 },
          length: 1,
          width: 2,
          height: 2,
          orientation: { x: 0, y: 0, z: 0, w: 1 },
        },
      ],
    },
    {
      id: '2',
      index: 2,
      pcd: '/src/assets/frm.pcd',
      frontImage: '',
      leftImage: '',
      annotations: [
        {
          id: '1',
          shapeType: 'Cube',
          position: { x: 2, y: 3, z: 3 },
          length: 1,
          width: 2,
          height: 2,
          orientation: { x: 0, y: 0, z: 0, w: 1 },
        },
      ],
    },
  ],
};
export function ClipContextProvider(props: PropsWithChildren<unknown>): JSX.Element {
  const [currentClip, setCurrentClip] = useState<Clip | undefined>();
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [currentFrame, setCurrentFrame] = useState<Frame | undefined>();

  useEffect(() => {
    if (!currentClip) {
      return undefined;
    }
    if (currentClip.frames[currentFrameIndex] !== undefined) {
      const temp = currentClip.frames[currentFrameIndex];
      setCurrentFrame(temp);
    }
  }, [currentClip, currentFrameIndex]);

  useAsync(async () => {
    // get clip from remote
    setCurrentClip(mockData);
  }, []);

  setTimeout(() => {
    setCurrentClip(mockData);
  }, 10000);

  const loadNext = useCallback(() => {
    return;
  }, []);
  const nextFrame = useCallback(() => {
    const nextFrameIndex = currentFrameIndex + 1;
    if (nextFrameIndex > (currentClip?.frames.length ?? 0)) {
      return;
    }
    setCurrentFrameIndex(nextFrameIndex);
    return undefined;
  }, []);
  const preFrame = useCallback(() => {
    return undefined;
  }, []);

  const value = {
    currentFrame,
    currentClip,
    loadNext,
    nextFrame,
    preFrame,
  };

  return <ClipContext.Provider value={value}>{props.children}</ClipContext.Provider>;
}
