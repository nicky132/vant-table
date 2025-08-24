<template>
  <div class="vant-table-wrapper" :class="{ 'has-load-more': enableLoadMore && showLoadMoreUi, 'has-horizontal-scrollbar': showHorizontalScrollbar }" :style="containerStyle" data-active-fix="true">
    <!-- 加载中状态 -->
    <div v-if="loading" class="vant-table-loading">
      <VanLoading size="24px" />
    </div>
    
    <!-- Table主体布局容器 -->
    <div class="vant-table-layout-wrapper" ref="layoutWrapperRef">
      <!-- 表头区域 -->
      <TableHeader
        v-bind="headerProps"
        :body-ref="bodyRef"
        @header-wheel="handleHeaderWheelEvent"
        ref="tableHeaderRef" />

      <!-- 表体区域 -->
      <TableBody
        v-bind="bodyProps"
        ref="tableBodyRef">
        <template #expanded="{ row, rowIndex }">
          <slot name="expanded" :row="row" :rowIndex="rowIndex" />
        </template>
      </TableBody>
    </div>

    <!-- 左侧固定列 -->
    <FixedColumn
      v-if="hasLeftFixedContent"
      position="left"
      v-bind="leftFixedProps"
      @load-more="$emit('load-more')"
      ref="leftFixedColumnRef" />

    <!-- 右侧固定列 -->
    <FixedColumn
      v-if="hasRightFixedColumns"
      position="right"
      v-bind="rightFixedProps"
      @load-more="$emit('load-more')"
      ref="rightFixedColumnRef" />

    <!-- 横向滚动条 -->
    <HorizontalScrollbar
      v-bind="scrollbarProps"
      ref="horizontalScrollbarRef" />

    <!-- 加载更多状态 -->
    <LoadMoreIndicator
      v-bind="loadMoreProps"
      @load-more="$emit('load-more')" />

    <!-- 过滤弹窗 - 使用useTableFilters的状态和方法 -->
    <template v-for="header in props.headers?.filter(h => h.filterable)" :key="`filter-${header.key}`">
      <Teleport to="body">
        <VanPopup
          v-if="currentFilterStates[header.key]?.show"
          v-model:show="currentFilterStates[header.key].show"
          position="center"
          :style="{ zIndex: 99999 }"
          :lazy-render="true"
          :destroy-on-close="true"
          closeable
          @click-overlay="handleFilterClose(header.key)"
          round
          class="vant-filter-modal-popup vant-filter-modal-popup--teleport van-overlay">
        <div class="vant-filter-modal">
          <div class="vant-filter-modal__header">
            <span class="vant-filter-modal__title">过滤 {{ header.label }}</span>
            <VanIcon
              name="cross"
              class="vant-filter-modal__close"
              @click="handleFilterClose(header.key)" />
          </div>

          <div class="vant-filter-modal__content">
            <!-- VTable风格：搜索框 -->
            <div class="vant-filter-search">
              <VanField
                v-model="currentFilterStates[header.key].searchValue"
                placeholder="搜索..."
                size="small"
                clearable />
            </div>
            
            <!-- VTable风格：选项列表 -->
            <div class="vant-filter-v-options">
              <!-- 全部选项 -->
              <div class="vant-filter-v-option">
                <VanCheckbox
                  :model-value="isAllSelected(header.key)"
                  @update:model-value="handleSelectAll(header.key)">
                  <span class="vant-filter-v-option__text">全部</span>
                </VanCheckbox>
              </div>
              
              <!-- 可选项列表 -->
              <div
                v-for="option in getFilteredOptions(header.key)"
                :key="option"
                class="vant-filter-v-option">
                <VanCheckbox
                  :model-value="isOptionSelected(header.key, option)"
                  @update:model-value="handleToggleOption(header.key, option)">
                  <span class="vant-filter-v-option__text">{{ option }}</span>
                </VanCheckbox>
              </div>
            </div>
          </div>

          <!-- VTable风格操作按钮 -->
          <div class="vant-filter-modal__actions">
            <VanButton block @click="handleResetFilter(header.key)">重置</VanButton>
            <VanButton block type="primary" @click="handleApplyFilter(header.key)">确定</VanButton>
          </div>
        </div>
        </VanPopup>
      </Teleport>
    </template>
    
    <!-- 原始 FilterPopup 组件 -->
    <div style="display: none;">{{ console.log('🔍 VantTable filterProps:', filterProps) }}</div>
    <FilterPopup v-bind="filterProps" style="display: none;" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, reactive, computed } from 'vue'
import { Loading as VanLoading, Popup as VanPopup, Field as VanField, Checkbox as VanCheckbox, Button as VanButton, Icon as VanIcon } from 'vant'
import { Teleport } from 'vue'

// Template components
import TableHeader from './components/TableHeader.vue'
import TableBody from './components/TableBody.vue'
import FixedColumn from './components/FixedColumn.vue'
import HorizontalScrollbar from './components/HorizontalScrollbar.vue'
import LoadMoreIndicator from './components/LoadMoreIndicator.vue'
import FilterPopup from './components/FilterPopup.vue'

// 配置文件
import { tableProps, tableEvents } from './configs/tableConfig.js'

// 核心组合函数
import { useTableSetup } from './composables/useTableSetup.js'
import { useTableLifecycle } from './composables/useTableLifecycle.js'
import { useTableWatchers } from './composables/useTableWatchers.js'
import { useTableExpose } from './composables/useTableExpose.js'

// Props 和 Emits 定义
const props = defineProps(tableProps)
const emit = defineEmits(tableEvents)

// 模板引用定义
const headerRef = ref(null)
const headerContentRef = ref(null)
const headerRowRef = ref(null)
const leftHeaderRowRef = ref(null)
const rightHeaderRowRef = ref(null)
const bodyRef = ref(null)
const tbodyRef = ref(null)
const leftFixedRef = ref(null)
const leftBodyWrapperRef = ref(null)
const leftTbodyRef = ref(null)
const rightFixedRef = ref(null)
const rightBodyWrapperRef = ref(null)
const rightTbodyRef = ref(null)
const layoutWrapperRef = ref(null)
const scrollbarWrapperRef = ref(null)
const scrollbarHandleRef = ref(null)
const tableHeaderRef = ref(null)
const tableBodyRef = ref(null)
const leftFixedColumnRef = ref(null)
const rightFixedColumnRef = ref(null)
const horizontalScrollbarRef = ref(null)

// 收集所有引用
const refs = {
  headerRef,
  headerContentRef,
  headerRowRef,
  leftHeaderRowRef,
  rightHeaderRowRef,
  bodyRef,
  tbodyRef,
  leftFixedRef,
  leftBodyWrapperRef,
  leftTbodyRef,
  rightFixedRef,
  rightBodyWrapperRef,
  rightTbodyRef,
  layoutWrapperRef,
  scrollbarWrapperRef,
  scrollbarHandleRef,
  tableHeaderRef,
  tableBodyRef,
  leftFixedColumnRef,
  rightFixedColumnRef,
  horizontalScrollbarRef
}

// 定时器跟踪数组，用于组件卸载时清理
const timers = ref([])

// 添加定时器到跟踪数组的辅助函数
const addTimer = (timerId) => {
  if (timerId) {
    timers.value.push(timerId)
  }
  return timerId
}

// 清理所有定时器的函数
const clearAllTimers = () => {
  timers.value.forEach(timerId => {
    if (timerId) {
      clearTimeout(timerId)
    }
  })
  timers.value = []
}

// 使用表格设置组合函数 - 整合所有组合函数调用
const composableResults = useTableSetup(props, emit, refs)

// 🔑 添加过滤功能的本地状态和方法
const currentFilterStates = reactive({})

// 为每个可过滤的列初始化状态
props.headers?.forEach(header => {
  if (header.filterable) {
    currentFilterStates[header.key] = {
      show: false,
      searchValue: '',
      selectedValues: [], // 空数组表示全选状态
      allOptions: []
    }
  }
})

// 获取列的所有唯一值作为过滤选项
const getColumnOptions = (key) => {
  if (!composableResults.filteredAndSortedData?.value) return []
  const uniqueValues = [...new Set(composableResults.filteredAndSortedData.value.map(row => row[key]).filter(v => v != null))]
  return uniqueValues.sort()
}

// 获取过滤后的选项（基于搜索）
const getFilteredOptions = (key) => {
  const allOptions = getColumnOptions(key)
  const searchValue = currentFilterStates[key]?.searchValue?.toLowerCase() || ''
  if (!searchValue) return allOptions
  return allOptions.filter(option => 
    String(option).toLowerCase().includes(searchValue)
  )
}

// 检查选项是否被选中
const isOptionSelected = (key, option) => {
  const selectedValues = currentFilterStates[key]?.selectedValues || []
  
  // 如果selectedValues是字符串"NONE"，表示全不选状态
  if (selectedValues === 'NONE') {
    return false
  }
  
  // 如果是全选状态（selectedValues为空数组），则所有选项都显示为选中
  if (selectedValues.length === 0) {
    return true
  }
  
  // 否则检查该选项是否在selectedValues中
  return selectedValues.includes(option)
}

// 检查是否全选
const isAllSelected = (key) => {
  const selectedValues = currentFilterStates[key]?.selectedValues || []
  // 只有当selectedValues为空数组时才是全选状态
  return Array.isArray(selectedValues) && selectedValues.length === 0
}

// 处理全选/取消全选
const handleSelectAll = (key) => {
  if (isAllSelected(key)) {
    // 当前是全选状态，点击后应该变为全不选状态
    currentFilterStates[key].selectedValues = 'NONE'
  } else {
    // 当前不是全选状态，设置为全选（清空selectedValues为空数组）
    currentFilterStates[key].selectedValues = []
  }
}

// 处理选项切换
const handleToggleOption = (key, option) => {
  const selectedValues = currentFilterStates[key].selectedValues
  
  // 如果当前是全不选状态
  if (selectedValues === 'NONE') {
    // 用户选择某个选项，转为部分选择状态
    currentFilterStates[key].selectedValues = [option]
    return
  }
  
  // 如果当前是全选状态（selectedValues为空数组）
  if (Array.isArray(selectedValues) && selectedValues.length === 0) {
    // 用户取消选择某个选项，需要将其他所有选项都加入selectedValues
    const allOptions = getColumnOptions(key)
    currentFilterStates[key].selectedValues = allOptions.filter(opt => opt !== option)
  } else if (Array.isArray(selectedValues)) {
    // 正常的切换逻辑
    const index = selectedValues.indexOf(option)
    if (index > -1) {
      selectedValues.splice(index, 1)
      // 如果所有选项都被取消选择，转为全不选状态
      if (selectedValues.length === 0) {
        currentFilterStates[key].selectedValues = 'NONE'
      }
    } else {
      selectedValues.push(option)
    }
    
    // 检查是否所有选项都被选中了，如果是，则转为全选状态
    const allOptions = getColumnOptions(key)
    if (selectedValues.length === allOptions.length) {
      currentFilterStates[key].selectedValues = []
    }
  }
}

// 处理过滤器重置
const handleResetFilter = (key) => {
  currentFilterStates[key].selectedValues = []
  currentFilterStates[key].searchValue = ''
}

// 处理过滤器应用
const handleApplyFilter = (key) => {
  // 调用组合函数的过滤方法
  const selectedValues = currentFilterStates[key].selectedValues
  const allOptions = getColumnOptions(key)
  
  console.log('🎯 过滤器应用 - 字段:', key)
  console.log('🎯 选中的值:', selectedValues)
  console.log('🎯 所有可用选项:', allOptions)
  console.log('🎯 状态类型:', {
    isNone: selectedValues === 'NONE',
    isAll: Array.isArray(selectedValues) && selectedValues.length === 0,
    isPartial: Array.isArray(selectedValues) && selectedValues.length > 0,
    value: selectedValues
  })
  
  if (selectedValues === 'NONE') {
    // 全不选状态，不显示任何数据（设置一个不可能的过滤条件）
    console.log('🎯 应用全不选过滤')
    console.log('🎯 实际生效的选项: 无（不显示任何数据）')
    if (composableResults.resetFilter) {
      composableResults.resetFilter(key)
    }
    if (composableResults.toggleFilterOption) {
      // 设置一个不存在的值来过滤掉所有数据
      composableResults.toggleFilterOption(key, '__FILTER_NONE__')
    }
  } else if (Array.isArray(selectedValues) && selectedValues.length === 0) {
    // 全选状态，清除过滤
    console.log('🎯 应用全选过滤（清除过滤）')
    console.log('🎯 实际生效的选项:', allOptions, '（显示所有数据）')
    if (composableResults.clearFilters) {
      composableResults.clearFilters()
    }
  } else if (Array.isArray(selectedValues)) {
    // 部分选择状态，应用过滤
    console.log('🎯 应用部分选择过滤')
    console.log('🎯 实际生效的选项:', selectedValues)
    console.log('🎯 被过滤掉的选项:', allOptions.filter(opt => !selectedValues.includes(opt)))
    if (composableResults.toggleFilterOption) {
      // 先重置该字段的所有选项
      if (composableResults.resetFilter) {
        composableResults.resetFilter(key)
      }
      // 然后选择指定的选项
      selectedValues.forEach((value, index) => {
        console.log(`🎯 设置过滤选项 ${index + 1}:`, value)
        composableResults.toggleFilterOption(key, value)
      })
    }
  }
  
  console.log('🎯 过滤器应用完成，关闭弹窗')
  
  // 关闭弹窗
  currentFilterStates[key].show = false
}

// 处理过滤器关闭
const handleFilterClose = (key) => {
  currentFilterStates[key].show = false
}

// 重写toggleFilter函数以使用本地状态
const toggleFilter = (key) => {
  console.log('🚀 VantTable LOCAL toggleFilter called with key:', key)
  console.log('🚀 This is the LOCAL toggle filter function!')
  
  if (!currentFilterStates[key]) {
    console.warn('⚠️ Filter state not found for key:', key)
    return
  }
  
  // 切换显示状态
  currentFilterStates[key].show = !currentFilterStates[key].show
  
  console.log('🚀 LOCAL Filter popup show state:', {
    key,
    show: currentFilterStates[key].show,
    state: currentFilterStates[key]
  })
}


const handleHeaderWheelEvent = (eventData) => {
  console.log('🎯 主组件收到表头滚动事件(通过emit):', eventData)
  
  // 使用现有的VXE风格同步机制来同步固定列
  if (composableResults.vxeStyleAbsoluteSync) {
    composableResults.vxeStyleAbsoluteSync(
      eventData.scrollTop, 
      eventData.scrollLeft, 
      'header' // 标记来源是表头，避免循环
    )
  }
}

// 重写headerProps以使用本地的toggleFilter函数
const originalHeaderProps = composableResults.headerProps
const headerProps = computed(() => {
  const props = {
    ...originalHeaderProps.value,
    toggleFilter: toggleFilter // 使用本地的toggleFilter函数
  }
  
  console.log('🔍 HeaderProps updated:', {
    originalToggleFilter: originalHeaderProps.value?.toggleFilter,
    newToggleFilter: toggleFilter,
    propsToggleFilter: props.toggleFilter,
    areEqual: props.toggleFilter === toggleFilter
  })
  
  return props
})

// 重写leftFixedProps和rightFixedProps以使用本地的toggleFilter函数
const originalLeftFixedProps = composableResults.leftFixedProps
const leftFixedProps = computed(() => {
  const props = {
    ...originalLeftFixedProps.value,
    toggleFilter: toggleFilter // 使用本地的toggleFilter函数
  }
  return props
})

const originalRightFixedProps = composableResults.rightFixedProps
const rightFixedProps = computed(() => {
  const props = {
    ...originalRightFixedProps.value,
    toggleFilter: toggleFilter // 使用本地的toggleFilter函数
  }
  return props
})

// 从设置组合函数中解构需要的属性和方法
const {
  // 核心数据和状态
  filteredAndSortedData,
  containerStyle,
  hasLeftFixedContent,
  hasRightFixedColumns,
  
  // 过滤相关 - 注意这里的filterStates是用于FilterPopup组件的
  filterStates: popupFilterStates,
  toggleFilter: popupToggleFilter,
  
  // 组件属性绑定（除了headerProps、leftFixedProps、rightFixedProps，我们已经重新定义了）
  bodyProps,
  scrollbarProps,
  loadMoreProps,
  filterProps
} = composableResults

// 使用表格监听器管理组合函数
const watchers = useTableWatchers(props, composableResults)

// 使用表格生命周期管理组合函数
const lifecycle = useTableLifecycle(props, emit, refs, composableResults)

// 🔑 关键修复：确保headerContentRef、bodyRef和固定列引用正确获取子组件的引用
onMounted(() => {
  nextTick(() => {
    console.log('🔍 调试表头、表体和固定列引用获取:', {
      tableHeaderRef: !!tableHeaderRef.value,
      tableBodyRef: !!tableBodyRef.value,
      leftFixedColumnRef: !!leftFixedColumnRef.value,
      rightFixedColumnRef: !!rightFixedColumnRef.value,
      headerContentRefFromChild: tableHeaderRef.value?.headerContentRef,
      bodyRefFromChild: tableBodyRef.value?.bodyRef,
      leftBodyWrapperFromChild: leftFixedColumnRef.value?.bodyWrapperRef,
      rightBodyWrapperFromChild: rightFixedColumnRef.value?.bodyWrapperRef
    })
    
    // 🔑 新增：立即设置DOM查询fallback以确保滚动同步从一开始就能工作
    const setupImmediateFallbackRefs = () => {
      console.log('🚀 设置立即DOM查询fallback以修复初始化滚动同步问题')
      
      // 立即设置bodyRef fallback
      if (!bodyRef.value && typeof document !== 'undefined') {
        const bodyElements = document.querySelectorAll('.vant-table-body')
        for (let element of bodyElements) {
          if (!element.closest('.vant-table-fixed')) {
            bodyRef.value = element
            console.log('✅ 立即通过DOM查询设置bodyRef')
            break
          }
        }
      }
      
      // 立即设置headerContentRef fallback
      if (!headerContentRef.value && typeof document !== 'undefined') {
        const headerContentElement = document.querySelector('.vant-table-header__content')
        if (headerContentElement) {
          headerContentRef.value = headerContentElement
          console.log('✅ 立即通过DOM查询设置headerContentRef')
        }
      }
      
      // 立即设置leftBodyWrapperRef fallback
      if (!leftBodyWrapperRef.value && typeof document !== 'undefined') {
        const leftFixedElements = document.querySelectorAll('.vant-table-fixed--left .vant-table-fixed__body')
        if (leftFixedElements.length > 0) {
          leftBodyWrapperRef.value = leftFixedElements[0]
          console.log('✅ 立即通过DOM查询设置leftBodyWrapperRef')
        }
      }
      
      // 立即设置rightBodyWrapperRef fallback
      if (!rightBodyWrapperRef.value && typeof document !== 'undefined') {
        const rightFixedElements = document.querySelectorAll('.vant-table-fixed--right .vant-table-fixed__body')
        if (rightFixedElements.length > 0) {
          rightBodyWrapperRef.value = rightFixedElements[0]
          console.log('✅ 立即通过DOM查询设置rightBodyWrapperRef')
        }
      }
      
      console.log('🔍 立即fallback设置后的ref状态:', {
        bodyRef: !!bodyRef.value,
        headerContentRef: !!headerContentRef.value,
        leftBodyWrapperRef: !!leftBodyWrapperRef.value,
        rightBodyWrapperRef: !!rightBodyWrapperRef.value
      })
    }
    
    // 立即执行fallback设置
    setupImmediateFallbackRefs()
    
    // 🔑 减少setTimeout调用以避免表头宽度闪现，只保留一次重试
    addTimer(setTimeout(setupImmediateFallbackRefs, 20))
    
    // 🔑 新增：在设置fallback refs后，立即测试滚动同步功能确保它正常工作
    const testInitialScrollSync = () => {
      console.log('🧪 测试初始化滚动同步功能')
      
      // 确保所有必要的refs都已设置
      const hasAllRefs = bodyRef.value && 
                        (leftBodyWrapperRef.value || (typeof document === 'undefined' || !document.querySelector('.vant-table-fixed--left'))) &&
                        (rightBodyWrapperRef.value || (typeof document === 'undefined' || !document.querySelector('.vant-table-fixed--right')))
      
      if (hasAllRefs) {
        console.log('✅ 所有必要的refs已设置，滚动同步应该能正常工作')
        
        // 执行一次微小的滚动来"激活"同步机制
        if (bodyRef.value) {
          const currentScrollTop = bodyRef.value.scrollTop
          // 微调滚动位置然后恢复，这会触发同步机制
          bodyRef.value.scrollTop = currentScrollTop + 1
          addTimer(setTimeout(() => {
            if (bodyRef.value) {
              bodyRef.value.scrollTop = currentScrollTop
              console.log('✅ 初始化滚动同步激活完成')
            }
          }, 5))
        }
      } else {
        console.log('⚠️ 还有refs未设置，将在50ms后重试')
        addTimer(setTimeout(testInitialScrollSync, 50))
      }
    }
    
    // 🔑 减少延迟，在设置refs后快速测试同步
    addTimer(setTimeout(testInitialScrollSync, 30))
    
    // 确保tableHeaderRef指向TableHeader组件，并获取其headerContentRef.value（实际DOM元素）
    const connectHeaderContentRef = () => {
      if (tableHeaderRef.value && tableHeaderRef.value.headerContentRef && tableHeaderRef.value.headerContentRef.value) {
        headerContentRef.value = tableHeaderRef.value.headerContentRef.value
        console.log('✅ 主组件成功获取表头内容引用:', {
          获取到的引用: !!headerContentRef.value,
          DOM元素: headerContentRef.value,
          元素类名: headerContentRef.value?.className
        })
        return true
      }
      return false
    }
    
    // 🔑 修复表头闪现：减少重试，因为已有立即DOM查询fallback
    if (!connectHeaderContentRef()) {
      // 只进行一次简单重试，避免过度调整
      addTimer(setTimeout(() => {
        if (typeof document !== 'undefined' && !connectHeaderContentRef()) {
          const headerContentElement = document.querySelector('.vant-table-header__content')
          if (headerContentElement) {
            headerContentRef.value = headerContentElement
            console.log('✅ 通过简化DOM查询获取表头内容引用')
          }
        }
      }, 100))
    }
    
    // 🔑 关键修复：确保bodyRef指向TableBody组件的实际DOM元素
    const connectBodyRef = () => {
      if (tableBodyRef.value && tableBodyRef.value.bodyRef && tableBodyRef.value.bodyRef.value) {
        bodyRef.value = tableBodyRef.value.bodyRef.value
        console.log('✅ 主组件成功获取表体引用:', {
          获取到的引用: !!bodyRef.value,
          DOM元素: bodyRef.value,
          元素类名: bodyRef.value?.className
        })
        return true
      }
      return false
    }
    
    // 🔑 修复表头闪现：减少重试，因为已有立即DOM查询fallback
    if (!connectBodyRef()) {
      // 只进行一次简单重试，避免过度调整
      addTimer(setTimeout(() => {
        if (typeof document !== 'undefined' && !connectBodyRef()) {
          const bodyElements = document.querySelectorAll('.vant-table-body')
          if (bodyElements) {
            for (let element of bodyElements) {
              if (!element.closest('.vant-table-fixed')) {
                bodyRef.value = element
                console.log('✅ 通过简化DOM查询获取表体引用')
                break
              }
            }
          }
        }
      }, 100))
    }
    
    // 🔑 新增：获取左侧固定列的bodyWrapperRef引用用于垂直滚动同步
    // 尝试多种方式获取左侧固定列的DOM元素
    const connectLeftBodyWrapper = () => {
      let leftBodyElement = null
      
      // 方法1: 通过组件暴露的ref
      if (leftFixedColumnRef.value?.bodyWrapperRef?.value) {
        leftBodyElement = leftFixedColumnRef.value.bodyWrapperRef.value
        console.log('✅ 方法1成功: 通过组件暴露的ref获取左侧固定列')
      }
      // 方法2: 通过DOM查询
      else {
        if (typeof document !== 'undefined') {
          const leftFixedElements = document.querySelectorAll('.vant-table-fixed--left .vant-table-fixed__body')
          if (leftFixedElements.length > 0) {
            leftBodyElement = leftFixedElements[0]
            console.log('✅ 方法2成功: 通过DOM查询获取左侧固定列')
          }
        }
      }
      
      if (leftBodyElement) {
        leftBodyWrapperRef.value = leftBodyElement
        console.log('✅ 主组件成功获取左侧固定列表体引用:', {
          获取到的引用: !!leftBodyWrapperRef.value,
          DOM元素: leftBodyWrapperRef.value,
          元素类名: leftBodyWrapperRef.value?.className,
          滚动能力: leftBodyWrapperRef.value?.scrollHeight > leftBodyWrapperRef.value?.clientHeight
        })
        return true
      }
      
      return false
    }
    
    // 立即尝试连接
    if (!connectLeftBodyWrapper()) {
      console.warn('⚠️ 主组件无法获取左侧固定列表体引用，开始重试...')
      
      // 延迟重试，使用多次尝试
      const tryConnectLeft = (attempt = 1, maxAttempts = 5) => {
        addTimer(setTimeout(() => {
          if (connectLeftBodyWrapper()) {
            console.log(`✅ 第${attempt}次重试成功获取左侧固定列表体引用`)
          } else if (attempt < maxAttempts) {
            console.log(`⚠️ 第${attempt}次重试失败，继续尝试...`)
            tryConnectLeft(attempt + 1, maxAttempts)
          } else {
            console.error(`❌ ${maxAttempts}次重试后仍无法获取左侧固定列表体引用`)
          }
        }, attempt * 100)) // 递增延迟
      }
      tryConnectLeft()
    }
    
    // 🔑 新增：获取右侧固定列的bodyWrapperRef引用用于垂直滚动同步
    // 尝试多种方式获取右侧固定列的DOM元素
    const connectRightBodyWrapper = () => {
      let rightBodyElement = null
      
      // 方法1: 通过组件暴露的ref
      if (rightFixedColumnRef.value?.bodyWrapperRef?.value) {
        rightBodyElement = rightFixedColumnRef.value.bodyWrapperRef.value
        console.log('✅ 方法1成功: 通过组件暴露的ref获取右侧固定列')
      }
      // 方法2: 通过DOM查询
      else {
        if (typeof document !== 'undefined') {
          const rightFixedElements = document.querySelectorAll('.vant-table-fixed--right .vant-table-fixed__body')
          if (rightFixedElements.length > 0) {
            rightBodyElement = rightFixedElements[0]
            console.log('✅ 方法2成功: 通过DOM查询获取右侧固定列')
          }
        }
      }
      
      if (rightBodyElement) {
        rightBodyWrapperRef.value = rightBodyElement
        console.log('✅ 主组件成功获取右侧固定列表体引用:', {
          获取到的引用: !!rightBodyWrapperRef.value,
          DOM元素: rightBodyWrapperRef.value,
          元素类名: rightBodyWrapperRef.value?.className,
          滚动能力: rightBodyWrapperRef.value?.scrollHeight > rightBodyWrapperRef.value?.clientHeight
        })
        return true
      }
      
      return false
    }
    
    // 立即尝试连接
    if (!connectRightBodyWrapper()) {
      console.warn('⚠️ 主组件无法获取右侧固定列表体引用，开始重试...')
      
      // 延迟重试，使用多次尝试
      const tryConnectRight = (attempt = 1, maxAttempts = 5) => {
        addTimer(setTimeout(() => {
          if (connectRightBodyWrapper()) {
            console.log(`✅ 第${attempt}次重试成功获取右侧固定列表体引用`)
          } else if (attempt < maxAttempts) {
            console.log(`⚠️ 第${attempt}次重试失败，继续尝试...`)
            tryConnectRight(attempt + 1, maxAttempts)
          } else {
            console.error(`❌ ${maxAttempts}次重试后仍无法获取右侧固定列表体引用`)
          }
        }, attempt * 100)) // 递增延迟
      }
      tryConnectRight()
    }
    
    // 🔑 修复表头闪现：禁用测试滚动，避免初始化时的额外调整
    // setTimeout(() => {
    //   if (headerContentRef.value) {
    //     console.log('🧪 测试表头手动滚动...')
    //     headerContentRef.value.scrollLeft = 100
    //     setTimeout(() => {
    //       console.log('🧪 测试结果:', {
    //         设置scrollLeft: 100,
    //         实际scrollLeft: headerContentRef.value.scrollLeft
    //       })
    //       // 恢复原位置
    //       headerContentRef.value.scrollLeft = 0
    //     }, 1000)
    //   }
    // }, 2000)
    
    // 🔧 添加全局测试函数
    window.testHeaderScroll = (scrollLeft = 200) => {
      if (headerContentRef.value) {
        console.log(`🧪 手动测试表头滚动到 ${scrollLeft}px`)
        headerContentRef.value.scrollLeft = scrollLeft
        addTimer(setTimeout(() => {
          if (headerContentRef.value) {
            console.log('🧪 滚动结果:', {
              目标scrollLeft: scrollLeft,
              实际scrollLeft: headerContentRef.value.scrollLeft,
              可滚动: headerContentRef.value.scrollWidth > headerContentRef.value.clientWidth,
              scrollWidth: headerContentRef.value.scrollWidth,
              clientWidth: headerContentRef.value.clientWidth
            })
          }
        }, 100))
      } else {
        console.warn('⚠️ headerContentRef 不存在')
      }
    }
    
    // 🔧 添加垂直滚动测试函数
    window.testVerticalSync = (scrollTop = 100) => {
      console.log(`🧪 手动测试垂直滚动同步到 ${scrollTop}px`)
      console.log('🔍 当前引用状态:', {
        bodyRef: !!bodyRef.value,
        leftBodyWrapperRef: !!leftBodyWrapperRef.value,
        rightBodyWrapperRef: !!rightBodyWrapperRef.value
      })
      
      if (bodyRef.value) {
        // 设置主表格滚动位置
        bodyRef.value.scrollTop = scrollTop
        console.log('✅ 主表格scrollTop已设置:', bodyRef.value.scrollTop)
        
        // 手动同步到固定列
        if (leftBodyWrapperRef.value) {
          leftBodyWrapperRef.value.scrollTop = scrollTop
          console.log('✅ 左侧固定列scrollTop已设置:', leftBodyWrapperRef.value.scrollTop)
        }
        
        if (rightBodyWrapperRef.value) {
          rightBodyWrapperRef.value.scrollTop = scrollTop
          console.log('✅ 右侧固定列scrollTop已设置:', rightBodyWrapperRef.value.scrollTop)
        }
        
        // 检查同步结果
        addTimer(setTimeout(() => {
          console.log('🔍 同步结果检查:', {
            主表格scrollTop: bodyRef.value?.scrollTop,
            左侧固定列scrollTop: leftBodyWrapperRef.value?.scrollTop,
            右侧固定列scrollTop: rightBodyWrapperRef.value?.scrollTop,
            同步成功: (
              bodyRef.value?.scrollTop === scrollTop &&
              (!leftBodyWrapperRef.value || leftBodyWrapperRef.value.scrollTop === scrollTop) &&
              (!rightBodyWrapperRef.value || rightBodyWrapperRef.value.scrollTop === scrollTop)
            )
          })
        }, 100))
      } else {
        console.warn('⚠️ bodyRef 不存在，无法测试垂直滚动同步')
      }
    }
    
    // 🔧 添加滚动事件测试函数
    window.testScrollEvents = () => {
      console.log('🧪 测试滚动事件绑定状态')
      console.log('主表格滚动事件:', {
        element: bodyRef.value,
        hasScrollListener: !!bodyRef.value?.onscroll,
        scrollHeight: bodyRef.value?.scrollHeight,
        clientHeight: bodyRef.value?.clientHeight,
        canScroll: bodyRef.value && bodyRef.value.scrollHeight > bodyRef.value.clientHeight,
        currentScrollTop: bodyRef.value?.scrollTop
      })
      
      if (leftBodyWrapperRef.value) {
        console.log('左侧固定列滚动事件:', {
          element: leftBodyWrapperRef.value,
          hasScrollListener: !!leftBodyWrapperRef.value?.onscroll,
          scrollHeight: leftBodyWrapperRef.value?.scrollHeight,
          clientHeight: leftBodyWrapperRef.value?.clientHeight,
          canScroll: leftBodyWrapperRef.value.scrollHeight > leftBodyWrapperRef.value.clientHeight,
          currentScrollTop: leftBodyWrapperRef.value?.scrollTop,
          overflowY: getComputedStyle(leftBodyWrapperRef.value).overflowY
        })
      }
      
      if (rightBodyWrapperRef.value) {
        console.log('右侧固定列滚动事件:', {
          element: rightBodyWrapperRef.value,
          hasScrollListener: !!rightBodyWrapperRef.value?.onscroll,
          scrollHeight: rightBodyWrapperRef.value?.scrollHeight,
          clientHeight: rightBodyWrapperRef.value?.clientHeight,
          canScroll: rightBodyWrapperRef.value.scrollHeight > rightBodyWrapperRef.value.clientHeight,
          currentScrollTop: rightBodyWrapperRef.value?.scrollTop,
          overflowY: getComputedStyle(rightBodyWrapperRef.value).overflowY
        })
      }
    }
    
    // 🔧 添加手动触发wheel事件测试函数
    window.testWheelEvents = (deltaY = 50) => {
      console.log(`🧪 手动触发wheel事件，deltaY: ${deltaY}`)
      
      if (bodyRef.value) {
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: deltaY,
          deltaX: 0,
          bubbles: true,
          cancelable: true
        })
        bodyRef.value.dispatchEvent(wheelEvent)
        console.log('✅ 主表格wheel事件已触发')
      }
      
      if (leftBodyWrapperRef.value) {
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: deltaY,
          deltaX: 0,
          bubbles: true,
          cancelable: true
        })
        leftBodyWrapperRef.value.dispatchEvent(wheelEvent)
        console.log('✅ 左侧固定列wheel事件已触发')
      }
    }
    
    // 🔧 添加强制滚动测试函数
    window.forceScroll = (target = 'main', scrollTop = 50) => {
      console.log(`🧪 强制滚动测试 - 目标: ${target}, scrollTop: ${scrollTop}`)
      
      let targetElement = null
      if (target === 'main' && bodyRef.value) {
        targetElement = bodyRef.value
      } else if (target === 'left' && leftBodyWrapperRef.value) {
        targetElement = leftBodyWrapperRef.value
      } else if (target === 'right' && rightBodyWrapperRef.value) {
        targetElement = rightBodyWrapperRef.value
      }
      
      if (targetElement) {
        console.log('🔍 滚动前状态:', {
          scrollTop: targetElement.scrollTop,
          scrollHeight: targetElement.scrollHeight,
          clientHeight: targetElement.clientHeight,
          canScroll: targetElement.scrollHeight > targetElement.clientHeight,
          computedStyle: {
            overflow: getComputedStyle(targetElement).overflow,
            overflowY: getComputedStyle(targetElement).overflowY,
            height: getComputedStyle(targetElement).height,
            maxHeight: getComputedStyle(targetElement).maxHeight
          }
        })
        
        targetElement.scrollTop = scrollTop
        
        console.log('🔍 滚动后状态:', {
          scrollTop: targetElement.scrollTop,
          设置成功: targetElement.scrollTop === scrollTop
        })
      } else {
        console.warn(`⚠️ 找不到目标元素: ${target}`)
      }
    }
    
    // 🔧 添加固定列内容检查函数
    window.checkFixedContent = () => {
      console.log('🧪 检查固定列内容')
      
      if (leftFixedColumnRef.value) {
        const leftElement = leftFixedColumnRef.value.$el || leftFixedColumnRef.value
        console.log('🔍 左侧固定列状态:', {
          组件存在: !!leftFixedColumnRef.value,
          DOM元素: leftElement,
          shouldShow: leftFixedColumnRef.value?.shouldShow,
          columns: leftFixedColumnRef.value?.columns,
          filteredData: leftFixedColumnRef.value?.filteredAndSortedData,
          innerHTML: leftElement?.innerHTML?.substring(0, 200) + '...',
          子元素数量: leftElement?.children?.length
        })
      }
      
      if (rightFixedColumnRef.value) {
        const rightElement = rightFixedColumnRef.value.$el || rightFixedColumnRef.value
        console.log('🔍 右侧固定列状态:', {
          组件存在: !!rightFixedColumnRef.value,
          DOM元素: rightElement,
          shouldShow: rightFixedColumnRef.value?.shouldShow,
          columns: rightFixedColumnRef.value?.columns,
          filteredData: rightFixedColumnRef.value?.filteredAndSortedData,
          innerHTML: rightElement?.innerHTML?.substring(0, 200) + '...',
          子元素数量: rightElement?.children?.length
        })
      }
    }
    
    // 🔧 添加ref连接状态检查函数
    window.checkRefConnections = () => {
      console.log('🔍 检查所有ref连接状态:')
      console.log('主要组件refs:', {
        tableHeaderRef: !!tableHeaderRef.value,
        tableBodyRef: !!tableBodyRef.value,
        leftFixedColumnRef: !!leftFixedColumnRef.value,
        rightFixedColumnRef: !!rightFixedColumnRef.value
      })
      
      console.log('内部DOM refs:', {
        headerContentRef: !!headerContentRef.value,
        bodyRef: !!bodyRef.value,
        leftBodyWrapperRef: !!leftBodyWrapperRef.value,
        rightBodyWrapperRef: !!rightBodyWrapperRef.value
      })
      
      console.log('组件暴露的refs:', {
        headerContentFromChild: tableHeaderRef.value?.headerContentRef?.value,
        bodyFromChild: tableBodyRef.value?.bodyRef?.value,
        leftBodyWrapperFromChild: leftFixedColumnRef.value?.bodyWrapperRef?.value,
        rightBodyWrapperFromChild: rightFixedColumnRef.value?.bodyWrapperRef?.value
      })
    }
    
    // 🔧 添加强制ref重连函数
    window.forceReconnectRefs = () => {
      console.log('🔧 强制重新连接所有refs...')
      
      // 重连headerContentRef
      if (tableHeaderRef.value?.headerContentRef?.value) {
        headerContentRef.value = tableHeaderRef.value.headerContentRef.value
        console.log('✅ headerContentRef重连成功')
      }
      
      // 重连bodyRef
      if (tableBodyRef.value?.bodyRef?.value) {
        bodyRef.value = tableBodyRef.value.bodyRef.value
        console.log('✅ bodyRef重连成功')
      }
      
      // 重连leftBodyWrapperRef
      if (connectLeftBodyWrapper()) {
        console.log('✅ leftBodyWrapperRef重连成功')
      } else {
        console.warn('⚠️ leftBodyWrapperRef重连失败')
      }
      
      // 重连rightBodyWrapperRef
      if (connectRightBodyWrapper()) {
        console.log('✅ rightBodyWrapperRef重连成功')
      } else {
        console.warn('⚠️ rightBodyWrapperRef重连失败')
      }
      
      // 检查最终状态
      window.checkRefConnections()
    }
    
    console.log('🔧 全局测试函数已添加：')
    console.log('  - window.testHeaderScroll(scrollLeft) - 测试表头水平滚动')
    console.log('  - window.testVerticalSync(scrollTop) - 测试垂直滚动同步')
    console.log('  - window.testScrollEvents() - 测试滚动事件绑定状态')
    console.log('  - window.testWheelEvents(deltaY) - 手动触发wheel事件测试')
    console.log('  - window.forceScroll(target, scrollTop) - 强制滚动测试 (target: main/left/right)')
    console.log('  - window.checkFixedContent() - 检查固定列内容状态')
    console.log('  - window.checkRefConnections() - 检查ref连接状态')
    console.log('  - window.forceReconnectRefs() - 强制重新连接refs')
  })
})

// 组件卸载时清理所有定时器
onBeforeUnmount(() => {
  console.log('🧹 VantTable组件卸载，清理所有定时器:', timers.value.length)
  clearAllTimers()
})

// 使用表格对外API管理组合函数
const { exposedAPI } = useTableExpose(composableResults)

// 暴露方法给父组件
defineExpose(exposedAPI)
</script>

<style lang="less" scoped>
@import './styles/VantTable.less';
@import './styles/VantTableContent.less';
@import './styles/VantTableFilters.less';
@import './styles/VantTableExtras.less';
@import './styles/VantTableSticky.less';
</style>

<style>
/* 🔑 确保关键样式正确加载 */

/* 表格基础样式 */
.vant-table {
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
  color: #323233;
  line-height: 1.5;
}

/* 🔑 表头样式 - 恢复标准高度，避免闪现 */
.vant-th {
  background-color: #fafafa;
  color: #666;
  font-weight: 500;
  font-size: 12px;
  padding: 8px 12px; /* 🔑 恢复原始padding */
  border-bottom: 1px solid #ebebeb;
  border-right: 1px solid #ebebeb;
  line-height: 1.4; /* 🔑 恢复原始行高 */
  height: auto;
  min-height: 48px; /* 🔑 恢复标准48px高度 */
  overflow: hidden;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-all;
  text-align: left;
  display: table-cell;
  vertical-align: middle;
  box-sizing: border-box;
  position: relative;
}

/* 🔑 表头内容样式 - 恢复标准样式 */
.vant-table-wrapper .vant-th__content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px; /* 🔑 恢复正常间距 */
  padding: 0;
  border-radius: 2px;
  transition: background-color 0.2s;
  min-height: inherit; /* 🔑 继承父元素最小高度 */
  line-height: 1.4; /* 🔑 恢复原始行高 */
  height: auto;
}

/* 🔑 表头容器 - 恢复标准样式 */
.vant-table-wrapper .vant-table-header {
  overflow: hidden; /* 🔑 保持hidden以支持滚动同步 */
  height: auto;
  min-height: 48px; /* 🔑 恢复标准最小高度 */
}

.vant-table-wrapper .vant-table-header__content {
  overflow: hidden !important; /* 🔑 保持hidden以支持水平滚动同步 */
  overflow-x: hidden !important;
  overflow-y: hidden !important;
  height: auto !important;
  min-height: unset !important;
}

.vant-table-wrapper .vant-table-fixed__header {
  overflow: hidden !important; /* 🔑 固定列表头保持hidden */
  height: auto !important; /* 🔑 自动高度 */
  min-height: unset !important; /* 🔑 移除最小高度限制 */
}

/* 🔑 可排序表头的特殊布局 - 高优先级覆盖 */
.vant-table-wrapper .vant-th--sortable .vant-th__content {
  justify-content: flex-start !important;
}

.vant-table-wrapper .vant-th--sortable .vant-th__text {
  flex: inherit !important; /* 🔑 不要占满，让图标紧跟在后面 */
}

/* 🔑 确保普通表头文本仍然占满可用空间 */
.vant-table-wrapper .vant-th:not(.vant-th--sortable) .vant-th__text {
  flex: 1 !important;
}

.vant-th__text {
  flex: 1 !important;
  font-size: 12px !important;
  color: #666 !important;
  font-weight: 500 !important;
  word-wrap: break-word !important;
  word-break: break-all !important;
  white-space: normal !important;
  line-height: 1.4 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* 🔑 统一表头样式覆盖LESS文件设置 */
.vant-table-wrapper .vant-th,
.vant-table-wrapper .vant-th--fixed,
.vant-table-wrapper .vant-table-fixed .vant-th,
.vant-table-wrapper .vant-table-header .vant-th,
.vant-table-wrapper .vant-table-fixed__header .vant-th,
.vant-table-wrapper .vant-thead .vant-th,
.vant-table-wrapper .vant-thead-row .vant-th {
  background: #fafafa !important;
  background-color: #fafafa !important;
  color: #666 !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 8px 12px !important; /* 🔑 恢复标准padding */
  line-height: 1.4 !important; /* 🔑 恢复标准行高 */
  height: auto !important;
  min-height: 48px !important; /* 🔑 恢复标准48px高度 */
  max-height: none !important;
  border-right: 1px solid #ebebeb !important;
  border-bottom: 1px solid #ebebeb !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  box-sizing: border-box !important;
  vertical-align: middle !important;
  overflow: hidden !important;
  white-space: normal !important;
  word-wrap: break-word !important;
  word-break: break-all !important;
}

/* 🔑 恢复表头行标准样式 */
.vant-table-wrapper .vant-thead-row,
.vant-table-wrapper .vant-thead-row--main,
.vant-table-wrapper .vant-thead-row--left,
.vant-table-wrapper .vant-thead-row--right {
  height: auto;
  min-height: 48px; /* 🔑 恢复标准48px高度 */
  max-height: none;
}

/* 表体样式 */
.vant-td {
  border-bottom: 1px solid #ebedf0 !important;
  border-right: 1px solid #ebedf0 !important; /* 🔑 恢复右边框 */
  padding: 12px !important;
  font-size: 14px !important;
  color: #646566 !important;
  vertical-align: middle !important;
}

/* 🔑 确保固定列的表体单元格也有边框 */
.vant-td--fixed {
  border-bottom: 1px solid #ebedf0 !important;
  border-right: 1px solid #ebedf0 !important;
}

/* 🔑 VXETable风格：确保所有表格单元格都有边框 */
.vant-table-wrapper .vant-table {
  border-collapse: separate !important;
  border-spacing: 0 !important;
}

.vant-table-wrapper .vant-th:last-child,
.vant-table-wrapper .vant-td:last-child {
  border-right: none !important; /* 最后一列不需要右边框 */
}

/* 🔑 确保表格有明确的边框结构 */
.vant-table-wrapper .vant-table-body .vant-table,
.vant-table-wrapper .vant-table-header .vant-table,
.vant-table-wrapper .vant-table-fixed__header .vant-table,
.vant-table-wrapper .vant-table-fixed__body .vant-table {
  border-collapse: separate !important;
  border-spacing: 0 !important;
}


/* 表体行样式 */
.vant-tr:hover {
  background-color: #f7f8fa;
}

/* 排序图标样式 */
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
  fill: #c8c9cc;
  stroke: #c8c9cc;
  transition: fill 0.2s, stroke 0.2s;
}

.vant-sort-icon__asc.vant-sort-icon--active,
.vant-sort-icon__desc.vant-sort-icon--active {
  fill: #1989fa;
  stroke: #1989fa;
}

.vant-th--sortable {
  cursor: pointer;
  user-select: none;
}

.vant-th--sortable:hover {
  background-color: #f2f3f5;
}

.vant-th__content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* 🔑 表头滚动条隐藏但保持可滚动性 - 最高优先级 */
.vant-table-header {
  overflow: hidden !important;
  /* 保持可以接收滚动事件 */
  pointer-events: auto !important;
  /* 确保表头可以接收鼠标事件 */
  position: relative !important;
}

.vant-table-header__content {
  /* 🔑 关键修复：允许程序化滚动但隐藏滚动条 */
  overflow: auto !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  /* 隐藏所有浏览器的滚动条 */
  scrollbar-width: none !important; /* Firefox */
  -ms-overflow-style: none !important; /* IE/Edge */
  /* 确保可以接收鼠标事件 */
  pointer-events: auto !important;
  position: relative !important;
}

/* 表头内的table元素也不能有滚动条 */
.vant-table-header .vant-table,
.vant-table-header__content .vant-table {
  overflow: hidden !important;
}

/* 隐藏表头内容区域的webkit滚动条 */
.vant-table-header__content::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* 表头区域本身不需要滚动条，但内容区域需要 */
.vant-table-header::-webkit-scrollbar,
.vant-table-header .vant-table::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* 其他浏览器的滚动条隐藏 */
.vant-table-header,
.vant-table-header__content,
.vant-table-header .vant-table {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}

/* 🔑 固定列滚动条隐藏 - 允许程序化滚动但隐藏滚动条 */
.vant-table-fixed__body {
  overflow: auto !important; /* 允许滚动 */
  overflow-x: hidden !important; /* 隐藏水平滚动条 */
  overflow-y: auto !important; /* 允许垂直滚动 */
  /* 隐藏所有浏览器的滚动条 */
  scrollbar-width: none !important; /* Firefox */
  -ms-overflow-style: none !important; /* IE/Edge */
}

/* 隐藏固定列的webkit滚动条 */
.vant-table-fixed__body::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* 固定列边框 */
.vant-table-fixed-column {
  border-right: 1px solid #ebedf0;
}

.vant-table-fixed-column--right {
  border-left: 1px solid #ebedf0;
  border-right: none;
}

/* 🔑 过滤图标样式 - 最高优先级 */
.vant-th__filter-icon {
  display: inline-block !important;
  font-size: 12px !important;
  color: #c1c1c1 !important;
  cursor: pointer !important;
  padding: 4px !important;
  border-radius: 4px !important;
  transition: all 0.2s !important;
  margin-left: 4px !important;
  background: transparent !important;
  position: relative !important;
  z-index: 5 !important;
  flex-shrink: 0 !important;
}

/* 过滤图标hover效果 - 仅在PC端生效，最高优先级 */
@media (hover: hover) and (pointer: fine) {
  .vant-th__filter-icon:hover {
    background-color: rgba(2, 120, 255, 0.1) !important;
    color: #0278ff !important;
  }
}

.vant-th__filter-icon--active {
  background-color: #0278ff !important;
  color: #fff !important;
}
</style>