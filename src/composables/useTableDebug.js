import { ref } from 'vue'

export function useTableDebug(
  containerWidth,
  columnsInfo,
  scrollLeft,
  scrollTop,
  filteredAndSortedData,
  selectedRows,
  selectedRowKeys,
  isAllSelected,
  isIndeterminate,
  selectableRows,
  dynamicHeaderHeight,
  dynamicRowHeights,
  showHorizontalScrollbar,
  headerRowRef,
  leftHeaderRowRef,
  rightHeaderRowRef,
  forceHeaderSync,
  isDevelopment
) {
  // 调试方法
  const enableDebug = () => {
    console.log('=== 表格调试信息 ===')
    console.log('容器宽度:', containerWidth.value)
    console.log('列信息:', columnsInfo.value)
    console.log('滚动位置:', { scrollLeft: scrollLeft.value, scrollTop: scrollTop.value })
    console.log('数据长度:', filteredAndSortedData.value.length)
    console.log('选择状态:', {
      选中行数: selectedRows.value.length,
      选中键值: selectedRowKeys.value,
      全选状态: isAllSelected.value,
      半选状态: isIndeterminate.value,
      可选行数: selectableRows.value.length
    })
    console.log('动态尺寸:', {
      表头高度: dynamicHeaderHeight.value,
      行高度映射: Object.fromEntries(dynamicRowHeights.value)
    })
    console.log('横向滚动条:', {
      显示: showHorizontalScrollbar.value,
      容器宽度: containerWidth.value,
      总宽度: columnsInfo.value.totalWidth
    })
  }

  const quickDebug = () => {
    console.log('=== 快速调试 ===')
    console.log('主表格行数:', filteredAndSortedData.value.length)
    console.log('当前动态高度:', {
      表头: dynamicHeaderHeight.value,
      行数: dynamicRowHeights.value.size
    })
    console.log('滚动状态:', { scrollLeft: scrollLeft.value, scrollTop: scrollTop.value })
    console.log('选择状态:', {
      选中: selectedRows.value.length,
      键值: selectedRowKeys.value,
      可选: selectableRows.value.length
    })

    forceHeaderSync()
  }

  const checkAlignment = () => {
    console.log('=== 高度对齐检查 ===')

    const headerRows = [headerRowRef.value, leftHeaderRowRef.value, rightHeaderRowRef.value].filter(
      Boolean
    )
    const headerHeights = headerRows.map((row, index) => {
      const rect = row.getBoundingClientRect()
      const area = ['主表头', '左表头', '右表头'][index]
      return { area, height: Math.round(rect.height * 10) / 10 }
    })

    console.log('表头高度:', headerHeights)
    console.log('行高度映射:', Object.fromEntries(dynamicRowHeights.value))
  }

  return {
    enableDebug,
    quickDebug,
    checkAlignment
  }
}