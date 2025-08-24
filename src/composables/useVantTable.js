/**
 * VantTable主组合函数 - 整合所有功能
 */
import { computed } from 'vue'
import { useScrollHandlers } from './useScrollHandlers.js'
import { useLoadMore } from './useLoadMore.js'
import { useSelection } from './useSelection.js'
import { useTableEvents } from './useTableEvents.js'
import { useTableFilters } from './useTableFilters.js'
import { useTableSorting } from './useTableSorting.js'
import { useTableState } from './useTableState.js'
import { useTableComputed } from './useTableComputed.js'
import { useTableUtils } from './useTableUtils.js'
import { useScrollbar } from './useScrollbar.js'
import { useTableStyles } from './useTableStyles.js'
import { useTableHandlers } from './useTableHandlers.js'

export function useVantTable(props, emit, bodyRef, leftBodyWrapperRef, rightBodyWrapperRef, layoutWrapperRef) {
  
  // 基础状态管理
  const tableState = useTableState(props, emit, bodyRef, leftBodyWrapperRef, rightBodyWrapperRef, layoutWrapperRef, true)
  
  // 计算属性 - 依赖状态
  const tableComputed = useTableComputed(
    props, 
    tableState.containerWidth, 
    tableState.scrollTop, 
    tableState.scrollLeft, 
    tableState.headerHeight, 
    null, // filteredAndSortedData 将在后面计算
    tableState.rowHeightMap
  )
  
  // 排序功能
  const tableSorting = useTableSorting(props, emit)
  
  // 过滤功能  
  const tableFilters = useTableFilters(props, emit, tableComputed.columnsInfo, tableState.isDevelopment)
  
  // 计算过滤和排序后的数据
  const filteredAndSortedData = computed(() => {
    let data = [...props.data]
    
    // 应用过滤
    data = tableFilters.applyFilters(data)
    
    // 应用排序
    data = tableSorting.applySorting(data)
    
    return data
  })
  
  // 选择功能
  const tableSelection = useSelection(props, emit, filteredAndSortedData, tableState.getRowKey, tableState.isDevelopment, null)
  
  // 滚动处理
  const scrollHandlers = useScrollHandlers(
    props, emit, bodyRef, leftBodyWrapperRef, rightBodyWrapperRef,
    tableState.headerContentRef, tableState.scrollTop, tableState.scrollLeft, tableState.isDevelopment
  )
  
  // 加载更多
  const loadMore = useLoadMore(
    props, emit, bodyRef, tableState.scrollTop, tableState.scrollLeft,
    tableState.isDevelopment
  )
  
  // 触摸事件
  const tableEvents = useTableEvents(
    props, emit, bodyRef, leftBodyWrapperRef, rightBodyWrapperRef,
    tableState, scrollHandlers, loadMore, tableState.isDevelopment
  )
  
  // 滚动条
  const scrollbar = useScrollbar(
    bodyRef, tableState.scrollLeft, tableState.containerWidth, 
    tableComputed.columnsInfo, tableState.isDragging, tableState.isScrollbarVisible,
    tableState.autoHideTimer, tableState.smoothScrollAnimation,
    scrollHandlers.syncScroll, scrollHandlers.updateShadowState
  )
  
  // 样式计算
  const tableStyles = useTableStyles(
    props, tableComputed.columnsInfo, tableComputed.leftFixedTotalWidth,
    tableComputed.hasRightFixedColumns, tableComputed.hasLeftFixedContent,
    tableState.scrollLeft, tableState.containerWidth, tableState.headerHeight,
    tableComputed.EXPAND_WIDTH, tableComputed.SELECTION_WIDTH, tableComputed.SCROLLBAR_HEIGHT
  )
  
  // 工具函数
  const tableUtils = useTableUtils(
    props, emit, tableComputed.columnsInfo, tableState.containerWidth,
    tableState.scrollLeft, tableStyles.hasHorizontalScrollbar,
    tableComputed.leftFixedTotalWidth, tableComputed.hasRightFixedColumns,
    scrollbar.scrollbarHandleWidth, scrollbar.scrollbarHandleLeft,
    tableState.isDragging, tableState.isScrollbarVisible, tableComputed.SCROLLBAR_HEIGHT
  )
  
  // 事件处理
  const tableHandlers = useTableHandlers(
    props, emit, tableState.scrollTop, tableState.scrollLeft,
    tableState.lastScrollTop, tableState.lastScrollLeft,
    scrollHandlers.intoRunScroll, loadMore.isLoadingMore, tableState.isDevelopment,
    scrollHandlers.vxeStyleAbsoluteSync, loadMore.handleLoadMore,
    scrollHandlers.updateShadowState, scrollHandlers.syncScroll,
    44, // MIN_ROW_HEIGHT
    tableState.rowHeightMap, tableComputed.EXPAND_WIDTH
  )

  return {
    // 状态
    ...tableState,
    
    // 计算属性
    ...tableComputed,
    
    // 数据
    filteredAndSortedData,
    
    // 排序
    ...tableSorting,
    
    // 过滤
    ...tableFilters,
    
    // 选择
    ...tableSelection,
    
    // 滚动
    ...scrollHandlers,
    
    // 加载更多
    ...loadMore,
    
    // 事件
    ...tableEvents,
    
    // 滚动条
    ...scrollbar,
    
    // 样式
    ...tableStyles,
    
    // 工具
    ...tableUtils,
    
    // 处理器
    ...tableHandlers
  }
}