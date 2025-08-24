<template>
  <div style="padding: 20px;">
    <h1>VantTable 组件预览</h1>
    
    <div style="margin-bottom: 20px;">
      <h2>基础表格 - 支持上拉加载更多和复选框多行高亮</h2>
      <VantTable 
        :headers="columns" 
        :data="data"
        :selectable="true"
        :select-mode="'checkbox'"
        v-model:selected-keys="selectedKeys"
        @selection-change="handleSelectionChange"
        :enable-load-more="true"
        :show-load-more-ui="showLoadMoreUi"
        :load-more-loading="loadMoreLoading"
        :load-more-finished="loadMoreFinished"
        :load-more-error="loadMoreError"
        @load-more="handleLoadMore"
        highlight-color="#e6f4ff"
        selected-row-color="#f0f9ff"
        selected-row-border-color="#40a9ff"
        height="300px"
      />
    </div>

    <div style="margin-top: 20px;">
      <h3>选中的行：</h3>
      <pre>{{ JSON.stringify(selection, null, 2) }}</pre>
    </div>
    
    <div style="margin-top: 20px;">
      <h3>加载状态控制：</h3>
      <div style="display: flex; gap: 10px; align-items: center;">
        <button @click="toggleLoadMoreUi">{{ showLoadMoreUi ? '隐藏' : '显示' }}加载更多UI</button>
        <button @click="toggleLoadMoreLoading" :disabled="!showLoadMoreUi">{{ loadMoreLoading ? '停止' : '开始' }}加载</button>
        <button @click="toggleLoadMoreError" :disabled="!showLoadMoreUi">{{ loadMoreError ? '清除' : '模拟' }}错误</button>
        <button @click="toggleLoadMoreFinished" :disabled="!showLoadMoreUi">{{ loadMoreFinished ? '重置' : '标记' }}完成</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VantTable from '@cc/vant-table' // 真实的包名
import '@cc/vant-table/dist/index.css' // 真实的样式路径

const columns = ref([
  { key: 'id', label: 'ID', sortable: true,width: 90, filterable: true,fixed:'left' },
  { key: 'name', label: '姓名',sortable: true, width: 120,filterable: true },
  { key: 'email', label: '邮箱',sortable: true, width: 200,filterable: true },
  { key: 'phone', label: '电话',sortable: true, width: 150 ,filterable: true},
  { key: 'status', label: '状态',sortable: true, width: 100,filterable: true ,fixed:'right' }
])

const data = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', phone: '138001380001380013800013800138000', status: '正常' },
  { id: 2, name: '李四', email: 'lisi@example.com', phone: '13800138001', status: '正常' },
  { id: 3, name: '王五', email: 'wangwu@example.com', phone: '13800138002', status: '禁用' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', phone: '13800138003', status: '正常' },
  { id: 5, name: '钱七', email: 'qianqi@example.com', phone: '13800138004', status: '正常' },
  { id: 6, name: '孙八', email: 'sunba@example.com', phone: '13800138005', status: '正常' },
  { id: 7, name: '周九', email: 'zhoujiu@example.com', phone: '13800138006', status: '禁用' },
  { id: 8, name: '吴十', email: 'wushi@example.com', phone: '13800138007', status: '正常' }
])

const selection = ref([])
const selectedKeys = ref([])

// 加载更多相关状态
const showLoadMoreUi = ref(false)
const loadMoreLoading = ref(false)
const loadMoreFinished = ref(false)
const loadMoreError = ref(false)

const handleSelectionChange = (eventData: any) => {
  selectedKeys.value = eventData.selectedRowKeys || []
  selection.value = eventData.selectedRows || []
  console.log('选中的行发生变化:', eventData)
}

const handleLoadMore = () => {
  console.log('触发加载更多')
  loadMoreLoading.value = true
  loadMoreError.value = false
  
  // 模拟异步加载
  setTimeout(() => {
    const newData = [
      { id: data.value.length + 1, name: `新用户${data.value.length + 1}`, email: `user${data.value.length + 1}@example.com`, phone: `1380013${String(data.value.length + 1).padStart(4, '0')}`, status: '正常' },
      { id: data.value.length + 2, name: `新用户${data.value.length + 2}`, email: `user${data.value.length + 2}@example.com`, phone: `1380013${String(data.value.length + 2).padStart(4, '0')}`, status: '正常' }
    ]
    
    data.value.push(...newData)
    loadMoreLoading.value = false
    
    // 模拟加载完成
    if (data.value.length >= 20) {
      loadMoreFinished.value = true
    }
  }, 1500)
}

// 控制函数
const toggleLoadMoreUi = () => {
  showLoadMoreUi.value = !showLoadMoreUi.value
}

const toggleLoadMoreLoading = () => {
  loadMoreLoading.value = !loadMoreLoading.value
}

const toggleLoadMoreError = () => {
  loadMoreError.value = !loadMoreError.value
  if (loadMoreError.value) {
    loadMoreLoading.value = false
  }
}

const toggleLoadMoreFinished = () => {
  loadMoreFinished.value = !loadMoreFinished.value
  if (!loadMoreFinished.value) {
    loadMoreError.value = false
  }
}
</script>

<style scoped>
h1, h2, h3 {
  color: #333;
}

pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button:disabled:hover {
  border-color: #d9d9d9;
  color: inherit;
}
</style>