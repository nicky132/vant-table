import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const demoHtmlPath = resolve(__dirname, 'demo/index.html')

export default defineConfig({
  plugins: [vue()],
  base: './', // 使用相对路径以支持 GitHub Pages
  build: {
    outDir: './docs', // 输出到 docs 目录，GitHub Pages 会自动部署
    emptyOutDir: false, // 不清空目录，避免删除其他文件
    rollupOptions: {
      input: {
        main: demoHtmlPath
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3001,
    open: true
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      }
    }
  }
})