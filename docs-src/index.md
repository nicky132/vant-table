---
layout: home

hero:
  name: "VantTable"
  text: "功能丰富的Vue表格组件"
  tagline: "基于 Vant UI，支持高级选择、固定列、排序过滤等特性"
  image:
    src: /logo.svg
    alt: VantTable
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在线演示
      link: /demo/
    - theme: alt
      text: 查看源码
      link: https://github.com/nicky132/vant-table

features:
  - icon: 🚀
    title: 高性能
    details: 支持大量数据渲染，虚拟滚动优化，流畅的用户体验
  - icon: 🎯
    title: 选择功能
    details: 支持单选/多选模式，选择过滤，最大选择限制等高级功能
  - icon: 📌
    title: 固定列
    details: 支持左右固定列，自动阴影效果，完美的视觉体验
  - icon: 🔄
    title: 排序过滤
    details: 支持多列排序和自定义过滤，VTable风格的现代化交互
  - icon: 📱
    title: 响应式
    details: 完美适配移动端和桌面端，自适应各种屏幕尺寸
  - icon: 🎨
    title: 自定义渲染
    details: 支持单元格自定义渲染，灵活的内容展示方式
  - icon: 📦
    title: TypeScript
    details: 完整的 TypeScript 类型定义，更好的开发体验
  - icon: 🧪
    title: 测试覆盖
    details: 完善的单元测试和集成测试，可靠的代码质量
---

## 快速安装

```bash
npm install @nicky132/vant-table
# 或
yarn add @nicky132/vant-table  
# 或
pnpm add @nicky132/vant-table
```

## 简单使用

```vue
<template>
  <VantTable
    :headers="headers"
    :data="data"
    :selectable="true"
    select-mode="checkbox"
    @selection-change="handleSelectionChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import { VantTable } from '@nicky132/vant-table'
import '@nicky132/vant-table/dist/index.css'

const headers = ref([
  { key: 'id', label: 'ID', width: 100, sortable: true },
  { key: 'name', label: '姓名', width: 120, fixed: 'left' },
  { key: 'department', label: '部门', sortable: true },
  { key: 'salary', label: '薪资', type: 'currency', sortable: true },
  { key: 'status', label: '状态', width: 100, fixed: 'right' }
])

const data = ref([
  { id: 1, name: '张三', department: '技术部', salary: 25000, status: '在职' },
  { id: 2, name: '李四', department: '产品部', salary: 20000, status: '在职' },
])

const handleSelectionChange = (event) => {
  console.log('选择变化:', event.selectedRows)
}
</script>
```