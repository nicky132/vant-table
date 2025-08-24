<template>
  <div class="demo-app">
    <!-- GitHub 链接 -->
    <a href="https://github.com/nicky132/vant-table" class="github-link" target="_blank">
      ⭐ GitHub
    </a>

    <!-- 头部 -->
    <div class="header">
      <h1>@nicky132/vant-table</h1>
      <p>基于 Vant UI 的功能丰富的表格组件</p>
      <div style="margin-top: 20px;">
        <a href="https://www.npmjs.com/package/@nicky132/vant-table" class="npm-link" target="_blank">
          📦 NPM
        </a>
        <a href="https://github.com/nicky132/vant-table" class="npm-link" target="_blank" style="background: #24292e;">
          📖 文档
        </a>
      </div>
    </div>

    <div class="demo-container">
      <!-- 基础表格演示 -->
      <div class="demo-card">
        <h2 class="demo-title">🚀 基础表格</h2>
        <p class="demo-description">展示基本的表格功能，包括数据展示和基础操作</p>
        <VantTable
          :headers="basicHeaders"
          :data="basicData"
          :height="300"
        />
      </div>

      <!-- 选择功能演示 -->
      <div class="demo-card">
        <h2 class="demo-title">🎯 多选功能</h2>
        <p class="demo-description">支持多选模式，可设置最大选择数量和选择过滤条件</p>
        <div style="margin-bottom: 15px; color: #666;">
          已选择: {{ selectedKeys.length }} 项 
          <span v-if="selectedKeys.length > 0">
            ({{ selectedKeys.join(', ') }})
          </span>
        </div>
        <VantTable
          :headers="selectionHeaders"
          :data="selectionData"
          :height="300"
          selectable
          select-mode="checkbox"
          :max-select-count="3"
          v-model:selected-keys="selectedKeys"
          @selection-change="handleSelectionChange"
        />
      </div>

      <!-- 固定列演示 -->
      <div class="demo-card">
        <h2 class="demo-title">📌 固定列</h2>
        <p class="demo-description">左右固定列功能，适合宽表格数据展示</p>
        <VantTable
          :headers="fixedHeaders"
          :data="fixedData"
          :height="300"
          :width="800"
        />
      </div>

      <!-- 排序和过滤演示 -->
      <div class="demo-card">
        <h2 class="demo-title">🔄 排序与过滤</h2>
        <p class="demo-description">支持列排序和高级过滤功能</p>
        <VantTable
          :headers="sortableHeaders"
          :data="sortableData"
          :height="300"
        />
      </div>

      <!-- 自定义渲染演示 -->
      <div class="demo-card">
        <h2 class="demo-title">🎨 自定义渲染</h2>
        <p class="demo-description">支持自定义单元格内容渲染</p>
        <VantTable
          :headers="customHeaders"
          :data="customData"
          :height="300"
        />
      </div>

      <!-- 安装和使用说明 -->
      <div class="demo-card">
        <h2 class="demo-title">📦 安装和使用</h2>
        <div class="code-section">
          <h3>安装</h3>
          <pre><code>npm install @nicky132/vant-table</code></pre>
          
          <h3>基本使用</h3>
          <pre><code>&lt;template&gt;
  &lt;VantTable
    :headers="headers"
    :data="data"
    :selectable="true"
    select-mode="checkbox"
    @selection-change="handleSelectionChange"
  /&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { VantTable } from '@nicky132/vant-table'
import '@nicky132/vant-table/dist/index.css'

const headers = [
  { key: 'id', label: 'ID', width: 100 },
  { key: 'name', label: '姓名', width: 120 }
]

const data = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
]
&lt;/script&gt;</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import VantTable from '../src/VantTable.vue'
import { Button } from 'vant'

// 基础表格数据
const basicHeaders = [
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '姓名', width: 100 },
  { key: 'department', label: '部门', width: 120 },
  { key: 'position', label: '职位', width: 120 },
  { key: 'salary', label: '薪资', width: 100 }
]

const basicData = [
  { id: 1, name: '张三', department: '技术部', position: '前端工程师', salary: '25000' },
  { id: 2, name: '李四', department: '产品部', position: '产品经理', salary: '28000' },
  { id: 3, name: '王五', department: '设计部', position: 'UI设计师', salary: '22000' },
  { id: 4, name: '赵六', department: '技术部', position: '后端工程师', salary: '26000' },
  { id: 5, name: '孙七', department: '运营部', position: '运营专员', salary: '18000' }
]

// 选择功能数据
const selectionHeaders = [...basicHeaders]
const selectionData = [...basicData]
const selectedKeys = ref([])

const handleSelectionChange = (event: any) => {
  console.log('选择变化:', event)
}

// 固定列数据
const fixedHeaders = [
  { key: 'id', label: 'ID', width: 80, fixed: 'left' },
  { key: 'name', label: '姓名', width: 100, fixed: 'left' },
  { key: 'department', label: '部门', width: 120 },
  { key: 'position', label: '职位', width: 120 },
  { key: 'salary', label: '薪资', width: 100 },
  { key: 'email', label: '邮箱', width: 200 },
  { key: 'phone', label: '电话', width: 150 },
  { key: 'address', label: '地址', width: 200 },
  { key: 'status', label: '状态', width: 100, fixed: 'right' }
]

const fixedData = basicData.map(item => ({
  ...item,
  email: `${item.name.toLowerCase()}@company.com`,
  phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
  address: '北京市朝阳区某某街道',
  status: Math.random() > 0.5 ? '在职' : '试用'
}))

// 排序过滤数据
const sortableHeaders = [
  { key: 'id', label: 'ID', width: 80, sortable: true },
  { key: 'name', label: '姓名', width: 100, filterable: true },
  { key: 'department', label: '部门', width: 120, filterable: true },
  { key: 'position', label: '职位', width: 120, filterable: true },
  { key: 'salary', label: '薪资', width: 100, sortable: true }
]

const sortableData = [...basicData]

// 自定义渲染数据
const customHeaders = [
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '姓名', width: 100 },
  { key: 'department', label: '部门', width: 120 },
  { 
    key: 'salary', 
    label: '薪资', 
    width: 120,
    renderCell: (value: string) => {
      const num = parseInt(value)
      const color = num >= 25000 ? '#52c41a' : num >= 20000 ? '#1890ff' : '#ff4d4f'
      return h('span', { 
        style: { 
          color, 
          fontWeight: 'bold',
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: color + '20'
        } 
      }, `¥${value}`)
    }
  },
  { 
    key: 'actions', 
    label: '操作', 
    width: 120,
    renderCell: () => {
      return h(Button, { 
        size: 'small', 
        type: 'primary',
        onClick: () => alert('点击了操作按钮')
      }, () => '编辑')
    }
  }
]

const customData = [...basicData]
</script>

<style scoped>
.demo-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  color: white;
  padding: 60px 20px 40px;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 15px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.header p {
  font-size: 1.3rem;
  opacity: 0.9;
  margin-bottom: 10px;
}

.demo-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.demo-title {
  font-size: 1.6rem;
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}

.demo-description {
  color: #666;
  margin-bottom: 25px;
  font-size: 1rem;
  line-height: 1.6;
}

.github-link {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.2);
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  text-decoration: none;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-weight: 600;
  z-index: 1000;
}

.github-link:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

.npm-link {
  display: inline-block;
  background: #cb3837;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  margin: 0 8px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.npm-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.code-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  font-family: 'Monaco', 'Consolas', monospace;
}

.code-section h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.code-section pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 20px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.code-section code {
  font-family: inherit;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2.2rem;
  }
  
  .header p {
    font-size: 1.1rem;
  }
  
  .demo-container {
    padding: 10px;
  }
  
  .demo-card {
    padding: 20px;
  }
  
  .github-link {
    position: relative;
    top: auto;
    right: auto;
    margin-bottom: 20px;
    display: inline-block;
  }
}
</style>