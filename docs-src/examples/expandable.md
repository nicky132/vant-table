# 扩展行

当表格内容较为复杂时，可以使用扩展行功能来显示更多详细信息。

## 基础扩展行

```vue
<template>
  <VantTable 
    :headers="headers" 
    :data="data" 
    expandable
    @expand-change="handleExpandChange"
  >
    <template #expanded="{ row }">
      <div style="padding: 16px; background-color: #fafafa;">
        <h4>详细信息</h4>
        <p><strong>描述：</strong>{{ row.description }}</p>
        <p><strong>创建时间：</strong>{{ row.createTime }}</p>
        <p><strong>更新时间：</strong>{{ row.updateTime }}</p>
      </div>
    </template>
  </VantTable>
</template>

<script setup>
import { ref } from 'vue'

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '项目名称', width: 180 },
  { key: 'leader', label: '负责人', width: 120 },
  { key: 'status', label: '状态', width: 100 }
])

const data = ref([
  { 
    id: 1, 
    name: '电商平台重构', 
    leader: '张三', 
    status: '进行中',
    description: '对现有电商平台进行全面重构，采用最新的技术栈，提升系统性能和用户体验。',
    createTime: '2024-01-01 09:00:00',
    updateTime: '2024-02-15 14:30:00'
  },
  { 
    id: 2, 
    name: '移动端优化', 
    leader: '李四', 
    status: '待开始',
    description: '优化移动端页面性能，减少页面加载时间，提升移动端用户体验。',
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-20 16:45:00'
  },
  { 
    id: 3, 
    name: '数据分析系统', 
    leader: '王五', 
    status: '已完成',
    description: '建设数据分析系统，支持实时数据监控和多维度数据分析。',
    createTime: '2023-10-01 08:30:00',
    updateTime: '2024-01-31 17:00:00'
  }
])

const handleExpandChange = (event) => {
  console.log('扩展状态变化:', event)
}
</script>
```

## 复杂扩展内容

```vue
<template>
  <VantTable 
    :headers="headers" 
    :data="data" 
    expandable
  >
    <template #expanded="{ row }">
      <div style="padding: 20px; background-color: #f8f9fa;">
        <!-- 员工详细信息 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <h4 style="margin-bottom: 12px; color: #333;">基本信息</h4>
            <div style="display: grid; gap: 8px;">
              <div><strong>邮箱：</strong>{{ row.email }}</div>
              <div><strong>电话：</strong>{{ row.phone }}</div>
              <div><strong>地址：</strong>{{ row.address }}</div>
              <div><strong>入职日期：</strong>{{ row.joinDate }}</div>
            </div>
          </div>
          
          <div>
            <h4 style="margin-bottom: 12px; color: #333;">工作信息</h4>
            <div style="display: grid; gap: 8px;">
              <div><strong>直属上级：</strong>{{ row.manager }}</div>
              <div><strong>工作年限：</strong>{{ row.experience }} 年</div>
              <div><strong>绩效评级：</strong>{{ row.performance }}</div>
              <div><strong>上次考评：</strong>{{ row.lastReview }}</div>
            </div>
          </div>
        </div>
        
        <!-- 技能标签 -->
        <div>
          <h4 style="margin-bottom: 12px; color: #333;">专业技能</h4>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span 
              v-for="skill in row.skills" 
              :key="skill"
              style="
                padding: 4px 12px; 
                background-color: #e6f7ff; 
                color: #1890ff; 
                border-radius: 16px; 
                font-size: 12px;
                border: 1px solid #91d5ff;
              "
            >
              {{ skill }}
            </span>
          </div>
        </div>
        
        <!-- 项目经历 -->
        <div style="margin-top: 20px;">
          <h4 style="margin-bottom: 12px; color: #333;">项目经历</h4>
          <div style="display: grid; gap: 12px;">
            <div 
              v-for="project in row.projects" 
              :key="project.name"
              style="
                padding: 12px; 
                background-color: white; 
                border-radius: 8px; 
                border-left: 4px solid #52c41a;
              "
            >
              <div style="font-weight: bold; margin-bottom: 4px;">{{ project.name }}</div>
              <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                {{ project.period }} | 担任：{{ project.role }}
              </div>
              <div style="font-size: 14px;">{{ project.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </VantTable>
</template>

<script setup>
import { ref } from 'vue'

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'department', label: '部门', width: 120 },
  { key: 'position', label: '职位', width: 150 },
  { key: 'salary', label: '薪资', width: 120, type: 'currency' }
])

const data = ref([
  { 
    id: 1, 
    name: '张三', 
    department: '技术部', 
    position: '前端工程师',
    salary: 25000,
    email: 'zhangsan@example.com',
    phone: '138-8888-8888',
    address: '北京市朝阳区xxx街道xxx号',
    joinDate: '2022-03-15',
    manager: '技术总监-陈总',
    experience: 5,
    performance: 'A',
    lastReview: '2024-01-15',
    skills: ['Vue.js', 'React', 'TypeScript', 'Node.js', 'Docker'],
    projects: [
      {
        name: '电商平台前端重构',
        period: '2023.06 - 2024.01',
        role: '技术负责人',
        description: '负责电商平台前端架构设计和核心功能开发，提升了页面性能30%。'
      },
      {
        name: '移动端H5开发',
        period: '2023.01 - 2023.05',
        role: '主要开发者',
        description: '开发移动端商城H5页面，实现了完整的购物流程和支付功能。'
      }
    ]
  },
  { 
    id: 2, 
    name: '李四', 
    department: '产品部', 
    position: '产品经理',
    salary: 28000,
    email: 'lisi@example.com',
    phone: '139-9999-9999',
    address: '上海市浦东新区xxx路xxx号',
    joinDate: '2021-08-20',
    manager: '产品总监-王总',
    experience: 8,
    performance: 'A+',
    lastReview: '2024-02-01',
    skills: ['产品设计', '需求分析', '用户研究', 'Axure', 'Figma'],
    projects: [
      {
        name: '用户增长策略制定',
        period: '2023.09 - 至今',
        role: '产品负责人',
        description: '制定并执行用户增长策略，通过数据分析和A/B测试提升用户留存率。'
      },
      {
        name: '新用户引导流程优化',
        period: '2023.03 - 2023.08',
        role: '产品经理',
        description: '重新设计新用户引导流程，将注册转化率提升了25%。'
      }
    ]
  }
])
</script>
```

## 表格与扩展行组合

```vue
<template>
  <VantTable 
    :headers="headers" 
    :data="data" 
    expandable
    selectable
    v-model:selected-keys="selectedKeys"
  >
    <template #expanded="{ row, rowIndex }">
      <div style="padding: 16px; background: linear-gradient(90deg, #f0f9ff 0%, #f8fafc 100%);">
        <!-- 订单详情表格 -->
        <h4 style="margin-bottom: 16px; color: #1890ff;">订单详情 #{{ row.orderNo }}</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">订单金额</div>
            <div style="font-size: 18px; font-weight: bold; color: #52c41a;">¥{{ row.amount.toLocaleString() }}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">商品数量</div>
            <div style="font-size: 18px; font-weight: bold; color: #1890ff;">{{ row.itemCount }} 件</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">配送地址</div>
            <div style="font-size: 14px;">{{ row.address }}</div>
          </div>
        </div>
        
        <!-- 商品列表 -->
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #fafafa;">
              <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e8e8e8;">商品</th>
              <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e8e8e8;">数量</th>
              <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e8e8e8;">单价</th>
              <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e8e8e8;">小计</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in row.items" :key="item.id">
              <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img :src="item.image" style="width: 40px; height: 40px; border-radius: 4px;" />
                  <div>
                    <div style="font-weight: bold; margin-bottom: 4px;">{{ item.name }}</div>
                    <div style="font-size: 12px; color: #666;">{{ item.specs }}</div>
                  </div>
                </div>
              </td>
              <td style="padding: 12px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                {{ item.quantity }}
              </td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f0f0f0;">
                ¥{{ item.price }}
              </td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f0f0f0; font-weight: bold;">
                ¥{{ (item.price * item.quantity).toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </VantTable>
  
  <div style="margin-top: 16px;">
    <p>已选择订单: {{ selectedKeys.join(', ') }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedKeys = ref([])

const headers = ref([
  { key: 'orderNo', label: '订单号', width: 120 },
  { key: 'customer', label: '客户', width: 120 },
  { key: 'amount', label: '订单金额', width: 120, type: 'currency' },
  { key: 'status', label: '状态', width: 100 },
  { key: 'createTime', label: '下单时间', width: 150 }
])

const data = ref([
  { 
    id: 1,
    orderNo: 'ORD001', 
    customer: '张三', 
    amount: 1299,
    status: '已发货',
    createTime: '2024-01-15 14:30',
    itemCount: 2,
    address: '北京市朝阳区xxx街道xxx号',
    items: [
      {
        id: 1,
        name: 'iPhone 15 手机壳',
        specs: '透明硅胶 | 6.1英寸',
        quantity: 1,
        price: 99,
        image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=100'
      },
      {
        id: 2,
        name: 'AirPods Pro 2',
        specs: '主动降噪 | 白色',
        quantity: 1,
        price: 1200,
        image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=100'
      }
    ]
  },
  { 
    id: 2,
    orderNo: 'ORD002', 
    customer: '李四', 
    amount: 2599,
    status: '待发货',
    createTime: '2024-01-16 09:15',
    itemCount: 1,
    address: '上海市浦东新区xxx路xxx号',
    items: [
      {
        id: 3,
        name: 'MacBook Air M2',
        specs: '13英寸 | 256GB | 午夜色',
        quantity: 1,
        price: 2599,
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100'
      }
    ]
  }
])
</script>
```

## 扩展行状态控制

```vue
<template>
  <div>
    <div style="margin-bottom: 16px;">
      <button @click="expandAll" style="margin-right: 8px;">全部展开</button>
      <button @click="collapseAll">全部收起</button>
    </div>
    
    <VantTable 
      ref="tableRef"
      :headers="headers" 
      :data="data" 
      expandable
      v-model:expanded-keys="expandedKeys"
    >
      <template #expanded="{ row }">
        <div style="padding: 16px; background-color: #f0f9ff;">
          <p><strong>备注：</strong>{{ row.remark }}</p>
          <p><strong>标签：</strong>{{ row.tags.join(', ') }}</p>
        </div>
      </template>
    </VantTable>
    
    <div style="margin-top: 16px;">
      <p>当前展开的行: {{ expandedKeys.join(', ') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tableRef = ref()
const expandedKeys = ref(['2']) // 默认展开第2行

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'title', label: '标题', width: 200 },
  { key: 'author', label: '作者', width: 120 },
  { key: 'category', label: '分类', width: 100 }
])

const data = ref([
  { 
    id: 1, 
    title: 'Vue.js 3.0 新特性详解', 
    author: '张三',
    category: '前端',
    remark: '这是一篇关于Vue.js 3.0新特性的详细介绍文章，包含Composition API、Teleport等重要特性。',
    tags: ['Vue.js', '前端框架', 'JavaScript']
  },
  { 
    id: 2, 
    title: 'TypeScript 实战指南', 
    author: '李四',
    category: '后端',
    remark: '从基础语法到高级应用，全面介绍TypeScript在实际项目中的应用。',
    tags: ['TypeScript', '类型系统', '编程语言']
  },
  { 
    id: 3, 
    title: 'React Hooks 深入浅出', 
    author: '王五',
    category: '前端',
    remark: 'React Hooks的原理分析和最佳实践，帮助开发者更好地理解和使用Hooks。',
    tags: ['React', 'Hooks', '状态管理']
  }
])

const expandAll = () => {
  expandedKeys.value = data.value.map(item => item.id.toString())
}

const collapseAll = () => {
  expandedKeys.value = []
}
</script>
```

## 扩展行最佳实践

### 1. 内容设计
- 将详细信息放在扩展行中，保持主表格的简洁
- 使用合理的信息层次结构
- 考虑内容的可读性和视觉层次

### 2. 性能优化
- 避免在扩展行中放置过于复杂的组件
- 使用懒加载机制，只在展开时加载详细数据
- 合理控制同时展开的行数

### 3. 用户体验
- 提供清晰的展开/收起视觉反馈
- 考虑添加展开/收起动画效果
- 在移动端确保扩展内容的可用性

### 4. 数据管理
- 合理设计数据结构，分离主要信息和详细信息
- 考虑扩展行状态的持久化需求
- 提供批量展开/收起功能