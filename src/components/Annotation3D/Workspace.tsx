import { VideoCameraAddOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import EventEmitter from 'eventemitter3';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMountedState } from 'react-use';
import * as THREE from 'three';
import { CameraHelper, Vector2 } from 'three';

import MultiProvider from '../MultiProvider';
import ClipContext, { useCurrentClip } from './context/ClipContext';
import { InputEmitter, MouseAndKeyEvent } from './Input';
import { ClipContextProvider } from './providers/ClipContextProvider';
import Renderer from './Renderer';
import SceneManager from './SceneManager';
import Sidebar, { SidebarItem } from './Sidebar';
import { CameraViews } from './camera/CameraViews';
import { ToolsManager } from './toolsManager';
import { TransferSpace } from './TransferSpace';
import { ObjectBusEvent } from './types/Messages';

export function Workspace() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const sceneManager = useMemo(() => new SceneManager(), []);
  const eventBus = useMemo(() => new EventEmitter<ObjectBusEvent>(), []);
  const [input, setInput] = useState<InputEmitter | undefined>();
  const [renderer, setRenderder] = useState<Renderer | undefined>();
  const { currentClip, currentFrame } = useCurrentClip();
  const transferSpace = useMemo(() => {
    return new TransferSpace(sceneManager, eventBus);
  }, [sceneManager]);

  useEffect(() => {
    if (canvas) {
      const renderderTemp = new Renderer(canvas, sceneManager.scene, eventBus);
      setRenderder(renderderTemp);

      const inputEmitter = new InputEmitter(
        canvas,
        renderderTemp.getCamera(),
        sceneManager,
        eventBus,
      );
      setInput(inputEmitter);

      new ToolsManager(
        inputEmitter,
        renderderTemp,
        sceneManager,
        eventBus,
        transferSpace,
      );

      renderderTemp.render();
    }
  }, [canvas]);

  useEffect(() => {
    if (currentFrame) {
      transferSpace.updateFrame(currentFrame);
    }
  }, [currentFrame, currentClip]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <CameraViews />
        <canvas
          ref={setCanvas}
          width={window.innerWidth / 2}
          height={window.innerHeight / 2}
        ></canvas>
        <div id="three-view-id"></div>
      </div>

      <div className="control"></div>
    </div>
  );
}
