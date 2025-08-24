<template>
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
      v-if="expandable"
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
      v-if="selectable"
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

    <!-- 数据列 -->
    <td
      v-for="(header, colIndex) in computedHeaders"
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
    v-if="expandable && isRowExpanded(row, rowIndex)"
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

<script>
import { h } from 'vue'
import { VCheckbox } from '../components/VCheckbox.js'
import { VRadio } from '../components/VRadio.js'

export default {
  name: 'VantTableRow',
  components: {
    VCheckbox,
    VRadio
  },
  props: {
    row: Object,
    rowIndex: Number,
    expandable: Boolean,
    selectable: Boolean,
    isRadioMode: Boolean,
    computedHeaders: Array,
    expandRender: Function,
    columnCount: Number,
    
    // 样式函数
    getRowClass: Function,
    getRowStyle: Function,
    getExpandCellStyle: Function,
    getSelectionCellStyle: Function,
    getColStyle: Function,
    
    // 数据函数
    getCellValue: Function,
    formatCellValue: Function,
    renderCell: Function,
    
    // 状态检查函数
    isRowExpanded: Function,
    isRowSelected: Function,
    isRowDisabled: Function,
    
    // 事件处理函数
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