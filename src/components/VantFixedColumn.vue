<template>
  <div
    :class="['vant-table-fixed', `vant-table-fixed--${position}`]"
    :style="fixedStyle"
    v-show="shouldShow"
  >
    <!-- 固定表头 -->
    <div class="vant-table-fixed__header-wrapper" :style="fixedHeaderWrapperStyle">
      <table class="vant-table" :style="headerTableStyle">
        <thead>
          <tr class="vant-thead-tr">
            <!-- 展开列 -->
            <th
              v-if="expandable && position === 'left'"
              :style="getExpandHeaderStyle()"
              class="vant-th vant-expand-header"
            >
              <div class="vant-th-content">
                <span class="vant-expand-header-text"></span>
              </div>
            </th>

            <!-- 选择列 -->
            <th
              v-if="selectable && position === 'left'"
              :style="getSelectionHeaderStyle()"
              class="vant-th vant-selection-header"
            >
              <div class="vant-th-content">
                <VCheckbox
                  v-if="!isRadioMode"
                  :modelValue="isAllSelected"
                  :indeterminate="isIndeterminate"
                  @update:modelValue="handleSelectAll"
                  class="vant-header-checkbox"
                />
              </div>
            </th>

            <!-- 固定列 -->
            <th
              v-for="header in fixedHeaders"
              :key="header.key"
              :style="getHeaderStyle(header)"
              :class="getHeaderClass(header)"
              @click="handleHeaderClick(header, $event)"
            >
              <div class="vant-th-content">
                <span class="vant-th-title">{{ header.title }}</span>
                
                <!-- 排序图标 -->
                <span v-if="header.sortable" class="vant-sort-caret-wrapper">
                  <i
                    class="vant-sort-caret ascending"
                    :class="{
                      active: sortConfig.key === header.key && sortConfig.direction === 'asc'
                    }"
                  ></i>
                  <i
                    class="vant-sort-caret descending"
                    :class="{
                      active: sortConfig.key === header.key && sortConfig.direction === 'desc'
                    }"
                  ></i>
                </span>

                <!-- 过滤器图标 -->
                <span
                  v-if="header.filterable"
                  class="vant-filter-trigger"
                  :class="{ active: activeFilters[header.key] }"
                  @click.stop="toggleFilterPopup(header.key)"
                >
                  <i class="vant-filter-icon"></i>
                </span>
              </div>
            </th>
          </tr>
        </thead>
      </table>
    </div>

    <!-- 固定表体 -->
    <div class="vant-table-fixed__body-wrapper" :style="bodyWrapperStyle">
      <table class="vant-table" :style="bodyTableStyle">
        <tbody>
          <template v-for="(row, rowIndex) in filteredAndSortedData" :key="getRowKey(row, rowIndex)">
            <tr
              :class="getRowClass(rowIndex, row)"
              :style="getRowStyle(rowIndex)"
              @click="handleRowClick(row, rowIndex, $event)"
              @dblclick="handleRowDoubleClick(row, rowIndex, $event)"
              @mouseenter="handleRowMouseEnter(row, rowIndex, $event)"
              @mouseleave="handleRowMouseLeave(row, rowIndex, $event)"
              @contextmenu="handleRowContextMenu(row, rowIndex, $event)"
            >
              <!-- 展开列 -->
              <td
                v-if="expandable && position === 'left'"
                :style="getExpandCellStyle()"
                class="vant-td vant-expand-cell"
                @click.stop
              >
                <div class="vant-td-content">
                  <span
                    class="vant-expand-icon"
                    :class="{ expanded: isRowExpanded(row, rowIndex) }"
                    @click="toggleRowExpansion(row, rowIndex)"
                  >
                    <i class="vant-expand-arrow"></i>
                  </span>
                </div>
              </td>

              <!-- 选择列 -->
              <td
                v-if="selectable && position === 'left'"
                :style="getSelectionCellStyle()"
                class="vant-td vant-selection-cell"
                @click.stop="handleCellSelect(row, rowIndex, $event)"
              >
                <div class="vant-td-content">
                  <VCheckbox
                    v-if="!isRadioMode"
                    :modelValue="isRowSelected(row, rowIndex)"
                    :disabled="isRowDisabled(row, rowIndex)"
                    class="vant-row-checkbox"
                  />
                  <VRadio
                    v-else
                    :modelValue="isRowSelected(row, rowIndex)"
                    :disabled="isRowDisabled(row, rowIndex)"
                    class="vant-row-radio"
                  />
                </div>
              </td>

              <!-- 固定列数据 -->
              <td
                v-for="(header, colIndex) in fixedHeaders"
                :key="header.key"
                :style="getColStyle(header)"
                class="vant-td"
                @click="handleCellClick(row, header, rowIndex, colIndex, getCellValue(row, header.key), $event)"
                @dblclick="handleCellDoubleClick(row, header, rowIndex, colIndex, getCellValue(row, header.key), $event)"
                @contextmenu="handleCellContextMenu(row, header, rowIndex, colIndex, getCellValue(row, header.key), $event)"
              >
                <div class="vant-td-content">
                  <component
                    :is="renderCell(getCellValue(row, header.key), row, header, rowIndex, colIndex, h)"
                    v-if="header.renderCell"
                  />
                  <span v-else>
                    {{ formatCellValue(getCellValue(row, header.key), header) }}
                  </span>
                </div>
              </td>
            </tr>

            <!-- 展开行 -->
            <tr
              v-if="expandable && isRowExpanded(row, rowIndex) && position === 'left'"
              :class="['vant-expanded-row']"
              :data-expanded-row-index="rowIndex"
            >
              <td :colspan="columnCount" class="vant-expanded-cell">
                <div class="vant-expanded-content">
                  <component
                    :is="expandRender"
                    v-if="expandRender"
                    :row="row"
                    :rowIndex="rowIndex"
                  />
                  <slot
                    v-else
                    name="expand"
                    :row="row"
                    :rowIndex="rowIndex"
                  >
                    <div class="vant-expanded-default">
                      <pre>{{ JSON.stringify(row, null, 2) }}</pre>
                    </div>
                  </slot>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- 加载更多UI（仅左侧固定列显示） -->
    <div
      v-if="enableLoadMore && showLoadMoreUi && position === 'left'"
      class="vant-table-load-more-fixed"
      :style="fixedColumnLoadMorePositionStyle"
    >
      <VantTableLoadMore
        :loading="loadMoreLoading"
        :finished="loadMoreFinished"
        :error="loadMoreError"
        :error-text="loadMoreErrorText"
        :finished-text="loadMoreFinishedText"
        :loading-text="loadMoreLoadingText"
        @click-error="$emit('load-more')"
      />
    </div>
  </div>
</template>

<script>
import { h } from 'vue'
import { VCheckbox } from '../components/VCheckbox.js'
import { VRadio } from '../components/VRadio.js'

export default {
  name: 'VantFixedColumn',
  components: {
    VCheckbox,
    VRadio
  },
  props: {
    position: {
      type: String,
      required: true,
      validator: value => ['left', 'right'].includes(value)
    },
    shouldShow: Boolean,
    fixedStyle: Object,
    fixedHeaderWrapperStyle: Object,
    headerTableStyle: Object,
    bodyWrapperStyle: Object,
    bodyTableStyle: Object,
    fixedColumnLoadMorePositionStyle: Object,
    
    // 表格配置
    expandable: Boolean,
    selectable: Boolean,
    isRadioMode: Boolean,
    enableLoadMore: Boolean,
    showLoadMoreUi: Boolean,
    
    // 数据
    fixedHeaders: Array,
    filteredAndSortedData: Array,
    
    // 状态
    isAllSelected: Boolean,
    isIndeterminate: Boolean,
    sortConfig: Object,
    activeFilters: Object,
    loadMoreLoading: Boolean,
    loadMoreFinished: Boolean,
    loadMoreError: Boolean,
    loadMoreErrorText: String,
    loadMoreFinishedText: String,
    loadMoreLoadingText: String,
    
    // 计算属性
    columnCount: Number,
    expandRender: Function,
    
    // 样式函数
    getExpandHeaderStyle: Function,
    getSelectionHeaderStyle: Function,
    getHeaderStyle: Function,
    getHeaderClass: Function,
    getRowClass: Function,
    getRowStyle: Function,
    getExpandCellStyle: Function,
    getSelectionCellStyle: Function,
    getColStyle: Function,
    
    // 数据函数
    getRowKey: Function,
    getCellValue: Function,
    formatCellValue: Function,
    renderCell: Function,
    
    // 状态检查函数
    isRowExpanded: Function,
    isRowSelected: Function,
    isRowDisabled: Function,
    
    // 事件处理函数
    handleSelectAll: Function,
    handleHeaderClick: Function,
    toggleFilterPopup: Function,
    toggleRowExpansion: Function,
    handleCellSelect: Function,
    handleRowClick: Function,
    handleRowDoubleClick: Function,
    handleRowMouseEnter: Function,
    handleRowMouseLeave: Function,
    handleRowContextMenu: Function,
    handleCellClick: Function,
    handleCellDoubleClick: Function,
    handleCellContextMenu: Function
  },
  setup() {
    return { h }
  }
}
</script>