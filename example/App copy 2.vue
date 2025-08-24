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
        :enable-load-more="showLoadMore"
        :show-load-more-ui="showLoadMoreUi"
        :load-more-loading="loadMoreLoading"
        :load-more-finished="loadMoreFinished"
        :load-more-error="loadMoreError"
        @load-more="handleLoadMore"
        highlight-color="#e6f4ff"
        selected-row-color="#e6f4ff"
        selected-row-border-color="#40a9ff"
        height="330px"
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
import { showToast, showConfirmDialog, showSuccessToast } from 'vant'
const columns = ref([
  { key: 'id', label: 'ID', sortable: true,width: 90, filterable: true,fixed:'left' },
  { key: 'name', label: '姓名',sortable: true, width: 120,filterable: true },
  { key: 'email', label: '邮箱',sortable: true, width: 200,filterable: true },
  { key: 'phone', label: '电话',sortable: true, width: 150 ,filterable: true},
  { key: 'status', label: '状态',sortable: true, width: 100,filterable: true },
  {
    key: 'actions',
    label: '操作',
    width: 100,
    align: 'center',
    fixed: 'right',
    renderCell: (value, row, column, rowIndex, colIndex, h) => {
      return h(
        'div',
        {
          style: {
            display: 'flex',
            gap: '4px',
            justifyContent: 'center'
          }
        },
        [
          h(
            'button',
            {
              style: {
                padding: '2px 6px',
                fontSize: '11px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                backgroundColor: '#fff',
                color: '#666',
                cursor: 'pointer'
              },
              onClick: e => {
                e.stopPropagation()
                // 手动触发行点击以确保高亮正确
                // 注意：这里我们可以通过ref调用表格的方法，但为了简化，先保持原样
                showToast(`编辑员工: ${row.name}`)
              }
            },
            '编辑'
          ),
          h(
            'button',
            {
              style: {
                padding: '2px 6px',
                fontSize: '11px',
                border: '1px solid #ff4d4f',
                borderRadius: '4px',
                backgroundColor: '#fff',
                color: '#ff4d4f',
                cursor: 'pointer'
              },
              onClick: e => {
                e.stopPropagation()
                handleSingleDelete(row)
              }
            },
            '删除'
          )
        ]
      )
    }
  }
])

const data = ref([
  { id: 1, name: '用户1', email: 'zhangsan@example.com', phone: '13800138001', status: '正常' },
  { id: 2, name: '用户2', email: 'lisi@example.com', phone: '13800138002', status: '正常' },
  { id: 3, name: '用户3', email: 'wangwu@example.com', phone: '13800138003', status: '禁用' },
  { id: 4, name: '用户4', email: 'zhaoliu@example.com', phone: '13800138004', status: '正常' },
  { id: 5, name: '用户5', email: 'qianqi@example.com', phone: '13800138005', status: '正常' },
  { id: 6, name: '用户6', email: 'sunba@example.com', phone: '13800138006', status: '正常' },
  { id: 7, name: '用户7', email: 'zhoujiu@example.comzhoujiu@example.comzhoujiu@example.comzhoujiu@example.comzhoujiu@example.com', phone: '13800138007', status: '禁用' },
  { id: 8, name: '用户8', email: 'wushi@example.com', phone: '13800138008', status: '正常' },
  { id: 9, name: '用户9', email: 'zhengshiyi@example.com', phone: '13800138009', status: '正常' },
  { id: 10, name: '用户10', email: 'wangshier@example.com', phone: '13800138010', status: '正常' },
  { id: 11, name: '用户11', email: 'lishisan@example.com', phone: '13800138011', status: '禁用' },
  { id: 12, name: '用户12', email: 'liushisi@example.com', phone: '13800138012', status: '正常' },
  { id: 13, name: '用户13', email: 'chenshiwu@example.com', phone: '13800138013', status: '正常' },
  { id: 14, name: '用户14', email: 'yangshiliu@example.com', phone: '13800138014', status: '正常' },
  { id: 15, name: '用户15', email: 'huangshiqi@example.com', phone: '13800138015', status: '禁用' },
  { id: 16, name: '用户16', email: 'linshiba@example.com', phone: '13800138016', status: '正常' },
  { id: 17, name: '用户17', email: 'zhoushijiu@example.com', phone: '13800138017', status: '正常' },
  { id: 18, name: '用户18', email: 'wuershi@example.com', phone: '13800138018', status: '正常' },
  { id: 19, name: '用户19', email: 'xuershiyi@example.com', phone: '13800138019', status: '禁用' },
  { id: 20, name: '用户20', email: 'sunershier@example.com', phone: '13800138020', status: '正常' },
  { id: 21, name: '用户21', email: 'zhuershisan@example.com', phone: '13800138021', status: '正常' },
  { id: 22, name: '用户22', email: 'maershisi@example.com', phone: '13800138022', status: '正常' },
  { id: 23, name: '用户23', email: 'huershiwu@example.com', phone: '13800138023', status: '禁用' },
  { id: 24, name: '用户24', email: 'guoershiliu@example.com', phone: '13800138024', status: '正常' },
  { id: 25, name: '用户25', email: 'heershiqi@example.com', phone: '13800138025', status: '正常' },
  { id: 26, name: '用户26', email: 'gaoershiba@example.com', phone: '13800138026', status: '正常' },
  { id: 27, name: '用户27', email: 'linershijiu@example.com', phone: '13800138027', status: '禁用' },
  { id: 28, name: '用户28', email: 'luosanshi@example.com', phone: '13800138028', status: '正常' },
  { id: 29, name: '用户29', email: 'songsanshiyi@example.com', phone: '13800138029', status: '正常' },
  { id: 30, name: '用户30', email: 'liangsanshier@example.com', phone: '13800138030', status: '正常' },
  { id: 31, name: '用户31', email: 'hansanshisan@example.com', phone: '13800138031', status: '禁用' },
  { id: 32, name: '用户32', email: 'fengsanshisi@example.com', phone: '13800138032', status: '正常' },
  { id: 33, name: '用户33', email: 'yusanshiwu@example.com', phone: '13800138033', status: '正常' },
  { id: 34, name: '用户34', email: 'dongsanshiliu@example.com', phone: '13800138034', status: '正常' },
  { id: 35, name: '用户35', email: 'xiaosanshiqi@example.com', phone: '13800138035', status: '禁用' },
  { id: 36, name: '用户36', email: 'chengsanshiba@example.com', phone: '13800138036', status: '正常' },
  { id: 37, name: '用户37', email: 'zengsanshijiu@example.com', phone: '13800138037', status: '正常' },
  { id: 38, name: '用户38', email: 'tiansishi@example.com', phone: '13800138038', status: '正常' },
  { id: 39, name: '用户39', email: 'yuansishiyi@example.com', phone: '13800138039', status: '禁用' },
  { id: 40, name: '用户40', email: 'dengsishier@example.com', phone: '13800138040', status: '正常' },
])

const selection = ref([])
const selectedKeys = ref([])
const operationHistory = ref([])
// 加载更多相关状态
const showLoadMore = ref(true)
const showLoadMoreUi = ref(false)
const loadMoreLoading = ref(false)
const loadMoreFinished = ref(false)
const loadMoreError = ref(false)

// 单个删除
const handleSingleDelete = async row => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除员工 ${row.name} 吗？`
    })

    data.value = data.value.filter(item => item.id !== row.id)
    selectedKeys.value = selectedKeys.value.filter(key => key !== row.id.toString())

    addOperationHistory('单个删除', `删除员工 ${row.name}`, 'delete')
    showSuccessToast(`成功删除员工 ${row.name}`)
  } catch (error) {
    console.log('用户取消删除')
  }
}

const addOperationHistory = (operation, detail, type = 'info') => {
  operationHistory.value.push({
    time: new Date().toLocaleTimeString(),
    operation,
    detail,
    type
  })
}

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
    const newData: any[] = []
    // 一次性加载10行数据
    for (let i = 1; i <= 10; i++) {
      newData.push({
        id: data.value.length + i,
        name: `新用户${data.value.length + i}`,
        email: `user${data.value.length + i}@example.com`,
        phone: `1380013${String(data.value.length + i).padStart(4, '0')}`,
        status: i % 3 === 0 ? '禁用' : '正常'
      })
    }
    
    data.value.push(...newData)
    loadMoreLoading.value = false
    
    // 模拟加载完成 - 可以继续加载更多数据
    // if (data.value.length >= 60) {
    //   loadMoreFinished.value = true
    // }
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