import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { useAsync } from 'react-use';

import useShallowMemo from '../../../utils/useShallowMemo';
import ClipContext, { CurrentClip } from '../context/ClipContext';
import { Clip } from '../types/Messages';

export function ClipContextProvider(props: PropsWithChildren<unknown>): JSX.Element {
  const [currentClip, setCurrentClip] = useState<Clip | undefined>();
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  const currentFrame = useMemo(() => {
    if (!currentClip) {
      return undefined;
    }
    if (currentClip.frames[currentFrameIndex] !== undefined) {
      return currentClip.frames[currentFrameIndex];
    }
    return undefined;
  }, [currentClip, currentFrameIndex]);

  useAsync(async () => {
    // get clip from remote
    const mockData: Clip = {
      id: '1',
      frameSize: 1,
      frames: [
        {
          id: '1',
          index: 1,
          pcd: '',
          frontImage: '',
          leftImage: '',
          annotations: [],
        },
      ],
    };
    setCurrentClip(mockData);
  }, []);

  const loadNext = useCallback(() => {}, []);
  const nextFrame = useCallback(() => {
    return undefined;
  }, []);
  const preFrame = useCallback(() => {
    return undefined;
  }, []);

  const value = useShallowMemo({
    currentFrame,
    currentClip,
    loadNext,
    nextFrame,
    preFrame,
  });

  return <ClipContext.Provider value={value}>{props.children}</ClipContext.Provider>;
}
