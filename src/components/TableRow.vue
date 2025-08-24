<template>
  <!-- 主行 -->
  <tr
    :class="getRowClass(rowIndex, row)"
    :style="getRowStyle(rowIndex)"
    :data-row-index="rowIndex"
    :ref="el => setRowElementRef(el, rowIndex, 'main')"
    @click="handleSingleRowHighlight($event, rowIndex); handleRowClickLocal(row, rowIndex)"
    @mouseenter="handleRowMouseEnter(rowIndex)"
    @mouseleave="handleRowMouseLeave(rowIndex)">

    <td
      v-for="(header, colIndex) in columnsInfo.computedHeaders"
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
      :colspan="columnsInfo.computedHeaders.length"
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

<script setup>
defineProps({
  row: Object,
  rowIndex: Number,
  expandable: Boolean,
  columnsInfo: Object,
  
  // 函数 props
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
  isExpanded: Function
})
</script>