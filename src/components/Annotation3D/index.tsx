import { VideoCameraAddOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import MultiProvider from '../MultiProvider';
import { Control } from './Control';
import { ClipContextProvider } from './providers/ClipContextProvider';
import Sidebar, { SidebarItem } from './Sidebar';
import { CameraSide } from './Sidebar/CameraSide';
import { Workspace } from './Workspace';

function Annotation3D(): JSX.Element {
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

  const InfoBar = <div></div>;

  const providers = [<ClipContextProvider key={`providers-1`} />];

  return (
    <MultiProvider providers={providers}>
      {/* <ClipContextProvider> */}
      <div style={{ display: 'flex' }}>
        <Sidebar items={sideBarList}></Sidebar>
        <div>
          <div style={{ display: 'flex' }}>
            <Workspace />
            {InfoBar}
          </div>
          <Control />
        </div>
      </div>
      {/* </ClipContextProvider> */}
    </MultiProvider>
  );
}
export default Annotation3D;
