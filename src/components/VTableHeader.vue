<template>
  <div class="vant-table-header" ref="headerRef" :style="headerStyle">
    <div class="vant-table-header__content" ref="headerContentRef">
      <table class="vant-table vant-table--header" :style="tableStyle">
        <colgroup>
          <col v-for="header in computedHeaders" :key="header.key" :style="getColStyle(header)" />
        </colgroup>
        <thead class="vant-thead">
          <tr class="vant-thead-row vant-thead-row--main" ref="headerRowRef">
            <th
              v-for="header in computedHeaders"
              :key="header.key"
              :class="getHeaderClass(header)"
              :style="getHeaderStyle(header)"
              :data-key="header.key"
              :ref="el => setHeaderElementRef(el, header.key, 'main')">
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineOptions({
  name: 'VTableHeader'
})

const props = defineProps({
  computedHeaders: Array,
  tableStyle: Object,
  hasLeftFixedContent: Boolean,
  leftFixedTotalWidth: Number,
  hasRightFixedColumns: Boolean,
  rightFixedWidth: Number,
  sortConfig: Object,
  getColStyle: Function,
  getHeaderClass: Function,
  getHeaderStyle: Function,
  isFilterActive: Function
})

const emit = defineEmits(['sort', 'toggle-filter', 'set-header-element-ref'])

const headerRef = ref(null)
const headerContentRef = ref(null) 
const headerRowRef = ref(null)

const headerStyle = computed(() => ({
  marginLeft: props.hasLeftFixedContent ? `${props.leftFixedTotalWidth}px` : '0',
  marginRight: props.hasRightFixedColumns ? `${props.rightFixedWidth}px` : '0'
}))

const handleSort = (header) => {
  emit('sort', header)
}

const toggleFilter = (key) => {
  emit('toggle-filter', key)
}

const setHeaderElementRef = (el, key, position) => {
  emit('set-header-element-ref', el, key, position)
}

defineExpose({
  headerRef,
  headerContentRef,
  headerRowRef
})
</script>

<style>
/* 确保表头样式正确应用 - 不使用scoped以避免样式作用域问题 */
.vant-th__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 2px 4px;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 44px;
}

.vant-th--sortable .vant-th__content {
  cursor: pointer;
}

.vant-th__sort-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 4px;
  flex-shrink: 0;
}

.vant-sort-icon {
  display: block;
  width: 12px;
  height: 12px;
}

.vant-sort-icon__asc,
.vant-sort-icon__desc {
  fill: var(--van-text-color-3);
  stroke: var(--van-text-color-3);
  transition: fill 0.2s, stroke 0.2s;
}

.vant-sort-icon__asc.vant-sort-icon--active,
.vant-sort-icon__desc.vant-sort-icon--active {
  fill: var(--van-primary-color);
  stroke: var(--van-primary-color);
}

.vant-th__filter-icon {
  display: inline-block;
  font-size: 12px;
  color: var(--van-text-color-3);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  margin-left: 4px;
  position: relative;
  flex-shrink: 0;
}

.vant-th__filter-icon--active {
  background-color: var(--van-primary-color);
  color: var(--van-white);
}

/* 表头sortable hover效果 - 仅在PC端生效 */
@media (hover: hover) and (pointer: fine) {
  .vant-th--sortable .vant-th__content:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
  
  .vant-th__filter-icon:hover {
    background-color: rgba(2, 120, 255, 0.1);
    color: var(--van-primary-color);
  }
}
</style>