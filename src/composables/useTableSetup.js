/**
 * 表格主要设置组合函数
 * 整合所有组合函数的调用和初始化逻辑
 */

import { ref, computed, nextTick, watch } from "vue";

// 导入所有组合函数
import { useScrollHandlers } from "./useScrollHandlers.js";
import { useLoadMore } from "./useLoadMore.js";
import { useSelection } from "./useSelection.js";
import { useTableEvents } from "./useTableEvents.js";
import { useTableFilters } from "./useTableFilters.js";
import { useTableSorting } from "./useTableSorting.js";
import { useTableState } from "./useTableState.js";
import { useTableComputed } from "./useTableComputed.js";
import { useTableUtils } from "./useTableUtils.js";
import { useScrollbar } from "./useScrollbar.js";
import { useTableStyles } from "./useTableStyles.js";
import { useTableHandlers } from "./useTableHandlers.js";
import { useTouchEvents } from "./useTouchEvents.js";
import { useRowHighlight } from "./useRowHighlight.js";
import { useVantTableCore } from "./useVantTableCore.js";
import { useScrollUtils } from "./useScrollUtils.js";
import { useFilterUtils } from "./useFilterUtils.js";
import { useCellUtils } from "./useCellUtils.js";
import { useStickyStyles } from "./useStickyStyles.js";
import { useTableDebug } from "./useTableDebug.js";
import { useScrollRestore } from "./useScrollRestore.js";

/**
 * 主要表格设置函数
 */
export function useTableSetup(props, emit, refs) {
  const {
    headerRef,
    headerContentRef,
    headerRowRef,
    leftHeaderRowRef,
    rightHeaderRowRef,
    bodyRef,
    tbodyRef,
    leftFixedRef,
    leftBodyWrapperRef,
    leftTbodyRef,
    rightFixedRef,
    rightBodyWrapperRef,
    rightTbodyRef,
    layoutWrapperRef,
    scrollbarWrapperRef,
    scrollbarHandleRef,
    tableHeaderRef,
    leftFixedColumnRef,
    rightFixedColumnRef,
    horizontalScrollbarRef
  } = refs;

  // 响应式数据初始化
  const dynamicHeaderHeight = ref(48);
  const dynamicRowHeights = ref(new Map());
  const expandedRowHeights = ref(new Map());
  const isHeaderSyncing = ref(false);
  const isRowSyncing = ref(false);
  const headerElementRefs = ref({});
  const rowElementRefs = ref({});
  const internalSelectedKeys = ref(new Set(props.selectedKeys || []));
  const lastSelectedIndex = ref(-1);
  const containerWidth = ref(0);
  const scrollLeft = ref(0);
  const scrollTop = ref(0);
  const lastScrollLeft = ref(0);

  // 🔑 关键修复：添加容器宽度测量功能，使用与原版相同的策略
  const updateContainerWidth = () => {
    // 首先尝试使用props.width（如果是数字类型）
    if (typeof props.width === 'number') {
      containerWidth.value = props.width
      return
    }
    
    // 然后尝试测量DOM元素
    if (layoutWrapperRef?.value) {
      const rect = layoutWrapperRef.value.getBoundingClientRect()
      const newWidth = Math.floor(rect.width)
      if (newWidth > 0 && newWidth !== containerWidth.value) {
        containerWidth.value = Math.max(newWidth, props.minWidth || 0)
        return
      }
    }
    
    // 最后使用默认值（与原版保持一致）
    if (containerWidth.value === 0) {
      containerWidth.value = 375 // 默认移动端宽度
    }
  }

  // 初始化表格功能
  const initializeTable = () => {
    // 立即更新一次（基于props）
    updateContainerWidth()
    
    nextTick(() => {
      updateContainerWidth()
      // 延迟再次测量，确保DOM完全渲染
      setTimeout(() => {
        updateContainerWidth()
      }, 100)
    })
  }
  
  // 监听props.width变化，与原版保持一致
  watch(() => props.width, () => {
    updateContainerWidth()
  }, { immediate: true })

  // 基础数据源
  const rawData = computed(() => props.data);

  // 使用表格状态组合函数
  const tableState = useTableState(
    props,
    emit,
    bodyRef,
    leftBodyWrapperRef,
    rightBodyWrapperRef,
    layoutWrapperRef,
    true // isDevelopment
  );

  // 🔑 临时占位符，稍后会被真实数据替换
  const tempFilteredData = ref([]);
  
  // 使用表格计算属性组合函数
  const tableComputed = useTableComputed(
    props,
    containerWidth,
    scrollTop,
    scrollLeft,
    tableState.headerHeight,
    tempFilteredData, // 先用ref，稍后更新
    tableState.rowHeightMap
  );

  // 使用滚动处理组合函数 - 需要在tableStyles之后调用
  // 创建响应式props对象给scroll handlers使用
  const reactivePropsForScrollHandlers = computed(() => ({
    ...props,
    columnsInfo: tableComputed.columnsInfo?.value,
    containerWidth: containerWidth.value
  }))

  // 使用过滤功能组合函数
  const tableFilters = useTableFilters(
    props,
    rawData,
    tableComputed.columnsInfo,
    true // isDevelopment
  );

  // 使用排序功能组合函数
  const tableSorting = useTableSorting(
    props,
    emit,
    tableFilters.filteredData,
    true // isDevelopment
  );

  // 最终过滤并排序的数据
  const filteredAndSortedData = computed(() => {
    const result = tableSorting.sortedData?.value || [];
    
    // 🔑 重要修复：同步更新tempFilteredData，确保tableComputed能获取到真实数据
    tempFilteredData.value = result;
    
    return result;
  });


  // 使用行高亮管理组合函数 - 提前初始化
  const rowHighlight = useRowHighlight(
    true, // isDevelopment
    rowElementRefs,
    tableState.hoveredRowIndex,
    tableState.selectedRowIndex,
    tableState.measureAndSyncRowHeights // 🔑 传递行高同步函数
  );

  // 使用选择功能组合函数
  const tableSelection = useSelection(
    props,
    emit,
    filteredAndSortedData,
    (row, rowIndex) => {
      if (typeof props.rowKey === 'function') {
        return props.rowKey(row, rowIndex)
      }
      return row[props.rowKey] || `row-${rowIndex}`
    }, // getRowKey函数
    true, // isDevelopment
    rowHighlight.updateSelectionHighlight // 传递updateSelectionHighlight函数
  );

  // 使用表格工具函数
  const tableUtils = useTableUtils(
    props,
    emit,
    tableComputed.columnsInfo,
    containerWidth,
    scrollLeft,
    tableComputed.hasHorizontalScrollbar,
    tableComputed.leftFixedTotalWidth,
    tableComputed.hasRightFixedColumns,
    tableComputed.scrollbarHandleWidth,
    tableComputed.scrollbarHandleLeft,
    tableState.isDragging,
    tableState.isScrollbarVisible,
    tableComputed.SCROLLBAR_HEIGHT
  );

  // 使用滚动条处理函数
  const scrollbar = useScrollbar(
    bodyRef,
    scrollLeft,
    containerWidth,
    tableComputed.columnsInfo,
    tableState.isDragging,
    tableState.isScrollbarVisible,
    tableState.autoHideTimer,
    tableState.smoothScrollAnimation,
    () => {}, // syncScroll临时函数
    () => {} // updateShadowState临时函数
  );

  // 使用表格样式
  const tableStyles = useTableStyles(
    props,
    tableComputed.columnsInfo,
    tableComputed.leftFixedTotalWidth,
    tableComputed.hasRightFixedColumns,
    tableComputed.hasLeftFixedContent,
    scrollLeft,
    containerWidth,
    tableState.headerHeight,
    tableComputed.EXPAND_WIDTH,
    tableComputed.SELECTION_WIDTH,
    tableComputed.SCROLLBAR_HEIGHT
  );

  // 🔑 修复：现在在tableStyles之后初始化scrollHandlers
  const scrollHandlers = useScrollHandlers(
    reactivePropsForScrollHandlers.value,
    emit,
    bodyRef,
    leftBodyWrapperRef,
    rightBodyWrapperRef,
    headerContentRef, // 添加表头内容引用
    scrollTop,
    scrollLeft,
    true, // isDevelopment
    layoutWrapperRef, // 添加布局容器引用
    tableStyles.updateShadowState, // 添加阴影状态更新函数
    tableStyles.updateShadowScrollPosition // 添加独立的阴影滚动跟踪函数
  );

  // 🔑 修复：现在在scrollHandlers之后初始化tableEvents
  const tableEvents = useTableEvents(
    bodyRef,
    leftBodyWrapperRef,
    rightBodyWrapperRef,
    scrollTop,
    scrollLeft,
    scrollHandlers.vxeStyleAbsoluteSync,
    () => 0, // getGlobalMaxScrollTop临时函数
    () => {}, // updateShadowState临时函数
    true, // isDevelopment
    emit,
    props,
    scrollHandlers.isLoadingMore,
    scrollHandlers.savedScrollPosition
  );

  // 使用表格事件处理
  const tableHandlers = useTableHandlers(
    props,
    emit,
    scrollTop,
    scrollLeft,
    scrollHandlers.lastScrollTop,
    lastScrollLeft,
    scrollHandlers.intoRunScroll,
    scrollHandlers.isLoadingMore,
    true, // isDevelopment
    scrollHandlers.vxeStyleAbsoluteSync,
    () => {}, // handleLoadMore临时函数
    () => {}, // updateShadowState临时函数
    () => {}, // syncScroll临时函数
    44, // MIN_ROW_HEIGHT
    dynamicRowHeights,
    tableComputed.EXPAND_WIDTH,
    rowHighlight // 传递行高亮处理函数
  );

  // 使用核心组合函数整合主要逻辑
  const tableCore = useVantTableCore(
    props,
    emit,
    {
      layoutWrapperRef,
      bodyRef,
      headerRef,
      leftBodyWrapperRef,
      rightBodyWrapperRef,
    },
    {
      filteredAndSortedData,
      activeFilters: tableFilters.activeFilters,
      sortConfig: tableSorting.sortConfig,
      getCellValue: tableUtils.getCellValue,
      isRowTotal: tableUtils.isRowTotal,
      columnsInfo: tableComputed.columnsInfo,
      containerWidth,
      scrollLeft,
      hasLeftFixedContent: tableComputed.hasLeftFixedContent,
      hasRightFixedColumns: tableComputed.hasRightFixedColumns,
      leftFixedTotalWidth: tableComputed.leftFixedTotalWidth,
      showHorizontalScrollbar: tableStyles.hasHorizontalScrollbar,
      hoveredRowIndex: tableState.hoveredRowIndex,
      selectedRowIndex: tableState.selectedRowIndex,
      isRowDisabled: () => false, // 临时函数
      isRowSelected: tableSelection.isRowSelected,
      handleRowSelect: tableSelection.handleRowSelect,
      selectedRows: tableSelection.selectedRows,
      selectedRowKeys: tableSelection.selectedRowKeys,
      ensureSingleRowHighlight: rowHighlight.ensureSingleRowHighlight,
      touchHandledRowIndex: rowHighlight.touchHandledRowIndex,
      expandedRows: tableState.expandedRows,
      measureAndSyncRowHeights: tableState.measureAndSyncRowHeights,
      applyRowState: () => {}, // 临时函数
    }
  );

  // 使用触摸事件处理组合函数
  const touchEvents = useTouchEvents(
    props,
    emit,
    bodyRef,
    leftBodyWrapperRef,
    rightBodyWrapperRef,
    scrollLeft,
    scrollHandlers.vxeStyleAbsoluteSync,
    () => 0, // getGlobalMaxScrollTop临时函数
    filteredAndSortedData,
    rowHighlight.handleSingleRowHighlight,
    tableCore.handleRowClickLocal,
    scrollHandlers.isLoadingMore,
    scrollHandlers.savedScrollPosition,
    true, // isDevelopment
    rowHighlight.touchHandledRowIndex,
    tableComputed.columnsInfo,
    containerWidth
  );

  // 使用滚动工具组合函数
  const scrollUtils = useScrollUtils(
    bodyRef,
    leftBodyWrapperRef,
    rightBodyWrapperRef,
    scrollTop,
    scrollLeft,
    scrollHandlers.isLoadingMore,
    scrollHandlers.vxeStyleAbsoluteSync,
    true // isDevelopment
  );

  // 使用过滤工具组合函数
  const filterUtils = useFilterUtils(
    tableFilters.filterStates,
    tableFilters.activeFilters,
    tableCore.filterOptions,
    emit,
    true // isDevelopment
  );

  // 使用单元格工具组合函数
  const cellUtils = useCellUtils(
    props,
    tableUtils.getCellValue,
    tableSelection.isRowSelected,
    tableUtils.isRowTotal
  );

  // 使用粘性样式组合函数
  const stickyStyles = useStickyStyles(
    props,
    tableComputed.columnsInfo,
    tableComputed.SELECTION_WIDTH,
    tableComputed.EXPAND_WIDTH
  );

  // 使用调试组合函数
  const tableDebug = useTableDebug(
    containerWidth,
    tableComputed.columnsInfo,
    scrollLeft,
    scrollTop,
    filteredAndSortedData,
    tableSelection.selectedRows,
    tableSelection.selectedRowKeys,
    tableSelection.isAllSelected,
    tableSelection.isIndeterminate,
    computed(() => []), // selectableRows临时
    dynamicHeaderHeight,
    dynamicRowHeights,
    tableStyles.hasHorizontalScrollbar,
    headerRowRef,
    leftHeaderRowRef,
    rightHeaderRowRef,
    () => {}, // forceHeaderSync临时函数
    true // isDevelopment
  );

  // 使用滚动恢复组合函数
  const scrollRestore = useScrollRestore(
    bodyRef,
    leftBodyWrapperRef,
    rightBodyWrapperRef,
    scrollTop,
    scrollLeft,
    scrollHandlers.savedScrollPosition,
    tableState.hoveredRowIndex,
    () => {}, // applyRowState临时函数
    scrollHandlers.vxeStyleAbsoluteSync,
    scrollHandlers.intoRunScroll,
    scrollHandlers.lastScrollTop,
    true // isDevelopment
  );

  // 使用加载更多组合函数
  useLoadMore(
    props,
    bodyRef,
    leftBodyWrapperRef,
    rightBodyWrapperRef,
    scrollTop,
    scrollLeft,
    filteredAndSortedData,
    tableState.measureAndSyncHeaderHeight,
    tableState.measureAndSyncRowHeights,
    true, // isDevelopment
    scrollHandlers.isLoadingMore,
    scrollHandlers.savedScrollPosition,
    scrollHandlers.savedDataLength,
    scrollHandlers.savedScrollHeight,
    scrollHandlers.lastScrollTop,
    scrollHandlers.intoRunScroll
  );

  // 基本组件属性（简化版，先确保基本功能工作）
  const headerProps = computed(() => {
    // 计算是否有左固定列的展开功能
    const hasLeftFixedExpand = props.expandable && (tableComputed.hasLeftFixedContent.value || false);
    
    const headerPropsValue = {
      hasLeftFixedContent: tableComputed.hasLeftFixedContent.value || false,
      leftFixedTotalWidth: tableComputed.leftFixedTotalWidth.value || 0,
      hasRightFixedColumns: tableComputed.hasRightFixedColumns.value || false,
      columnsInfo: tableComputed.columnsInfo?.value || { computedHeaders: [] },
      tableStyle: tableComputed.tableStyle?.value || {},
      expandable: props.expandable || false,
      hasLeftFixedExpand: hasLeftFixedExpand,
      getColStyle: tableComputed.getColStyle,
      getHeaderClass: cellUtils.getHeaderClass,
      getHeaderStyle: cellUtils.getHeaderStyle,
      setHeaderElementRef: tableState.setHeaderElementRef,
      handleSort: tableSorting.handleSort,
      sortConfig: tableSorting.sortConfig?.value || {},
      isFilterActive: tableFilters.isFilterActive,
      toggleFilter: tableFilters.toggleFilter,
    }
    
    
    return headerPropsValue
  });

  const bodyProps = computed(() => {
    // 计算是否有左固定列的展开功能
    const hasLeftFixedExpand = props.expandable && (tableComputed.hasLeftFixedContent.value || false);
    
    return {
      bodyWrapperStyle: tableComputed.bodyWrapperStyle?.value || {},
      tableStyle: tableComputed.tableStyle?.value || {},
      columnsInfo: tableComputed.columnsInfo?.value || { computedHeaders: [] },
      filteredAndSortedData: filteredAndSortedData.value || [],
      hasActiveFilters: tableFilters.hasActiveFilters?.value || false,
      expandable: props.expandable || false,
      hasLeftFixedExpand: hasLeftFixedExpand,
      handleScroll: scrollHandlers.handleScroll,
      handleMainTableWheel: scrollHandlers.handleMainTableWheel,
      handleMainTableTouchStart: scrollHandlers.handleMainTableTouchStart,
      handleMainTableTouchMove: scrollHandlers.handleMainTableTouchMove,
      handleMainTableTouchEnd: scrollHandlers.handleMainTableTouchEnd,
      handleAreaMouseEnter: scrollHandlers.handleAreaMouseEnter,
      handleAreaMouseLeave: scrollHandlers.handleAreaMouseLeave,
      getColStyle: tableComputed.getColStyle,
      getRowKey: tableCore.getRowKey,
      getRowClass: tableComputed.getRowClass,
      getRowStyle: tableComputed.getRowStyle,
      setRowElementRef: tableState.setRowElementRef,
      handleSingleRowHighlight: tableHandlers.handleSingleRowHighlight,
      handleRowClickLocal: tableHandlers.handleRowClickLocal,
      handleRowMouseEnter: tableHandlers.handleRowMouseEnter,
      handleRowMouseLeave: tableHandlers.handleRowMouseLeave,
      getCellClass: cellUtils.getCellClass,
      getCellStyle: cellUtils.getCellStyle,
      handleCellClick: tableHandlers.handleCellClick,
      isRowTotal: tableUtils.isRowTotal,
      getDataBarStyle: cellUtils.getDataBarStyle,
      getCellValue: tableUtils.getCellValue,
      renderCustomCell: cellUtils.renderCustomCell,
      formatCellValue: cellUtils.formatCellValue,
      isExpanded: tableState.isRowExpanded,
      toggleExpand: tableCore.toggleExpand,
    };
  });

  const leftFixedProps = computed(() => {
    const colInfo = tableComputed.columnsInfo?.value || { computedHeaders: [] };
    const leftColumns = colInfo.leftFixedColumns || [];
    const selectionWidth = props.selectable && props.selectMode === "checkbox" ? 48 : 0;
    const expandWidth = props.expandable ? 40 : 0;

    // 🔑 修复：左侧固定列应该在有左固定列、选择列或展开列时显示
    const shouldShowLeft = leftColumns.length > 0 || props.selectable || props.expandable;

    // 🔑 重要修复：直接使用computed的filteredAndSortedData，而不是.value
    // 这样确保Vue的响应式系统能正确追踪依赖关系
    const dataToPass = filteredAndSortedData.value || [];
    
    
    return {
      position: "left", 
      shouldShow: shouldShowLeft,
      columns: leftColumns,
      columnsInfo: colInfo,
      filteredAndSortedData: dataToPass,
      tableStyle: tableComputed.tableStyle || {},
      bodyWrapperStyle: (() => {
        // 🔑 关键修复：直接使用主表格的bodyWrapperStyle，但除去margin
        const mainStyle = tableComputed.bodyWrapperStyle?.value || {};
        const result = {
          ...mainStyle,
          // 除去margin以避免固定列与主表格重复偏移
          marginLeft: '0',
          marginRight: '0',
          // 固定列使用hidden而不是auto滚动
          overflow: 'hidden',
          overflowX: 'hidden',
          overflowY: 'hidden'
        };
        
        console.log('🔍 Fixed column bodyWrapperStyle debug:', {
          position: 'left/right',
          originalMainHeight: mainStyle.height,
          finalResultHeight: result.height,
          originalMainPadding: mainStyle.paddingBottom,
          finalResultPadding: result.paddingBottom,
          heightMatch: mainStyle.height === result.height,
          paddingMatch: mainStyle.paddingBottom === result.paddingBottom,
          marginLeft: result.marginLeft,
          marginRight: result.marginRight,
          '疑点': '主表格和固定列高度公式是否一致？'
        });
        
        return result;
      })(),
      fixedStyle: tableStyles.leftFixedStyle?.value || { left: 0 },
      fixedHeaderWrapperStyle: {
        // 🔑 关键修复：完全不限制高度，让内容自由扩展
      },
      headerTableStyle: {
        width: `${colInfo.leftFixedWidth + expandWidth + selectionWidth}px`,
        tableLayout: 'fixed',
        borderCollapse: 'separate',
        borderSpacing: 0,
        margin: 0
      },
      bodyTableStyle: {
        width: `${colInfo.leftFixedWidth + expandWidth + selectionWidth}px`,
        tableLayout: 'fixed',
        borderCollapse: 'separate',
        borderSpacing: 0,
        margin: 0
      },
      selectionColStyle: { width: "48px" },
      expandColStyle: { width: "40px" },
      showSelection: props.selectable && props.selectMode === "checkbox",
      showExpand: props.expandable,
      getColStyle: tableComputed.getColStyle,
      getRowKey: tableCore.getRowKey,
      getRowClass: tableComputed.getRowClass,
      getRowStyle: tableComputed.getRowStyle,
      getFixedHeaderClass: cellUtils.getFixedHeaderClass,
      getFixedHeaderStyle: cellUtils.getFixedHeaderStyle,
      getSelectionHeaderStyle: cellUtils.getSelectionHeaderStyle,
      getExpandHeaderStyle: cellUtils.getExpandHeaderStyle,
      getSelectionCellStyle: cellUtils.getSelectionCellStyle,
      getExpandCellStyle: cellUtils.getExpandCellStyle,
      toggleExpand: tableCore.toggleExpand,
      setRowElementRef: tableState.setRowElementRef,
      setHeaderElementRef: tableState.setHeaderElementRef,
      handleSingleRowHighlight: tableHandlers.handleSingleRowHighlight,
      handleRowClickLocal: tableHandlers.handleRowClickLocal,
      handleRowMouseEnter: tableHandlers.handleRowMouseEnter,
      handleRowMouseLeave: tableHandlers.handleRowMouseLeave,
      getCellClass: cellUtils.getCellClass,
      getCellStyle: cellUtils.getCellStyle,
      getFixedCellClass: cellUtils.getFixedCellClass,
      getFixedCellStyle: cellUtils.getFixedCellStyle,
      handleCellClick: tableHandlers.handleCellClick,
      isRowTotal: tableUtils.isRowTotal,
      getDataBarStyle: cellUtils.getDataBarStyle,
      getCellValue: tableUtils.getCellValue,
      renderCustomCell: cellUtils.renderCustomCell,
      formatCellValue: cellUtils.formatCellValue,
      isExpanded: tableState.isRowExpanded,
      expandable: props.expandable || false,
      hasActiveFilters: tableFilters.hasActiveFilters?.value || false,
      handleSort: tableSorting.handleSort,
      sortConfig: tableSorting.sortConfig?.value || {},
      isFilterActive: tableFilters.isFilterActive,
      toggleFilter: tableFilters.toggleFilter,
      // 选择相关
      handleSelectAll: tableSelection.handleSelectAll,
      isAllSelected: tableSelection.isAllSelected?.value || false,
      isIndeterminate: tableSelection.isIndeterminate?.value || false,
      selectableRows: tableSelection.selectableRows?.value || [],
      allRowsDisabled: tableSelection.allRowsDisabled?.value || false,
      isRadioMode: props.selectMode === "radio",
      isRowSelected: tableSelection.isRowSelected,
      handleRowSelect: tableSelection.handleRowSelect,
      isRowDisabled: tableSelection.isRowDisabled,
      handleCellSelect: tableSelection.handleCellSelect,
      // 滚动和触摸事件
      handleFixedColumnScroll: scrollHandlers.handleFixedColumnScroll,
      handleFixedColumnWheel: scrollHandlers.handleFixedColumnWheel,
      handleFixedColumnTouchStart: scrollHandlers.handleFixedColumnTouchStart,
      handleFixedColumnTouchMove: scrollHandlers.handleFixedColumnTouchMove,
      handleFixedColumnTouchEnd: scrollHandlers.handleFixedColumnTouchEnd,
      handleAreaMouseEnter: scrollHandlers.handleAreaMouseEnter,
      handleAreaMouseLeave: scrollHandlers.handleAreaMouseLeave,
      // 🔑 添加左侧阴影控制，参考vxe-table
      shouldShowShadow: tableStyles.shouldShowLeftShadow?.value || false,
    };
  });

  const rightFixedProps = computed(() => {
    const colInfo = tableComputed.columnsInfo?.value || { computedHeaders: [] };
    const rightColumns = colInfo.rightFixedColumns || [];
    const shouldShowRight = rightColumns.length > 0;
    const dataToPass = filteredAndSortedData.value || [];


    return {
      position: "right",
      shouldShow: shouldShowRight,
      columns: rightColumns,
      columnsInfo: colInfo,
      filteredAndSortedData: dataToPass,
      tableStyle: tableComputed.tableStyle || {},
      bodyWrapperStyle: (() => {
        // 🔑 关键修复：直接使用主表格的bodyWrapperStyle，但除去margin
        const mainStyle = tableComputed.bodyWrapperStyle?.value || {};
        const result = {
          ...mainStyle,
          // 除去margin以避免固定列与主表格重复偏移
          marginLeft: '0',
          marginRight: '0',
          // 固定列使用hidden而不是auto滚动
          overflow: 'hidden',
          overflowX: 'hidden',
          overflowY: 'hidden'
        };
        
        console.log('🔍 Fixed column bodyWrapperStyle debug:', {
          position: 'left/right',
          originalMainHeight: mainStyle.height,
          finalResultHeight: result.height,
          originalMainPadding: mainStyle.paddingBottom,
          finalResultPadding: result.paddingBottom,
          heightMatch: mainStyle.height === result.height,
          paddingMatch: mainStyle.paddingBottom === result.paddingBottom,
          marginLeft: result.marginLeft,
          marginRight: result.marginRight,
          '疑点': '主表格和固定列高度公式是否一致？'
        });
        
        return result;
      })(),
      fixedStyle: tableStyles.rightFixedStyle?.value || { right: 0 },
      fixedHeaderWrapperStyle: {
        // 🔑 关键修复：完全不限制高度，让内容自由扩展
      },
      headerTableStyle: {
        width: `${colInfo.rightFixedWidth || 0}px`,
        tableLayout: 'fixed',
        borderCollapse: 'separate',
        borderSpacing: 0,
        margin: 0
      },
      bodyTableStyle: {
        width: `${colInfo.rightFixedWidth || 0}px`,
        tableLayout: 'fixed',
        borderCollapse: 'separate',
        borderSpacing: 0,
        margin: 0
      },
      selectionColStyle: { width: "48px" },
      expandColStyle: { width: "40px" },
      showSelection: false, // 右固定列通常不显示选择框
      showExpand: false, // 右固定列通常不显示展开
      getColStyle: tableComputed.getColStyle,
      getRowKey: tableCore.getRowKey,
      getRowClass: tableComputed.getRowClass,
      getRowStyle: tableComputed.getRowStyle,
      getFixedHeaderClass: cellUtils.getFixedHeaderClass,
      getFixedHeaderStyle: cellUtils.getFixedHeaderStyle,
      getSelectionHeaderStyle: cellUtils.getSelectionHeaderStyle,
      getExpandHeaderStyle: cellUtils.getExpandHeaderStyle,
      getSelectionCellStyle: cellUtils.getSelectionCellStyle,
      getExpandCellStyle: cellUtils.getExpandCellStyle,
      toggleExpand: tableCore.toggleExpand,
      setRowElementRef: tableState.setRowElementRef,
      setHeaderElementRef: tableState.setHeaderElementRef,
      handleSingleRowHighlight: tableHandlers.handleSingleRowHighlight,
      handleRowClickLocal: tableHandlers.handleRowClickLocal,
      handleRowMouseEnter: tableHandlers.handleRowMouseEnter,
      handleRowMouseLeave: tableHandlers.handleRowMouseLeave,
      getCellClass: cellUtils.getCellClass,
      getCellStyle: cellUtils.getCellStyle,
      getFixedCellClass: cellUtils.getFixedCellClass,
      getFixedCellStyle: cellUtils.getFixedCellStyle,
      handleCellClick: tableHandlers.handleCellClick,
      isRowTotal: tableUtils.isRowTotal,
      getDataBarStyle: cellUtils.getDataBarStyle,
      getCellValue: tableUtils.getCellValue,
      renderCustomCell: cellUtils.renderCustomCell,
      formatCellValue: cellUtils.formatCellValue,
      isExpanded: tableState.isRowExpanded,
      expandable: props.expandable || false,
      hasActiveFilters: tableFilters.hasActiveFilters?.value || false,
      handleSort: tableSorting.handleSort,
      sortConfig: tableSorting.sortConfig?.value || {},
      isFilterActive: tableFilters.isFilterActive,
      toggleFilter: tableFilters.toggleFilter,
      // 选择相关
      handleSelectAll: tableSelection.handleSelectAll,
      isAllSelected: tableSelection.isAllSelected?.value || false,
      isIndeterminate: tableSelection.isIndeterminate?.value || false,
      selectableRows: tableSelection.selectableRows?.value || [],
      allRowsDisabled: tableSelection.allRowsDisabled?.value || false,
      isRadioMode: props.selectMode === "radio",
      isRowSelected: tableSelection.isRowSelected,
      handleRowSelect: tableSelection.handleRowSelect,
      isRowDisabled: tableSelection.isRowDisabled,
      handleCellSelect: tableSelection.handleCellSelect,
      // 滚动和触摸事件
      handleFixedColumnScroll: scrollHandlers.handleFixedColumnScroll,
      handleFixedColumnWheel: scrollHandlers.handleFixedColumnWheel,
      handleFixedColumnTouchStart: scrollHandlers.handleFixedColumnTouchStart,
      handleFixedColumnTouchMove: scrollHandlers.handleFixedColumnTouchMove,
      handleFixedColumnTouchEnd: scrollHandlers.handleFixedColumnTouchEnd,
      handleAreaMouseEnter: scrollHandlers.handleAreaMouseEnter,
      handleAreaMouseLeave: scrollHandlers.handleAreaMouseLeave,
      // 🔑 添加右侧阴影控制，参考vxe-table
      shouldShowShadow: tableStyles.shouldShowRightShadow?.value || false,
    };
  });
  const scrollbarProps = computed(() => ({
    showHorizontalScrollbar: tableStyles.hasHorizontalScrollbar?.value || false,
    horizontalScrollbarContainerStyle:
      tableUtils.horizontalScrollbarContainerStyle?.value || {},
    scrollbarWrapperStyle: tableUtils.scrollbarWrapperStyle?.value || {},
    isScrollbarVisible: tableState.isScrollbarVisible?.value || false,
    isDragging: tableState.isDragging?.value || false,
    scrollbarHandleStyle: tableUtils.scrollbarHandleStyle?.value || {},
    scrollbarSpaceStyle: tableUtils.scrollbarSpaceStyle?.value || {},
    scrollbarLeftCornerStyle: tableUtils.scrollbarLeftCornerStyle?.value || {},
    scrollbarRightCornerStyle: tableUtils.scrollbarRightCornerStyle?.value || {},

    // 事件处理函数
    handleScrollbarTrackClick:
      scrollbar.handleScrollbarTrackClick || (() => {}),
    handleScrollbarMouseDown: scrollbar.handleScrollbarMouseDown || (() => {}),
    handleScrollbarMouseEnter:
      scrollbar.handleScrollbarMouseEnter || (() => {}),
    handleScrollbarMouseLeave:
      scrollbar.handleScrollbarMouseLeave || (() => {}),
    handleScrollToLeft: scrollbar.scrollToLeft || (() => {}),
    handleScrollToRight: scrollbar.scrollToRight || (() => {}),
  }));
  const loadMoreProps = computed(() => ({
    enableLoadMore: props.enableLoadMore,
    showLoadMoreUi: props.showLoadMoreUi,
    loadMoreLoading: props.loadMoreLoading,
    loadMoreFinished: props.loadMoreFinished,
    loadMoreError: props.loadMoreError,
    loadMoreLoadingText: props.loadMoreLoadingText,
    loadMoreFinishedText: props.loadMoreFinishedText,
    loadMoreErrorText: props.loadMoreErrorText,
    loadMoreReadyText: props.loadMoreReadyText,
  }));
  const filterProps = computed(() => ({
    headers: props.headers,
    filterStates: tableFilters.filterStates,
    filters: tableFilters.filters,
    toggleFilter: tableFilters.toggleFilter,
    applyFilter: tableFilters.applyFilter,
    clearFilters: tableFilters.clearFilters
  }));

  // 返回所有组合函数的结果
  return {
    // 滚动相关
    ...scrollHandlers,
    ...scrollUtils,
    ...scrollbar,
    ...scrollRestore,

    // 状态管理
    ...tableState,

    // 计算属性
    ...tableComputed,

    // 过滤和排序
    ...tableFilters,
    ...tableSorting,
    ...filterUtils,

    // 选择功能
    ...tableSelection,

    // 事件处理
    ...tableEvents,
    ...tableHandlers,
    ...touchEvents,

    // 样式相关
    ...tableStyles,
    ...cellUtils,
    ...stickyStyles,

    // 核心功能
    ...tableCore,

    // 行高亮
    ...rowHighlight,

    // 工具函数
    ...tableUtils,

    // 调试功能
    ...tableDebug,

    // 数据
    filteredAndSortedData,
    rawData,

    // 基础响应式数据
    dynamicHeaderHeight,
    dynamicRowHeights,
    expandedRowHeights,
    isHeaderSyncing,
    isRowSyncing,
    headerElementRefs,
    rowElementRefs,
    internalSelectedKeys,
    lastSelectedIndex,
    containerWidth,
    scrollLeft,
    scrollTop,
    lastScrollLeft,

    // 组件属性绑定
    headerProps,
    bodyProps,
    leftFixedProps,
    rightFixedProps,
    scrollbarProps,
    loadMoreProps,
    filterProps,

    // 核心功能方法
    updateContainerWidth,
    initializeTable,
  };
}
