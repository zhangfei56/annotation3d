import './index.css';

import { ConfigProvider } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App';
import QueryClientProvider from './queries';
import { routes } from './routes';

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div style={{ height: '100vh' }}>
      <QueryClientProvider>
        <RouterProvider router={router}>
          <HashRouter>
            <ConfigProvider>
              <App />
            </ConfigProvider>
          </HashRouter>
        </RouterProvider>
      </QueryClientProvider>
    </div>
  </React.StrictMode>,
);
