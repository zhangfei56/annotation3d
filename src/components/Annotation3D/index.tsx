import { VideoCameraAddOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import EventEmitter from 'eventemitter3';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMountedState } from 'react-use';
import * as THREE from 'three';
import { CameraHelper, Vector2 } from 'three';

import imageUrl from '../../assets/11.png';
import MultiProvider from '../MultiProvider';
import ClipContext from './context/ClipContext';
import { InputEmitter, MouseAndKeyEvent } from './Input';
import { loadPcd } from './loadPcd';
import { ClipContextProvider } from './providers/ClipContextProvider';
import Renderer from './Renderer';
import SceneManager from './SceneManager';
import Sidebar, { SidebarItem } from './Sidebar';
import { CameraSide } from './Sidebar/CameraSide';
import { VertexNormalsHelper } from './ThreeDee/VertexNormalsHelper';
import { CreateBoxTool } from './tools/CreateBoxTool';
import { ToolsManager } from './toolsManager';
import { ObjectBusEvent } from './types/Messages';

function Annotation3D(): JSX.Element {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const sceneManager = useMemo(() => {
    return new SceneManager();
  }, []);
  const eventBus = useMemo(() => new EventEmitter<ObjectBusEvent>(), []);

  const renderer = useMemo(() => {
    if (canvas) {
      return new Renderer(canvas, sceneManager.scene, eventBus);
    }
    return null;
  }, [canvas]);

  let input;

  let isInitEdit = false;

  useEffect(() => {
    if (!isInitEdit && renderer && canvas) {
      input = new InputEmitter(canvas!, renderer.getCamera(), sceneManager, eventBus);

      new ToolsManager(input, renderer, sceneManager, eventBus);
      loadPcd(renderer, sceneManager);
      //
      renderer.render();

      isInitEdit = true;
    }
  }, [isInitEdit, renderer, canvas]);

  const CameraSidebarItem = useMemo(() => {
    return function CameraSidebarItemImpl() {
      return <CameraSide />;
    };
  }, []);

  const sideBarList: SidebarItem[] = [
    {
      title: 'Camera',
      icon: VideoCameraAddOutlined,
      component: CameraSidebarItem,
    },
  ];

  const editToolBound = {
    height: 100,
    width: 100,
  };

  const Workspace = (
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
          <Col id="three-view-id">
            {/* <Row>
              <canvas
                ref={setLeftEditCanvas}
                width={editToolBound.width}
                height={editToolBound.height}
              ></canvas>
            </Row>
            <Row>
              <canvas
                ref={setUpEditCanvas}
                width={editToolBound.width}
                height={editToolBound.height}
              ></canvas>
            </Row>
            <Row>
              <canvas
                ref={setFrontEditCanvas}
                width={editToolBound.width}
                height={editToolBound.height}
              ></canvas>
            </Row> */}
          </Col>
        </Row>

        <div className="control"></div>
      </div>
    </div>
  );

  const InfoBar = <div></div>;

  return (
    <MultiProvider providers={[<ClipContextProvider />]}>
      <div style={{ display: 'flex' }}>
        <Sidebar items={sideBarList}></Sidebar>
        {Workspace}
        {InfoBar}
      </div>
    </MultiProvider>
  );
}
export default Annotation3D;
