import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  root: resolve(__dirname, 'dev'),
  server: {
    host: '0.0.0.0', // 监听所有网络接口
    port: 3001,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@vant-table': resolve(__dirname, 'src') // 使用源码
    }
  }
})