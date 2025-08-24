<template>
  <div class="vant-table-body" :style="bodyWrapperStyle" @scroll="handleScroll" @wheel="handleWheel" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd" :ref="bodyRefKey">
    <table class="vant-table vant-table--body" :style="tableStyle">
      <colgroup>
        <col v-if="showSelection" :style="selectionColStyle" />
        <col v-if="showExpand" :style="expandColStyle" />
        <col v-for="header in headers" :key="header.key" :style="getColStyle(header)" />
      </colgroup>
      <tbody class="vant-tbody" :ref="tbodyRefKey">
        <!-- 空数据状态 -->
        <tr v-if="!data.length">
          <td
            :colspan="columnCount"
            class="vant-td vant-td--empty">
            <div class="vant-empty-content">
              <VanEmpty :description="emptyDescription" />
            </div>
          </td>
        </tr>

        <!-- 数据行 -->
        <template v-else>
          <template
            v-for="(row, rowIndex) in data"
            :key="getRowKey(row, rowIndex)">
            <!-- 主行 -->
            <tr
              :class="getRowClass(rowIndex, row)"
              :style="getRowStyle(rowIndex)"
              :data-row-index="rowIndex"
              :ref="el => setRowElementRef(el, rowIndex, position)"
              @click="handleRowClickWithHighlight($event, rowIndex, row)"
              @mouseenter="handleRowMouseEnter(rowIndex)"
              @mouseleave="handleRowMouseLeave(rowIndex)">
              
              <!-- 选择列 -->
              <td
                v-if="showSelection"
                :class="getFixedCellClass('selection', row, rowIndex, position)"
                :style="getSelectionCellStyle()"
                @click.stop="handleSelectionToggle(row, rowIndex, $event)">
                <div class="vant-td__content">
                  <VCheckbox
                    v-if="!isRadioMode"
                    :modelValue="isRowSelected(row, rowIndex)"
                    :disabled="isRowDisabled(row, rowIndex)"
                    :class="getCheckboxClass(row, rowIndex)"
                    @update:modelValue="checked => handleRowSelect(row, rowIndex, checked)" />
                  <VRadio
                    v-else
                    :modelValue="isRowSelected(row, rowIndex)"
                    :disabled="isRowDisabled(row, rowIndex)"
                    :class="getRadioClass(row, rowIndex)"
                    @update:modelValue="checked => handleRowSelect(row, rowIndex, checked)" />
                </div>
              </td>

              <!-- 展开列 -->
              <td
                v-if="showExpand"
                :class="getFixedCellClass('expand', row, rowIndex, position)"
                :style="getExpandCellStyle()"
                @click.stop="toggleRowExpansion(row, rowIndex)">
                <div class="vant-td__content">
                  <i
                    class="van-icon"
                    :class="[
                      isRowExpanded(row, rowIndex) ? 'van-icon-arrow-down' : 'van-icon-arrow',
                      'vant-expand-icon',
                      { expanded: isRowExpanded(row, rowIndex) }
                    ]">
                  </i>
                </div>
              </td>

              <!-- 数据列 -->
              <td
                v-for="(header, colIndex) in headers"
                :key="header.key"
                :class="getCellClass(header, row, rowIndex, colIndex, position)"
                :style="getCellStyle(header)"
                @click="handleCellClick(row, header, rowIndex, colIndex, getCellValue(row, header.key), $event)"
                @dblclick="handleCellDoubleClick(row, header, rowIndex, colIndex, getCellValue(row, header.key), $event)"
                @contextmenu="handleCellContextMenu(row, header, rowIndex, colIndex, getCellValue(row, header.key), $event)">
                <div class="vant-td__content">
                  <component
                    :is="renderCell(getCellValue(row, header.key), row, header, rowIndex, colIndex, h)"
                    v-if="header.renderCell" />
                  <span v-else>
                    {{ formatCellValue(getCellValue(row, header.key), header) }}
                  </span>
                </div>
              </td>
            </tr>

            <!-- 展开行 -->
            <tr
              v-if="showExpand && isRowExpanded(row, rowIndex)"
              :class="['vant-expanded-row', `vant-expanded-row--${position}`]"
              :data-expanded-row-index="rowIndex"
              :ref="el => setExpandedRowElementRef(el, rowIndex, position)">
              <td :colspan="columnCount" class="vant-expanded-cell">
                <div class="vant-expanded-content">
                  <component
                    :is="expandRender"
                    v-if="expandRender"
                    :row="row"
                    :rowIndex="rowIndex" />
                  <slot
                    v-else
                    name="expand"
                    :row="row"
                    :rowIndex="rowIndex">
                    <div class="vant-expanded-default">
                      <pre>{{ JSON.stringify(row, null, 2) }}</pre>
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

<script>
import { h } from 'vue'
import { Empty as VanEmpty } from 'vant'

export default {
  name: 'VantTableBody',
  components: {
    VanEmpty
  },
  props: {
    // 位置标识
    position: {
      type: String,
      default: 'main'
    },
    
    // 数据
    data: {
      type: Array,
      required: true
    },
    headers: {
      type: Array,
      required: true
    },
    
    // 配置
    showSelection: Boolean,
    showExpand: Boolean,
    isRadioMode: Boolean,
    expandRender: Function,
    emptyDescription: String,
    
    // 样式
    bodyWrapperStyle: Object,
    tableStyle: Object,
    selectionColStyle: Object,
    expandColStyle: Object,
    
    // 计算属性
    columnCount: Number,
    
    // ref相关
    bodyRefKey: String,
    tbodyRefKey: String,
    
    // 样式函数
    getColStyle: Function,
    getRowClass: Function,
    getRowStyle: Function,
    getFixedCellClass: Function,
    getSelectionCellStyle: Function,
    getExpandCellStyle: Function,
    getCellClass: Function,
    getCellStyle: Function,
    getCheckboxClass: Function,
    getRadioClass: Function,
    
    // 数据函数
    getRowKey: Function,
    getCellValue: Function,
    formatCellValue: Function,
    renderCell: Function,
    
    // 状态检查函数
    isRowSelected: Function,
    isRowDisabled: Function,
    isRowExpanded: Function,
    
    // 事件处理函数
    handleScroll: Function,
    handleWheel: Function,
    handleTouchStart: Function,
    handleTouchMove: Function,
    handleTouchEnd: Function,
    setRowElementRef: Function,
    setExpandedRowElementRef: Function,
    handleRowClickWithHighlight: Function,
    handleRowMouseEnter: Function,
    handleRowMouseLeave: Function,
    handleSelectionToggle: Function,
    handleRowSelect: Function,
    toggleRowExpansion: Function,
    handleCellClick: Function,
    handleCellDoubleClick: Function,
    handleCellContextMenu: Function
  },
  setup() {
    return { h }
  }
}
</script>