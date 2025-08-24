# 自定义渲染

通过自定义渲染函数，可以灵活地控制单元格的显示内容和样式。

## 基础自定义渲染

```vue
<template>
  <VantTable :headers="headers" :data="data" />
</template>

<script setup>
import { ref, h } from 'vue'

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'avatar', label: '头像', width: 100, renderCell: renderAvatar },
  { key: 'status', label: '状态', width: 100, renderCell: renderStatus },
  { key: 'salary', label: '薪资', width: 120, renderCell: renderSalary }
])

const data = ref([
  { id: 1, name: '张三', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', status: '在职', salary: 25000 },
  { id: 2, name: '李四', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', status: '试用', salary: 18000 },
  { id: 3, name: '王五', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', status: '离职', salary: 22000 }
])

// 渲染头像
function renderAvatar(value, row, column, rowIndex, colIndex, h) {
  return h('img', {
    src: value,
    style: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      objectFit: 'cover'
    }
  })
}

// 渲染状态标签
function renderStatus(value, row, column, rowIndex, colIndex, h) {
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
      backgroundColor: colors[value] + '20',
      fontSize: '12px'
    }
  }, value)
}

// 渲染薪资
function renderSalary(value, row, column, rowIndex, colIndex, h) {
  const color = value >= 25000 ? '#ff4d4f' : value >= 20000 ? '#fa8c16' : '#52c41a'
  
  return h('span', {
    style: { color, fontWeight: 'bold' }
  }, `¥${value.toLocaleString()}`)
}
</script>
```

## 操作按钮渲染

```vue
<template>
  <VantTable :headers="headers" :data="data" />
</template>

<script setup>
import { ref, h } from 'vue'
import { Button, Space } from 'vant'

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '项目名称', width: 180 },
  { key: 'progress', label: '进度', width: 120, renderCell: renderProgress },
  { key: 'status', label: '状态', width: 100 },
  { key: 'actions', label: '操作', width: 200, renderCell: renderActions }
])

const data = ref([
  { id: 1, name: '电商平台重构', progress: 75, status: '进行中' },
  { id: 2, name: '移动端优化', progress: 30, status: '进行中' },
  { id: 3, name: '数据分析系统', progress: 100, status: '已完成' },
  { id: 4, name: '用户体验升级', progress: 0, status: '待开始' }
])

// 渲染进度条
function renderProgress(value, row, column, rowIndex, colIndex, h) {
  const color = value === 100 ? '#52c41a' : value >= 50 ? '#1890ff' : '#fa8c16'
  
  return h('div', {
    style: { display: 'flex', alignItems: 'center', gap: '8px' }
  }, [
    h('div', {
      style: {
        width: '60px',
        height: '8px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        overflow: 'hidden'
      }
    }, [
      h('div', {
        style: {
          width: `${value}%`,
          height: '100%',
          backgroundColor: color,
          transition: 'width 0.3s'
        }
      })
    ]),
    h('span', { style: { fontSize: '12px', color: '#666' } }, `${value}%`)
  ])
}

// 渲染操作按钮
function renderActions(value, row, column, rowIndex, colIndex, h) {
  return h(Space, { size: 8 }, () => [
    h(Button, {
      type: 'primary',
      size: 'mini',
      onClick: () => handleView(row)
    }, () => '查看'),
    
    h(Button, {
      type: 'success',
      size: 'mini',
      disabled: row.status === '已完成',
      onClick: () => handleEdit(row)
    }, () => '编辑'),
    
    h(Button, {
      type: 'danger',
      size: 'mini',
      onClick: () => handleDelete(row)
    }, () => '删除')
  ])
}

const handleView = (row) => {
  alert(`查看项目: ${row.name}`)
}

const handleEdit = (row) => {
  alert(`编辑项目: ${row.name}`)
}

const handleDelete = (row) => {
  if (confirm(`确定删除项目 "${row.name}" 吗？`)) {
    const index = data.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      data.value.splice(index, 1)
    }
  }
}
</script>
```

## 复杂内容渲染

```vue
<template>
  <VantTable :headers="headers" :data="data" />
</template>

<script setup>
import { ref, h } from 'vue'
import { Tag, Rate } from 'vant'

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'skills', label: '技能', width: 200, renderCell: renderSkills },
  { key: 'rating', label: '评分', width: 120, renderCell: renderRating },
  { key: 'contact', label: '联系信息', width: 200, renderCell: renderContact }
])

const data = ref([
  { 
    id: 1, 
    name: '张三', 
    skills: ['Vue.js', 'React', 'TypeScript'], 
    rating: 4.5,
    contact: { phone: '138****8888', email: 'zhangsan@example.com' }
  },
  { 
    id: 2, 
    name: '李四', 
    skills: ['Node.js', 'Python', 'MySQL'], 
    rating: 4.2,
    contact: { phone: '139****9999', email: 'lisi@example.com' }
  },
  { 
    id: 3, 
    name: '王五', 
    skills: ['Figma', 'Sketch', 'Photoshop'], 
    rating: 4.8,
    contact: { phone: '137****7777', email: 'wangwu@example.com' }
  }
])

// 渲染技能标签
function renderSkills(value, row, column, rowIndex, colIndex, h) {
  return h('div', {
    style: { display: 'flex', gap: '4px', flexWrap: 'wrap' }
  }, value.map(skill => 
    h(Tag, { 
      size: 'small',
      type: 'primary'
    }, () => skill)
  ))
}

// 渲染评分
function renderRating(value, row, column, rowIndex, colIndex, h) {
  return h('div', {
    style: { display: 'flex', alignItems: 'center', gap: '8px' }
  }, [
    h(Rate, {
      value: value,
      readonly: true,
      size: 16
    }),
    h('span', { style: { fontSize: '12px', color: '#666' } }, value.toFixed(1))
  ])
}

// 渲染联系信息
function renderContact(value, row, column, rowIndex, colIndex, h) {
  return h('div', {
    style: { fontSize: '12px', lineHeight: '1.5' }
  }, [
    h('div', [
      h('span', { style: { color: '#666' } }, '📞 '),
      h('span', value.phone)
    ]),
    h('div', [
      h('span', { style: { color: '#666' } }, '✉️ '),
      h('span', value.email)
    ])
  ])
}
</script>
```

## 条件渲染

```vue
<template>
  <VantTable :headers="headers" :data="data" />
</template>

<script setup>
import { ref, h } from 'vue'

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '商品名称', width: 150 },
  { key: 'price', label: '价格', width: 100, renderCell: renderPrice },
  { key: 'stock', label: '库存', width: 100, renderCell: renderStock },
  { key: 'trend', label: '趋势', width: 100, renderCell: renderTrend },
  { key: 'status', label: '状态', width: 100, renderCell: renderStatus }
])

const data = ref([
  { id: 1, name: 'iPhone 15', price: 5999, stock: 50, trend: 'up', status: 'active' },
  { id: 2, name: 'MacBook Pro', price: 12999, stock: 5, trend: 'down', status: 'active' },
  { id: 3, name: 'iPad Air', price: 4399, stock: 0, trend: 'stable', status: 'inactive' },
  { id: 4, name: 'Apple Watch', price: 2999, stock: 25, trend: 'up', status: 'active' }
])

// 根据价格渲染不同颜色
function renderPrice(value, row, column, rowIndex, colIndex, h) {
  const color = value >= 10000 ? '#ff4d4f' : value >= 5000 ? '#fa8c16' : '#52c41a'
  
  return h('span', {
    style: { 
      color, 
      fontWeight: 'bold',
      fontSize: '14px'
    }
  }, `¥${value.toLocaleString()}`)
}

// 根据库存量渲染不同样式
function renderStock(value, row, column, rowIndex, colIndex, h) {
  if (value === 0) {
    return h('span', {
      style: {
        color: '#ff4d4f',
        backgroundColor: '#fff2f0',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '12px'
      }
    }, '缺货')
  }
  
  if (value <= 10) {
    return h('span', {
      style: {
        color: '#fa8c16',
        backgroundColor: '#fff7e6',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '12px'
      }
    }, `库存紧张 ${value}`)
  }
  
  return h('span', {
    style: {
      color: '#52c41a',
      fontSize: '14px'
    }
  }, value.toString())
}

// 渲染趋势图标
function renderTrend(value, row, column, rowIndex, colIndex, h) {
  const icons = {
    up: '📈',
    down: '📉',
    stable: '➡️'
  }
  
  const colors = {
    up: '#52c41a',
    down: '#ff4d4f',
    stable: '#1890ff'
  }
  
  return h('span', {
    style: {
      color: colors[value],
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }
  }, [
    icons[value],
    h('span', { style: { fontSize: '12px' } }, 
      value === 'up' ? '上升' : value === 'down' ? '下降' : '平稳'
    )
  ])
}

// 渲染状态开关
function renderStatus(value, row, column, rowIndex, colIndex, h) {
  return h('button', {
    style: {
      padding: '4px 12px',
      borderRadius: '16px',
      border: 'none',
      fontSize: '12px',
      cursor: 'pointer',
      backgroundColor: value === 'active' ? '#52c41a' : '#d9d9d9',
      color: 'white'
    },
    onClick: () => {
      row.status = row.status === 'active' ? 'inactive' : 'active'
    }
  }, value === 'active' ? '已上架' : '已下架')
}
</script>
```

## 自定义渲染最佳实践

### 1. 性能优化
- 避免在渲染函数中创建复杂的计算
- 使用简单的条件渲染而非复杂的组件嵌套
- 缓存计算结果避免重复计算

### 2. 样式一致性
- 使用统一的颜色变量和字体大小
- 保持与 Vant UI 设计风格的一致性
- 考虑深色模式的兼容性

### 3. 交互反馈
- 为可交互元素添加适当的 hover 效果
- 提供清晰的视觉反馈
- 确保按钮和链接有合适的点击区域

### 4. 响应式设计
- 考虑在不同屏幕尺寸下的显示效果
- 使用相对单位而非固定像素值
- 确保在移动端的可用性