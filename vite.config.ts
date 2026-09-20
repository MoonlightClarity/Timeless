import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    proxy: {
      '/metadata-translate': {
        target: 'http://127.0.0.1:1969',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/metadata-translate/, ''),
      },
    },
  },
})
