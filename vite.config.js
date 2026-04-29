import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    allowedHosts: ['yin-camisole-fleshy.ngrok-free.dev'],
    watch: {
      // Do NOT watch the emsdk directory
      ignored: ['**/emsdk/**'],
    },
  },
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    exclude: ['ascii_engine'],
    entries: ['src/main.jsx'], // Only scan src, not emsdk
  },
});
