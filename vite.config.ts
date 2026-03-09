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
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-tooltip'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-utils': ['zod', 'react-helmet-async'],
          'vendor-charts': ['recharts'],
          'vendor-stripe': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
  }
})
