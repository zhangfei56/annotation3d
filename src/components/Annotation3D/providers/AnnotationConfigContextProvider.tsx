import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';

import useShallowMemo from '../../../utils/useShallowMemo';
import AnnotationConfigContext, {
  AnnotationConfig,
  DefaultConfig,
} from '../context/AnnotationConfigContext';

export function AnnotationConfigContextProvider(
  props: PropsWithChildren<unknown>,
): JSX.Element {
  const [config, setConfig] = useState<AnnotationConfig>(DefaultConfig);

  const value = {
    config,
    setConfig,
  };

  return (
    <AnnotationConfigContext.Provider value={value}>
      {props.children}
    </AnnotationConfigContext.Provider>
  );
}
