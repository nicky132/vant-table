# Props

VantTable 组件支持以下属性配置：

## 基础属性

### headers
- **类型**: `TableHeader[]`
- **默认值**: `[]`
- **说明**: 表头配置数组

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

### data
- **类型**: `any[]`
- **默认值**: `[]`
- **说明**: 表格数据数组

## 尺寸属性

### width
- **类型**: `number | string`
- **默认值**: `'100%'`
- **说明**: 表格宽度

### height
- **类型**: `number | string`
- **默认值**: `400`
- **说明**: 表格高度

### min-width
- **类型**: `number`
- **默认值**: `800`
- **说明**: 表格最小宽度

## 选择功能

### selectable
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否启用选择功能

### select-mode
- **类型**: `'checkbox' | 'radio'`
- **默认值**: `'checkbox'`
- **说明**: 选择模式

### select-on-row-click
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 点击行是否触发选择

### preserve-selection
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否保持选择状态

### selectable-filter
- **类型**: `(row: any, index: number) => boolean`
- **默认值**: `null`
- **说明**: 选择过滤函数

```javascript
// 示例：只允许在职员工被选择
const selectableFilter = (row, index) => {
  return row.status === '在职'
}
```

### max-select-count
- **类型**: `number`
- **默认值**: `0`
- **说明**: 最大选择数量，0 表示不限制

### row-key
- **类型**: `string | function`
- **默认值**: `'id'`
- **说明**: 行唯一标识

### selected-keys
- **类型**: `string[]`
- **默认值**: `[]`
- **说明**: 选中行键值 (v-model)

## 扩展功能

### expandable
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否支持展开行

## 状态属性

### loading
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 加载状态

### striped
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否显示斑马纹

### bordered
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否显示边框

## 加载更多

### enable-load-more
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否启用加载更多功能

### load-more-loading
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 加载更多状态

### load-more-finished
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否加载完成

### load-more-error
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否加载错误

### load-more-offset
- **类型**: `number`
- **默认值**: `50`
- **说明**: 触发加载更多的滚动偏移量

### show-load-more-ui
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否显示加载更多 UI

### load-more-loading-text
- **类型**: `string`
- **默认值**: `'加载中...'`
- **说明**: 加载中提示文本

### load-more-finished-text
- **类型**: `string`
- **默认值**: `'没有更多了'`
- **说明**: 加载完成提示文本

### load-more-error-text
- **类型**: `string`
- **默认值**: `'加载失败，点击重试'`
- **说明**: 加载失败提示文本

## 使用示例

```vue
<template>
  <VantTable
    :headers="headers"
    :data="data"
    :width="'100%'"
    :height="500"
    :min-width="1000"
    :selectable="true"
    select-mode="checkbox"
    :select-on-row-click="true"
    :preserve-selection="true"
    :selectable-filter="selectableFilter"
    :max-select-count="10"
    row-key="id"
    v-model:selected-keys="selectedKeys"
    :expandable="true"
    :loading="loading"
    :striped="true"
    :bordered="true"
    :enable-load-more="true"
    :load-more-loading="loadMoreLoading"
    :load-more-finished="loadMoreFinished"
    :load-more-error="loadMoreError"
    :load-more-offset="100"
    :show-load-more-ui="true"
    load-more-loading-text="正在加载更多..."
    load-more-finished-text="已经到底了~"
    load-more-error-text="加载失败，点击重试"
  />
</template>
```