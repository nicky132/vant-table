<template>
  <div class="vant-table-body" :style="bodyWrapperStyle" @scroll="handleScroll" @wheel="handleMainTableWheel" @touchstart="handleMainTableTouchStart" @touchmove="handleMainTableTouchMove" @touchend="handleMainTableTouchEnd" @mouseenter="() => handleAreaMouseEnter('main')" @mouseleave="() => handleAreaMouseLeave('main')" ref="bodyRef">
    <table class="vant-table vant-table--body" :style="tableStyle">
      <colgroup>
        <col v-if="expandable && !hasLeftFixedExpand" :style="{ width: '40px' }" />
        <col v-for="header in columnsInfo.mainHeaders" :key="header.key" :style="getColStyle(header)" />
      </colgroup>
      <tbody class="vant-tbody" ref="tbodyRef">
        <!-- 空数据状态 -->
        <tr v-if="!filteredAndSortedData.length">
          <td
            :colspan="(expandable && !hasLeftFixedExpand ? 1 : 0) + columnsInfo.mainHeaders.length"
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
              :ref="el => setRowElementRef(el, rowIndex, 'main')"
              @click="handleSingleRowHighlight($event, rowIndex); handleRowClickLocal(row, rowIndex)"
              @mouseenter="handleRowMouseEnter(rowIndex)"
              @mouseleave="handleRowMouseLeave(rowIndex)">

              <!-- 展开列 - 只在没有左固定列展开时显示 -->
              <td
                v-if="expandable && !hasLeftFixedExpand"
                class="vant-td vant-td--expand"
                :style="{ width: '40px', textAlign: 'center' }"
                @click.stop="toggleExpand(row, rowIndex)">
                <div class="vant-td__content">
                  <i
                    class="van-icon van-icon-arrow vant-td__expand-icon"
                    :class="{ 'vant-td__expand-icon--expanded': isExpanded(row, rowIndex) }">
                  </i>
                </div>
              </td>

              <td
                v-for="(header, colIndex) in columnsInfo.mainHeaders"
                :key="header.key"
                :class="getCellClass(header, row, rowIndex)"
                :style="getCellStyle(header)"
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

            <!-- 扩展行 -->
            <tr
              v-if="expandable && isExpanded(row, rowIndex)"
              :class="['vant-tr', 'vant-tr--expanded']"
              :data-expanded-row-index="rowIndex">
              <td
                :colspan="(expandable && !hasLeftFixedExpand ? 1 : 0) + columnsInfo.mainHeaders.length"
                class="vant-td vant-td--expanded">
                <div class="vant-td__expand-content">
                  <slot name="expanded" :row="row" :rowIndex="rowIndex">
                    <div class="vant-expand-panel">
                      <div class="vant-expand-panel__header">
                        <h4>详细信息</h4>
                      </div>
                      <div class="vant-expand-panel__content">
                        <div
                          v-for="(value, key) in row"
                          :key="key"
                          class="vant-field vant-field--readonly">
                          <div class="vant-field__label">{{ key }}:</div>
                          <div class="vant-field__value">{{ value }}</div>
                        </div>
                      </div>
                    </div>
                  </slot>
                </div>
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Empty as VanEmpty } from 'vant'

defineProps({
  bodyWrapperStyle: Object,
  tableStyle: Object,
  columnsInfo: Object,
  filteredAndSortedData: Array,
  hasActiveFilters: Boolean,
  expandable: Boolean,
  hasLeftFixedExpand: Boolean,
  
  // Functions
  handleScroll: Function,
  handleMainTableWheel: Function,
  handleMainTableTouchStart: Function,
  handleMainTableTouchMove: Function,
  handleMainTableTouchEnd: Function,
  handleAreaMouseEnter: Function,
  handleAreaMouseLeave: Function,
  getColStyle: Function,
  getRowKey: Function,
  getRowClass: Function,
  getRowStyle: Function,
  setRowElementRef: Function,
  handleSingleRowHighlight: Function,
  handleRowClickLocal: Function,
  handleRowMouseEnter: Function,
  handleRowMouseLeave: Function,
  getCellClass: Function,
  getCellStyle: Function,
  handleCellClick: Function,
  isRowTotal: Function,
  getDataBarStyle: Function,
  getCellValue: Function,
  renderCustomCell: Function,
  formatCellValue: Function,
  isExpanded: Function,
  toggleExpand: Function
})

// 组件内部引用
const bodyRef = ref(null)
const tbodyRef = ref(null)

defineSlots()

defineExpose({
  bodyRef,
  tbodyRef
})
</script>