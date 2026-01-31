import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiPort = Number(process.env.API_PORT || 8000);

const resolveClientIp = (remoteAddress) => {
  if (!remoteAddress) {
    return '';
  }

  if (remoteAddress === '::1') {
    return '127.0.0.1';
  }

  if (remoteAddress.startsWith('::ffff:')) {
    return remoteAddress.substring(7);
  }

  return remoteAddress;
};

const getClientIpFromRequest = (req) => {
  const forwardedHeader = req.headers['x-forwarded-for'] || req.headers['x-client-ip'];
  if (typeof forwardedHeader === 'string' && forwardedHeader.trim()) {
    return forwardedHeader.split(',')[0].trim();
  }

  const remoteAddress = req.socket?.remoteAddress || req.connection?.remoteAddress;
  return resolveClientIp(remoteAddress);
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5172, // Use port 5172
    host: '0.0.0.0',
    strictPort: true, // Don't try other ports if 5172 is occupied
    proxy: {
      // Proxy API requests to the json-server to avoid CORS issues
      '/api': {
        target: `http://127.0.0.1:${apiPort}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const clientIp = getClientIpFromRequest(req);
            if (clientIp) {
              proxyReq.setHeader('X-Forwarded-For', clientIp);
              proxyReq.setHeader('X-Client-IP', clientIp);
            }
          });
        },
      },
    },
    hmr: {
      overlay: false,
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const clientIp = getClientIpFromRequest(req);

        if (clientIp) {
          req.headers['x-client-ip'] = clientIp;
          res.setHeader('X-Client-IP', clientIp);
        }

        next();
      });
    },
  },
  cacheDir: './.vite',
});
