import { PieChartOutlined } from '@ant-design/icons';
import LayoutWrapper from '../layouts';
import Welcome from '@/pages/Welcome';

export const layoutRoutes = [
  {
    path: '/',
    name: 'welcome',
    icon: <PieChartOutlined />,
    children: [
      {
        path: '/welcome',
        name: 'one',
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
    path: '/demo',
    name: 'demo',
    icon: <PieChartOutlined />,
  },
];
export const routes = [
  {
    path: '/user',
    name: 'user',
    layout: false,
    children: [
      {
        name: 'login',
        path: 'login',
        element: './user/Login',
      },
    ],
  },
  {
    path: '/',
    name: 'sd',
    // layout: "",
    element: <LayoutWrapper />,
    children: layoutRoutes,
  },
];
