import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      stream: 'stream-browserify',
      buffer: 'buffer',
      util: 'util',
    }
  },
  define: {
    global: 'window',
    process: {
      env: {},
    },
  },
  optimizeDeps: {
    include: ['process', 'buffer']
  },
  server: {
    port: 5173,
    open: true,
    historyApiFallback: true
  }
})
