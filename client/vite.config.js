import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { config } from '../server/config.js';

const apiHost = ['0.0.0.0', '::'].includes(config.host) ? '127.0.0.1' : config.host;

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: config.webPort,
    strictPort: true,
    // changeOrigin false: Host asli (localhost:WEB_PORT) diteruskan ke Express sehingga
    // pemeriksaan Origin kelak melihat request dev sebagai same-origin.
    proxy: {
      '/api': { target: `http://${apiHost}:${config.port}`, changeOrigin: false },
    },
  },
  build: { outDir: 'dist', emptyOutDir: true },
});
