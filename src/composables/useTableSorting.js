import { ref, computed } from 'vue'

/**
 * 表格排序功能逻辑
 */
export function useTableSorting(props, emit, filteredData, isDevelopment) {
  // 排序配置
  const sortConfig = ref({ 
    key: props.sortProp, 
    direction: props.sortType 
  })

  // 处理排序点击
  const handleSort = (header) => {
    if (!header.sortable) return

    const currentKey = sortConfig.value.key
    const currentDirection = sortConfig.value.direction

    if (currentKey === header.key) {
      // 同一列：切换排序方向
      if (currentDirection === 'asc') {
        sortConfig.value.direction = 'desc'
      } else if (currentDirection === 'desc') {
        // 取消排序
        sortConfig.value.key = ''
        sortConfig.value.direction = ''
      } else {
        sortConfig.value.direction = 'asc'
      }
    } else {
      // 不同列：设置为升序
      sortConfig.value.key = header.key
      sortConfig.value.direction = 'asc'
    }

    if (isDevelopment.value) {
      console.log('Sort changed:', {
        key: sortConfig.value.key,
        direction: sortConfig.value.direction,
        header: header.key
      })
    }

    // 发送排序变化事件
    emit('sort-change', {
      key: sortConfig.value.key,
      direction: sortConfig.value.direction,
      header
    })
  }

  // 排序后的数据
  const sortedData = computed(() => {
    if (!sortConfig.value.key || !sortConfig.value.direction) {
      return filteredData.value
    }

    const key = sortConfig.value.key
    const direction = sortConfig.value.direction

    const sorted = [...filteredData.value].sort((a, b) => {
      let aVal = a[key]
      let bVal = b[key]

      // 处理null/undefined值
      if (aVal === null || aVal === undefined) aVal = ''
      if (bVal === null || bVal === undefined) bVal = ''

      // 尝试数值比较
      const aNum = Number(aVal)
      const bNum = Number(bVal)
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        // 数值比较
        return direction === 'asc' ? aNum - bNum : bNum - aNum
      }

      // 字符串比较
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      
      if (direction === 'asc') {
        return aStr.localeCompare(bStr, 'zh-CN')
      } else {
        return bStr.localeCompare(aStr, 'zh-CN')
      }
    })

    if (isDevelopment.value) {
      console.log('Data sorted:', {
        key,
        direction,
        originalLength: filteredData.value.length,
        sortedLength: sorted.length
      })
    }

    return sorted
  })

  // 重置排序
  const resetSort = () => {
    sortConfig.value.key = ''
    sortConfig.value.direction = ''
    
    if (isDevelopment.value) {
      console.log('Sort reset')
    }
    
    emit('sort-change', {
      key: '',
      direction: '',
      header: null
    })
  }

  // 设置排序
  const setSort = (key, direction) => {
    sortConfig.value.key = key
    sortConfig.value.direction = direction
    
    if (isDevelopment.value) {
      console.log('Sort set:', { key, direction })
    }
    
    emit('sort-change', {
      key,
      direction,
      header: null
    })
  }

  return {
    // 状态
    sortConfig,
    sortedData,
    
    // 方法
    handleSort,
    resetSort,
    setSort
  }
}