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
  build: {
    outDir: 'dist', // Assurez-vous que la sortie est dans le dossier 'dist'
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
    host:'0.0.0.0',
    port: 5173,
    strictPort: true, 
    cors: true ,
    open: true,
    historyApiFallback: true
  }
})
