import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Ảnh tĩnh: fallback qua backend nếu Vite không tìm thấy file
      '/3ce': { target: 'http://localhost:3000', changeOrigin: true },
      '/romand': { target: 'http://localhost:3000', changeOrigin: true },
      '/intoyou': { target: 'http://localhost:3000', changeOrigin: true },
      '/merzy': { target: 'http://localhost:3000', changeOrigin: true },
      '/bbia': { target: 'http://localhost:3000', changeOrigin: true },
      '/product': { target: 'http://localhost:3000', changeOrigin: true },
      '/login': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
