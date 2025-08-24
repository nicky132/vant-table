<template>
  <div 
    v-if="shouldShow" 
    :class="[
      'vant-table-fixed', 
      `vant-table-fixed--${position}`
    ]" 
    :style="fixedStyle">
    <!-- 固定列表头 -->
    <div class="vant-table-fixed__header" :style="fixedHeaderWrapperStyle">
      <table class="vant-table vant-table--header" :style="headerTableStyle">
        <colgroup>
          <col v-if="showSelection" :style="selectionColStyle" />
          <col v-if="showExpand" :style="expandColStyle" />
          <col v-for="header in columns" :key="header.key" :style="getColStyle(header)" />
        </colgroup>
        <thead class="vant-thead">
          <tr :class="['vant-thead-row', `vant-thead-row--${position}`]" ref="headerRowRef">
            <!-- 选择列表头 -->
            <th
              v-if="showSelection"
              :class="getFixedHeaderClass('selection', position)"
              :style="getSelectionHeaderStyle()">
              <div class="vant-th__content">
                <div class="vant-selection-header">
                  <VTableCheckbox
                    v-if="!isRadioMode"
                    :model-value="isAllSelected"
                    :indeterminate="isIndeterminate"
                    @update:model-value="handleSelectAll"
                    :disabled="!selectableRows.length || allRowsDisabled" />
                  <span v-else class="vant-selection-header__text">选择</span>
                </div>
              </div>
            </th>

            <!-- 展开列表头 -->
            <th
              v-if="showExpand"
              :class="getFixedHeaderClass('expand', position)"
              :style="getExpandHeaderStyle()">
              <div class="vant-th__content"></div>
            </th>

            <!-- 固定列表头 -->
            <th
              v-for="header in columns"
              :key="header.key"
              :class="getFixedHeaderClass(header, position)"
              :style="getFixedHeaderStyle(header)"
              :data-key="header.key"
              :ref="el => setHeaderElementRef(el, header.key, position)">
              <div class="vant-th__content" @click="handleSort(header)">
                <span class="vant-th__text">{{ header.label }}</span>
                <div v-if="header.sortable" class="vant-th__sort-icon">
                  <svg
                    class="vant-sort-icon"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none">
                    <path
                      :class="[
                        'vant-sort-icon__asc',
                        {
                          'vant-sort-icon--active':
                            sortConfig.key === header.key && sortConfig.direction === 'asc'
                        }
                      ]"
                      d="M3.96569 4C3.60932 4 3.43086 3.56914 3.68284 3.31716L5.71716 1.28284C5.87337 1.12663 6.12663 1.12663 6.28284 1.28284L8.31716 3.31716C8.56914 3.56914 8.39068 4 8.03431 4L3.96569 4Z"
                      stroke-linejoin="round" />
                    <path
                      :class="[
                        'vant-sort-icon__desc',
                        {
                          'vant-sort-icon--active':
                            sortConfig.key === header.key && sortConfig.direction === 'desc'
                        }
                      ]"
                      d="M8.03431 8C8.39068 8 8.56914 8.43086 8.31716 8.68284L6.28284 10.7172C6.12663 10.8734 5.87337 10.8734 5.71716 10.7172L3.68284 8.68284C3.43086 8.43086 3.60932 8 3.96569 8H8.03431Z"
                      stroke-linejoin="round" />
                  </svg>
                </div>
                <i
                  v-if="header.filterable"
                  class="van-icon van-icon-filter-o vant-th__filter-icon"
                  :class="{ 'vant-th__filter-icon--active': isFilterActive(header.key) }"
                  @click.stop="toggleFilter(header.key)">
                </i>
              </div>
            </th>
          </tr>
        </thead>
      </table>
    </div>

    <!-- 固定列表体 -->
    <div 
      :class="['vant-table-fixed__body']" 
      :style="bodyWrapperStyle" 
      ref="bodyWrapperRef" 
      @scroll="handleFixedColumnScroll"
      @wheel="handleFixedColumnWheel" 
      @touchstart="handleFixedColumnTouchStart" 
      @touchmove="handleFixedColumnTouchMove" 
      @touchend="handleFixedColumnTouchEnd"
      @mouseenter="() => handleAreaMouseEnter(position)"
      @mouseleave="() => handleAreaMouseLeave(position)">
      <table class="vant-table vant-table--body" :style="bodyTableStyle">
        <colgroup>
          <col v-if="showSelection" :style="selectionColStyle" />
          <col v-if="showExpand" :style="expandColStyle" />
          <col v-for="header in columns" :key="header.key" :style="getColStyle(header)" />
        </colgroup>
        <tbody class="vant-tbody" ref="tbodyRef">
          <!-- 空数据状态 -->
          <tr v-if="!filteredAndSortedData || !filteredAndSortedData.length">
            <td
              :colspan="(showSelection ? 1 : 0) + (showExpand ? 1 : 0) + columns.length"
              class="vant-td vant-td--empty">
              <div class="vant-empty-content">
                <VanEmpty :description="hasActiveFilters ? '没有符合条件的数据' : '暂无数据'" />
              </div>
            </td>
          </tr>

          <!-- 数据行 -->
          <template v-else>
            <template
              v-for="(row, rowIndex) in filteredAndSortedData"
              :key="getRowKey(row, rowIndex)">
              <!-- 主行 -->
              <tr
                :class="getRowClass(rowIndex, row)"
                :style="getRowStyle(rowIndex)"
                :data-row-index="rowIndex"
                :ref="el => setRowElementRef(el, rowIndex, position)"
                @click="handleSingleRowHighlight($event, rowIndex); handleRowClickLocal(row, rowIndex)"
                @mouseenter="handleRowMouseEnter(rowIndex)"
                @mouseleave="handleRowMouseLeave(rowIndex)">
                
                <!-- 选择列 -->
                <td
                  v-if="showSelection"
                  :class="getFixedCellClass('selection', row, rowIndex, position)"
                  :style="getSelectionCellStyle()"
                  @click.stop="handleCellSelect(row, rowIndex, $event)">
                  <div class="vant-td__content">
                    <VTableCheckbox
                      v-if="!isRadioMode"
                      :model-value="isRowSelected(row, rowIndex)"
                      :disabled="isRowDisabled(row, rowIndex)"
                      @update:model-value="checked => handleRowSelect(row, rowIndex, checked)" />
                    <VTableRadio
                      v-else
                      :model-value="isRowSelected(row, rowIndex)"
                      :disabled="isRowDisabled(row, rowIndex)"
                      @update:model-value="checked => handleRowSelect(row, rowIndex, checked)" />
                  </div>
                </td>

                <!-- 展开列 -->
                <td
                  v-if="showExpand"
                  :class="getFixedCellClass('expand', row, rowIndex, position)"
                  :style="getExpandCellStyle()"
                  @click.stop="toggleExpand(row, rowIndex)">
                  <div class="vant-td__content">
                    <i
                      class="van-icon van-icon-arrow vant-td__expand-icon"
                      :class="{ 'vant-td__expand-icon--expanded': isExpanded(row, rowIndex) }">
                    </i>
                  </div>
                </td>

                <!-- 固定列数据 -->
                <td
                  v-for="(header, colIndex) in columns"
                  :key="header.key"
                  :class="getFixedCellClass(header, row, rowIndex, position)"
                  :style="getFixedCellStyle(header)"
                  :data-key="header.key"
                  @click="handleSingleRowHighlight($event, rowIndex); handleCellClick(row, header, rowIndex, colIndex, $event)">
                  <div class="vant-td__content">
                    <div
                      v-if="header.showDataBar && !isRowTotal(row)"
                      class="vant-td__data-bar"
                      :style="getDataBarStyle(getCellValue(row, header.key), header.key)"></div>
                    <span
                      :class="{ 'vant-td__link': header.link, 'vant-td__text': !header.link }">
                      <component
                        v-if="header.renderCell"
                        :is="renderCustomCell(
                          getCellValue(row, header.key),
                          row,
                          header,
                          rowIndex,
                          colIndex
                        )" />
                      <template v-else>
                        {{ formatCellValue(getCellValue(row, header.key), header) }}
                      </template>
                    </span>
                  </div>
                </td>
              </tr>

              <!-- 扩展行（固定列部分）-->
              <tr
                v-if="expandable && isExpanded(row, rowIndex)"
                :class="['vant-tr', 'vant-tr--expanded']"
                :data-expanded-row-index="rowIndex">
                <td
                  :colspan="(showSelection ? 1 : 0) + (showExpand ? 1 : 0) + columns.length"
                  class="vant-td vant-td--expanded vant-td--fixed">
                  <div class="vant-td__expand-content vant-td__expand-content--fixed">
                    <!-- 固定列的扩展内容 -->
                    <div class="vant-expand-panel">
                      <div class="vant-expand-panel__content vant-expand-panel__content--fixed">
                        <div
                          v-if="columns[0]"
                          class="vant-field vant-field--readonly">
                          <div class="vant-field__label">{{ columns[0].label }}:</div>
                          <div class="vant-field__value">{{ getCellValue(row, columns[0].key) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>
    
    <!-- 固定列的加载更多占位 -->
    <div 
      v-if="enableLoadMore && showLoadMoreUi" 
      :class="['vant-table-load-more', `vant-table-load-more--fixed-${position}`]" 
      :style="fixedColumnLoadMorePositionStyle">
      <div v-if="loadMoreLoading" class="vant-table-load-more__loading">
        <VanLoading size="16px" />
        <span>{{ loadMoreLoadingText }}</span>
      </div>
      <div
        v-else-if="loadMoreError"
        class="vant-table-load-more__error"
        @click="$emit('load-more')">
        <span>{{ loadMoreErrorText }}</span>
      </div>
      <div v-else-if="loadMoreFinished" class="vant-table-load-more__finished">
        <span>{{ loadMoreFinishedText }}</span>
      </div>
      <div v-else class="vant-table-load-more__ready">
        <span>{{ loadMoreReadyText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Empty as VanEmpty, Loading as VanLoading } from 'vant'
import VTableCheckbox from './VTableCheckbox.vue'
import VTableRadio from './VTableRadio.vue'

const props = defineProps({
  position: {
    type: String,
    required: true,
    validator: value => ['left', 'right'].includes(value)
  },
  shouldShow: Boolean,
  columns: Array,
  showSelection: Boolean,
  showExpand: Boolean,
  shouldShowShadow: Boolean, // 🔑 参考vxe-table的阴影控制
  
  // 样式相关
  fixedStyle: Object,
  fixedHeaderWrapperStyle: Object,
  headerTableStyle: Object,
  bodyWrapperStyle: Object,
  bodyTableStyle: Object,
  selectionColStyle: Object,
  expandColStyle: Object,
  fixedColumnLoadMorePositionStyle: Object,
  
  // 数据相关
  filteredAndSortedData: Array,
  hasActiveFilters: Boolean,
  sortConfig: Object,
  isRadioMode: Boolean,
  isAllSelected: Boolean,
  isIndeterminate: Boolean,
  selectableRows: Array,
  allRowsDisabled: Boolean,
  columnsInfo: Object,
  tableStyle: Object,
  expandable: Boolean,
  
  // 加载更多相关
  enableLoadMore: Boolean,
  showLoadMoreUi: Boolean,
  loadMoreLoading: Boolean,
  loadMoreError: Boolean,
  loadMoreFinished: Boolean,
  loadMoreLoadingText: String,
  loadMoreErrorText: String,
  loadMoreFinishedText: String,
  loadMoreReadyText: String,
  
  // 函数相关
  getColStyle: Function,
  getFixedHeaderClass: Function,
  getFixedHeaderStyle: Function,
  getFixedCellClass: Function,
  getFixedCellStyle: Function,
  getSelectionHeaderStyle: Function,
  getExpandHeaderStyle: Function,
  getSelectionCellStyle: Function,
  getExpandCellStyle: Function,
  setHeaderElementRef: Function,
  handleSort: Function,
  isFilterActive: Function,
  toggleFilter: Function,
  handleFixedColumnScroll: Function,
  handleFixedColumnWheel: Function,
  handleFixedColumnTouchStart: Function,
  handleAreaMouseEnter: Function,
  handleAreaMouseLeave: Function,
  handleFixedColumnTouchMove: Function,
  handleFixedColumnTouchEnd: Function,
  getRowClass: Function,
  getRowStyle: Function,
  setRowElementRef: Function,
  handleSingleRowHighlight: Function,
  handleRowClickLocal: Function,
  handleRowMouseEnter: Function,
  handleRowMouseLeave: Function,
  getCellClass: Function,
  getCellStyle: Function,
  handleCellSelect: Function,
  isRowSelected: Function,
  isRowDisabled: Function,
  handleRowSelect: Function,
  toggleExpand: Function,
  isExpanded: Function,
  handleCellClick: Function,
  isRowTotal: Function,
  getDataBarStyle: Function,
  getCellValue: Function,
  renderCustomCell: Function,
  formatCellValue: Function,
  getRowKey: Function,
  handleSelectAll: Function
})

// 添加调试信息
console.log(`FixedColumn ${props.position} debug:`, {
  shouldShow: props.shouldShow,
  columns: props.columns,
  columnsLength: props.columns?.length || 0,
  filteredData: props.filteredAndSortedData,
  filteredDataLength: props.filteredAndSortedData?.length || 0,
  filteredDataType: typeof props.filteredAndSortedData,
  filteredDataIsArray: Array.isArray(props.filteredAndSortedData),
  showSelection: props.showSelection,
  showExpand: props.showExpand,
  hasActiveFilters: props.hasActiveFilters
})

// 🔑 关键调试：检查模板条件
console.log(`FixedColumn ${props.position} template conditions:`, {
  'shouldShow': props.shouldShow,
  '!filteredAndSortedData.length': !props.filteredAndSortedData?.length,
  'will show empty state': !props.filteredAndSortedData?.length,
  'will show data rows': !!props.filteredAndSortedData?.length
})

defineEmits(['load-more'])

import { ref } from 'vue'

// 组件内部引用
const headerRowRef = ref(null)
const bodyWrapperRef = ref(null)
const tbodyRef = ref(null)

defineExpose({
  headerRowRef,
  bodyWrapperRef,
  tbodyRef
})
</script>