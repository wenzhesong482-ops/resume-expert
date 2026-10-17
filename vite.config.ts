import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 前端通过 /api/* 访问后端，Vite 开发服务器将 /api 代理到 Express 后端（默认 3001 端口）。
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        timeout: 200000,
        proxyTimeout: 200000
      }
    }
  }
})
