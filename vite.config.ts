import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/do512': {
        target: 'https://do512.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/do512/, ''),
      },
    },
  },
})
