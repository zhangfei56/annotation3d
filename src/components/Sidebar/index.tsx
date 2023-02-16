
import styles from './style.module.css'
import "./react-resizable.css";
import { Resizable, ResizableBox, ResizeCallbackData } from 'react-resizable';
import { useState } from 'react';
import React from 'react';

export type SidebarItem = {
  iconName: string;
  title: string;
  component?: React.ComponentType;
  url?: string;
};



export default function Sidebar() {
  const [width, setWidth] = useState(100)

  const onResize = (event: React.SyntheticEvent, data: ResizeCallbackData) => {
    console.log(data.size.width)
    setWidth(data.size.width)
  }

  return <div className={styles.mainBody} >
    <div className={styles.iconCol}>
      "icon"
    </div>

    <Resizable axis='x' width={width} onResize={onResize} >
      <div className="box" style={{ width: width + 'px', height: 80 + 'px' }}>
        <span>Contents</span>
      </div>
    </Resizable>

  </div>
}
