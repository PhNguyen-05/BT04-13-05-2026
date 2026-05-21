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
      // Chỉ proxy thư mục ảnh thương hiệu — KHÔNG proxy /login hay /product
      // (trùng route React: /login, /product/:id → sẽ không vào được trang)
      '/3ce': { target: 'http://localhost:3000', changeOrigin: true },
      '/romand': { target: 'http://localhost:3000', changeOrigin: true },
      '/intoyou': { target: 'http://localhost:3000', changeOrigin: true },
      '/merzy': { target: 'http://localhost:3000', changeOrigin: true },
      '/bbia': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
