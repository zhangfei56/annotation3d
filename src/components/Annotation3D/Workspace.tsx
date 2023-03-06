import { VideoCameraAddOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import EventEmitter from 'eventemitter3';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMountedState } from 'react-use';
import * as THREE from 'three';
import { CameraHelper, Vector2 } from 'three';

import imageUrl from '../../assets/11.png';
import MultiProvider from '../MultiProvider';
import ClipContext, { useCurrentClip } from './context/ClipContext';
import { InputEmitter, MouseAndKeyEvent } from './Input';
import { loadPcd } from './loadPcd';
import { ClipContextProvider } from './providers/ClipContextProvider';
import Renderer from './Renderer';
import SceneManager from './SceneManager';
import Sidebar, { SidebarItem } from './Sidebar';
import { CameraSide } from './Sidebar/CameraSide';
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
    return new TransferSpace(sceneManager);
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

      new ToolsManager(inputEmitter, renderderTemp, sceneManager, eventBus);

      loadPcd(renderderTemp, sceneManager);
      renderderTemp.render();
    }
  }, [canvas]);

  useEffect(() => {
    if (currentFrame) {
      transferSpace.updateFrame(currentFrame);
    }
  }, [currentFrame, currentClip]);

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Row>
          <Col>
            <canvas
              ref={setCanvas}
              width={window.innerWidth / 2}
              height={window.innerHeight / 2}
            ></canvas>
          </Col>
          <Col id="three-view-id"></Col>
        </Row>

        <div className="control"></div>
      </div>
    </div>
  );
}
