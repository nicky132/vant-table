# 快速开始

本节将帮助你在项目中快速上手使用 VantTable。

## 全局注册

在 `main.js` 或 `main.ts` 中全局注册 VantTable：

```typescript
import { createApp } from 'vue'
import App from './App.vue'

// 引入 Vant
import Vant from 'vant'
import 'vant/lib/index.css'

// 引入 VantTable
import VantTable from '@nicky132/vant-table'
import '@nicky132/vant-table/dist/index.css'

const app = createApp(App)

app.use(Vant)
app.use(VantTable)

app.mount('#app')
```

## 局部引入

如果你只想在特定组件中使用 VantTable：

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

<script setup lang="ts">
import { ref } from 'vue'
import { VantTable } from '@nicky132/vant-table'
import '@nicky132/vant-table/dist/index.css'

// 表头配置
const headers = ref([
  { key: 'id', label: 'ID', width: 100, sortable: true },
  { key: 'name', label: '姓名', width: 120, fixed: 'left' },
  { key: 'department', label: '部门', sortable: true },
  { key: 'salary', label: '薪资', type: 'currency', sortable: true },
  { key: 'status', label: '状态', width: 100, fixed: 'right' }
])

// 表格数据
const data = ref([
  { id: 1, name: '张三', department: '技术部', salary: 25000, status: '在职' },
  { id: 2, name: '李四', department: '产品部', salary: 20000, status: '在职' },
  { id: 3, name: '王五', department: '设计部', salary: 18000, status: '试用' },
  { id: 4, name: '赵六', department: '运营部', salary: 15000, status: '在职' }
])

// 选择变化处理
const handleSelectionChange = (event) => {
  console.log('选择的行:', event.selectedRows)
  console.log('选择的键值:', event.selectedRowKeys)
  console.log('是否全选:', event.isAllSelected)
}
</script>
```

## 基础示例

这里是一个最简单的 VantTable 示例：

```vue
<template>
  <div class="demo-container">
    <VantTable :headers="headers" :data="data" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const headers = ref([
  { key: 'name', label: '姓名' },
  { key: 'age', label: '年龄' },
  { key: 'city', label: '城市' }
])

const data = ref([
  { name: '张三', age: 25, city: '北京' },
  { name: '李四', age: 30, city: '上海' },
  { name: '王五', age: 28, city: '深圳' }
])
</script>

<style scoped>
.demo-container {
  padding: 20px;
}
</style>
```

## TypeScript 支持

VantTable 完全支持 TypeScript，你可以使用类型定义来获得更好的开发体验：

```typescript
import { ref } from 'vue'
import type { TableHeader, VantTableInstance } from '@nicky132/vant-table'

// 定义数据类型
interface UserData {
  id: number
  name: string
  department: string
  salary: number
  status: string
}

// 表头配置（带类型）
const headers = ref<TableHeader[]>([
  { key: 'id', label: 'ID', width: 100, sortable: true },
  { key: 'name', label: '姓名', width: 120, fixed: 'left' },
  { key: 'department', label: '部门', sortable: true },
  { key: 'salary', label: '薪资', type: 'currency', sortable: true },
  { key: 'status', label: '状态', width: 100, fixed: 'right' }
])

// 表格数据（带类型）
const data = ref<UserData[]>([
  { id: 1, name: '张三', department: '技术部', salary: 25000, status: '在职' },
  { id: 2, name: '李四', department: '产品部', salary: 20000, status: '在职' }
])

// 表格实例引用
const tableRef = ref<VantTableInstance>()

// 使用表格方法
const clearSelection = () => {
  tableRef.value?.clearSelection()
}
```

## 样式定制

VantTable 基于 Vant UI 设计，你可以通过 CSS 变量来定制主题：

```css
:root {
  /* 自定义表格主色调 */
  --van-primary-color: #1890ff;
  --van-success-color: #52c41a;
  --van-warning-color: #fa8c16;
  --van-danger-color: #ff4d4f;
  
  /* 自定义表格样式 */
  --vant-table-border-color: #e8e8e8;
  --vant-table-header-bg: #fafafa;
  --vant-table-row-hover-bg: #f5f5f5;
}
```

## 下一步

现在你已经学会了 VantTable 的基础用法！接下来可以：

- 了解 [选择功能](/examples/selection) 的高级用法
- 探索 [固定列](/examples/fixed-columns) 的配置方式
- 学习 [排序过滤](/examples/sorting-filtering) 功能
- 查看完整的 [API 文档](/api/props)

或者直接在 [在线演示](https://nicky132.github.io/vant-table/demo/) 中体验所有功能！