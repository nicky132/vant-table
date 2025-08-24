<template>
  <div style="padding: 20px;">
    <h1>VantTable 组件开发</h1>
    <h2>基础表格</h2>
    <!-- 直接使用 src/index.vue 的内容 -->
    <IndexDemo />
  </div>
</template>

<script setup>
import IndexDemo from '@/index.vue' // 使用完整的示例
</script>

<style scoped>
h1, h2, h3 {
  color: #333;
}

pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>