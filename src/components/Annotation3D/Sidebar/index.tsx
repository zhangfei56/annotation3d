import Icon, { HomeOutlined } from '@ant-design/icons';
import { Button, Tabs, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import React from 'react';

export type SidebarItem = {
  icon: typeof Icon;
  title: string;
  component: React.FunctionComponent;
  url?: string;
};

type Props = {
  items: SidebarItem[];
};

export default function Sidebar(props: Props) {
  const { items } = props;

  const [activeKey, setActiveKey] = useState<string>();

  const sideTabs = useMemo(() => {
    const result = items.map((item) => {
      return {
        key: item.title,
        label: (
          <Tooltip title={item.title} key={`side-title${item.title}}`}>
            <Icon component={item.icon as React.ForwardRefExoticComponent<any>} />
          </Tooltip>
        ),
        children: item.component({}),
      };
    });
    result.push({
      key: 'hidden',
      label: <></>,
      children: <></>,
    });
    return result;
  }, []);

  return (
    <Tabs
      tabPosition={'left'}
      activeKey={activeKey}
      onTabClick={(key) => {
        const willActivityKey = activeKey === key ? 'hidden' : key;

        setActiveKey(willActivityKey);
      }}
      items={sideTabs}
    ></Tabs>
  );
}
