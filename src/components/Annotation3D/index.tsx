import { VideoCameraAddOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMountedState } from 'react-use';
import * as THREE from 'three';
import { CameraHelper, Vector2 } from 'three';

import imageUrl from '../../assets/11.png';
import MultiProvider from '../MultiProvider';
import ClipContext from './context/ClipContext';
import { EventType, InputEmitter } from './Input';
import { loadPcd } from './loadPcd';
import { ClipContextProvider } from './providers/ClipContextProvider';
import Renderer from './Renderer';
import SceneManager from './SceneManager';
import Box3D from './Shapes/Box3D';
import Sidebar, { SidebarItem } from './Sidebar';
import { CameraSide } from './Sidebar/CameraSide';
import { VertexNormalsHelper } from './ThreeDee/VertexNormalsHelper';
import { CreateBoxTool } from './tools/CreateBoxTool';
import { BoxFaceEnum, EditBoxFace } from './tools/EditBoxFace';
import { ToolsManager } from './toolsManager';

function Annotation3D(): JSX.Element {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [leftEditCanvas, setLeftEditCanvas] = useState<HTMLCanvasElement | null>(null);
  const [upEditCanvas, setUpEditCanvas] = useState<HTMLCanvasElement | null>(null);
  const [frontEditCanvas, setFrontEditCanvas] = useState<HTMLCanvasElement | null>(null);
  const sceneManager = useMemo(() => {
    return new SceneManager();
  }, []);

  const renderer = useMemo(() => {
    if (canvas) {
      return new Renderer(canvas, sceneManager.scene);
    }
    return null;
  }, [canvas]);

  let input;
  let editTools: EditBoxFace[] = [];

  const onBoxClick = (box) => {
    editTools.forEach((tool) => {
      tool.setBox(box);
      tool.render();
    });
  };
  let isInitEdit = false;

  useEffect(() => {
    if (
      !isInitEdit &&
      renderer &&
      canvas &&
      leftEditCanvas &&
      upEditCanvas &&
      frontEditCanvas
    ) {
      input = new InputEmitter(canvas!, renderer);
      new ToolsManager(input, renderer, sceneManager);
      loadPcd(renderer, sceneManager);

      renderer.render();

      editTools = [
        new EditBoxFace(leftEditCanvas!, renderer, 1, BoxFaceEnum.Left, sceneManager),
        new EditBoxFace(upEditCanvas!, renderer, 1, BoxFaceEnum.Up, sceneManager),
        new EditBoxFace(frontEditCanvas!, renderer, 1, BoxFaceEnum.Front, sceneManager),
      ];
      input.on(EventType.ObjectChooseEvent, onBoxClick);

      isInitEdit = true;
    }
  }, [isInitEdit, renderer, canvas, leftEditCanvas, upEditCanvas, frontEditCanvas]);

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
          <Col>
            <Row>
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
            </Row>
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
