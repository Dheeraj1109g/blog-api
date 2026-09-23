import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-only proxy: /api/* -> VITE_PROXY_TARGET (default http://localhost:8000),
// stripping the /api prefix. This avoids CORS entirely (backend is not modified).
// If you set VITE_API_URL to a deployed URL in .env.local, requests go there
// directly and your browser may block them unless the backend sends CORS headers.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_PROXY_TARGET || 'http://localhost:8000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: target.startsWith('https'),
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
