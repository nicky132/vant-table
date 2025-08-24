import { ref, computed } from 'vue'

/**
 * 表格选择功能逻辑
 */
export function useSelection(props, emit, filteredAndSortedData, getRowKey, isDevelopment, updateSelectionHighlight) {
  // 选择状态管理
  const selectedKeysSet = ref(new Set())

  // 计算属性：已选择的行数据
  const selectedRows = computed(() => {
    if (!props.selectable) return []
    return filteredAndSortedData.value.filter((row, index) => {
      const key = getRowKey(row, index)
      return selectedKeysSet.value.has(key)
    })
  })

  // 计算属性：已选择的行键
  const selectedRowKeys = computed(() => {
    return Array.from(selectedKeysSet.value)
  })

  // 单行选择处理
  const handleRowSelect = (row, rowIndex, checked) => {
    const key = getRowKey(row, rowIndex)
    
    if (checked) {
      selectedKeysSet.value.add(key)
    } else {
      selectedKeysSet.value.delete(key)
    }
    
    if (isDevelopment.value) {
      console.log('Row select:', {
        key,
        checked,
        selectedCount: selectedKeysSet.value.size
      })
    }
    
    // 发送选择变化事件
    const selectedKeysList = Array.from(selectedKeysSet.value)
    const selectedRowData = filteredAndSortedData.value.filter((row, index) => {
      const rowKey = getRowKey(row, index)
      return selectedKeysSet.value.has(rowKey)
    })
    
    emit('selection-change', {
      selectedRowKeys: selectedKeysList,
      selectedRows: selectedRowData,
      currentRow: row,
      currentRowKey: key,
      checked
    })

    // 🔑 新增：更新选中行的高亮显示
    if (updateSelectionHighlight && typeof updateSelectionHighlight === 'function') {
      updateSelectionHighlight(selectedRowData, getRowKey, filteredAndSortedData)
    }
  }

  // 行点击选择处理（当点击行时切换选择状态）
  const handleRowClick = (row, rowIndex) => {
    if (!props.selectable) return
    
    const key = getRowKey(row, rowIndex)
    const currentSelected = selectedKeysSet.value.has(key)
    handleRowSelect(row, rowIndex, !currentSelected)
  }

  // 全选/取消全选处理
  const handleSelectAll = (checked) => {
    if (checked) {
      // 全选：添加当前页所有行的key
      filteredAndSortedData.value.forEach((row, index) => {
        const key = getRowKey(row, index)
        selectedKeysSet.value.add(key)
      })
    } else {
      // 取消全选：清空所有选择
      selectedKeysSet.value.clear()
    }
    
    if (isDevelopment.value) {
      console.log('Select all:', {
        checked,
        selectedCount: selectedKeysSet.value.size
      })
    }
    
    // 计算选中的行数据
    const selectedRowData = filteredAndSortedData.value.filter((row, index) => {
      const rowKey = getRowKey(row, index)
      return selectedKeysSet.value.has(rowKey)
    })
    
    // 发送全选变化事件
    if (checked) {
      const selectedKeysList = Array.from(selectedKeysSet.value)
      
      emit('select-all', {
        selectedRowKeys: selectedKeysList,
        selectedRows: selectedRowData,
        checked: true
      })
    } else {
      const selectedKeysList = Array.from(selectedKeysSet.value)
      
      emit('select-all', {
        selectedRowKeys: selectedKeysList,
        selectedRows: selectedRowData,
        checked: false
      })
    }

    // 🔑 新增：更新选中行的高亮显示
    if (updateSelectionHighlight && typeof updateSelectionHighlight === 'function') {
      updateSelectionHighlight(selectedRowData, getRowKey, filteredAndSortedData)
    }
  }

  // 清除所有选择
  const clearSelection = () => {
    selectedKeysSet.value.clear()
    
    if (isDevelopment.value) {
      console.log('Clear all selections')
    }
    
    emit('selection-change', {
      selectedRowKeys: [],
      selectedRows: [],
      currentRow: null,
      currentRowKey: null,
      checked: false
    })

    // 🔑 新增：清除所有选中行的高亮显示
    if (updateSelectionHighlight && typeof updateSelectionHighlight === 'function') {
      updateSelectionHighlight([], getRowKey, filteredAndSortedData)
    }
  }

  // 检查行是否被选中
  const isRowSelected = (row, rowIndex) => {
    if (!props.selectable) return false
    const key = getRowKey(row, rowIndex)
    return selectedKeysSet.value.has(key)
  }

  // 检查行是否被禁用
  const isRowDisabled = (row, rowIndex) => {
    if (typeof props.disabledRowKeys === 'function') {
      return props.disabledRowKeys(row, rowIndex)
    }
    if (Array.isArray(props.disabledRowKeys)) {
      const key = getRowKey(row, rowIndex)
      return props.disabledRowKeys.includes(key)
    }
    return false
  }

  // 检查是否全选
  const isAllSelected = computed(() => {
    if (!props.selectable || filteredAndSortedData.value.length === 0) return false
    return filteredAndSortedData.value.every((row, index) => {
      const key = getRowKey(row, index)
      return selectedKeysSet.value.has(key)
    })
  })

  // 检查是否部分选择
  const isIndeterminate = computed(() => {
    if (!props.selectable || filteredAndSortedData.value.length === 0) return false
    const selectedCount = filteredAndSortedData.value.filter((row, index) => {
      const key = getRowKey(row, index)
      return selectedKeysSet.value.has(key)
    }).length
    return selectedCount > 0 && selectedCount < filteredAndSortedData.value.length
  })

  // 可选择的行（排除禁用行）
  const selectableRows = computed(() => {
    return filteredAndSortedData.value.filter((row, index) => !isRowDisabled(row, index))
  })

  // 检查是否所有行都被禁用
  const allRowsDisabled = computed(() => {
    if (filteredAndSortedData.value.length === 0) return true
    return filteredAndSortedData.value.every((row, index) => isRowDisabled(row, index))
  })

  // 处理单元格选择点击
  const handleCellSelect = (row, rowIndex, event) => {
    if (isRowDisabled(row, rowIndex)) return
    
    const currentlySelected = isRowSelected(row, rowIndex)
    handleRowSelect(row, rowIndex, !currentlySelected)
  }

  return {
    // 状态
    selectedKeysSet,
    selectedRows,
    selectedRowKeys,
    isAllSelected,
    isIndeterminate,
    selectableRows,
    allRowsDisabled,
    
    // 方法
    handleRowSelect,
    handleRowClick,
    handleSelectAll,
    clearSelection,
    isRowSelected,
    isRowDisabled,
    handleCellSelect
  }
}