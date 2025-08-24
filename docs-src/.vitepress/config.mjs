import { defineConfig } from 'vitepress'
import { copyFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  title: 'VantTable',
  description: '基于 Vant UI 的功能丰富的表格组件',
  base: '/vant-table/',
  cleanUrls: false,
  
  ignoreDeadLinks: [
    // 忽略演示页面链接，因为它会在构建后复制到正确位置
    /^\/vant-table\/demo/
  ],
  
  // 构建钩子：复制demo文件
  buildEnd(siteConfig) {
    try {
      const demoDir = resolve(siteConfig.outDir, 'demo')
      mkdirSync(demoDir, { recursive: true })
      
      // 复制demo文件到输出目录
      copyFileSync(
        resolve(__dirname, '../../demo/index.html'),
        resolve(demoDir, 'index.html')
      )
    } catch (error) {
      console.warn('Failed to copy demo files:', error)
    }
  },
  
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: 'API', link: '/api/props' },
      { text: '示例', link: '/examples/basic' },
      { 
        text: '链接',
        items: [
          { text: '在线演示', link: '/demo/' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@nicky132/vant-table' },
          { text: 'GitHub', link: 'https://github.com/nicky132/vant-table' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/getting-started' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 文档',
          items: [
            { text: 'Props', link: '/api/props' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础表格', link: '/examples/basic' },
            { text: '选择功能', link: '/examples/selection' },
            { text: '固定列', link: '/examples/fixed-columns' },
            { text: '排序过滤', link: '/examples/sorting-filtering' },
            { text: '自定义渲染', link: '/examples/custom-render' },
            { text: '扩展行', link: '/examples/expandable' },
            { text: '加载更多', link: '/examples/load-more' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nicky132/vant-table' }
    ]
  }
})