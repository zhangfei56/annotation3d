import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';
import OptimizationPersist from 'vite-plugin-optimize-persist';
import PkgConfig from 'vite-plugin-package-config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), PkgConfig(), OptimizationPersist()],
  assetsInclude: ['**/*.pcd'],
  resolve: {
    alias: [
      {
        find: /^~/,
        replacement: '',
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: '@root-entry-name: default;',
      },
    },
  },
});
