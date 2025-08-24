import { ref, computed, watch } from 'vue'

/**
 * 表格过滤功能逻辑
 */
export function useTableFilters(props, rawData, columnsInfo, isDevelopment) {
  // 过滤状态管理
  const filterStates = ref({})
  const activeFilters = ref({})

  // 初始化过滤状态
  const initializeFilters = () => {
    if (!columnsInfo.value?.computedHeaders) return
    
    columnsInfo.value.computedHeaders.forEach(header => {
      if (header.filterable) {
        if (!filterStates.value[header.key]) {
          filterStates.value[header.key] = {
            show: false,
            value: '',
            options: header.filterOptions || []
          }
        }
      }
    })
  }

  // 监听列信息变化，重新初始化过滤器
  watch(() => columnsInfo.value?.computedHeaders, initializeFilters, { immediate: true, deep: true })

  // 切换过滤器显示状态
  const toggleFilter = (key) => {
    console.log('🔍 toggleFilter called with key:', key)
    
    if (!filterStates.value[key]) {
      filterStates.value[key] = {
        show: false,
        value: '',
        options: []
      }
    }
    filterStates.value[key].show = !filterStates.value[key].show
    
    console.log('🔍 Filter state after toggle:', {
      key,
      filterState: filterStates.value[key],
      showValue: filterStates.value[key]?.show,
      allFilterStates: filterStates.value,
      allShowValues: Object.fromEntries(
        Object.entries(filterStates.value).map(([k, v]) => [k, v?.show])
      )
    })
    
    if (isDevelopment.value) {
      console.log('Toggle filter:', {
        key,
        show: filterStates.value[key].show
      })
    }
  }

  // 检查过滤器是否激活
  const isFilterActive = (key) => {
    return !!(activeFilters.value[key] && (
      (activeFilters.value[key].value && activeFilters.value[key].value.trim() !== '') ||
      (activeFilters.value[key].values && activeFilters.value[key].values.length > 0)
    ))
  }

  // 处理过滤器关闭
  const handleFilterClose = (key) => {
    if (filterStates.value[key]) {
      filterStates.value[key].show = false
    }
  }

  // 切换过滤选项
  const toggleFilterOption = (key, option) => {
    if (!activeFilters.value[key]) {
      activeFilters.value[key] = {
        values: []
      }
    }
    
    const values = activeFilters.value[key].values || []
    const index = values.indexOf(option.value)
    
    if (index === -1) {
      values.push(option.value)
    } else {
      values.splice(index, 1)
    }
    
    activeFilters.value[key] = {
      ...activeFilters.value[key],
      values: [...values]
    }
    
    if (isDevelopment.value) {
      console.log('Toggle filter option:', {
        key,
        option: option.value,
        currentValues: activeFilters.value[key].values
      })
    }
  }

  // 应用文本过滤
  const applyTextFilter = (key) => {
    const filterState = filterStates.value[key]
    if (!filterState) return
    
    const value = filterState.value?.trim()
    
    if (value) {
      activeFilters.value[key] = {
        type: 'text',
        value: value
      }
    } else {
      delete activeFilters.value[key]
    }
    
    // 关闭过滤器面板
    filterState.show = false
    
    if (isDevelopment.value) {
      console.log('Apply text filter:', {
        key,
        value,
        activeFilters: Object.keys(activeFilters.value)
      })
    }
  }

  // 重置特定过滤器
  const resetFilter = (key) => {
    delete activeFilters.value[key]
    if (filterStates.value[key]) {
      filterStates.value[key].value = ''
      filterStates.value[key].show = false
    }
    
    if (isDevelopment.value) {
      console.log('Reset filter:', key)
    }
  }

  // 清除所有过滤器
  const clearFilters = () => {
    activeFilters.value = {}
    Object.keys(filterStates.value).forEach(key => {
      if (filterStates.value[key]) {
        filterStates.value[key].value = ''
        filterStates.value[key].show = false
      }
    })
    
    if (isDevelopment.value) {
      console.log('Clear all filters')
    }
  }

  // 检查是否有激活的过滤器
  const hasActiveFilters = computed(() => {
    return Object.keys(activeFilters.value).length > 0
  })

  // 过滤数据
  const filteredData = computed(() => {
    let filtered = rawData.value || []
    
    // 应用所有激活的过滤器
    Object.entries(activeFilters.value).forEach(([key, filter]) => {
      if (filter.type === 'text' && filter.value) {
        // 文本过滤
        const searchValue = filter.value.toLowerCase()
        filtered = filtered.filter(row => {
          const cellValue = row[key]
          if (cellValue === null || cellValue === undefined) return false
          return String(cellValue).toLowerCase().includes(searchValue)
        })
      } else if (filter.values && filter.values.length > 0) {
        // 选项过滤
        filtered = filtered.filter(row => {
          const cellValue = row[key]
          return filter.values.includes(cellValue)
        })
      }
    })
    
    return filtered
  })

  return {
    // 状态
    filterStates,
    activeFilters,
    hasActiveFilters,
    filteredData,
    
    // 方法
    toggleFilter,
    isFilterActive,
    handleFilterClose,
    toggleFilterOption,
    applyTextFilter,
    resetFilter,
    clearFilters,
    initializeFilters
  }
}