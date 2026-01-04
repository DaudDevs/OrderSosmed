import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Setiap request yang depannya '/api-proxy' akan dibelokkan ke ordersosmed.id
      '/api-proxy': {
        target: 'https://ordersosmed.id',
        changeOrigin: true,
        secure: false, // Abaikan masalah SSL
        rewrite: (path) => path.replace(/^\/api-proxy/, '')
      },
    },
  },
})