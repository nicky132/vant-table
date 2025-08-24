<template>
  <thead>
    <!-- 主表格头部 -->
    <tr class="vant-thead-tr">
      <!-- 展开列 -->
      <th
        v-if="expandable"
        :style="getExpandHeaderStyle()"
        class="vant-th vant-expand-header"
      >
        <div class="vant-th-content">
          <span class="vant-expand-header-text"></span>
        </div>
      </th>

      <!-- 选择列 -->
      <th
        v-if="selectable"
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

      <!-- 数据列 -->
      <th
        v-for="header in computedHeaders"
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
</template>

<script>
import { VCheckbox } from '../components/VCheckbox.js'

export default {
  name: 'VantTableHeader',
  components: {
    VCheckbox
  },
  props: {
    expandable: Boolean,
    selectable: Boolean,
    isRadioMode: Boolean,
    isAllSelected: Boolean,
    isIndeterminate: Boolean,
    computedHeaders: Array,
    sortConfig: Object,
    activeFilters: Object,
    getExpandHeaderStyle: Function,
    getSelectionHeaderStyle: Function,
    getHeaderStyle: Function,
    getHeaderClass: Function,
    handleSelectAll: Function,
    handleHeaderClick: Function,
    toggleFilterPopup: Function
  }
}
</script>