import { computed } from 'vue'

/**
 * 表格工具函数和样式计算
 */
export function useTableUtils(props, emit, columnsInfo, containerWidth, scrollLeft, hasHorizontalScrollbar, leftFixedTotalWidth, hasRightFixedColumns, scrollbarHandleWidth, scrollbarHandleLeft, isDragging, isScrollbarVisible, SCROLLBAR_HEIGHT) {

  // 数据处理工具函数
  const getCellValue = (row, key) => row[key]

  const isRowTotal = (row) => {
    return row[props.totalRowKey] === true
  }

  const formatCellValue = (value, column) => {
    if (value == null) return ''
    
    switch (column.type) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value
      case 'percent':
        return typeof value === 'number' ? `${value}%` : value
      case 'currency':
        return typeof value === 'number' ? `¥${value.toLocaleString()}` : value
      default:
        return value
    }
  }

  // 渲染函数工具
  const renderCell = (value, row, column, rowIndex, colIndex, h) => {
    if (typeof column.renderCell === 'function') {
      const result = column.renderCell(value, row, column, rowIndex, colIndex, h)
      if (result && typeof result === 'object' && result.type) {
        return result
      }
      if (typeof result === 'string' || typeof result === 'number') {
        return h('span', result)
      }
      return h('span', String(value || ''))
    }
    return h('span', String(value || ''))
  }

  // 滚动条样式计算
  const horizontalScrollbarContainerStyle = computed(() => {
    if (!hasHorizontalScrollbar.value) return { display: 'none' }

    return {
      position: 'absolute',
      bottom: '0px',
      left: 0,
      right: 0,
      height: `${SCROLLBAR_HEIGHT}px`,
      zIndex: 90,
      visibility: hasHorizontalScrollbar.value ? 'visible' : 'hidden',
      width: '100%',
      background: '#f5f5f5',
      borderTop: '0.5px solid var(--van-border-color)',
      pointerEvents: 'auto',
      boxShadow: '0 -1px 3px rgba(0,0,0,0.1)',
      zIndex: 999
    }
  })

  const scrollbarLeftCornerStyle = computed(() => {
    const width = leftFixedTotalWidth.value

    return {
      width: `${width}px`,
      height: `${SCROLLBAR_HEIGHT}px`,
      backgroundColor: '#f5f5f5',
      borderRight: width > 0 ? '1px solid var(--van-border-color)' : 'none',
      flexShrink: 0,
      cursor: width > 0 ? 'pointer' : 'default'
    }
  })

  const scrollbarRightCornerStyle = computed(() => {
    const rightWidth = hasRightFixedColumns.value ? columnsInfo.value.rightFixedWidth : 0

    return {
      width: `${rightWidth}px`,
      height: `${SCROLLBAR_HEIGHT}px`,
      backgroundColor: '#f5f5f5',
      borderLeft: rightWidth > 0 ? '1px solid var(--van-border-color)' : 'none',
      flexShrink: 0,
      display: 'block',
      cursor: rightWidth > 0 ? 'pointer' : 'default'
    }
  })

  const scrollbarWrapperStyle = computed(() => {
    return {
      position: 'absolute',
      left: '0',
      right: '0',
      top: '0',
      bottom: '0',
      height: `${SCROLLBAR_HEIGHT}px`,
      overflow: 'hidden',
      backgroundColor: 'rgba(249, 249, 249, 0.8)',
      cursor: 'pointer',
      width: '100%',
      border: '1px solid rgba(224, 224, 224, 0.6)',
      borderRadius: '8px',
      borderTop: 'none',
      boxSizing: 'border-box',
      backdropFilter: 'blur(2px)',
      transition: 'opacity 0.3s ease',
      opacity: isScrollbarVisible.value ? 1 : 0.7
    }
  })

  const scrollbarHandleStyle = computed(() => {
    const handleWidth = scrollbarHandleWidth.value
    const handleLeft = scrollbarHandleLeft.value

    // 🔧 调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 滚动条手柄样式计算:', {
        handleWidth,
        handleLeft,
        '完整样式': {
          left: `${handleLeft}px`,
          width: `${handleWidth}px`,
        }
      })
    }

    return {
      position: 'absolute',
      top: '2px',
      left: `${handleLeft}px`,
      width: `${handleWidth}px`,
      height: 'calc(100% - 4px)',
      cursor: isDragging.value ? 'grabbing' : 'grab',
      userSelect: 'none',
      transition: isDragging.value ? 'none' : 'left 0.1s ease, opacity 0.3s ease',
      borderRadius: '6px',
      opacity: isScrollbarVisible.value ? 0.9 : 0.6,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }
  })

  const scrollbarSpaceStyle = computed(() => {
    return {
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, rgba(232, 232, 232, 0.8) 0%, rgba(200, 200, 200, 0.9) 50%, rgba(232, 232, 232, 0.8) 100%)',
      border: '1px solid rgba(208, 208, 208, 0.6)',
      borderRadius: '6px',
      position: 'relative',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease',
      backdropFilter: 'blur(1px)'
    }
  })

  // 事件处理工具
  const handleCellClick = (row, column, rowIndex, colIndex, value, originalEvent) => {
    emit('cell-click', {
      row,
      column,
      rowIndex,
      colIndex,
      value,
      originalEvent
    })
  }

  const handleRowClick = (row, rowIndex, originalEvent) => {
    emit('row-click', {
      row,
      rowIndex,
      originalEvent
    })
  }

  // 批量操作工具
  const handleBatchDelete = (selectedRows, selectedRowKeys) => {
    if (selectedRows.length === 0) return

    emit('batch-delete', {
      selectedRows,
      selectedRowKeys
    })
  }

  return {
    // 数据处理工具
    getCellValue,
    isRowTotal,
    formatCellValue,
    renderCell,
    
    // 样式计算
    horizontalScrollbarContainerStyle,
    scrollbarLeftCornerStyle,
    scrollbarRightCornerStyle,
    scrollbarWrapperStyle,
    scrollbarHandleStyle,
    scrollbarSpaceStyle,
    
    // 事件处理
    handleCellClick,
    handleRowClick,
    handleBatchDelete
  }
}