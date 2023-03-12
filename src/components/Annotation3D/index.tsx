import { VideoCameraAddOutlined, TagsOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import MultiProvider from '../MultiProvider';
import { Control } from './Control';
import { AnnotationConfigContextProvider } from './providers/AnnotationConfigContextProvider';
import { ClipContextProvider } from './providers/ClipContextProvider';
import Sidebar, { SidebarItem } from './Sidebar';
import { CameraSetting } from './Sidebar/CameraSetting';
import { Workspace } from './Workspace';

type Props = {
  initialState?: unknown;
  saveState?: () => void;
};

function Annotation3D(props: Props): JSX.Element {
  const { initialState, saveState } = props;

  const CameraSidebarItem = useMemo(() => {
    return function CameraSidebarItemImpl() {
      return <CameraSetting />;
    };
  }, []);

  const TagSidebarItem = useMemo(() => {
    return function TagSidebarItemImpl() {
      return <span>Tags waiting for implementation</span>;
    };
  }, []);
  const sideBarList: SidebarItem[] = [
    {
      title: 'Camera',
      icon: VideoCameraAddOutlined,
      component: CameraSidebarItem,
    },
    {
      title: 'Tags',
      icon: TagsOutlined,
      component: TagSidebarItem,
    },
  ];

  const InfoBar = <div></div>;

  const providers = [
    <ClipContextProvider key={`providers-1`} />,
    <AnnotationConfigContextProvider key="providers-2" />,
  ];

  return (
    <MultiProvider providers={providers}>
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
    </MultiProvider>
  );
}
export default Annotation3D;
