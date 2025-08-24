/**
 * 表格对外暴露API管理组合函数
 * 统一管理组件向外暴露的方法和属性
 */

export function useTableExpose(composableResults) {
  const {
    // 表格基础方法
    forceHeaderSync,
    measureAndSyncHeaderHeight,
    measureAndSyncRowHeights,
    quickDebug,
    enableDebug,
    checkAlignment,

    // 选择功能相关方法
    setSelectedRowKeys,
    setSelectedRows,
    getSelectedRowKeys,
    getSelectedRows,
    clearSelection,
    toggleRowSelection,
    selectAllCurrentPage,
    invertSelection,
    isRowSelected,
    isRowDisabled,

    // 滚动控制方法
    smoothScrollTo,
    scrollToLeft,
    scrollToRight,
    scrollToColumn,

    // 过滤控制方法
    closeAllFilterPopups,

    // 内部状态访问器
    selectedRowKeys,
    selectedRows,
    selectableRows,
    isAllSelected,
    isIndeterminate
  } = composableResults

  /**
   * 创建状态访问器函数
   * 提供对内部状态的只读访问
   */
  const createStateAccessors = () => ({
    // 选择状态
    selectedRowKeys: () => selectedRowKeys?.value || [],
    selectedRows: () => selectedRows?.value || [],
    selectableRows: () => selectableRows?.value || [],
    isAllSelected: () => isAllSelected?.value || false,
    isIndeterminate: () => isIndeterminate?.value || false
  })

  /**
   * 表格基础操作方法
   */
  const createBaseOperations = () => ({
    // 表头和行高度同步
    forceHeaderSync: forceHeaderSync || (() => {}),
    measureAndSyncHeaderHeight: measureAndSyncHeaderHeight || (() => {}),
    measureAndSyncRowHeights: measureAndSyncRowHeights || (() => {}),
    
    // 调试方法
    quickDebug: quickDebug || (() => {}),
    enableDebug: enableDebug || (() => {}),
    checkAlignment: checkAlignment || (() => {})
  })

  /**
   * 选择功能相关方法
   */
  const createSelectionOperations = () => ({
    // 设置选择状态
    setSelectedRowKeys: setSelectedRowKeys || (() => {}),
    setSelectedRows: setSelectedRows || (() => {}),
    
    // 获取选择状态
    getSelectedRowKeys: getSelectedRowKeys || (() => []),
    getSelectedRows: getSelectedRows || (() => []),
    
    // 选择操作
    clearSelection: clearSelection || (() => {}),
    toggleRowSelection: toggleRowSelection || (() => {}),
    selectAllCurrentPage: selectAllCurrentPage || (() => {}),
    invertSelection: invertSelection || (() => {}),
    
    // 选择状态判断
    isRowSelected: isRowSelected || (() => false),
    isRowDisabled: isRowDisabled || (() => false)
  })

  /**
   * 滚动控制方法
   */
  const createScrollOperations = () => ({
    smoothScrollTo: smoothScrollTo || (() => {}),
    scrollToLeft: scrollToLeft || (() => {}),
    scrollToRight: scrollToRight || (() => {}),
    scrollToColumn: scrollToColumn || (() => {})
  })

  /**
   * 过滤控制方法
   */
  const createFilterOperations = () => ({
    closeAllFilterPopups: closeAllFilterPopups || (() => {})
  })

  /**
   * 高级操作方法
   */
  const createAdvancedOperations = () => ({
    // 强制重新对齐（组合多个基础操作）
    forceRealign: () => {
      if (forceHeaderSync) forceHeaderSync()
      if (measureAndSyncHeaderHeight) measureAndSyncHeaderHeight(true)
      if (measureAndSyncRowHeights) measureAndSyncRowHeights()
    },
    
    // 强制DOM清理和重建
    forceDOMCleanup: () => {
      if (clearSelection) clearSelection()
      if (closeAllFilterPopups) closeAllFilterPopups()
      if (forceHeaderSync) forceHeaderSync()
    },
    
    // 同步所有区域高度
    measureAndSyncAllHeights: () => {
      if (measureAndSyncHeaderHeight) measureAndSyncHeaderHeight(true)
      setTimeout(() => {
        if (measureAndSyncRowHeights) measureAndSyncRowHeights()
      }, 50)
    },
    
    // 强制同步所有区域
    forceAllAreaSync: () => {
      if (forceHeaderSync) forceHeaderSync()
      setTimeout(() => {
        if (measureAndSyncHeaderHeight) measureAndSyncHeaderHeight(true)
        setTimeout(() => {
          if (measureAndSyncRowHeights) measureAndSyncRowHeights()
        }, 50)
      }, 50)
    }
  })

  /**
   * 批量操作方法
   */
  const createBatchOperations = () => ({
    // 批量选择操作
    batchSelect: (rowKeys = []) => {
      if (setSelectedRowKeys) {
        setSelectedRowKeys(rowKeys)
      }
    },
    
    // 批量取消选择
    batchDeselect: (rowKeys = []) => {
      const currentKeys = getSelectedRowKeys ? getSelectedRowKeys() : []
      const remainingKeys = currentKeys.filter(key => !rowKeys.includes(key))
      if (setSelectedRowKeys) {
        setSelectedRowKeys(remainingKeys)
      }
    },
    
    // 重置表格状态
    resetTableState: () => {
      if (clearSelection) clearSelection()
      if (closeAllFilterPopups) closeAllFilterPopups()
      if (scrollToLeft) scrollToLeft()
    }
  })

  /**
   * 创建完整的对外暴露API
   */
  const createExposedAPI = () => ({
    // 基础操作
    ...createBaseOperations(),
    
    // 选择功能
    ...createSelectionOperations(),
    
    // 滚动控制
    ...createScrollOperations(),
    
    // 过滤控制
    ...createFilterOperations(),
    
    // 高级操作
    ...createAdvancedOperations(),
    
    // 批量操作
    ...createBatchOperations(),
    
    // 状态访问器
    ...createStateAccessors()
  })

  return {
    // 返回完整的对外API
    exposedAPI: createExposedAPI(),
    
    // 也可以分类返回，便于按需使用
    baseOperations: createBaseOperations(),
    selectionOperations: createSelectionOperations(),
    scrollOperations: createScrollOperations(),
    filterOperations: createFilterOperations(),
    advancedOperations: createAdvancedOperations(),
    batchOperations: createBatchOperations(),
    stateAccessors: createStateAccessors()
  }
}