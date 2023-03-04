import { createContext, useContext } from 'react';

import type { Clip, Frame } from '../types/Messages';

export interface CurrentProject {
  currentClip: Clip | undefined;
  loadNext: () => void;
  currentFrame: Frame | undefined;
  nextFrame: () => Frame | undefined;
  preFrame: () => Frame | undefined;
}

const ProjectContext = createContext<CurrentProject>({
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
ProjectContext.displayName = 'ClipContext';

export function useProject(): CurrentClip {
  return useContext(ProjectContext);
}

export default ProjectContext;
