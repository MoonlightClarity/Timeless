import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const metadataProxy = {
  '/metadata-translate': {
    target: 'http://127.0.0.1:1969',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/metadata-translate/, ''),
  },
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    proxy: metadataProxy,
  },
  preview: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    proxy: metadataProxy,
  },
})
