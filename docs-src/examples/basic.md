# 基础表格

最简单的表格用法，展示基本的数据展示功能。

## 基础用法

```vue
<template>
  <VantTable :headers="headers" :data="data" />
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
```

## 设置列宽

```vue
<template>
  <VantTable :headers="headers" :data="data" />
</template>

<script setup>
import { ref } from 'vue'

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'department', label: '部门', width: 150 },
  { key: 'salary', label: '薪资', width: 100 }
])

const data = ref([
  { id: 1, name: '张三', department: '技术部', salary: 25000 },
  { id: 2, name: '李四', department: '产品部', salary: 20000 },
  { id: 3, name: '王五', department: '设计部', salary: 18000 }
])
</script>
```

## 对齐方式

```vue
<template>
  <VantTable :headers="headers" :data="data" />
</template>

<script setup>
import { ref } from 'vue'

const headers = ref([
  { key: 'id', label: 'ID', width: 80, align: 'center' },
  { key: 'name', label: '姓名', width: 120, align: 'left' },
  { key: 'salary', label: '薪资', width: 100, align: 'right', type: 'currency' },
  { key: 'rate', label: '完成率', width: 100, align: 'center', type: 'percent' }
])

const data = ref([
  { id: 1, name: '张三', salary: 25000, rate: 0.95 },
  { id: 2, name: '李四', salary: 20000, rate: 0.88 },
  { id: 3, name: '王五', salary: 18000, rate: 0.92 }
])
</script>
```

## 斑马纹和边框

```vue
<template>
  <div>
    <h3>带斑马纹</h3>
    <VantTable :headers="headers" :data="data" striped />
    
    <h3 style="margin-top: 20px;">无边框</h3>
    <VantTable :headers="headers" :data="data" :bordered="false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const headers = ref([
  { key: 'name', label: '姓名' },
  { key: 'department', label: '部门' },
  { key: 'status', label: '状态' }
])

const data = ref([
  { name: '张三', department: '技术部', status: '在职' },
  { name: '李四', department: '产品部', status: '在职' },
  { name: '王五', department: '设计部', status: '试用' },
  { name: '赵六', department: '运营部', status: '在职' }
])
</script>
```