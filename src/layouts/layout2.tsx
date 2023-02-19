import {
  CaretDownFilled,
  DoubleRightOutlined,
  GithubFilled,
  InfoCircleFilled,
  LogoutOutlined,
  PlusCircleFilled,
  QuestionCircleFilled,
  SearchOutlined,
} from '@ant-design/icons';
import type { ProSettings } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProConfigProvider,
  ProLayout,
  SettingDrawer,
} from '@ant-design/pro-components';
import { css } from '@emotion/css';
import { Button, Divider, Dropdown, Input, Popover, theme } from 'antd';
import React, { useState } from 'react';

import defaultProps from './_defaultProps';

export default function layout2() {
  const [settings, setSetting] = useState<Partial<ProSettings> | undefined>({
    fixSiderbar: true,
    layout: 'mix',
    splitMenus: true,
  });

  const [pathname, setPathname] = useState('/list/sub-page/sub-sub-page1');
  const [num, setNum] = useState(40);
  return (
    <div
      id="test-pro-layout"
      style={{
        height: '100vh',
      }}
    >
      <ProConfigProvider hashed={false}>
        <ProLayout
          prefixCls="my-prefix"
          bgLayoutImgList={[
            {
              src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
              left: 85,
              bottom: 100,
              height: '303px',
            },
            {
              src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
              bottom: -68,
              right: -45,
              height: '303px',
            },
            {
              src: 'https://img.alicdn.com/imgextra/i3/O1CN018NxReL1shX85Yz6Cx_!!6000000005798-2-tps-884-496.png',
              bottom: 0,
              left: 0,
              width: '331px',
            },
          ]}
          {...defaultProps}
          location={{
            pathname,
          }}
          siderMenuType="group"
          menu={{
            collapsedShowGroupTitle: true,
          }}
          avatarProps={{
            src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
            size: 'small',
            title: '七妮妮',
            render: (props, dom) => {
              return (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'logout',
                        icon: <LogoutOutlined />,
                        label: '退出登录',
                      },
                    ],
                  }}
                >
                  {dom}
                </Dropdown>
              );
            },
          }}
          actionsRender={(props) => {
            // if (props.isMobile) return [];
            return [
              // props.layout !== 'side' && document.body.clientWidth > 1400 ? (
              //   <SearchInput />
              // ) : undefined,
              // <InfoCircleFilled key="InfoCircleFilled" />,
              // <QuestionCircleFilled key="QuestionCircleFilled" />,
            ];
          }}
          // headerTitleRender={(logo, title, _) => {
          //   const defaultDom = (
          //     <a>
          //       {logo}
          //       {title}
          //     </a>
          //   );
          //   if (document.body.clientWidth < 1400) {
          //     return defaultDom;
          //   }
          //   if (_.isMobile) return defaultDom;
          //   return (
          //     <>
          //       {defaultDom}
          //       {/* <MenuCard /> */}
          //     </>
          //   );
          // }}
          menuFooterRender={(props) => {
            if (props?.collapsed) return undefined;
            return (
              <div
                style={{
                  textAlign: 'center',
                  paddingBlockStart: 12,
                }}
              >
                <div>© 2021 Made with love</div>
                <div>by Ant Design</div>
              </div>
            );
          }}
          onMenuHeaderClick={(e) => console.log(e)}
          itemClick={(e) => console.log(e)}
          menuItemRender={(item, dom) => (
            <div
              onClick={(e) => {
                console.log(e, item);
                setPathname(item.path || '/welcome');
              }}
            >
              {dom}
            </div>
          )}
          {...settings}
        >
          <SettingDrawer
            pathname={pathname}
            enableDarkTheme
            getContainer={() => document.getElementById('test-pro-layout')}
            settings={settings}
            onSettingChange={(changeSetting) => {
              setSetting(changeSetting);
            }}
            disableUrlParams={false}
          />
        </ProLayout>
      </ProConfigProvider>
    </div>
  );
}
