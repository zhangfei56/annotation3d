// import Layout from 'virtual:antd-layout'
import {
  CaretDownFilled,
  DoubleRightOutlined,
  GithubFilled,
  InfoCircleFilled,
  LogoutOutlined,
  PlusCircleFilled,
  QuestionCircleFilled,
  SearchOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { ProSettings } from '@ant-design/pro-components';
import ProLayout, { PageLoading, SettingDrawer } from '@ant-design/pro-layout';
import { Button, Divider, Dropdown, Input, Popover, theme } from 'antd';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { layoutRoutes, routes } from '@/routes';

import Footer from './components/Footer';
import RightContent from './components/RightContent';
// import { useLayout } from './hooks';
export * from './hooks';

export default function LayoutWrapper() {
  // const { data: currentUser, isLoading } = useUserInfoQuery();
  const [settings, setSetting] = useState<Partial<ProSettings> | undefined>({
    fixSiderbar: true,
    layout: 'mix',
    splitMenus: true,
  });

  const loginData = {
    status: 'ok',
  };
  const isLoading = false;

  // const [layout, updateLayout] = useLayout();
  const location = useLocation();
  const navigate = useNavigate();
  // const intl = useIntl();
  const [pathname, setPathname] = useState('/');

  // const proRoutes = useMemo(() => {
  //   return convertToProRoutes(layoutRoutes);
  // }, [routes]);

  return (
    <ProLayout
      menu={{ request: async () => layoutRoutes }}
      // rightContentRender={() => <RightContent />}
      // waterMarkProps={{
      //   content: 'zhangsan',
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
      footerRender={() => <Footer />}
      location={{
        pathname,
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
      // onPageChange={() => {
      //   // 如果没有登录，重定向到 login
      //   if (loginData?.status !== 'ok' && location.pathname !== '/user/login') {
      //     requestAnimationFrame(() => {
      //       navigate('/user/login');
      //     });
      //   }
      // }}
      // formatMessage={intl.formatMessage}
      menuItemRender={(item, dom) => (
        <div
          onClick={(e) => {
            console.log(e, item);
            setPathname(item.path || '/welcome');
            navigate(item.path);
          }}
        >
          {dom}
        </div>
      )}
      {...settings}
      // 自定义 403 页面
      // unAccessible: <div>unAccessible</div>,
      // 增加一个 loading 的状态
      // {...layout}
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
      <Outlet />
    </ProLayout>
  );
}
