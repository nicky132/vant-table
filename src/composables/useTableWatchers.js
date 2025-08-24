/**
 * 表格监听器管理组合函数
 * 统一管理所有的 watch 逻辑
 */

import { watch, nextTick } from 'vue'

export function useTableWatchers(props, composableResults) {
  const {
    selectedKeys,
    internalSelectedKeys,
    filteredAndSortedData,
    expandedRows,
    loadMoreLoading,
    enableLoadMore,
    showLoadMoreUi,
    highlightIndex,
    width,
    isDevelopment,
    measureAndSyncHeaderHeight,
    measureAndSyncRowHeights,
    updateContainerWidth,
    applyRowState,
    bodyRef
  } = composableResults

  /**
   * 监听 selectedKeys prop 变化（v-model支持）
   */
  const watchSelectedKeys = () => {
    if (!props.selectedKeys || !internalSelectedKeys) return

    watch(
      () => props.selectedKeys,
      newKeys => {
        if (internalSelectedKeys.value) {
          internalSelectedKeys.value = new Set(newKeys || [])
        }
      },
      { immediate: true }
    )
  }

  /**
   * 监听列信息变化
   */
  const watchColumnsData = () => {
    // 监听 columns prop 变化，可能导致表头高度变化
    watch(
      () => props.columns,
      () => {
        nextTick(() => {
          setTimeout(() => {
            if (isDevelopment?.value) {
              console.log('列信息变化，重新同步表头高度')
            }
            
            // 列信息变化时需要重新同步表头高度
            if (measureAndSyncHeaderHeight) measureAndSyncHeaderHeight(true)
            // 重新测量行高度以确保对齐
            if (measureAndSyncRowHeights) measureAndSyncRowHeights()
          }, 50)
        })
      },
      { deep: true, flush: 'post' }
    )
  }

  /**
   * 监听数据变化 - 按照 VXE Table 的方式，不自动恢复滚动位置
   */
  const watchFilteredData = () => {
    if (!filteredAndSortedData) return

    watch(
      () => filteredAndSortedData.value,
      () => {
        // VXE Table 方式：只进行必要的高度同步，不恢复滚动位置
        nextTick(() => {
          setTimeout(() => {
            if (isDevelopment?.value) {
              console.log('VXE 方式：数据变化，只进行高度同步')
            }
            
            // 进行高度同步
            if (measureAndSyncHeaderHeight) measureAndSyncHeaderHeight()
            if (measureAndSyncRowHeights) measureAndSyncRowHeights()
          }, 50)
        })
      },
      { flush: 'post' }
    )
  }

  /**
   * 监听加载更多状态变化
   */
  const watchLoadMoreState = () => {
    // 监听 loadMoreLoading 变化，在加载完成后恢复滚动位置
    if (loadMoreLoading) {
      watch(
        () => loadMoreLoading.value,
        (newLoading, oldLoading) => {
          // 从加载中变为非加载中，说明加载完成
          if (oldLoading && !newLoading) {
            nextTick(() => {
              setTimeout(() => {
                if (measureAndSyncHeaderHeight) measureAndSyncHeaderHeight(false)
                if (measureAndSyncRowHeights) measureAndSyncRowHeights()
              }, 100)
            })
          }
        }
      )
    }

    // 监听 enableLoadMore 变化
    if (enableLoadMore) {
      watch(
        () => props.enableLoadMore,
        () => {
          nextTick(() => {
            if (updateContainerWidth) updateContainerWidth()
            // 强制重新计算滚动条位置
            setTimeout(() => {
              if (bodyRef?.value) {
                // 触发滚动事件以更新滚动条位置
                const scrollEvent = new Event('scroll')
                bodyRef.value.dispatchEvent(scrollEvent)
              }
            }, 100)
          })
        }
      )
    }

    // 监听 showLoadMoreUi 变化，确保动态切换时布局正确更新
    if (showLoadMoreUi) {
      watch(
        () => props.showLoadMoreUi,
        () => {
          nextTick(() => {
            if (updateContainerWidth) updateContainerWidth()
            // 强制重新计算表格高度和滚动条位置
            setTimeout(() => {
              if (bodyRef?.value) {
                // 触发滚动事件以更新滚动条位置
                const scrollEvent = new Event('scroll')
                bodyRef.value.dispatchEvent(scrollEvent)
              }
            }, 100)
          })
        }
      )
    }
  }

  /**
   * 监听展开行变化
   */
  const watchExpandedRows = () => {
    if (!expandedRows) return

    watch(
      () => expandedRows.value,
      () => {
        nextTick(() => {
          setTimeout(() => {
            if (measureAndSyncRowHeights) measureAndSyncRowHeights()
          }, 50)
        })
      },
      { deep: true }
    )
  }

  /**
   * 监听表格宽度变化
   */
  const watchTableWidth = () => {
    watch(
      () => props.width,
      () => {
        nextTick(() => {
          if (updateContainerWidth) updateContainerWidth()
        })
      }
    )
  }

  /**
   * 监听高亮索引变化
   */
  const watchHighlightIndex = () => {
    if (!highlightIndex) return

    watch(
      () => props.highlightIndex,
      (newIndex, oldIndex) => {
        if (applyRowState) {
          if (oldIndex >= 0) {
            applyRowState(oldIndex, 'highlighted', false)
          }
          if (newIndex >= 0) {
            applyRowState(newIndex, 'highlighted', true)
          }
        }
      }
    )
  }

  /**
   * 监听滚动相关状态变化
   */
  const watchScrollState = () => {
    // 这里可以添加对滚动相关状态的监听
    // 比如滚动位置、容器尺寸等的变化处理
  }

  /**
   * 监听选择状态变化
   */
  const watchSelectionState = () => {
    // 这里可以添加对选择状态的监听
    // 比如选择模式切换、选择限制变化等
  }

  /**
   * 监听过滤和排序状态变化
   */
  const watchFilterSortState = () => {
    // 这里可以添加对过滤和排序状态的监听
    // 比如过滤条件变化、排序规则变化等
  }

  /**
   * 监听样式相关状态变化
   */
  const watchStyleState = () => {
    // 这里可以添加对样式相关状态的监听
    // 比如主题变化、颜色配置变化等
  }

  /**
   * 初始化所有监听器
   */
  const initializeWatchers = () => {
    // 基础数据监听
    watchSelectedKeys()
    watchColumnsData() // 新增：监听列信息变化
    watchFilteredData()
    watchExpandedRows()
    watchTableWidth()
    watchHighlightIndex()
    
    // 加载更多相关监听
    watchLoadMoreState()
    
    // 其他状态监听
    watchScrollState()
    watchSelectionState()
    watchFilterSortState()
    watchStyleState()
  }

  /**
   * 清理所有监听器
   */
  const cleanupWatchers = () => {
    // Vue 3 的 watch 会在组件卸载时自动清理
    // 这里可以处理一些特殊的清理逻辑
  }

  // 自动初始化监听器
  initializeWatchers()

  return {
    // 监听器初始化和清理
    initializeWatchers,
    cleanupWatchers,
    
    // 各个监听器函数，可以单独使用
    watchSelectedKeys,
    watchColumnsData,
    watchFilteredData,
    watchLoadMoreState,
    watchExpandedRows,
    watchTableWidth,
    watchHighlightIndex,
    watchScrollState,
    watchSelectionState,
    watchFilterSortState,
    watchStyleState
  }
}