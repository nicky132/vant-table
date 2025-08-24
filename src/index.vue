<template>
  <div class="demo-container">
    <div class="demo-header">
      <h2>VantTable 选择功能示例 - Table风格</h2>
      <div class="demo-controls">
        <van-button size="small" @click="toggleSelectable">
          {{ selectable ? '关闭' : '开启' }}选择功能
        </van-button>
        <van-button size="small" @click="toggleSelectMode">
          切换为{{ selectMode === 'checkbox' ? '单选' : '多选' }}模式
        </van-button>
        <van-button size="small" @click="toggleSelectOnRowClick">
          {{ selectOnRowClick ? '关闭' : '开启' }}点击行选择
        </van-button>
        <van-button size="small" @click="togglePreserveSelection">
          {{ preserveSelection ? '关闭' : '开启' }}保持选择状态
        </van-button>
        <van-button type="primary" size="small" @click="resetData" :loading="loading">
          重置数据
        </van-button>
      </div>
    </div>

    <div class="demo-content">
      <!-- 选择状态信息面板 -->
      <div v-if="selectable" class="selection-status">
        <van-notice-bar :text="selectionStatusText" background="#e6f7ff" color="#1989fa" />
      </div>

      <!-- 表格示例 -->
      <div class="demo-section">
        <h3>Table风格的表格选择功能</h3>
        <p class="demo-description">
          采用Table风格设计，支持方形复选框、更清晰的选中状态、优化的视觉反馈等功能。
          API保持简洁易用，视觉效果更加专业。
        </p>

        <VantTable
          ref="tableRef"
          :headers="tableHeaders"
          :data="tableData"
          :width="'100%'"
          :height="500"
          :min-width="800"
          :bordered="true"
          :striped="false"
          :expandable="true"
          :loading="loading"
          :enable-load-more="enableLoadMore"
          :show-load-more-ui="showLoadMoreUi"
          :load-more-loading="loadMoreLoading"
          :load-more-finished="loadMoreFinished"
          :load-more-error="loadMoreError"
          :load-more-offset="50"
          load-more-loading-text="正在加载更多数据..."
          load-more-finished-text="已经到底了~"
          load-more-error-text="加载失败，点击重试"
          @load-more="handleLoadMore"
          :selectable="selectable"
          :select-mode="selectMode"
          :select-on-row-click="selectOnRowClick"
          :preserve-selection="preserveSelection"
          :selectable-filter="selectableFilter"
          :max-select-count="maxSelectCount"
          :row-key="'id'"
          v-model:selected-keys="selectedKeys"
          @selection-change="handleSelectionChange"
          @select-all="handleSelectAll"
          @select="handleSelect"
          @batch-delete="handleBatchDelete"
          @sort-change="handleSort"
          @cell-click="handleCellClick"
          @row-click="handleRowClick"
          @expand-change="handleExpandChange">
          <!-- 展开行内容 -->
          <template #expanded="{ row }">
            <div class="custom-expand-content">
              <van-cell-group>
                <van-cell title="员工详情" :value="`${row.name} - ${row.position}`" />
                <van-cell title="部门信息" :value="row.department" />
                <van-cell title="薪资待遇" :value="`¥${row.salary?.toLocaleString()}`" />
                <van-cell title="绩效评分" :value="`${row.performance}分`" />
                <van-cell title="入职时间" :value="row.joinDate" />
                <van-cell title="工作状态" :value="row.status" />
              </van-cell-group>
            </div>
          </template>

          <!-- 自定义批量操作按钮 -->
          <template #selection-actions="{ selectedRows, selectedRowKeys, selectableRows }">
            <van-button type="primary" size="mini" @click="handleBatchEdit">
              批量编辑 ({{ selectedRows.length }})
            </van-button>
            <van-button type="warning" size="mini" @click="handleBatchExport">
              导出选中 ({{ selectedRows.length }})
            </van-button>
            <van-button type="danger" size="mini" @click="handleBatchDelete">
              批量删除 ({{ selectedRows.length }})
            </van-button>
          </template>
        </VantTable>
      </div>

      <!-- 操作信息面板 -->
      <div class="demo-info">
        <div class="selection-info">
          <h4>选择状态信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">选择模式:</span>
              <span class="info-value">{{ selectModeText }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">选中数量:</span>
              <span class="info-value">{{ selectedKeys.length }} / {{ selectableRowsCount }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最大选择:</span>
              <span class="info-value">{{ maxSelectCount || '不限制' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">选中率:</span>
              <span class="info-value">{{ selectionRate }}%</span>
            </div>
          </div>

          <div v-if="selectedKeys.length > 0" class="selected-list">
            <h5>选中的行ID:</h5>
            <div class="selected-keys">
              <van-tag
                v-for="key in selectedKeys.slice(0, 10)"
                :key="key"
                type="primary"
                size="small">
                {{ key }}
              </van-tag>
              <span v-if="selectedKeys.length > 10" class="more-count">
                +{{ selectedKeys.length - 10 }} 更多...
              </span>
            </div>
          </div>
        </div>

        <div class="operation-history">
          <h4>操作历史 (最近10次)</h4>
          <div class="history-list">
            <div
              v-for="(record, index) in operationHistory.slice(-10)"
              :key="index"
              class="history-item">
              <span class="history-time">{{ record.time }}</span>
              <span :class="['history-type', `history-type--${record.type}`]">
                {{ record.operation }}
              </span>
              <span class="history-detail">{{ record.detail }}</span>
            </div>
            <div v-if="operationHistory.length === 0" class="history-empty">暂无操作历史</div>
          </div>
        </div>

        <!-- 快速操作按钮 -->
        <div class="quick-actions">
          <h4>快速操作 - VTable API风格</h4>
          <div class="action-buttons">
            <van-button size="small" @click="selectFirst5">选择前5行</van-button>
            <van-button size="small" @click="selectByDepartment('技术部')">选择技术部</van-button>
            <van-button size="small" @click="selectHighSalary">选择高薪员工</van-button>
            <van-button size="small" @click="clearAllSelection">清空选择</van-button>
            <van-button size="small" @click="selectAllCurrentPage">全选当前页</van-button>
            <van-button size="small" @click="invertSelection">反选</van-button>
            <van-button size="small" type="primary" @click="setMaxSelectCount">
              设置最大选择数 (5)
            </van-button>
            <van-button size="small" @click="removeMaxSelectCount">取消限制</van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VantTable from './VantTable.vue'
import { showToast, showConfirmDialog, showSuccessToast } from 'vant'

// ========== 响应式数据 ==========
const loading = ref(false)
const showLoadMoreUi = ref(false)
const enableLoadMore = ref(true)
const loadMoreLoading = ref(false)
const loadMoreFinished = ref(false)
const loadMoreError = ref(false)
const selectable = ref(true)
const selectMode = ref('checkbox') // 'checkbox' | 'radio'
const selectOnRowClick = ref(false)
const preserveSelection = ref(false)
const maxSelectCount = ref(0) // 0表示不限制
const selectedKeys = ref([])
const tableData = ref([])
const operationHistory = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalPages = ref(10) // 模拟总共10页数据
const loadHistory = ref([])
const activeFilters = ref({})
// 表格引用
const tableRef = ref(null)

// ========== 计算属性 ==========
const selectModeText = computed(() => {
  return selectMode.value === 'checkbox' ? '多选模式' : '单选模式'
})

const selectableRowsCount = computed(() => {
  return tableData.value.filter((row, index) => selectableFilter(row, index)).length
})

const selectionRate = computed(() => {
  if (selectableRowsCount.value === 0) return 0
  return Math.round((selectedKeys.value.length / selectableRowsCount.value) * 100)
})

const selectionStatusText = computed(() => {
  return `选择功能已启用 (${selectModeText.value})，当前选中 ${
    selectedKeys.value.length
  } 项，可选择 ${selectableRowsCount.value} 项${
    maxSelectCount.value > 0 ? `，最大可选 ${maxSelectCount.value} 项` : ''
  }`
})

// ========== 表格配置 ==========
const tableHeaders = ref([
  {
    key: 'id',
    label: 'ID',
    fixed: 'left',
    width: 100,
    sortable: true,
    align: 'center',
    filterable: true,
    renderCell: (value, row, column, rowIndex, colIndex, h) => {
      return h(
        'div',
        {
          style: {
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: value % 2 === 0 ? '#e6f7ff' : '#f6ffed',
            color: value % 2 === 0 ? '#1890ff' : '#52c41a',
            fontWeight: 'bold',
            textAlign: 'center'
          }
        },
        `#${value}`
      )
    }
  },
  {
    key: 'name',
    label: '姓名',
    width: 120,
    fixed: 'left',
    sortable: true,
    align: 'left',
    filterable: true
  },
  {
    key: 'department',
    label: '部门',
    sortable: true,
    align: 'left',
    filterable: true,
    renderCell: (value, row, column, rowIndex, colIndex, h) => {
      const departmentIcons = {
        技术部: '💻',
        产品部: '📱',
        设计部: '🎨',
        运营部: '📊',
        市场部: '📈',
        人事部: '👥',
        财务部: '💰'
      }

      return h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }
        },
        [h('span', departmentIcons[value] || '🏢'), h('span', value)]
      )
    }
  },
  {
    key: 'position',
    label: '职位',
    sortable: true,
    align: 'left',
    filterable: true
  },
  {
    key: 'salary',
    label: '薪资',
    sortable: true,
    showDataBar: true,
    align: 'right',
    type: 'currency',
    filterable: true,
    renderCell: (value, row, column, rowIndex, colIndex, h) => {
      let color = '#666'
      if (value >= 30000) color = '#52c41a'
      else if (value >= 20000) color = '#1890ff'
      else color = '#fa8c16'

      return h(
        'span',
        {
          style: {
            color: color,
            fontWeight: 'bold'
          }
        },
        `¥${value.toLocaleString()}`
      )
    }
  },
  {
    key: 'performance',
    label: '绩效评分',
    sortable: true,
    align: 'right',
    type: 'number',
    renderCell: (value, row, column, rowIndex, colIndex, h) => {
      const stars = Math.floor(value / 20)
      const fullStars = '★'.repeat(stars)
      const emptyStars = '☆'.repeat(5 - stars)

      return h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }
        },
        [
          h(
            'span',
            {
              style: {
                color: '#faad14',
                fontSize: '12px'
              }
            },
            fullStars + emptyStars
          ),
          h(
            'span',
            {
              style: {
                fontSize: '11px',
                color: '#999'
              }
            },
            `(${value})`
          )
        ]
      )
    }
  },
  {
    key: 'joinDate',
    label: '入职日期',
    width: 120,
    sortable: true,
    align: 'center',
    filterable: true
  },
  {
    key: 'status',
    label: '状态',
    width: 100,
    fixed: 'right',
    align: 'center',
    filterable: true,
    renderCell: (value, row, column, rowIndex, colIndex, h) => {
      const statusConfig = {
        在职: { color: '#52c41a', bgColor: '#f6ffed' },
        试用: { color: '#1890ff', bgColor: '#e6f7ff' },
        离职: { color: '#999', bgColor: '#f5f5f5' }
      }

      const config = statusConfig[value] || statusConfig['在职']

      return h(
        'span',
        {
          style: {
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: config.bgColor,
            color: config.color,
            fontSize: '11px',
            fontWeight: '500'
          }
        },
        value
      )
    }
  },
  {
    key: 'actions',
    label: '操作',
    width: 120,
    fixed: 'right',
    align: 'center',
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

// ========== 选择功能配置 ==========

// 选择过滤函数 - 离职员工不可选择
const selectableFilter = (row, index) => {
  return row.status !== '离职'
}

// ========== 数据生成 ==========
const generateData = () => {
  const departments = ['技术部', '产品部', '设计部', '运营部', '市场部', '人事部', '财务部']
  const positions = [
    '工程师',
    '高级工程师',
    '技术专家',
    '产品经理',
    '设计师',
    '运营专员',
    '市场专员'
  ]
  const statuses = ['在职', '试用', '离职']

  return Array.from({ length: 50 }, (_, i) => {
    const id = i + 1
    return {
      id,
      name: `员工${id.toString().padStart(3, '0')}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      salary: Math.floor(Math.random() * 50000) + 8000,
      performance: Math.floor(Math.random() * 41) + 60,
      joinDate: new Date(
        2020 + Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      )
        .toISOString()
        .split('T')[0],
      status: statuses[Math.floor(Math.random() * 3)]
    }
  })
}

// 生成模拟数据
const generatePageData = (count = 20) => {
  const departments = ['技术部', '产品部', '设计部', '运营部', '市场部', '人事部', '财务部']
  const positions = [
    '工程师',
    '高级工程师',
    '技术专家',
    '产品经理',
    '设计师',
    '运营专员',
    '市场专员'
  ]
  const statuses = ['在职', '试用', '离职']

  // 获取当前数据中的最大ID，确保新ID连续
  const maxId = tableData.value.length > 0 
    ? Math.max(...tableData.value.map(row => row.id))
    : 0

  return Array.from({ length: count }, (_, i) => {
    const id = maxId + i + 1  // 基于最大ID递增，确保连续性
    return {
      id,
      name: `员工${id.toString().padStart(3, '0')}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      salary: Math.floor(Math.random() * 50000) + 8000,
      performance: Math.floor(Math.random() * 41) + 60,
      joinDate: new Date(
        2020 + Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      )
        .toISOString()
        .split('T')[0],
      status: statuses[Math.floor(Math.random() * 3)]
    }
  })
}


// 添加操作历史记录
const addLoadHistory = (status, message) => {
  loadHistory.value.push({
    time: new Date().toLocaleTimeString(),
    status,
    message
  })
}

// ========== 操作历史管理 ==========
const addOperationHistory = (operation, detail, type = 'info') => {
  operationHistory.value.push({
    time: new Date().toLocaleTimeString(),
    operation,
    detail,
    type
  })
}

// ========== 事件处理函数 ==========

// 选择变化事件
const handleSelectionChange = eventData => {
  console.log('选择变化:', eventData)
  const { selectedRowKeys, selectedRows, selectableRows } = eventData
  addOperationHistory(
    '选择变化',
    `当前选中 ${selectedRowKeys.length} 项 / 可选 ${selectableRows.length} 项`,
    'selection'
  )
}

// 全选事件
const handleSelectAll = eventData => {
  console.log('全选变化:', eventData)
  const { checked, selectedRowKeys, selectedRows, selectableRows } = eventData
  addOperationHistory(
    '全选操作',
    `${checked ? '全选' : '取消全选'} ${selectedRowKeys.length} 项 / 可选 ${
      selectableRows.length
    } 项`,
    'select-all'
  )
  showToast(`${checked ? '已全选' : '已取消全选'} ${selectedRowKeys.length} 项`)
}

// 单选事件
const handleSelect = eventData => {
  console.log('单选变化:', eventData)
  const { row, selected, selectedRowKeys } = eventData
  addOperationHistory(
    '单选操作',
    `${selected ? '选中' : '取消选中'} ${row.name}，当前选中 ${selectedRowKeys.length} 项`,
    'select'
  )
}

// 批量删除事件
const handleBatchDelete = eventData => {
  console.log('批量删除:', eventData)
  const { selectedRows, selectedRowKeys } = eventData || { selectedRows: [], selectedRowKeys: [] }

  if (selectedRowKeys.length === 0) {
    showToast('请先选择要删除的数据')
    return
  }

  showConfirmDialog({
    title: '确认删除',
    message: `确定要删除选中的 ${selectedRowKeys.length} 条数据吗？此操作不可撤销。`
  })
    .then(() => {
      // 模拟删除操作
      tableData.value = tableData.value.filter(row => !selectedRowKeys.includes(row.id.toString()))
      selectedKeys.value = []

      addOperationHistory('批量删除', `成功删除 ${selectedRowKeys.length} 条数据`, 'delete')
      showSuccessToast(`成功删除 ${selectedRowKeys.length} 条数据`)
    })
    .catch(() => {
      console.log('用户取消删除')
    })
}

// 批量编辑
const handleBatchEdit = () => {
  if (selectedKeys.value.length === 0) {
    showToast('请先选择要编辑的数据')
    return
  }

  addOperationHistory('批量编辑', `编辑 ${selectedKeys.value.length} 条数据`, 'edit')
  showToast(`批量编辑 ${selectedKeys.value.length} 条数据`)
}

// 批量导出
const handleBatchExport = () => {
  if (selectedKeys.value.length === 0) {
    showToast('请先选择要导出的数据')
    return
  }

  // 模拟导出
  const selectedRowData = tableData.value.filter(row =>
    selectedKeys.value.includes(row.id.toString())
  )

  const exportData = selectedRowData.map(row => ({
    ID: row.id,
    姓名: row.name,
    部门: row.department,
    职位: row.position,
    薪资: row.salary,
    绩效: row.performance,
    入职日期: row.joinDate,
    状态: row.status
  }))

  console.log('导出数据:', exportData)
  addOperationHistory('批量导出', `导出 ${selectedKeys.value.length} 条数据`, 'export')
  showToast(`成功导出 ${selectedKeys.value.length} 条数据`)
}

// 单个删除
const handleSingleDelete = async row => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除员工 ${row.name} 吗？`
    })

    tableData.value = tableData.value.filter(item => item.id !== row.id)
    selectedKeys.value = selectedKeys.value.filter(key => key !== row.id.toString())

    addOperationHistory('单个删除', `删除员工 ${row.name}`, 'delete')
    showSuccessToast(`成功删除员工 ${row.name}`)
  } catch (error) {
    console.log('用户取消删除')
  }
}

// 关键修复4: 改进的加载更多处理
const handleLoadMore = async () => {
  if (loadMoreLoading.value || loadMoreFinished.value) {
    return
  }

  console.log('触发加载更多，当前页:', currentPage.value)
  addLoadHistory('loading', `开始加载第 ${currentPage.value + 1} 页数据`)

  loadMoreLoading.value = true
  loadMoreError.value = false

  try {
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 模拟20%的概率出现错误（如果不是手动模拟错误的话）
    if (Math.random() < 0.2 && !loadMoreError.value) {
      throw new Error('网络请求失败')
    }

    currentPage.value++

    // 检查是否还有更多数据
    if (currentPage.value >= totalPages.value) {
      loadMoreFinished.value = true
      addLoadHistory('finished', '所有数据加载完成')
      showToast('所有数据已加载完成')
    } else {
      // 生成新数据并添加到现有数据中
      const newData = generatePageData(pageSize.value)

      // 关键修复：在更新数据前清理DOM状态
      if (tableRef.value?.forceDOMCleanup) {
        tableRef.value.forceDOMCleanup()
      }

      tableData.value.push(...newData)

      addLoadHistory(
        'success',
        `第 ${currentPage.value} 页数据加载成功，新增 ${newData.length} 条记录`
      )
      showToast(`加载成功，新增 ${newData.length} 条数据`)

      // 关键修复：数据更新后的处理流程
      setTimeout(() => {
        // 对所有表格实例都强制重新对齐
        if (tableRef.value?.forceRealign) {
          tableRef.value.forceRealign()
        }
      }, 100)

      // 第二次确认对齐
      setTimeout(() => {
        if (tableRef.value?.measureAndSyncAllHeights) {
          tableRef.value.measureAndSyncAllHeights()
        }
      }, 300)

      // 第三次最终确认
      setTimeout(() => {
        if (tableRef.value?.measureAndSyncAllHeights) {
          tableRef.value.measureAndSyncAllHeights()
        }

        // 验证DOM一致性
        const mainRowCount = document.querySelectorAll(
          '.vant-table-body .vant-tbody tr[data-row-index]'
        ).length
        const leftRowCount = document.querySelectorAll(
          '.vant-table-fixed--left .vant-tbody tr[data-row-index]'
        ).length

        console.log('加载更多后DOM验证:', {
          数据行数: tableData.value.length,
          主表格行数: mainRowCount,
          左固定列行数: leftRowCount,
          是否一致: mainRowCount === leftRowCount && mainRowCount === tableData.value.length
        })

        if (mainRowCount !== leftRowCount) {
          console.warn('加载更多后DOM仍不一致，再次强制修复')
          if (tableRef.value?.forceDOMCleanup) {
            tableRef.value.forceDOMCleanup()
          }
          setTimeout(() => {
            if (tableRef.value?.measureAndSyncAllHeights) {
              tableRef.value.measureAndSyncAllHeights()
            }
          }, 100)
        }
      }, 600)
    }
    // 数据更新后，强制同步所有区域
    if (tableRef.value?.forceAllAreaSync) {
      tableRef.value.forceAllAreaSync()
    }
  } catch (error) {
    loadMoreError.value = true
    addLoadHistory('error', `第 ${currentPage.value + 1} 页数据加载失败: ${error.message}`)
    console.error('加载更多失败:', error)
    showToast('加载失败，请重试')
  } finally {
    loadMoreLoading.value = false
  }
}

// 其他事件处理
const handleSort = sortInfo => {
  console.log('排序:', sortInfo)
  addOperationHistory(
    '排序操作',
    `按 ${sortInfo.column.label} ${sortInfo.direction === 'asc' ? '升序' : '降序'} 排列`,
    'sort'
  )
}

const handleCellClick = cellInfo => {
  console.log('单元格点击:', cellInfo)
}

const handleRowClick = rowInfo => {
  console.log('行点击:', rowInfo)
}

const handleExpandChange = expandInfo => {
  console.log('扩展变化:', expandInfo)
  addOperationHistory(
    '展开操作',
    `${expandInfo.expanded ? '展开' : '收起'}第 ${expandInfo.rowIndex + 1} 行`,
    'expand'
  )
}

// ========== 控制功能 ==========

const toggleSelectable = () => {
  selectable.value = !selectable.value
  if (!selectable.value) {
    selectedKeys.value = []
  }
  addOperationHistory('功能切换', `${selectable.value ? '启用' : '禁用'}选择功能`, 'toggle')
  showToast(`${selectable.value ? '已启用' : '已禁用'}选择功能`)
}

const toggleSelectMode = () => {
  selectMode.value = selectMode.value === 'checkbox' ? 'radio' : 'checkbox'
  selectedKeys.value = [] // 切换模式时清空选择
  addOperationHistory('功能切换', `切换为${selectModeText.value}`, 'toggle')
  showToast(`已切换为${selectModeText.value}`)
}

const toggleSelectOnRowClick = () => {
  selectOnRowClick.value = !selectOnRowClick.value
  addOperationHistory('功能切换', `${selectOnRowClick.value ? '启用' : '禁用'}点击行选择`, 'toggle')
  showToast(`${selectOnRowClick.value ? '已启用' : '已禁用'}点击行选择`)
}

const togglePreserveSelection = () => {
  preserveSelection.value = !preserveSelection.value
  addOperationHistory(
    '功能切换',
    `${preserveSelection.value ? '启用' : '禁用'}保持选择状态`,
    'toggle'
  )
  showToast(`${preserveSelection.value ? '已启用' : '已禁用'}保持选择状态`)
}

// ========== 快速操作 ==========

const selectFirst5 = () => {
  if (!tableRef.value) return

  const first5Keys = tableData.value
    .slice(0, 5)
    .filter(row => selectableFilter(row))
    .map(row => row.id.toString())

  tableRef.value.setSelectedRowKeys(first5Keys)
  addOperationHistory('快速选择', `选择前5行，共 ${first5Keys.length} 项`, 'quick')
  showToast(`已选择前5行`)
}

const selectByDepartment = department => {
  if (!tableRef.value) return

  const departmentKeys = tableData.value
    .filter(row => row.department === department && selectableFilter(row))
    .map(row => row.id.toString())

  tableRef.value.setSelectedRowKeys(departmentKeys)
  addOperationHistory('快速选择', `选择${department}员工，共 ${departmentKeys.length} 项`, 'quick')
  showToast(`已选择${department}的 ${departmentKeys.length} 名员工`)
}

const selectHighSalary = () => {
  if (!tableRef.value) return

  const highSalaryKeys = tableData.value
    .filter(row => row.salary >= 25000 && selectableFilter(row))
    .map(row => row.id.toString())

  tableRef.value.setSelectedRowKeys(highSalaryKeys)
  addOperationHistory('快速选择', `选择高薪员工，共 ${highSalaryKeys.length} 项`, 'quick')
  showToast(`已选择 ${highSalaryKeys.length} 名高薪员工`)
}

const clearAllSelection = () => {
  if (!tableRef.value) return

  const prevCount = selectedKeys.value.length
  tableRef.value.clearSelection()
  addOperationHistory('快速操作', `清空选择，清除 ${prevCount} 项`, 'clear')
  showToast('已清空所有选择')
}

const selectAllCurrentPage = () => {
  if (!tableRef.value) return

  tableRef.value.selectAllCurrentPage()
  addOperationHistory('快速选择', `全选当前页`, 'select-all')
}

const invertSelection = () => {
  if (!tableRef.value) return

  tableRef.value.invertSelection()
  addOperationHistory('快速操作', `反选操作`, 'invert')
}

const setMaxSelectCount = () => {
  maxSelectCount.value = 5
  // 如果当前选择超过限制，截取前N个
  if (selectedKeys.value.length > 5) {
    selectedKeys.value = selectedKeys.value.slice(0, 5)
  }
  addOperationHistory('功能设置', '设置最大选择数为5', 'setting')
  showToast('已设置最大选择数为5')
}

const removeMaxSelectCount = () => {
  maxSelectCount.value = 0
  addOperationHistory('功能设置', '取消最大选择数限制', 'setting')
  showToast('已取消最大选择数限制')
}

const resetData = async () => {
  loading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 800))

    tableData.value = generateData()
    selectedKeys.value = []
    operationHistory.value = []

    addOperationHistory('数据重置', '重新生成数据', 'reset')
    showToast('数据重置成功')
  } finally {
    loading.value = false
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  tableData.value = generateData()
  addOperationHistory('初始化', '表格数据初始化完成', 'init')
})
</script>

<style scoped>
.demo-container {
  padding: 20px;
  background: #fafafa;
  min-height: 100vh;
}

.demo-header {
  margin-bottom: 20px;
}

.demo-header h2 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.demo-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.demo-content {
  margin-bottom: 20px;
}

.selection-status {
  margin-bottom: 16px;
}

.demo-section {
  margin-bottom: 30px;
}

.demo-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.demo-description {
  margin: 0 0 12px 0;
  color: #999;
  font-size: 12px;
  line-height: 18px;
}

.demo-section .vant-table-wrapper {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selection-info,
.operation-history,
.quick-actions {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.selection-info h4,
.operation-history h4,
.quick-actions h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  color: #666;
  font-size: 12px;
  min-width: 80px;
}

.info-value {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.selected-list {
  margin-top: 12px;
}

.selected-list h5 {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 12px;
  font-weight: 500;
}

.selected-keys {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.more-count {
  color: #999;
  font-size: 12px;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-time {
  font-size: 12px;
  color: #999;
  min-width: 80px;
}

.history-type {
  font-size: 12px;
  font-weight: 500;
  min-width: 80px;
}

.history-type--selection {
  color: #1890ff;
}

.history-type--select-all {
  color: #52c41a;
}

.history-type--select {
  color: #722ed1;
}

.history-type--delete {
  color: #ff4d4f;
}

.history-type--edit {
  color: #fa8c16;
}

.history-type--export {
  color: #13c2c2;
}

.history-type--quick {
  color: #eb2f96;
}

.history-type--clear {
  color: #fa541c;
}

.history-type--invert {
  color: #722ed1;
}

.history-type--toggle {
  color: #52c41a;
}

.history-type--setting {
  color: #722ed1;
}

.history-type--sort {
  color: #1890ff;
}

.history-type--expand {
  color: #13c2c2;
}

.history-type--reset {
  color: #fa8c16;
}

.history-type--init {
  color: #666;
}

.history-detail {
  font-size: 12px;
  color: #666;
  flex: 1;
}

.history-empty {
  padding: 20px 0;
  text-align: center;
  color: #999;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.custom-expand-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .demo-container {
    padding: 16px;
  }

  .demo-header h2 {
    font-size: 18px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .demo-controls {
    justify-content: flex-start;
  }

  .action-buttons {
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .demo-controls {
    gap: 6px;
  }

  .demo-controls .van-button {
    font-size: 12px;
    padding: 6px 12px;
  }

  .selected-keys {
    gap: 4px;
  }

  .action-buttons .van-button {
    font-size: 12px;
  }
}
</style>
