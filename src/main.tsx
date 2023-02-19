import './index.css';

import { ConfigProvider } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, HashRouter, RouterProvider } from 'react-router-dom';

// import App from './App';
import { routes } from './routes';

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div style={{ height: '100vh' }}>
      <RouterProvider router={router}>
        {/* <HashRouter> */}
        {/* <ConfigProvider></ConfigProvider> */}
        {/* </HashRouter> */}
      </RouterProvider>
    </div>
  </React.StrictMode>,
);
