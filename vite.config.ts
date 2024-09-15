import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // 自动打开浏览器
    // cors: true, // 允许跨域
    proxy: {
      '/api': {
        target: 'http://localhost:7001',
        changeOrigin: true,
        configure: (proxy, options) => {
          console.log('proxy', proxy, options)
          // 例如，设置自定义的请求头
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Custom-Header', 'value');
          });
        }
      }
    }
  },
})
