import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api -> FastAPI backend on :8000, stripping the /api prefix.
// This avoids CORS entirely (backend is not modified).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
