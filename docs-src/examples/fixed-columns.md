# 固定列

当表格内容较多时，可以固定左侧或右侧的列来方便查看。

## 左侧固定列

```vue
<template>
  <VantTable :headers="headers" :data="data" :min-width="1200" />
</template>

<script setup>
import { ref } from 'vue'

const headers = ref([
  { key: 'id', label: 'ID', width: 80, fixed: 'left' },
  { key: 'name', label: '姓名', width: 120, fixed: 'left' },
  { key: 'department', label: '部门', width: 150 },
  { key: 'position', label: '职位', width: 150 },
  { key: 'level', label: '级别', width: 100 },
  { key: 'salary', label: '薪资', width: 120, type: 'currency' },
  { key: 'bonus', label: '奖金', width: 120, type: 'currency' },
  { key: 'totalIncome', label: '总收入', width: 120, type: 'currency' },
  { key: 'joinDate', label: '入职日期', width: 120 },
  { key: 'email', label: '邮箱', width: 200 }
])

const data = ref([
  {
    id: 1,
    name: '张三',
    department: '技术部',
    position: '前端工程师',
    level: 'P6',
    salary: 25000,
    bonus: 5000,
    totalIncome: 30000,
    joinDate: '2022-01-15',
    email: 'zhangsan@example.com'
  },
  {
    id: 2,
    name: '李四',
    department: '产品部',
    position: '产品经理',
    level: 'P7',
    salary: 28000,
    bonus: 8000,
    totalIncome: 36000,
    joinDate: '2021-06-20',
    email: 'lisi@example.com'
  },
  {
    id: 3,
    name: '王五',
    department: '设计部',
    position: 'UI设计师',
    level: 'P5',
    salary: 20000,
    bonus: 3000,
    totalIncome: 23000,
    joinDate: '2022-03-10',
    email: 'wangwu@example.com'
  }
])
</script>
```

## 右侧固定列

```vue
<template>
  <VantTable :headers="headers" :data="data" :min-width="1000" />
</template>

<script setup>
import { ref } from 'vue'

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '项目名称', width: 180 },
  { key: 'description', label: '项目描述', width: 250 },
  { key: 'leader', label: '负责人', width: 120 },
  { key: 'startDate', label: '开始日期', width: 120 },
  { key: 'endDate', label: '结束日期', width: 120 },
  { key: 'status', label: '状态', width: 100, fixed: 'right' },
  { key: 'actions', label: '操作', width: 120, fixed: 'right' }
])

const data = ref([
  {
    id: 1,
    name: '电商平台重构',
    description: '对现有电商平台进行全面重构，提升性能和用户体验',
    leader: '张三',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    status: '进行中',
    actions: '查看 编辑'
  },
  {
    id: 2,
    name: '移动端优化',
    description: '优化移动端页面性能，提升加载速度',
    leader: '李四',
    startDate: '2024-02-15',
    endDate: '2024-05-15',
    status: '待开始',
    actions: '查看 编辑'
  },
  {
    id: 3,
    name: '数据分析系统',
    description: '建设数据分析系统，支持实时数据监控',
    leader: '王五',
    startDate: '2023-10-01',
    endDate: '2024-01-31',
    status: '已完成',
    actions: '查看 编辑'
  }
])
</script>
```

## 左右同时固定

```vue
<template>
  <VantTable :headers="headers" :data="data" selectable :min-width="1500" />
</template>

<script setup>
import { ref } from 'vue'

const headers = ref([
  { key: 'id', label: 'ID', width: 80, fixed: 'left' },
  { key: 'name', label: '员工姓名', width: 120, fixed: 'left' },
  { key: 'department', label: '部门', width: 150 },
  { key: 'position', label: '职位', width: 150 },
  { key: 'level', label: '级别', width: 100 },
  { key: 'workYears', label: '工作年限', width: 100 },
  { key: 'skill1', label: '技能1', width: 120 },
  { key: 'skill2', label: '技能2', width: 120 },
  { key: 'skill3', label: '技能3', width: 120 },
  { key: 'project', label: '当前项目', width: 150 },
  { key: 'performance', label: '绩效评级', width: 100 },
  { key: 'status', label: '状态', width: 100, fixed: 'right' },
  { key: 'actions', label: '操作', width: 150, fixed: 'right' }
])

const data = ref([
  {
    id: 1,
    name: '张三',
    department: '技术部',
    position: '前端工程师',
    level: 'P6',
    workYears: 5,
    skill1: 'Vue.js',
    skill2: 'React',
    skill3: 'TypeScript',
    project: '电商平台重构',
    performance: 'A',
    status: '在职',
    actions: '查看 编辑 删除'
  },
  {
    id: 2,
    name: '李四',
    department: '产品部',
    position: '产品经理',
    level: 'P7',
    workYears: 8,
    skill1: '需求分析',
    skill2: '原型设计',
    skill3: '项目管理',
    project: '用户体验升级',
    performance: 'A+',
    status: '在职',
    actions: '查看 编辑 删除'
  },
  {
    id: 3,
    name: '王五',
    department: '设计部',
    position: 'UI设计师',
    level: 'P5',
    workYears: 3,
    skill1: 'Figma',
    skill2: 'Sketch',
    skill3: '交互设计',
    project: '移动端优化',
    performance: 'B+',
    status: '试用',
    actions: '查看 编辑 删除'
  }
])
</script>
```

## 固定列阴影效果

固定列会自动显示阴影效果，帮助用户区分固定列和可滚动列。阴影效果会根据滚动位置自动显示和隐藏：

- 左固定列：当表格向右滚动时显示右侧阴影
- 右固定列：当表格向左滚动时显示左侧阴影
- 阴影效果使用 CSS box-shadow 实现，提供良好的视觉反馈

## 注意事项

1. **最小宽度**: 建议设置合适的 `min-width` 确保固定列功能正常工作
2. **列宽设置**: 固定列建议设置明确的 `width` 值
3. **性能考虑**: 过多的固定列可能影响滚动性能
4. **移动端适配**: 在小屏设备上，建议减少固定列数量