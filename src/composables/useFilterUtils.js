import { computed } from 'vue'

export function useFilterUtils(
  filterStates,
  activeFilters,
  filterOptions,
  emit,
  isDevelopment
) {
  // 创建计算属性映射缓存
  const filterComputedCache = new Map()

  // 基础过滤状态方法
  const isFilterActive = key => {
    return activeFilters.value[key] && activeFilters.value[key].value
  }

  // 安全获取过滤状态的显示状态
  const getFilterShowState = (key) => {
    return filterStates.value[key]?.show || false
  }

  // 安全获取过滤类型
  const getFilterType = (key) => {
    return filterStates.value[key]?.type || 'contains'
  }

  // 安全获取过滤值
  const getFilterValue = (key) => {
    return filterStates.value[key]?.value || ''
  }

  // 安全设置过滤类型
  const setFilterType = (key, type) => {
    ensureFilterState(key)
    filterStates.value[key].type = type
  }

  // 安全设置过滤值
  const setFilterValue = (key, value) => {
    ensureFilterState(key)
    filterStates.value[key].value = value
  }

  // 确保过滤状态存在
  const ensureFilterState = (key) => {
    if (!filterStates.value[key]) {
      filterStates.value[key] = {
        show: false,
        type: 'contains',
        value: ''
      }
    }
  }

  // 获取过滤类型的计算属性
  const getFilterTypeComputed = (key) => {
    const cacheKey = `type-${key}`
    if (!filterComputedCache.has(cacheKey)) {
      filterComputedCache.set(cacheKey, computed({
        get: () => {
          ensureFilterState(key)
          return filterStates.value[key].type
        },
        set: (value) => {
          ensureFilterState(key)
          filterStates.value[key].type = value
        }
      }))
    }
    return filterComputedCache.get(cacheKey)
  }

  // 获取显示状态的计算属性
  const getFilterShowStateComputed = (key) => {
    const cacheKey = `show-${key}`
    if (!filterComputedCache.has(cacheKey)) {
      filterComputedCache.set(cacheKey, computed({
        get: () => {
          ensureFilterState(key)
          return filterStates.value[key].show
        },
        set: (value) => {
          ensureFilterState(key)
          filterStates.value[key].show = value
        }
      }))
    }
    return filterComputedCache.get(cacheKey)
  }

  // 获取过滤值的计算属性
  const getFilterValueComputed = (key) => {
    const cacheKey = `value-${key}`
    if (!filterComputedCache.has(cacheKey)) {
      filterComputedCache.set(cacheKey, computed({
        get: () => {
          ensureFilterState(key)
          return filterStates.value[key].value
        },
        set: (value) => {
          ensureFilterState(key)
          filterStates.value[key].value = value
        }
      }))
    }
    return filterComputedCache.get(cacheKey)
  }

  // 修改现有的 toggleFilter 方法 - 懒加载初始化 + 单一弹窗逻辑
  const toggleFilter = key => {
    // 确保状态已初始化
    ensureFilterState(key)
    
    const currentState = filterStates.value[key]
    if (!currentState) return
    
    // 如果当前弹窗已经显示，则关闭它
    if (currentState.show) {
      currentState.show = false
      return
    }
    
    // 关闭所有其他的过滤弹窗
    Object.keys(filterStates.value).forEach(filterKey => {
      if (filterKey !== key && filterStates.value[filterKey]) {
        filterStates.value[filterKey].show = false
      }
    })
    
    // 打开当前弹窗
    currentState.show = true
  }

  // 关闭所有过滤弹窗的辅助方法
  const closeAllFilterPopups = () => {
    if (filterStates.value) {
      Object.keys(filterStates.value).forEach(key => {
        if (filterStates.value[key]) {
          filterStates.value[key].show = false
        }
      })
    }
  }

  // 处理点击遮罩层
  const onClickOverlay = () => {
    closeAllFilterPopups()
  }

  // 修改现有的 handleFilterClose 方法
  const handleFilterClose = key => {
    if (filterStates.value && filterStates.value[key]) {
      filterStates.value[key].show = false
    }
  }

  // 修改现有的 selectFilterOption 方法
  const selectFilterOption = (key, option) => {
    if (filterStates.value[key]) {
      filterStates.value[key].value = option
    }
  }

  // 应用过滤器（VTable风格的确定按钮）
  const applyFilter = (key) => {
    const filter = filterStates.value[key]
    if (!filter) return
    
    // 关闭下拉框
    filter.show = false
    
    // 多选过滤已经通过 toggleFilterOption 实时应用了，这里只需要关闭弹窗
    // 如果有文本搜索值且没有多选过滤，转换为包含过滤
    if (filter.value && filter.value.trim() && !activeFilters.value[key]) {
      activeFilters.value[key] = {
        type: 'contains',
        value: filter.value.trim()
      }
      
      emit('filter-change', {
        key,
        filter: activeFilters.value[key] || null,
        allFilters: { ...activeFilters.value }
      })
    }
    
    // 如果已经有多选过滤，不需要再次触发 filter-change 事件
  }

  // 修改现有的 clearFilter 方法
  const clearFilter = key => {
    const filter = filterStates.value[key]
    if (!filter) return
    
    filter.value = ''
    filter.show = false
    delete activeFilters.value[key]

    emit('filter-change', {
      key,
      filter: null,
      allFilters: { ...activeFilters.value }
    })
  }

  // 获取过滤后的选项列表
  const getFilteredOptions = (key) => {
    const allOptions = filterOptions.value[key] || []
    const searchValue = filterStates.value[key]?.value || ''
    
    if (!searchValue) {
      return allOptions
    }
    
    return allOptions.filter(option => 
      String(option).toLowerCase().includes(searchValue.toLowerCase())
    )
  }

  // 判断选项是否被选中
  const isOptionSelected = (key, option) => {
    const activeFilter = activeFilters.value[key]
    if (!activeFilter || !activeFilter.values) {
      return false
    }
    return activeFilter.values.includes(option)
  }

  // 切换选项的选中状态
  const toggleFilterOption = (key, option) => {
    ensureFilterState(key)
    
    if (!activeFilters.value[key]) {
      activeFilters.value[key] = {
        type: 'multiSelect',
        values: []
      }
    }
    
    const values = activeFilters.value[key].values || []
    const index = values.indexOf(option)
    
    if (index >= 0) {
      // 取消选中
      values.splice(index, 1)
    } else {
      // 选中
      values.push(option)
    }
    
    // 如果没有选中任何项，删除过滤器
    if (values.length === 0) {
      delete activeFilters.value[key]
    }
    
    emit('filter-change', {
      key,
      filter: activeFilters.value[key] || null,
      allFilters: { ...activeFilters.value }
    })
  }

  // 全选/取消全选过滤选项
  const selectAllFilterOptions = (key) => {
    ensureFilterState(key)
    
    const isAllSelected = !activeFilters.value[key] || activeFilters.value[key].values?.length === 0
    
    if (isAllSelected) {
      // 当前是全选状态，点击后取消全选，选择所有可见选项
      const allVisibleOptions = getFilteredOptions(key)
      activeFilters.value[key] = {
        type: 'multiSelect',
        values: [...allVisibleOptions]
      }
    } else {
      // 当前不是全选状态，点击后设为全选（清空选择）
      delete activeFilters.value[key]
    }
    
    emit('filter-change', {
      key,
      filter: activeFilters.value[key] || null,
      allFilters: { ...activeFilters.value }
    })
  }

  // 重置过滤器
  const resetFilter = (key) => {
    ensureFilterState(key)
    
    const filter = filterStates.value[key]
    filter.value = ''
    filter.show = false
    delete activeFilters.value[key]
    
    emit('filter-change', {
      key,
      filter: null,
      allFilters: { ...activeFilters.value }
    })
  }

  return {
    // 基础状态方法
    isFilterActive,
    getFilterShowState,
    getFilterType,
    getFilterValue,
    setFilterType,
    setFilterValue,
    ensureFilterState,
    
    // 计算属性方法
    getFilterTypeComputed,
    getFilterShowStateComputed,
    getFilterValueComputed,
    
    // 过滤器控制方法
    toggleFilter,
    closeAllFilterPopups,
    onClickOverlay,
    handleFilterClose,
    selectFilterOption,
    applyFilter,
    clearFilter,
    
    // VTable风格过滤方法
    getFilteredOptions,
    isOptionSelected,
    toggleFilterOption,
    selectAllFilterOptions,
    resetFilter
  }
}