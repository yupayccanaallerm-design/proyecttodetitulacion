// frontend/vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      // ✅ Redirige todas las peticiones /api al backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // ✅ También redirige otros endpoints del backend
      '/vision': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/chatbot': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/recomendar': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})