import React, { useEffect } from 'react';
import { PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';
import { Resizable, ResizableBox, ResizeCallbackData } from 'react-resizable';
import { useResizeDetector } from 'react-resize-detector';

import { useAnnotationConfig } from '../context/AnnotationConfigContext';
import { useCurrentClip } from '../context/ClipContext';
import './react-resizable.css';

import { AutoCanvas } from './AutoCanvas';

function CameraFixedComponent(): JSX.Element {
  const {
    width,
    height,
    ref: rootRef,
  } = useResizeDetector({
    refreshRate: 0,
    refreshMode: 'debounce',
  });
  const { currentFrame } = useCurrentClip();
  const {
    config: { cameraConfig },
  } = useAnnotationConfig();
  const cameraList = cameraConfig.cameraList;

  const fixedImage = useMemo(() => {
    if (currentFrame) {
      const configFixed = cameraList.find((item) => item.isFixed);
      if (configFixed) {
        return {
          showName: configFixed.showName,
          url: currentFrame[configFixed.name],
        };
      }
    }
    return undefined;
  }, [currentFrame, cameraList]);

  return (
    <>
      {fixedImage && (
        <div style={{ width: '300px', position: 'fixed' }} ref={rootRef}>
          <AutoCanvas
            key={`auto-canvas-${fixedImage.showName}`}
            width={width ?? 100}
            url={fixedImage.url}
            showName={fixedImage.showName}
          ></AutoCanvas>
        </div>
      )}
    </>
  );
}

function CameraListComponent(): JSX.Element {
  // const {
  //   width,
  //   height,
  //   ref: rootRef,
  // } = useResizeDetector({
  //   refreshRate: 0,
  //   refreshMode: 'debounce',
  // });
  const [width, setWidth] = useState<number>(300);
  const { currentFrame } = useCurrentClip();
  const {
    config: { cameraConfig },
  } = useAnnotationConfig();
  const cameraList = cameraConfig.cameraList;

  const needShowImages = useMemo(() => {
    const showImages: { showName: string; url: string }[] = [];
    if (currentFrame) {
      cameraList.forEach((cameraConfigItem) => {
        if (!cameraConfigItem.isHidden) {
          showImages.push({
            showName: cameraConfigItem.showName,
            url: currentFrame[cameraConfigItem.name],
          });
        }
      });
    }
    return showImages;
  }, [currentFrame, cameraList]);

  const autos = needShowImages.map((item) => (
    <AutoCanvas
      key={`auto-canvas-${item.showName}`}
      width={width ?? 100}
      url={item.url}
      showName={item.showName}
    ></AutoCanvas>
  ));

  const onResize = (event: React.SyntheticEvent, data: ResizeCallbackData) => {
    setWidth(data.size.width);
  };

  return (
    <Resizable axis="x" width={width} onResize={onResize}>
      <div className="box" style={{ display: 'flex', flexDirection: 'column' }}>
        {autos}
      </div>
    </Resizable>
  );
}

export function CameraViews(): JSX.Element {
  const {
    config: { cameraConfig },
  } = useAnnotationConfig();
  const cameraMode = cameraConfig.mode;
  if (cameraMode === 'hidden') {
    return <></>;
  } else if (cameraMode === 'one-fixed') {
    return <CameraFixedComponent />;
  } else {
    return <CameraListComponent />;
  }
}
