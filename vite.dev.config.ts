import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  root: resolve(__dirname, 'example'),
  server: {
    host: '0.0.0.0', // 监听所有网络接口
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@cc/vant-table/dist/index.css': resolve(__dirname, 'dist/index.css'), // 使用构建的CSS
      '@cc/vant-table': resolve(__dirname, 'src/index.ts') // 直接使用源码
    }
  }
})