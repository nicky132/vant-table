# 排序过滤

VantTable 支持列排序和现代化的过滤功能，提供直观的数据操作体验。

## 基础排序

```vue
<template>
  <VantTable :headers="headers" :data="data" @sort-change="handleSortChange" />
  <div style="margin-top: 16px;">
    <p>当前排序: {{ currentSort.key ? `${currentSort.key} ${currentSort.direction}` : '无' }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentSort = ref({ key: '', direction: '' })

const headers = ref([
  { key: 'id', label: 'ID', width: 80, sortable: true },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'age', label: '年龄', width: 100, sortable: true },
  { key: 'salary', label: '薪资', width: 120, sortable: true, type: 'currency' },
  { key: 'joinDate', label: '入职日期', width: 120, sortable: true }
])

const data = ref([
  { id: 3, name: '张三', age: 28, salary: 25000, joinDate: '2022-03-15' },
  { id: 1, name: '李四', age: 32, salary: 30000, joinDate: '2021-01-10' },
  { id: 4, name: '王五', age: 25, salary: 18000, joinDate: '2023-06-20' },
  { id: 2, name: '赵六', age: 35, salary: 35000, joinDate: '2020-08-05' }
])

const handleSortChange = (event) => {
  currentSort.value = event
  console.log('排序变化:', event)
}
</script>
```

## 多列排序

```vue
<template>
  <VantTable :headers="headers" :data="data" />
  <div style="margin-top: 16px;">
    <p>支持多列排序：先按部门排序，再按薪资排序</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'department', label: '部门', width: 120, sortable: true },
  { key: 'salary', label: '薪资', width: 120, sortable: true, type: 'currency' },
  { key: 'performance', label: '绩效', width: 100, sortable: true }
])

const data = ref([
  { id: 1, name: '张三', department: '技术部', salary: 25000, performance: 'A' },
  { id: 2, name: '李四', department: '产品部', salary: 28000, performance: 'B+' },
  { id: 3, name: '王五', department: '技术部', salary: 22000, performance: 'A-' },
  { id: 4, name: '赵六', department: '产品部', salary: 30000, performance: 'A+' },
  { id: 5, name: '陈七', department: '设计部', salary: 20000, performance: 'B' },
  { id: 6, name: '刘八', department: '设计部', salary: 24000, performance: 'A' }
])
</script>
```

## VTable 风格过滤

```vue
<template>
  <VantTable :headers="headers" :data="data" />
  <div style="margin-top: 16px;">
    <p>点击表头过滤图标体验现代化的多选过滤功能</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'department', label: '部门', width: 120, filterable: true },
  { key: 'position', label: '职位', width: 150, filterable: true },
  { key: 'status', label: '状态', width: 100, filterable: true },
  { key: 'salary', label: '薪资', width: 120, type: 'currency' }
])

const data = ref([
  { id: 1, name: '张三', department: '技术部', position: '前端工程师', status: '在职', salary: 25000 },
  { id: 2, name: '李四', department: '产品部', position: '产品经理', status: '在职', salary: 28000 },
  { id: 3, name: '王五', department: '技术部', position: '后端工程师', status: '试用', salary: 22000 },
  { id: 4, name: '赵六', department: '设计部', position: 'UI设计师', status: '在职', salary: 20000 },
  { id: 5, name: '陈七', department: '产品部', position: '产品助理', status: '试用', salary: 15000 },
  { id: 6, name: '刘八', department: '技术部', position: '全栈工程师', status: '在职', salary: 30000 },
  { id: 7, name: '周九', department: '设计部', position: '交互设计师', status: '离职', salary: 18000 },
  { id: 8, name: '吴十', department: '运营部', position: '运营专员', status: '在职', salary: 16000 }
])
</script>
```

## 排序和过滤组合

```vue
<template>
  <VantTable :headers="headers" :data="data" />
  <div style="margin-top: 16px;">
    <p>功能说明：</p>
    <ul>
      <li>点击列标题进行排序</li>
      <li>点击过滤图标进行多条件过滤</li>
      <li>过滤后的数据仍可进行排序</li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const headers = ref([
  { key: 'id', label: 'ID', width: 80, sortable: true },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'department', label: '部门', width: 120, sortable: true, filterable: true },
  { key: 'level', label: '级别', width: 100, sortable: true, filterable: true },
  { key: 'salary', label: '薪资', width: 120, sortable: true, type: 'currency' },
  { key: 'experience', label: '工作年限', width: 100, sortable: true },
  { key: 'status', label: '状态', width: 100, filterable: true }
])

const data = ref([
  { id: 1, name: '张三', department: '技术部', level: 'P6', salary: 25000, experience: 5, status: '在职' },
  { id: 2, name: '李四', department: '产品部', level: 'P7', salary: 30000, experience: 8, status: '在职' },
  { id: 3, name: '王五', department: '技术部', level: 'P5', salary: 20000, experience: 3, status: '试用' },
  { id: 4, name: '赵六', department: '设计部', level: 'P6', salary: 22000, experience: 6, status: '在职' },
  { id: 5, name: '陈七', department: '产品部', level: 'P5', salary: 18000, experience: 2, status: '试用' },
  { id: 6, name: '刘八', department: '技术部', level: 'P7', salary: 32000, experience: 10, status: '在职' },
  { id: 7, name: '周九', department: '设计部', level: 'P4', salary: 16000, experience: 1, status: '试用' },
  { id: 8, name: '吴十', department: '运营部', level: 'P5', salary: 19000, experience: 4, status: '在职' },
  { id: 9, name: '郑十一', department: '技术部', level: 'P8', salary: 40000, experience: 12, status: '在职' },
  { id: 10, name: '孙十二', department: '产品部', level: 'P6', salary: 26000, experience: 7, status: '离职' }
])
</script>
```

## 过滤功能特点

VantTable 的过滤功能采用现代化的设计：

### 🎯 多选复选框
- 支持同时选择多个过滤条件
- 可以通过复选框快速选择/取消选择
- 支持全选和取消全选操作

### 🔍 实时搜索
- 在过滤选项中快速搜索特定值
- 支持模糊匹配，提高查找效率
- 搜索结果实时更新

### 📱 居中模态框
- 现代化的居中弹窗设计
- 支持点击遮罩层关闭
- 支持 ESC 键快速关闭
- 响应式设计，适配移动端

### ⚡ 即时反馈
- 实时预览过滤结果数量
- 过滤条件变化时立即更新表格
- 清晰的视觉反馈和状态提示

### 🎨 用户体验
- 直观的操作界面
- 清晰的确定/重置按钮
- 过滤状态持久化
- 与排序功能无缝协作