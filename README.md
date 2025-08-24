# @nicky132/vant-table

一个基于 Vant UI 的强大表格组件，支持高级选择功能、固定列、排序、过滤和扩展行等特性。

## 🌐 在线体验

**[📚 完整文档](https://nicky132.github.io/vant-table/)** - 详细的组件文档和API说明

**[🚀 在线演示](https://nicky132.github.io/vant-table/demo/)** - 无需安装，直接体验所有功能！

## ✨ 特性

- 🚀 **高性能**: 支持大量数据渲染，虚拟滚动优化
- 🎯 **选择功能**: 支持单选/多选模式，选择过滤，最大选择限制
- 📌 **固定列**: 支持左右固定列，自动阴影效果
- 🔄 **排序过滤**: 支持多列排序和自定义过滤
- 📱 **响应式**: 完美适配移动端和桌面端
- 🎨 **自定义渲染**: 支持单元格自定义渲染
- 📦 **TypeScript**: 完整的 TypeScript 类型定义
- 🧪 **测试覆盖**: 完善的单元测试和集成测试

## 📦 安装

```bash
npm install @nicky132/vant-table
# 或
yarn add @nicky132/vant-table
# 或
pnpm add @nicky132/vant-table
```

## 🚀 快速开始

### 全局注册

```typescript
import { createApp } from 'vue'
import VantTable from '@nicky132/vant-table'
import '@nicky132/vant-table/dist/index.css'

const app = createApp(App)
app.use(VantTable)
```

### 局部使用

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
  // ... 更多数据
])

const handleSelectionChange = (event) => {
  console.log('选择变化:', event.selectedRows)
}
</script>
```

## 📖 API 文档

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| headers | 表头配置 | `TableHeader[]` | `[]` |
| data | 表格数据 | `any[]` | `[]` |
| width | 表格宽度 | `number \| string` | `'100%'` |
| height | 表格高度 | `number \| string` | `400` |
| min-width | 表格最小宽度 | `number` | `800` |
| selectable | 是否启用选择功能 | `boolean` | `false` |
| select-mode | 选择模式 | `'checkbox' \| 'radio'` | `'checkbox'` |
| select-on-row-click | 点击行是否选择 | `boolean` | `false` |
| preserve-selection | 保持选择状态 | `boolean` | `false` |
| selectable-filter | 选择过滤函数 | `(row, index) => boolean` | `null` |
| max-select-count | 最大选择数量 | `number` | `0` |
| row-key | 行唯一标识 | `string \| function` | `'id'` |
| selected-keys | 选中行键值(v-model) | `string[]` | `[]` |
| expandable | 是否支持展开行 | `boolean` | `false` |
| loading | 加载状态 | `boolean` | `false` |
| striped | 斑马纹 | `boolean` | `false` |
| bordered | 边框 | `boolean` | `true` |
| enable-load-more | 启用加载更多 | `boolean` | `false` |
| load-more-loading | 加载更多状态 | `boolean` | `false` |
| load-more-finished | 加载完成状态 | `boolean` | `false` |
| load-more-error | 加载错误状态 | `boolean` | `false` |
| load-more-offset | 加载触发偏移 | `number` | `50` |
| show-load-more-ui | 显示加载更多UI | `boolean` | `true` |

### TableHeader 类型

```typescript
interface TableHeader {
  key: string                    // 列键值
  label: string                  // 列标题
  width?: number                 // 列宽度
  fixed?: 'left' | 'right'      // 固定列位置
  sortable?: boolean             // 是否可排序
  filterable?: boolean           // 是否可过滤
  align?: 'left' | 'center' | 'right'  // 对齐方式
  type?: 'text' | 'number' | 'currency' | 'percent'  // 数据类型
  renderCell?: (value, row, column, rowIndex, colIndex, h) => any  // 自定义渲染
}
```

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| selection-change | 选择变化 | `{ selectedRowKeys, selectedRows, selectableRows, isAllSelected, isIndeterminate }` |
| select | 单行选择 | `{ row, rowIndex, selected, selectedRowKeys, selectedRows }` |
| select-all | 全选变化 | `{ checked, selectedRowKeys, selectedRows, selectableRows }` |
| row-click | 行点击 | `{ row, rowIndex }` |
| cell-click | 单元格点击 | `{ row, column, value, rowIndex, colIndex }` |
| sort-change | 排序变化 | `{ key, direction, column }` |
| expand-change | 展开变化 | `{ row, rowIndex, expanded, expandedKeys }` |
| batch-delete | 批量删除 | `{ selectedRows, selectedRowKeys }` |
| load-more | 加载更多 | `{}` |

### Methods

通过 ref 可以调用以下方法：

```typescript
// 选择相关
clearSelection()                          // 清空选择
setSelectedRowKeys(keys: string[])        // 设置选中行
getSelectedRowKeys(): string[]            // 获取选中行键值
getSelectedRows(): any[]                  // 获取选中行数据
toggleRowSelection(row, selected?)        // 切换行选择状态
selectAllCurrentPage()                    // 全选当前页
invertSelection()                         // 反选
isRowSelected(row, rowIndex): boolean     // 判断行是否选中
isRowDisabled(row, rowIndex): boolean     // 判断行是否禁用

// 表格控制
forceHeaderSync()                         // 强制同步表头高度
measureAndSyncRowHeights()               // 同步行高度
measureAndSyncAllHeights()               // 同步所有高度
forceRealign()                           // 强制重新对齐
forceDOMCleanup()                        // 强制DOM清理
forceAllAreaSync()                       // 强制同步所有区域
```

## 🎨 高级用法

### 选择功能

```vue
<template>
  <VantTable
    :headers="headers"
    :data="data"
    selectable
    select-mode="checkbox"
    :max-select-count="5"
    :selectable-filter="selectableFilter"
    v-model:selected-keys="selectedKeys"
    @selection-change="handleSelectionChange"
  />
</template>

<script setup>
const selectableFilter = (row, index) => {
  // 只有在职员工可以选择
  return row.status === '在职'
}

const selectedKeys = ref([])
</script>
```

### VTable 风格过滤

新版本支持 VTable 风格的过滤功能，提供更直观的多选过滤体验：

```javascript
const headers = [
  {
    key: 'department',
    label: '部门',
    filterable: true, // 启用过滤功能
    width: 120
  },
  {
    key: 'status',
    label: '状态',
    filterable: true,
    width: 100
  }
]
```

**过滤功能特点：**

- 📋 **多选复选框**: 可以同时选择多个过滤条件
- 🔍 **实时搜索**: 在过滤选项中快速搜索
- 🎯 **全选操作**: 支持一键全选/取消全选
- 📱 **居中弹窗**: 现代化的模态对话框设计
- ⚡ **即时反馈**: 实时预览过滤结果

**使用方式：**

1. 点击表头的过滤图标
2. 在居中弹出的过滤对话框中搜索或选择过滤条件
3. 使用复选框选择多个选项（支持全选/取消全选）
4. 点击"确定"应用过滤，或"重置"清除过滤
5. 点击关闭按钮、遮罩层或ESC键关闭过滤对话框

### 自定义单元格渲染

```javascript
const headers = [
  {
    key: 'status',
    label: '状态',
    renderCell: (value, row, column, rowIndex, colIndex, h) => {
      const colors = {
        '在职': '#52c41a',
        '试用': '#1890ff',
        '离职': '#999'
      }
      
      return h('span', {
        style: {
          color: colors[value],
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: colors[value] + '20'
        }
      }, value)
    }
  }
]
```

### 固定列

```javascript
const headers = [
  { key: 'id', label: 'ID', width: 100, fixed: 'left' },
  { key: 'name', label: '姓名', width: 120, fixed: 'left' },
  { key: 'department', label: '部门' },
  { key: 'salary', label: '薪资' },
  { key: 'actions', label: '操作', width: 120, fixed: 'right' }
]
```

### 加载更多功能

```vue
<template>
  <VantTable
    :headers="headers"
    :data="data"
    :enable-load-more="true"
    :load-more-loading="loadMoreLoading"
    :load-more-finished="loadMoreFinished"
    :load-more-error="loadMoreError"
    :load-more-offset="50"
    load-more-loading-text="正在加载更多数据..."
    load-more-finished-text="已经到底了~"
    load-more-error-text="加载失败，点击重试"
    @load-more="handleLoadMore"
  />
</template>

<script setup>
const loadMoreLoading = ref(false)
const loadMoreFinished = ref(false)
const loadMoreError = ref(false)

const handleLoadMore = async () => {
  loadMoreLoading.value = true
  try {
    const newData = await fetchMoreData()
    data.value.push(...newData)
    if (newData.length === 0) {
      loadMoreFinished.value = true
    }
  } catch (error) {
    loadMoreError.value = true
  } finally {
    loadMoreLoading.value = false
  }
}
</script>
```

### 批量操作

```vue
<template>
  <VantTable
    :headers="headers"
    :data="data"
    selectable
    v-model:selected-keys="selectedKeys"
    @selection-change="handleSelectionChange"
  >
    <!-- 自定义批量操作按钮 -->
    <template #selection-actions="{ selectedRows, selectedRowKeys }">
      <van-button type="primary" @click="handleBatchEdit">
        批量编辑 ({{ selectedRows.length }})
      </van-button>
      <van-button type="danger" @click="handleBatchDelete">
        批量删除 ({{ selectedRows.length }})
      </van-button>
    </template>
  </VantTable>
</template>
```

### 扩展行

```vue
<template>
  <VantTable
    :headers="headers"
    :data="data"
    expandable
    @expand-change="handleExpandChange"
  >
    <template #expanded="{ row }">
      <div class="expand-content">
        <p>详细信息：{{ row.detail }}</p>
        <p>创建时间：{{ row.createTime }}</p>
      </div>
    </template>
  </VantTable>
</template>
```

## 🧪 测试

```bash
# 运行测试
npm run test

# 生成覆盖率报告
npm run test:coverage

# 运行测试UI
npm run test:ui
```

## 📝 更新日志

### v1.0.1 (最新)

- ✨ **新功能**: 实现了 VTable 风格的过滤功能
  - 📋 多选复选框过滤选项  
  - 🔍 实时搜索过滤
  - 📱 居中模态对话框，符合现代UI设计规范
  - 🎯 支持全选/取消全选操作
  - ⚡ 优化的过滤性能和用户体验
- 🔧 修复了过滤弹窗的单一弹窗逻辑
- 🎨 改进了过滤UI的视觉效果和交互
- ⚙️ 优化了过滤状态管理和数据处理

### v1.0.0

- 🎉 初始发布
- ✨ 支持基础表格功能
- ✨ 支持选择功能（单选/多选）
- ✨ 支持固定列
- ✨ 支持排序和过滤
- ✨ 支持扩展行
- ✨ 完整的 TypeScript 支持
- ✨ 完善的测试覆盖

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT](LICENSE)

## 🙏 致谢

- [Vue 3](https://vuejs.org/)
- [Vant](https://vant-contrib.gitee.io/vant/)
- [Vitest](https://vitest.dev/)

---

Made with ❤️ by CC Team