<template>
  <div class="vant-table-wrapper" :class="tableWrapperClass" :style="containerStyle">
    <!-- 加载状态 -->
    <div v-if="loading" class="vant-table-loading">
      <VanLoading size="24px" />
    </div>

    <!-- 表格主容器 -->
    <div class="vant-table-layout-wrapper" ref="layoutWrapperRef">
      
      <!-- 主表格头部 -->
      <div class="vant-table-header" :style="headerWrapperStyle">
        <VantTableHeader
          :expandable="expandable"
          :selectable="selectable"
          :isRadioMode="isRadioMode"
          :isAllSelected="isAllSelected"
          :isIndeterminate="isIndeterminate"
          :computedHeaders="columnsInfo.computedHeaders"
          :sortConfig="sortConfig"
          :activeFilters="activeFilters"
          :getExpandHeaderStyle="getExpandHeaderStyle"
          :getSelectionHeaderStyle="getSelectionHeaderStyle"
          :getHeaderStyle="getHeaderStyle"
          :getHeaderClass="getHeaderClass"
          :handleSelectAll="handleSelectAll"
          :handleHeaderClick="handleSort"
          :toggleFilterPopup="toggleFilter"
        />
      </div>

      <!-- 主表格主体 -->
      <VantTableBody
        position="main"
        :data="filteredAndSortedData"
        :headers="columnsInfo.computedHeaders"
        :showSelection="selectable"
        :showExpand="expandable"
        :isRadioMode="isRadioMode"
        :expandRender="expandRender"
        :emptyDescription="hasActiveFilters ? '没有符合条件的数据' : '暂无数据'"
        :bodyWrapperStyle="bodyWrapperStyle"
        :tableStyle="tableStyle"
        :selectionColStyle="selectionColStyle"
        :expandColStyle="expandColStyle"
        :columnCount="totalColumnCount"
        bodyRefKey="bodyRef"
        tbodyRefKey="tbodyRef"
        :getColStyle="getColStyle"
        :getRowClass="getRowClass"
        :getRowStyle="getRowStyle"
        :getFixedCellClass="getFixedCellClass"
        :getSelectionCellStyle="getSelectionCellStyle"
        :getExpandCellStyle="getExpandCellStyle"
        :getCellClass="getCellClass"
        :getCellStyle="getCellStyle"
        :getCheckboxClass="getCheckboxClass"
        :getRadioClass="getRadioClass"
        :getRowKey="getRowKey"
        :getCellValue="getCellValue"
        :formatCellValue="formatCellValue"
        :renderCell="renderCell"
        :isRowSelected="isRowSelected"
        :isRowDisabled="isRowDisabled"
        :isRowExpanded="isRowExpanded"
        :handleScroll="handleScroll"
        :handleWheel="handleMainTableWheel"
        :handleTouchStart="handleMainTableTouchStart"
        :handleTouchMove="handleMainTableTouchMove"
        :handleTouchEnd="handleMainTableTouchEnd"
        :setRowElementRef="setRowElementRef"
        :setExpandedRowElementRef="setExpandedRowElementRef"
        :handleRowClickWithHighlight="handleRowClickWithHighlight"
        :handleRowMouseEnter="handleRowMouseEnter"
        :handleRowMouseLeave="handleRowMouseLeave"
        :handleSelectionToggle="handleSelectionToggle"
        :handleRowSelect="handleRowSelect"
        :toggleRowExpansion="toggleRowExpansion"
        :handleCellClick="handleCellClick"
        :handleCellDoubleClick="handleCellDoubleClick"
        :handleCellContextMenu="handleCellContextMenu"
      />

      <!-- 左固定列 -->
      <VantFixedColumn
        v-if="hasLeftFixedContent"
        position="left"
        :shouldShow="!shouldHideFixedColumns"
        :fixedStyle="leftFixedStyle"
        :fixedHeaderWrapperStyle="fixedHeaderWrapperStyle"
        :headerTableStyle="leftHeaderTableStyle"
        :bodyWrapperStyle="leftBodyWrapperStyle"
        :bodyTableStyle="leftBodyTableStyle"
        :fixedColumnLoadMorePositionStyle="fixedColumnLoadMorePositionStyle"
        :expandable="expandable"
        :selectable="selectable"
        :isRadioMode="isRadioMode"
        :enableLoadMore="enableLoadMore"
        :showLoadMoreUi="showLoadMoreUi"
        :fixedHeaders="columnsInfo.leftFixedColumns"
        :filteredAndSortedData="filteredAndSortedData"
        :isAllSelected="isAllSelected"
        :isIndeterminate="isIndeterminate"
        :sortConfig="sortConfig"
        :activeFilters="activeFilters"
        :loadMoreLoading="loadMoreLoading"
        :loadMoreFinished="loadMoreFinished"
        :loadMoreError="loadMoreError"
        :loadMoreErrorText="loadMoreErrorText"
        :loadMoreFinishedText="loadMoreFinishedText"
        :loadMoreLoadingText="loadMoreLoadingText"
        :columnCount="leftColumnCount"
        :expandRender="expandRender"
        :getExpandHeaderStyle="getExpandHeaderStyle"
        :getSelectionHeaderStyle="getSelectionHeaderStyle"
        :getHeaderStyle="getHeaderStyle"
        :getHeaderClass="getHeaderClass"
        :getRowClass="getRowClass"
        :getRowStyle="getRowStyle"
        :getExpandCellStyle="getExpandCellStyle"
        :getSelectionCellStyle="getSelectionCellStyle"
        :getColStyle="getColStyle"
        :getRowKey="getRowKey"
        :getCellValue="getCellValue"
        :formatCellValue="formatCellValue"
        :renderCell="renderCell"
        :isRowExpanded="isRowExpanded"
        :isRowSelected="isRowSelected"
        :isRowDisabled="isRowDisabled"
        :handleSelectAll="handleSelectAll"
        :handleHeaderClick="handleSort"
        :toggleFilterPopup="toggleFilter"
        :toggleRowExpansion="toggleRowExpansion"
        :handleCellSelect="handleCellSelect"
        :handleRowClick="handleRowClick"
        :handleRowDoubleClick="handleRowDoubleClick"
        :handleRowMouseEnter="handleRowMouseEnter"
        :handleRowMouseLeave="handleRowMouseLeave"
        :handleRowContextMenu="handleRowContextMenu"
        :handleCellClick="handleCellClick"
        :handleCellDoubleClick="handleCellDoubleClick"
        :handleCellContextMenu="handleCellContextMenu"
        @load-more="$emit('load-more')"
      />

      <!-- 右固定列 -->
      <VantFixedColumn
        v-if="hasRightFixedColumns"
        position="right"
        :shouldShow="!shouldHideFixedColumns"
        :fixedStyle="rightFixedStyle"
        :fixedHeaderWrapperStyle="fixedHeaderWrapperStyle"
        :headerTableStyle="rightHeaderTableStyle"
        :bodyWrapperStyle="rightBodyWrapperStyle"
        :bodyTableStyle="rightBodyTableStyle"
        :fixedColumnLoadMorePositionStyle="fixedColumnLoadMorePositionStyle"
        :expandable="false"
        :selectable="false"
        :isRadioMode="isRadioMode"
        :enableLoadMore="false"
        :showLoadMoreUi="false"
        :fixedHeaders="columnsInfo.rightFixedColumns"
        :filteredAndSortedData="filteredAndSortedData"
        :isAllSelected="isAllSelected"
        :isIndeterminate="isIndeterminate"
        :sortConfig="sortConfig"
        :activeFilters="activeFilters"
        :columnCount="rightColumnCount"
        :expandRender="expandRender"
        :getExpandHeaderStyle="getExpandHeaderStyle"
        :getSelectionHeaderStyle="getSelectionHeaderStyle"
        :getHeaderStyle="getHeaderStyle"
        :getHeaderClass="getHeaderClass"
        :getRowClass="getRowClass"
        :getRowStyle="getRowStyle"
        :getExpandCellStyle="getExpandCellStyle"
        :getSelectionCellStyle="getSelectionCellStyle"
        :getColStyle="getColStyle"
        :getRowKey="getRowKey"
        :getCellValue="getCellValue"
        :formatCellValue="formatCellValue"
        :renderCell="renderCell"
        :isRowExpanded="isRowExpanded"
        :isRowSelected="isRowSelected"
        :isRowDisabled="isRowDisabled"
        :handleSelectAll="handleSelectAll"
        :handleHeaderClick="handleSort"
        :toggleFilterPopup="toggleFilter"
        :toggleRowExpansion="toggleRowExpansion"
        :handleCellSelect="handleCellSelect"
        :handleRowClick="handleRowClick"
        :handleRowDoubleClick="handleRowDoubleClick"
        :handleRowMouseEnter="handleRowMouseEnter"
        :handleRowMouseLeave="handleRowMouseLeave"
        :handleRowContextMenu="handleRowContextMenu"
        :handleCellClick="handleCellClick"
        :handleCellDoubleClick="handleCellDoubleClick"
        :handleCellContextMenu="handleCellContextMenu"
      />

      <!-- 横向滚动条 -->
      <div
        v-if="showHorizontalScrollbar"
        class="vant-table-scrollbar-container"
        :style="horizontalScrollbarContainerStyle">
        
        <!-- 左侧固定区域 -->
        <div class="vant-table-scrollbar-left" :style="scrollbarLeftCornerStyle" @click="scrollToLeft"></div>
        
        <!-- 可滚动区域 -->
        <div class="vant-table-scrollbar-middle">
          <div
            class="vant-table-scroll-x-wrapper"
            :style="scrollbarWrapperStyle"
            ref="scrollbarWrapperRef"
            @click="handleScrollbarTrackClick">
            
            <div
              class="vant-table-scroll-x-handle"
              :style="scrollbarHandleStyle"
              ref="scrollbarHandleRef"
              @mousedown="handleScrollbarMouseDown"
              @mouseenter="handleScrollbarMouseEnter" 
              @mouseleave="handleScrollbarMouseLeave">
              <div class="vant-table-scroll-x-space" :style="scrollbarSpaceStyle"></div>
            </div>
          </div>
        </div>
        
        <!-- 右侧固定区域 -->
        <div class="vant-table-scrollbar-right" :style="scrollbarRightCornerStyle" @click="scrollToRight"></div>
      </div>

      <!-- 加载更多 -->
      <VantTableLoadMore
        v-if="enableLoadMore && showLoadMoreUi"
        class="vant-table-load-more-main"
        :style="loadMoreAreaStyle"
        :loading="loadMoreLoading"
        :finished="loadMoreFinished"
        :error="loadMoreError"
        :error-text="loadMoreErrorText"
        :finished-text="loadMoreFinishedText"
        :loading-text="loadMoreLoadingText"
        @click-error="$emit('load-more')"
      />
    </div>

    <!-- 过滤器弹窗 -->
    <VantTableFilter
      v-for="header in columnsInfo.computedHeaders.filter(h => h.filterable)"
      :key="`filter-${header.key}`"
      :show="currentFilterColumn === header.key"
      :title="`筛选 ${header.label}`"
      :filterType="header.filterType || 'text'"
      :options="getFilterOptions(header.key)"
      :value="activeFilters[header.key]"
      :column="header"
      @update:show="value => value || closeFilter()"
      @confirm="handleFilterConfirm"
      @reset="handleFilterReset"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Loading as VanLoading } from 'vant'
import VantTableHeader from './components/VantTableHeader.vue'
import VantTableBody from './components/VantTableBody.vue'
import VantFixedColumn from './components/VantFixedColumn.vue'
import VantTableLoadMore from './components/VantTableLoadMore.vue'
import VantTableFilter from './components/VantTableFilter.vue'
import { useVantTable } from './composables/useVantTable.js'

// Props定义
const props = defineProps({
  data: { type: Array, default: () => [] },
  headers: { type: Array, default: () => [] },
  height: { type: [Number, String], default: 400 },
  width: { type: [Number, String], default: '100%' },
  minWidth: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  expandable: { type: Boolean, default: false },
  selectable: { type: Boolean, default: false },
  selectMode: { type: String, default: 'checkbox' },
  rowKey: { type: [String, Function], default: 'id' },
  expandRender: Function,
  enableLoadMore: { type: Boolean, default: false },
  showLoadMoreUi: { type: Boolean, default: true },
  loadMoreLoading: { type: Boolean, default: false },
  loadMoreFinished: { type: Boolean, default: false },
  loadMoreError: { type: Boolean, default: false },
  loadMoreErrorText: { type: String, default: '加载失败，点击重试' },
  loadMoreFinishedText: { type: String, default: '没有更多了' },
  loadMoreLoadingText: { type: String, default: '加载中...' },
  loadMoreOffset: { type: Number, default: 50 }
})

// 事件定义
const emit = defineEmits([
  'load-more', 'scroll', 'sort-change', 'selection-change', 
  'select', 'select-all', 'row-click', 'cell-click',
  'row-double-click', 'cell-double-click', 'row-mouse-enter',
  'row-mouse-leave', 'row-context-menu', 'cell-context-menu',
  'expand-change', 'filter-change'
])

// DOM引用
const layoutWrapperRef = ref(null)
const bodyRef = ref(null)
const leftBodyWrapperRef = ref(null)
const rightBodyWrapperRef = ref(null)
const scrollbarWrapperRef = ref(null)
const scrollbarHandleRef = ref(null)

// 使用主组合函数
const tableInstance = useVantTable(props, emit, bodyRef, leftBodyWrapperRef, rightBodyWrapperRef, layoutWrapperRef)

// 计算属性
const tableWrapperClass = computed(() => ({
  'has-load-more': props.enableLoadMore && props.showLoadMoreUi,
  'vant-table--loading': props.loading
}))

const isRadioMode = computed(() => props.selectMode === 'radio')

const headerWrapperStyle = computed(() => ({
  marginLeft: tableInstance.hasLeftFixedContent ? `${tableInstance.leftFixedTotalWidth}px` : '0',
  marginRight: tableInstance.hasRightFixedColumns ? `${tableInstance.columnsInfo.rightFixedWidth}px` : '0'
}))

const totalColumnCount = computed(() => {
  return (props.selectable ? 1 : 0) + 
         (props.expandable ? 1 : 0) + 
         tableInstance.columnsInfo.computedHeaders.length
})

const leftColumnCount = computed(() => {
  return (props.selectable ? 1 : 0) + 
         (props.expandable ? 1 : 0) + 
         tableInstance.columnsInfo.leftFixedColumns.length
})

const rightColumnCount = computed(() => {
  return tableInstance.columnsInfo.rightFixedColumns.length
})

// 暴露方法给父组件
defineExpose({
  clearSelection: tableInstance.clearSelection,
  selectAllCurrentPage: tableInstance.selectAllCurrentPage,
  invertSelection: tableInstance.invertSelection,
  getSelectedRows: tableInstance.getSelectedRows,
  getSelectedRowKeys: tableInstance.getSelectedRowKeys,
  setSelectedRowKeys: tableInstance.setSelectedRowKeys,
  setSelectedRows: tableInstance.setSelectedRows,
  toggleRowSelection: tableInstance.toggleRowSelection,
  scrollToLeft: tableInstance.scrollToLeft,
  scrollToRight: tableInstance.scrollToRight,
  scrollToColumn: tableInstance.scrollToColumn,
  smoothScrollTo: tableInstance.smoothScrollTo
})

// 从tableInstance中解构所有需要的属性和方法
const {
  // 数据
  filteredAndSortedData,
  
  // 计算属性
  columnsInfo,
  hasLeftFixedContent,
  hasRightFixedColumns,
  containerStyle,
  tableStyle,
  bodyWrapperStyle,
  leftFixedStyle,
  rightFixedStyle,
  fixedHeaderWrapperStyle,
  leftHeaderTableStyle,
  rightHeaderTableStyle,
  leftBodyWrapperStyle,
  rightBodyWrapperStyle,
  leftBodyTableStyle,
  rightBodyTableStyle,
  fixedColumnLoadMorePositionStyle,
  loadMoreAreaStyle,
  shouldHideFixedColumns,
  showHorizontalScrollbar,
  
  // 样式
  selectionColStyle,
  expandColStyle,
  horizontalScrollbarContainerStyle,
  scrollbarLeftCornerStyle,
  scrollbarRightCornerStyle,
  scrollbarWrapperStyle,
  scrollbarHandleStyle,
  scrollbarSpaceStyle,
  
  // 状态
  isAllSelected,
  isIndeterminate,
  sortConfig,
  activeFilters,
  currentFilterColumn,
  hasActiveFilters,
  
  // 方法
  getRowKey,
  getColStyle,
  getHeaderClass,
  getHeaderStyle,
  getRowClass,
  getRowStyle,
  getFixedCellClass,
  getSelectionHeaderStyle,
  getSelectionCellStyle,
  getExpandHeaderStyle,
  getExpandCellStyle,
  getCellClass,
  getCellStyle,
  getCheckboxClass,
  getRadioClass,
  getCellValue,
  formatCellValue,
  renderCell,
  isRowSelected,
  isRowDisabled,
  isRowExpanded,
  
  // 事件处理
  handleScroll,
  handleMainTableWheel,
  handleMainTableTouchStart,
  handleMainTableTouchMove,
  handleMainTableTouchEnd,
  handleSort,
  handleSelectAll,
  handleRowSelect,
  handleCellSelect,
  handleSelectionToggle,
  toggleRowExpansion,
  handleRowClick,
  handleRowDoubleClick,
  handleRowMouseEnter,
  handleRowMouseLeave,
  handleRowContextMenu,
  handleCellClick,
  handleCellDoubleClick,
  handleCellContextMenu,
  handleRowClickWithHighlight,
  
  // 引用设置
  setRowElementRef,
  setExpandedRowElementRef,
  
  // 滚动条
  scrollToLeft,
  scrollToRight,
  handleScrollbarTrackClick,
  handleScrollbarMouseDown,
  handleScrollbarMouseEnter,
  handleScrollbarMouseLeave,
  
  // 过滤
  toggleFilter,
  closeFilter,
  getFilterOptions,
  handleFilterConfirm,
  handleFilterReset,
  
  // 其他
  clearSelection,
  selectAllCurrentPage,
  invertSelection,
  getSelectedRows,
  getSelectedRowKeys,
  setSelectedRowKeys,
  setSelectedRows,
  toggleRowSelection,
  scrollToColumn,
  smoothScrollTo
} = tableInstance
</script>

<style scoped>
.vant-table-wrapper {
  position: relative;
  background: #fff;
  border: 1px solid var(--van-border-color);
  border-radius: 6px;
  overflow: hidden;
}

.vant-table-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.vant-table-layout-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.vant-table-header {
  position: relative;
  z-index: 10;
  background: #fff;
  border-bottom: 1px solid var(--van-border-color);
}

.vant-table-scrollbar-container {
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.vant-table-scrollbar-middle {
  flex: 1;
  position: relative;
}

.vant-table-load-more-main {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}
</style>