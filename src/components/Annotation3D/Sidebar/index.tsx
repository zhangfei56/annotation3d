
import styles from './style.module.css'
import "./react-resizable.css";
import { Resizable, ResizableBox, ResizeCallbackData } from 'react-resizable';
import { useState } from 'react';
import React from 'react';
import Icon, { HomeOutlined } from '@ant-design/icons';
import { Tooltip, Button } from 'antd';

export type SidebarItem = {
  icon: typeof Icon;
  title: string;
  component: React.FunctionComponent;
  url?: string;
};


type Props = {
  items: SidebarItem[];
}

export default function Sidebar(props: Props) {
  const { items } = props;
  const [width, setWidth] = useState(100)
  const [SideContent, setSideContent] = useState<React.FunctionComponent>()

  const onResize = (event: React.SyntheticEvent, data: ResizeCallbackData) => {
    console.log(data.size.width)
    setWidth(data.size.width)
  }

  const itemRender = () => {
    return items.map(item => {
      return <Tooltip title={item.title}>
        <Button type='link' onClick={() => {
          setSideContent(item.component)
        }} icon={
          <Icon component={item.icon as React.ForwardRefExoticComponent<any>} />
        } />
      </Tooltip>
    })
  }

  return <div className={styles.mainBody} >
    <div className={styles.iconCol}>
      {itemRender()}
    </div>

    {SideContent && <Resizable axis='x' width={width} onResize={onResize} >
      <div className="box" style={{ width: width + 'px' }}>
        {SideContent}
      </div>
    </Resizable>}


  </div>
}
