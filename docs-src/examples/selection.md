# 选择功能

VantTable 提供了强大的行选择功能，支持单选、多选、选择过滤等高级特性。

## 基础多选

```vue
<template>
  <VantTable
    :headers="headers"
    :data="data"
    selectable
    select-mode="checkbox"
    v-model:selected-keys="selectedKeys"
    @selection-change="handleSelectionChange"
  />
  <div style="margin-top: 16px;">
    <p>已选择: {{ selectedKeys.join(', ') }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedKeys = ref([])

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'department', label: '部门' },
  { key: 'status', label: '状态', width: 100 }
])

const data = ref([
  { id: 1, name: '张三', department: '技术部', status: '在职' },
  { id: 2, name: '李四', department: '产品部', status: '在职' },
  { id: 3, name: '王五', department: '设计部', status: '试用' },
  { id: 4, name: '赵六', department: '运营部', status: '离职' }
])

const handleSelectionChange = (event) => {
  console.log('选择变化:', event)
}
</script>
```

## 单选模式

```vue
<template>
  <VantTable
    :headers="headers"
    :data="data"
    selectable
    select-mode="radio"
    v-model:selected-keys="selectedKeys"
  />
  <div style="margin-top: 16px;">
    <p>当前选择: {{ selectedKeys[0] || '无' }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedKeys = ref([])

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'department', label: '部门' },
  { key: 'salary', label: '薪资', type: 'currency' }
])

const data = ref([
  { id: 1, name: '张三', department: '技术部', salary: 25000 },
  { id: 2, name: '李四', department: '产品部', salary: 20000 },
  { id: 3, name: '王五', department: '设计部', salary: 18000 }
])
</script>
```

## 点击行选择

```vue
<template>
  <VantTable
    :headers="headers"
    :data="data"
    selectable
    select-on-row-click
    v-model:selected-keys="selectedKeys"
  />
  <div style="margin-top: 16px;">
    <p>提示: 点击行即可选择</p>
    <p>已选择: {{ selectedKeys.length }} 项</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedKeys = ref([])

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'position', label: '职位' },
  { key: 'level', label: '级别' }
])

const data = ref([
  { id: 1, name: '张三', position: '前端工程师', level: 'P6' },
  { id: 2, name: '李四', position: '产品经理', level: 'P7' },
  { id: 3, name: '王五', position: 'UI设计师', level: 'P5' },
  { id: 4, name: '赵六', position: '运营专员', level: 'P4' }
])
</script>
```

## 选择过滤

```vue
<template>
  <VantTable
    :headers="headers"
    :data="data"
    selectable
    :selectable-filter="selectableFilter"
    v-model:selected-keys="selectedKeys"
  />
  <div style="margin-top: 16px;">
    <p>提示: 只有在职员工可以被选择</p>
    <p>已选择: {{ selectedKeys.length }} 项</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedKeys = ref([])

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'department', label: '部门' },
  { key: 'status', label: '状态', width: 100 }
])

const data = ref([
  { id: 1, name: '张三', department: '技术部', status: '在职' },
  { id: 2, name: '李四', department: '产品部', status: '在职' },
  { id: 3, name: '王五', department: '设计部', status: '试用' },
  { id: 4, name: '赵六', department: '运营部', status: '离职' }
])

// 只有在职员工可以选择
const selectableFilter = (row, index) => {
  return row.status === '在职'
}
</script>
```

## 最大选择限制

```vue
<template>
  <VantTable
    :headers="headers"
    :data="data"
    selectable
    :max-select-count="2"
    v-model:selected-keys="selectedKeys"
  />
  <div style="margin-top: 16px;">
    <p>最多只能选择 2 项 ({{ selectedKeys.length }}/2)</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedKeys = ref([])

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '项目名称', width: 150 },
  { key: 'leader', label: '负责人', width: 100 },
  { key: 'status', label: '状态' }
])

const data = ref([
  { id: 1, name: '电商平台重构', leader: '张三', status: '进行中' },
  { id: 2, name: '移动端优化', leader: '李四', status: '待开始' },
  { id: 3, name: '数据分析系统', leader: '王五', status: '已完成' },
  { id: 4, name: '用户体验升级', leader: '赵六', status: '进行中' }
])
</script>
```