import { computed, ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useHighlightController } from './useHighlightController.js'
import { useRowClickHandler } from './useRowClickHandler.js'
import { useDataProcessor } from './useDataProcessor.js'
import { useStyleUpdater } from './useStyleUpdater.js'

/**
 * VantTable 核心组合函数
 * 整合表格的主要逻辑，减少主文件的复杂度
 */
export function useVantTableCore(
  props,
  emit,
  refs,
  composableResults
) {
  const isDevelopment = ref(process.env.NODE_ENV === 'development')

  // 解构必要的 refs
  const {
    layoutWrapperRef,
    bodyRef,
    headerRef,
    leftBodyWrapperRef,
    rightBodyWrapperRef
  } = refs

  // 解构组合函数返回的数据
  const {
    filteredAndSortedData,
    activeFilters,
    sortConfig,
    getCellValue,
    isRowTotal,
    columnsInfo,
    containerWidth,
    scrollLeft,
    hasLeftFixedContent,
    hasRightFixedColumns,
    leftFixedTotalWidth,
    showHorizontalScrollbar,
    hoveredRowIndex,
    selectedRowIndex,
    isRowDisabled,
    isRowSelected,
    handleRowSelect,
    selectedRows,
    selectedRowKeys,
    ensureSingleRowHighlight,
    touchHandledRowIndex
  } = composableResults

  // 数据处理
  const { filteredAndSortedData: processedData, hasActiveFilters } = useDataProcessor(
    props,
    activeFilters,
    sortConfig,
    getCellValue,
    isRowTotal
  )

  // 高亮控制
  const { createSingleHighlightController, monitorHighlightState } = useHighlightController(isDevelopment)
  const singleHighlightController = createSingleHighlightController()

  // 行点击处理
  const {
    handleRowClickLocal,
    handleBatchDelete,
    lastRowClickTime,
    lastRowClickIndex
  } = useRowClickHandler(
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
  )

  // 样式更新
  const { updateShadowState, updateContainerWidth } = useStyleUpdater(
    props,
    columnsInfo,
    containerWidth,
    scrollLeft,
    hasLeftFixedContent,
    hasRightFixedColumns,
    leftFixedTotalWidth,
    showHorizontalScrollbar,
    layoutWrapperRef,
    bodyRef,
    headerRef,
    leftBodyWrapperRef,
    rightBodyWrapperRef
  )

  // 单元格点击处理逻辑
  const handleCellClick = (row, header, rowIndex, colIndex, event) => {
    if (isDevelopment.value) {
      console.log('Cell clicked:', { rowIndex, headerKey: header.key })
    }
    
    // 检查是否点击的是复选框区域或编辑按钮
    const isCheckboxClick = event?.target?.closest('.vant-table-checkbox, .vant-table-radio, .vant-td--selection')
    const isEditButtonClick = event?.target?.closest('button, .van-button, [role="button"], .edit-btn, .action-btn')
    
    // 单行高亮控制逻辑：只要不是复选框点击或编辑按钮点击，就强制只有一行高亮
    if (!isCheckboxClick && !isEditButtonClick) {
      // 立即清除所有现有高亮（包括所有可能的高亮样式）
      const allHighlightClasses = ['.vant-tr--selected', '.vant-tr--hover', '.vant-tr--active', '.vant-tr--highlighted', '.vant-tr--checkbox-selected']
      allHighlightClasses.forEach(className => {
        document.querySelectorAll(className).forEach(el => {
          el.classList.remove(className.substring(1))
        })
      })
      
      // 只高亮当前点击的行（所有区域：主表格、左固定列、右固定列）
      document.querySelectorAll(`[data-row-index="${rowIndex}"]`).forEach(el => {
        if (el.classList.contains('vant-tr')) {
          el.classList.add('vant-tr--selected')
        }
      })
      
      // 更新状态
      selectedRowIndex.value = rowIndex
      
      if (isDevelopment.value) {
        console.log(`🎯 单行高亮控制: 第${rowIndex}行`)
      }
    } else {
      if (isDevelopment.value) {
        console.log(`🚫 复选框或编辑按钮点击，跳过单行高亮控制`)
      }
    }
    
    // 检查是否被触摸事件处理过，如果是则跳过行高亮处理
    if (touchHandledRowIndex.value === rowIndex) {
      if (isDevelopment.value) {
        console.log(`Cell click ignored: row ${rowIndex} already handled by touch event`)
      }
      // 仍然触发单元格点击事件，但跳过行高亮
      emit('cell-click', {
        row,
        column: header,
        rowIndex,
        colIndex,
        value: getCellValue(row, header.key)
      })
      return
    }
    
    // 触发单元格点击事件
    emit('cell-click', {
      row,
      column: header,
      rowIndex,
      colIndex,
      value: getCellValue(row, header.key)
    })
  }

  // 排序处理逻辑
  const handleSort = header => {
    if (!header.sortable) return

    let newDirection = 'asc'
    if (sortConfig.value.key === header.key) {
      if (sortConfig.value.direction === 'asc') {
        newDirection = 'desc'
      } else if (sortConfig.value.direction === 'desc') {
        newDirection = null
      }
    }

    sortConfig.value = {
      key: newDirection ? header.key : null,
      direction: newDirection
    }

    emit('sort-change', {
      key: header.key,
      direction: newDirection,
      column: header
    })
  }

  // 基础功能函数
  const getRowKey = (row, rowIndex) => {
    if (typeof props.rowKey === 'function') {
      return props.rowKey(row, rowIndex)
    }
    return row[props.rowKey] || `row-${rowIndex}`
  }

  // 展开相关功能
  const toggleExpand = (row, rowIndex) => {
    const key = getRowKey(row, rowIndex)
    const expandedRows = composableResults.expandedRows

    if (expandedRows.value.has(key)) {
      expandedRows.value.delete(key)
    } else {
      expandedRows.value.add(key)
    }

    emit('expand-change', {
      row,
      rowIndex,
      expanded: expandedRows.value.has(key),
      expandedKeys: Array.from(expandedRows.value)
    })

    nextTick(() => {
      setTimeout(() => {
        composableResults.measureAndSyncRowHeights()
      }, 50)
    })
  }

  const isExpanded = (row, rowIndex) => {
    const key = getRowKey(row, rowIndex)
    return composableResults.expandedRows.value.has(key)
  }

  // 行鼠标事件处理
  const handleRowMouseEnter = rowIndex => {
    if (hoveredRowIndex.value >= 0) {
      composableResults.applyRowState(hoveredRowIndex.value, 'hover', false)
    }

    hoveredRowIndex.value = rowIndex
    composableResults.applyRowState(rowIndex, 'hover', true)
  }

  const handleRowMouseLeave = rowIndex => {
    if (hoveredRowIndex.value === rowIndex) {
      composableResults.applyRowState(rowIndex, 'hover', false)
      hoveredRowIndex.value = -1
    }
  }

  // 计算属性 - 合并重复的计算逻辑
  const isRadioMode = computed(() => props.selectMode === 'radio')

  const filterableHeadersWithState = computed(() => {
    return props.headers.filter(header => header.filterable)
  })

  const filterOptions = computed(() => {
    const options = {}
    props.headers.forEach(header => {
      if (header.filterable) {
        const uniqueValues = [
          ...new Set(
            props.data
              .map(row => getCellValue(row, header.key))
              .filter(value => value != null && value !== '')
              .map(value => String(value))
          )
        ].slice(0, 10)
        options[header.key] = uniqueValues
      }
    })
    return options
  })

  // 生命周期相关函数
  const initializeTable = () => {
    updateContainerWidth()
    updateShadowState()
    
    // 激活实时高亮监控（开发环境）
    if (isDevelopment.value) {
      monitorHighlightState(singleHighlightController)
    }
  }

  return {
    // 核心状态
    isDevelopment,
    isRadioMode,
    singleHighlightController,
    
    // 数据处理
    filteredAndSortedData: processedData,
    hasActiveFilters,
    filterableHeadersWithState,
    filterOptions,
    
    // 事件处理
    handleRowClickLocal,
    handleCellClick,
    handleSort,
    handleBatchDelete,
    handleRowMouseEnter,
    handleRowMouseLeave,
    
    // 功能函数
    getRowKey,
    toggleExpand,
    isExpanded,
    updateShadowState,
    updateContainerWidth,
    initializeTable,
    
    // 调试相关
    lastRowClickTime,
    lastRowClickIndex
  }
}