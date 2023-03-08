import { PieChartOutlined } from '@ant-design/icons';

import Marker3D from '@/pages/Marker3D';
import Login from '@/pages/user/Login';
import Welcome from '@/pages/Welcome';

import LayoutWrapper from '../layouts';

export const layoutRoutes = [
  {
    path: '/',
    name: '标注',
    icon: <PieChartOutlined />,
    children: [
      {
        path: '/welcome',
        name: 'test',
        icon: <PieChartOutlined />,
        element: <Welcome />,
        children: [
          {
            path: '/welcome/welcome',
            name: 'two',
            icon: <PieChartOutlined />,
            exact: true,
          },
        ],
      },
    ],
  },
  {
    path: '/annotation/3d',
    name: '3D标注',
    icon: <PieChartOutlined />,
    element: <Marker3D />,
  },
];
export const routes = [
  {
    path: '/user',
    name: 'user',
    layout: false,
    // children: [
    //   {
    //     name: 'login',
    //     path: 'login',
    //     element: <Login />,
    //   },
    // ],
  },
  {
    path: '/',
    name: 'sd',
    // layout: "",
    element: <LayoutWrapper />,
    children: layoutRoutes,
  },
];
