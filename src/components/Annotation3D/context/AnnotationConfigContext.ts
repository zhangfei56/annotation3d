import { createContext, useContext } from 'react';

import _ from 'lodash';

const CameraDefinitionConfig = [
  {
    name: 'frontImage',
    showName: 'Front',
  },
  {
    name: 'leftImage',
    showName: 'Left',
  },
];

type CameraShowMode = 'hidden' | 'list' | 'one-fixed';
export interface AnnotationConfig {
  cameraConfig: {
    mode: CameraShowMode;
    cameraList: {
      name: string;
      showName: string;
      isHidden?: boolean;
      isFixed?: boolean;
    }[];
  };
}

export interface AnnotationConfigContent {
  config: AnnotationConfig;
  setConfig: (config: AnnotationConfig) => void;
}
export const DefaultConfig: AnnotationConfig = {
  cameraConfig: {
    mode: 'list',
    cameraList: _.clone(CameraDefinitionConfig),
  },
};
const AnnotationConfigContext = createContext<AnnotationConfigContent>({
  config: DefaultConfig,
  setConfig: () => {
    return;
  },
});
AnnotationConfigContext.displayName = 'AnnotationConfigContext';

export function useAnnotationConfig(): AnnotationConfigContent {
  return useContext(AnnotationConfigContext);
}

export default AnnotationConfigContext;
