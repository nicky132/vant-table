import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const demoHtmlPath = resolve(__dirname, 'demo-final/index.html')

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
    alias: [
      { find: '@', replacement: resolve(__dirname, 'src') },
      { find: '@cc/vant-table/dist/index.css', replacement: resolve(__dirname, 'src/styles/VantTable.less') },
      { find: '@cc/vant-table', replacement: resolve(__dirname, 'src/index.ts') }
    ]
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