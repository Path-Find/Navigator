import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  build: {
    rollupOptions: {
      output: {
        // Remove rigid manual chunks to allow better automatic splitting and tree-shaking
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
  }
})
