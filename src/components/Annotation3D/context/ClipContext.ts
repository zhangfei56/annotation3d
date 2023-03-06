import { createContext, useContext } from 'react';

import type { Clip, Frame } from '../types/Messages';

export interface ClipContent {
  currentClip: Clip | undefined;
  loadNext: () => void;
  currentFrame: Frame | undefined;
  nextFrame: () => Frame | undefined;
  preFrame: () => Frame | undefined;
}

const ClipContext = createContext<ClipContent>({
  currentClip: undefined,
  loadNext: () => {},
  currentFrame: undefined,
  nextFrame: () => {
    return undefined;
  },
  preFrame: () => {
    return undefined;
  },
});
ClipContext.displayName = 'ClipContext';

export function useCurrentClip(): ClipContent {
  return useContext(ClipContext);
}

export default ClipContext;
