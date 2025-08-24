import { ref } from 'vue'

/**
 * 行点击处理组合函数
 * 处理行点击、防抖、触摸事件冲突等逻辑
 */
export function useRowClickHandler(
  props, 
  emit, 
  isDevelopment,
  touchHandledRowIndex,
  selectedRowIndex,
  singleHighlightController,
  ensureSingleRowHighlight,
  isRowDisabled,
  isRowSelected,
  handleRowSelect
) {
  const lastRowClickTime = ref(0)
  const lastRowClickIndex = ref(-1)

  // 行点击处理 - 确保始终只有一行高亮
  const handleRowClickLocal = (row, rowIndex) => {
    const currentTime = Date.now()
    
    // 检查是否被触摸事件处理过，如果是则跳过
    if (touchHandledRowIndex.value === rowIndex) {
      if (isDevelopment.value) {
        console.log(`Row click ignored: row ${rowIndex} already handled by touch event`)
      }
      touchHandledRowIndex.value = -1 // 重置标记
      return
    }
    
    // 防抖：如果是相同行且在100ms内，则忽略
    if (lastRowClickIndex.value === rowIndex && currentTime - lastRowClickTime.value < 100) {
      if (isDevelopment.value) {
        console.log(`Row click ignored (debounce): row ${rowIndex}`)
      }
      return
    }
    
    lastRowClickTime.value = currentTime
    lastRowClickIndex.value = rowIndex

    if (isDevelopment.value) {
      console.log('Row clicked:', { 
        rowIndex, 
        previousSelected: selectedRowIndex.value
      })
    }

    // 使用单行高亮控制器强制执行单行高亮规则
    singleHighlightController.enforceSingleRowHighlight(rowIndex)
    
    // 核心逻辑：始终只有一行高亮
    ensureSingleRowHighlight(rowIndex)

    // 如果启用了点击行选择功能
    if (props.selectOnRowClick && props.selectable && !isRowDisabled(row, rowIndex)) {
      // 标记这是复选框操作（因为会触发复选框变化）
      singleHighlightController.markCheckboxOperation()
      const currentSelected = isRowSelected(row, rowIndex)
      handleRowSelect(row, rowIndex, !currentSelected)
    }

    // 触发行点击事件
    emit('row-click', { row, rowIndex })
  }

  // 处理批量删除
  const handleBatchDelete = (selectedRows, selectedRowKeys) => {
    if (selectedRows.value.length === 0) return

    emit('batch-delete', {
      selectedRows: selectedRows.value,
      selectedRowKeys: selectedRowKeys.value
    })
  }

  return {
    handleRowClickLocal,
    handleBatchDelete,
    lastRowClickTime,
    lastRowClickIndex
  }
}