import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    entries: ['index.html'],
  },
  server: {
    host: true,
    proxy: {
      '/user': 'http://localhost:3000',
      '/project': 'http://localhost:3000',
      '/admin': 'http://localhost:3000',
      '/update': 'http://localhost:3000',
      '/design': 'http://localhost:3000',
      '/report': 'http://localhost:3000',
      '/chat': 'http://localhost:3000',
      '/task': 'http://localhost:3000',
      '/comment': 'http://localhost:3000',
      '/note': 'http://localhost:3000',
      '/template': 'http://localhost:3000',
      '/material': 'http://localhost:3000',
      '/worker': 'http://localhost:3000',
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
    watch: {
      ignored: ['**/ios/**', '**/android/**'],
    },
  },
})
