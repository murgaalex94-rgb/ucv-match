import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('stream-chat')) {
              return 'stream-chat'
            }
            if (id.includes('supabase')) {
              return 'supabase'
            }
            if (id.includes('rsuite') || id.includes('framer-motion')) {
              return 'ui-library'
            }
            if (id.includes('date-fns') || id.includes('axios')) {
              return 'utils'
            }
            return 'vendor'
          }
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
