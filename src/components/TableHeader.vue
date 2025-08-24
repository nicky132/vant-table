<template>
  <div class="vant-table-header" ref="headerRef" :style="{
    marginLeft: hasLeftFixedContent ? `${leftFixedTotalWidth}px` : '0',
    marginRight: hasRightFixedColumns ? `${columnsInfo.rightFixedWidth}px` : '0'
  }"
  @wheel="handleHeaderWheel">
    <div class="vant-table-header__content" ref="headerContentRef"
         @wheel="handleHeaderWheelContent">
      <table class="vant-table vant-table--header" :style="tableStyle">
        <colgroup>
          <col v-if="expandable && !hasLeftFixedExpand" :style="{ width: '40px' }" />
          <col v-for="header in columnsInfo.mainHeaders" :key="header.key" :style="getColStyle(header)" />
        </colgroup>
        <thead class="vant-thead">
          <tr class="vant-thead-row vant-thead-row--main" ref="headerRowRef">
            <!-- 展开列表头 - 只在没有左固定列展开时显示 -->
            <th
              v-if="expandable && !hasLeftFixedExpand"
              class="vant-th vant-th--expand"
              :style="{ width: '40px', textAlign: 'center' }">
              <div class="vant-th__content"></div>
            </th>
            
            <th
              v-for="header in columnsInfo.mainHeaders"
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
import { ref, inject } from 'vue'

const props = defineProps({
  hasLeftFixedContent: Boolean,
  leftFixedTotalWidth: Number,
  hasRightFixedColumns: Boolean,
  columnsInfo: Object,
  tableStyle: Object,
  expandable: Boolean,
  hasLeftFixedExpand: Boolean,
  getColStyle: Function,
  getHeaderClass: Function,
  getHeaderStyle: Function,
  setHeaderElementRef: Function,
  handleSort: Function,
  sortConfig: Object,
  isFilterActive: Function,
  toggleFilter: Function,
  // 添加滚动处理相关的props
  bodyRef: Object
})

const emit = defineEmits(['header-wheel'])

// 组件内部引用
const headerRef = ref(null)
const headerContentRef = ref(null)
const headerRowRef = ref(null)

// 表头滚动事件处理
const handleHeaderWheel = (event) => {
  console.log('🎯 表头滚动事件被触发！', {
    deltaY: event.deltaY,
    deltaX: event.deltaX,
    target: event.target,
    currentTarget: event.currentTarget
  })
  
  // 阻止默认滚动行为
  event.preventDefault()
  
  // 首先定义所有需要的变量
  const deltaY = event.deltaY
  const deltaX = event.deltaX
  const scrollSensitivity = 1.0
  
  // 检查bodyRef状态 - 如果props.bodyRef是一个ref对象，使用.value；否则直接使用它
  const bodyElement = (props.bodyRef && props.bodyRef.__v_isRef) ? props.bodyRef.value : props.bodyRef
  
  console.log('🔍 TableHeader中的bodyRef状态:', {
    bodyRef: props.bodyRef,
    bodyRefExists: !!props.bodyRef,
    bodyRefValue: props.bodyRef?.value,
    bodyRefValueExists: !!props.bodyRef?.value,
    bodyElement: bodyElement,
    bodyElementExists: !!bodyElement
  })
  
  // 如果bodyRef不存在或者其value为空，尝试通过DOM查询获取主表格元素
  if (!bodyElement) {
    console.warn('⚠️ bodyRef不存在，尝试通过DOM查询获取主表格元素')
    
    // 尝试通过DOM查询获取主表格元素
    const mainBodyElements = document.querySelectorAll('.vant-table-body')
    let foundMainTable = null
    
    console.log('🔍 找到的.vant-table-body元素数量:', mainBodyElements.length)
    
    for (let element of mainBodyElements) {
      const isInFixed = !!element.closest('.vant-table-fixed')
      console.log('🔍 检查表格元素:', {
        element,
        className: element.className,
        isInFixed,
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop
      })
      
      if (!isInFixed) {
        foundMainTable = element
        console.log('✅ 找到主表格元素')
        break
      }
    }
    
    if (foundMainTable) {
      // 直接使用找到的主表格元素
      const currentScrollTop = foundMainTable.scrollTop
      const currentScrollLeft = foundMainTable.scrollLeft
      
      const newScrollTop = Math.max(0, currentScrollTop + (deltaY * scrollSensitivity))
      const newScrollLeft = Math.max(0, currentScrollLeft + (deltaX * scrollSensitivity))
      
      console.log('🔄 通过DOM查询直接操作主表格滚动:', {
        currentScrollTop,
        currentScrollLeft,
        newScrollTop,
        newScrollLeft,
        deltaY,
        deltaX
      })
      
      foundMainTable.scrollTop = newScrollTop
      foundMainTable.scrollLeft = newScrollLeft
      
      // 同步表头自身的水平滚动位置
      if (headerContentRef.value) {
        headerContentRef.value.scrollLeft = newScrollLeft
      }
      
      // 发射事件给父组件
      emit('header-wheel', {
        event,
        scrollTop: newScrollTop,
        scrollLeft: newScrollLeft,
        deltaY,
        deltaX
      })
      
      return
    } else {
      console.warn('⚠️ 通过DOM查询也无法找到主表格元素')
      return
    }
  }
  
  // 如果bodyElement存在，使用它来获取当前滚动位置
  const currentScrollTop = bodyElement.scrollTop
  const currentScrollLeft = bodyElement.scrollLeft
  
  const newScrollTop = Math.max(0, currentScrollTop + (deltaY * scrollSensitivity))
  const newScrollLeft = Math.max(0, currentScrollLeft + (deltaX * scrollSensitivity))
  
  console.log('🔄 表头滚动同步:', {
    currentScrollTop,
    currentScrollLeft,
    deltaY,
    deltaX,
    newScrollTop,
    newScrollLeft
  })
  
  // 同步到主表格
  bodyElement.scrollTop = newScrollTop
  bodyElement.scrollLeft = newScrollLeft
  
  // 同步表头自身的水平滚动位置
  if (headerContentRef.value) {
    headerContentRef.value.scrollLeft = newScrollLeft
  }
  
  // 发射事件给父组件，让父组件处理更复杂的同步逻辑（如固定列）
  emit('header-wheel', {
    event,
    scrollTop: newScrollTop,
    scrollLeft: newScrollLeft,
    deltaY,
    deltaX
  })
}

// 表头内容区域滚动事件处理
const handleHeaderWheelContent = (event) => {
  console.log('🎯 表头内容区域滚动事件！', {
    deltaY: event.deltaY,
    deltaX: event.deltaX
  })
  
  // 直接调用表头滚动处理器，避免事件重复
  handleHeaderWheel(event)
}

defineExpose({
  headerRef,
  headerContentRef,
  headerRowRef
})
</script>