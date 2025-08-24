import { computed } from 'vue'

/**
 * 数据处理组合函数
 * 处理数据的过滤、排序等逻辑
 */
export function useDataProcessor(props, activeFilters, sortConfig, getCellValue, isRowTotal) {
  // 过滤和排序后的数据
  const filteredAndSortedData = computed(() => {
    let data = [...props.data]

    // 应用过滤器
    Object.entries(activeFilters.value).forEach(([key, filter]) => {
      if (filter.type === 'multiSelect' && filter.values && filter.values.length > 0) {
        // VTable风格的多选过滤
        data = data.filter(row => {
          const cellValue = String(getCellValue(row, key) || '')
          return filter.values.includes(cellValue)
        })
      } else if (filter.value) {
        // 传统的文本过滤
        data = data.filter(row => {
          const cellValue = String(getCellValue(row, key) || '').toLowerCase()
          const filterValue = String(filter.value).toLowerCase()
          switch (filter.type) {
            case 'contains':
              return cellValue.includes(filterValue)
            case 'equals':
              return cellValue === filterValue
            case 'startsWith':
              return cellValue.startsWith(filterValue)
            default:
              return true
          }
        })
      }
    })

    // 应用排序
    if (sortConfig.value.key && sortConfig.value.direction) {
      const { key, direction } = sortConfig.value
      const totalRows = data.filter(row => isRowTotal(row))
      const normalRows = data.filter(row => !isRowTotal(row))

      normalRows.sort((a, b) => {
        const valueA = getCellValue(a, key)
        const valueB = getCellValue(b, key)

        let result = 0
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          result = valueA - valueB
        } else {
          result = String(valueA || '').localeCompare(String(valueB || ''))
        }

        return direction === 'asc' ? result : -result
      })

      data = [...normalRows, ...totalRows]
    }

    return data
  })

  // 是否有激活的过滤器
  const hasActiveFilters = computed(() => {
    return Object.keys(activeFilters.value).length > 0
  })

  return {
    filteredAndSortedData,
    hasActiveFilters
  }
}