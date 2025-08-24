import { ref } from 'vue'

export function useRowHighlight(isDevelopment, rowElementRefs, hoveredRowIndex, selectedRowIndex, measureAndSyncRowHeights) {
  // 防抖机制避免重复触发
  let lastRowClickTime = 0
  let lastRowClickIndex = -1
  let touchHandledRowIndex = -1 // 记录触摸事件已处理的行

  // 核心函数：确保始终只有一行高亮（除复选框选中外）
  const ensureSingleRowHighlight = (targetRowIndex) => {
    if (isDevelopment.value) {
      console.log(`ensureSingleRowHighlight: 开始处理第${targetRowIndex}行，当前选中行: ${selectedRowIndex.value}`)
    }
    
    // 第一步：立即清除所有高亮状态，使用更强力的方法
    if (isDevelopment.value) {
      console.log('ensureSingleRowHighlight: 开始彻底清除所有高亮状态')
    }
    
    // 使用最强力的DOM清理 - 直接查询所有可能的高亮元素
    const allHighlightedElements = document.querySelectorAll('.vant-tr--selected, .vant-tr--highlighted, .vant-tr--active')
    allHighlightedElements.forEach(el => {
      el.classList.remove('vant-tr--selected', 'vant-tr--highlighted', 'vant-tr--active')
      // 强制重排确保立即生效
      el.offsetHeight
    })
    
    // 通过rowElementRefs双重保险清理
    Object.keys(rowElementRefs.value).forEach(rowIndex => {
      const positions = ['main', 'left', 'right']
      positions.forEach(position => {
        const rowEl = rowElementRefs.value[rowIndex]?.[position]
        if (rowEl) {
          rowEl.classList.remove('vant-tr--selected', 'vant-tr--highlighted', 'vant-tr--active')
          // 强制重排
          rowEl.offsetHeight
        }
      })
    })
    
    // 重置状态变量
    selectedRowIndex.value = -1
    
    // 第二步：设置新的高亮
    selectedRowIndex.value = targetRowIndex
    const positions = ['main', 'left', 'right']
    let successCount = 0
    
    positions.forEach(position => {
      const rowEl = rowElementRefs.value[targetRowIndex]?.[position]
      if (rowEl) {
        // 确保元素没有任何其他高亮类
        rowEl.classList.remove('vant-tr--highlighted', 'vant-tr--active')
        // 添加选中类
        rowEl.classList.add('vant-tr--selected')
        // 强制重排确保样式立即生效
        rowEl.offsetHeight
        successCount++
        if (isDevelopment.value) {
          console.log(`ensureSingleRowHighlight: 已设置第${targetRowIndex}行${position}区域高亮`)
        }
      } else {
        if (isDevelopment.value) {
          console.warn(`ensureSingleRowHighlight: 第${targetRowIndex}行${position}区域元素未找到`)
        }
      }
    })
    
    // 第三步：立即验证并修正
    if (isDevelopment.value) {
      console.log(`ensureSingleRowHighlight: 成功设置${successCount}个区域高亮`)
      
      // 立即验证结果
      const selectedElements = document.querySelectorAll('.vant-tr--selected')
      console.log(`ensureSingleRowHighlight: 验证结果 - 找到${selectedElements.length}个高亮元素`)
      
      // 如果发现异常数量的高亮元素，立即修正
      if (selectedElements.length > 3) {
        console.error(`发现${selectedElements.length}个高亮元素，应该只有3个！立即修正...`)
        // 清除所有
        selectedElements.forEach(el => {
          el.classList.remove('vant-tr--selected')
          el.offsetHeight
        })
        // 重新设置正确的高亮
        positions.forEach(position => {
          const rowEl = rowElementRefs.value[targetRowIndex]?.[position]
          if (rowEl) {
            rowEl.classList.add('vant-tr--selected')
            rowEl.offsetHeight
          }
        })
      } else if (selectedElements.length === 0 && successCount > 0) {
        console.error('没有找到任何高亮元素但应该有！重新设置...')
        positions.forEach(position => {
          const rowEl = rowElementRefs.value[targetRowIndex]?.[position]
          if (rowEl) {
            rowEl.classList.add('vant-tr--selected')
            rowEl.offsetHeight
          }
        })
      }
    }
  }

  // 强制清理所有高亮的增强函数
  const forceCleanAllHighlight = () => {
    if (isDevelopment.value) {
      console.log('forceCleanAllHighlight: 开始强制清除所有行高亮')
    }
    
    // 第一步：使用最强力的DOM查询清理所有可能的高亮类
    const highlightClasses = ['.vant-tr--selected', '.vant-tr--highlighted', '.vant-tr--active']
    let totalCleaned = 0
    
    highlightClasses.forEach(className => {
      const elements = document.querySelectorAll(className)
      elements.forEach(el => {
        el.classList.remove(className.substring(1)) // 移除开头的点
        el.offsetHeight // 强制重排
        totalCleaned++
      })
    })
    
    // 第二步：通过rowElementRefs强制清理所有引用（双重保险）
    Object.keys(rowElementRefs.value).forEach(rowIndex => {
      const positions = ['main', 'left', 'right']
      positions.forEach(position => {
        const rowEl = rowElementRefs.value[rowIndex]?.[position]
        if (rowEl) {
          // 移除所有可能的高亮相关类
          const wasHighlighted = rowEl.classList.contains('vant-tr--selected') || 
                                 rowEl.classList.contains('vant-tr--highlighted') || 
                                 rowEl.classList.contains('vant-tr--active')
          
          rowEl.classList.remove('vant-tr--selected', 'vant-tr--highlighted', 'vant-tr--active')
          
          if (wasHighlighted) {
            // 强制重排
            rowEl.offsetHeight
            totalCleaned++
          }
        }
      })
    })
    
    // 第三步：重置状态变量
    selectedRowIndex.value = -1
    
    // 第四步：立即验证清理结果
    const remainingSelected = document.querySelectorAll('.vant-tr--selected, .vant-tr--highlighted, .vant-tr--active')
    if (remainingSelected.length > 0) {
      if (isDevelopment.value) {
        console.warn(`forceCleanAllHighlight: 仍有${remainingSelected.length}个元素未清理，执行最终清理`)
      }
      remainingSelected.forEach(el => {
        el.classList.remove('vant-tr--selected', 'vant-tr--highlighted', 'vant-tr--active')
        el.offsetHeight
      })
    }
    
    if (isDevelopment.value) {
      console.log(`forceCleanAllHighlight: 强制清除完成，共清理${totalCleaned}个元素`)
    }
  }

  // 清除所有行高亮的专用函数
  const clearAllRowHighlight = () => {
    if (isDevelopment.value) {
      console.log('clearAllRowHighlight: 开始清除所有行高亮')
    }
    
    // 第一步：使用DOM查询确保彻底清理
    document.querySelectorAll('.vant-tr--selected').forEach(el => {
      el.classList.remove('vant-tr--selected')
    })
    
    // 第二步：通过rowElementRefs也确保清理（双重保险）
    Object.keys(rowElementRefs.value).forEach(rowIndex => {
      const positions = ['main', 'left', 'right']
      positions.forEach(position => {
        const rowEl = rowElementRefs.value[rowIndex]?.[position]
        if (rowEl) {
          rowEl.classList.remove('vant-tr--selected')
        }
      })
    })
    
    // 第三步：重置状态变量
    selectedRowIndex.value = -1
    
    if (isDevelopment.value) {
      console.log('clearAllRowHighlight: 清除完成')
    }
  }

  // 单行高亮控制的专用函数（用于模板调用）
  const handleSingleRowHighlight = (event, rowIndex) => {
    console.log(`🚫 handleSingleRowHighlight 被调用但已禁用: rowIndex=${rowIndex}`)
    console.log(`💡 只有复选框选中的行才会高亮`)
    
    // 🔒 禁用点击行高亮功能 - 不再执行任何高亮逻辑
    // 只有复选框选中的行才会通过updateSelectionHighlight函数进行高亮
    return
  }

  // 同步清除所有选中状态 - 避免异步竞态条件
  const clearAllSelectedStateSync = () => {
    // 开发环境调试
    if (isDevelopment.value) {
      console.log('clearAllSelectedStateSync: 开始同步清除所有选中状态')
    }
    
    // 直接同步操作DOM，避免异步延迟
    Object.keys(rowElementRefs.value).forEach(rowIndex => {
      const positions = ['main', 'left', 'right']
      positions.forEach(position => {
        const rowEl = rowElementRefs.value[rowIndex]?.[position]
        if (rowEl) {
          // 移除所有可能的状态类
          rowEl.classList.remove('vant-tr--selected', 'vant-tr--hover', 'vant-tr--highlighted', 'vant-tr--active')
          // 强制重排确保移除生效
          rowEl.offsetHeight
        }
      })
    })
    
    // 同时使用DOM查询确保彻底清理
    document.querySelectorAll('.vant-tr--selected, .vant-tr--hover, .vant-tr--highlighted, .vant-tr--active').forEach(el => {
      el.classList.remove('vant-tr--selected', 'vant-tr--hover', 'vant-tr--highlighted', 'vant-tr--active')
    })
    
    // 重置所有相关状态变量
    selectedRowIndex.value = -1
    hoveredRowIndex.value = -1
    
    if (isDevelopment.value) {
      console.log('clearAllSelectedStateSync: 同步清除完成')
    }
  }

  // 同步应用行状态 - 避免异步竞态条件
  const applyRowStateSync = (rowIndex, state, active) => {
    const stateClass = `vant-tr--${state}`
    
    if (isDevelopment.value) {
      console.log(`applyRowStateSync: rowIndex=${rowIndex}, state=${state}, active=${active}`)
    }
    
    const positions = ['main', 'left', 'right']
    positions.forEach(position => {
      const rowEl = rowElementRefs.value[rowIndex]?.[position]
      if (rowEl) {
        if (active) {
          rowEl.classList.add(stateClass)
          // 强制重排确保添加生效
          rowEl.offsetHeight
          if (isDevelopment.value) {
            console.log(`applyRowStateSync: Added ${stateClass} to ${position} row ${rowIndex}`)
          }
        } else {
          rowEl.classList.remove(stateClass)
          // 强制重排确保移除生效
          rowEl.offsetHeight
          if (isDevelopment.value) {
            console.log(`applyRowStateSync: Removed ${stateClass} from ${position} row ${rowIndex}`)
          }
        }
      } else {
        if (isDevelopment.value) {
          console.warn(`applyRowStateSync: Row element not found for ${position} row ${rowIndex}`)
        }
      }
    })
    
    // 验证状态应用是否成功
    if (active && state === 'selected') {
      setTimeout(() => {
        positions.forEach(position => {
          const rowEl = rowElementRefs.value[rowIndex]?.[position]
          if (rowEl && !rowEl.classList.contains(stateClass)) {
            console.warn(`applyRowStateSync: Force reapplying ${stateClass} to ${position} row ${rowIndex}`)
            rowEl.classList.add(stateClass)
            rowEl.offsetHeight
          }
        })
      }, 0) // 立即验证
    }
  }

  // 清除所有选中状态的快捷方法
  const clearAllSelectedState = () => {
    // 清除所有行的选中状态，包括所有可能的状态类
    const stateClasses = ['vant-tr--selected', 'vant-tr--hover', 'vant-tr--highlighted', 'vant-tr--active']
    
    Object.keys(rowElementRefs.value).forEach(rowIndex => {
      const positions = ['main', 'left', 'right']
      positions.forEach(position => {
        const rowEl = rowElementRefs.value[rowIndex]?.[position]
        if (rowEl) {
          // 移除所有可能的状态类
          stateClasses.forEach(className => {
            rowEl.classList.remove(className)
          })
          // 强制刷新确保样式移除
          rowEl.offsetHeight
        }
      })
    })
    
    // 重置所有相关状态变量
    selectedRowIndex.value = -1
    hoveredRowIndex.value = -1
    
    // 开发环境调试
    if (isDevelopment.value) {
      console.log('clearAllSelectedState: 已清除所有行的选中状态和相关状态')
    }
  }

  // 强制重置所有行状态 - 清理任何可能的残留状态
  const forceResetAllRowStates = () => {
    if (isDevelopment.value) {
      console.log('forceResetAllRowStates: 强制重置所有行状态')
    }
    
    // 清理所有可能的行状态类
    const stateClasses = ['vant-tr--selected', 'vant-tr--hover', 'vant-tr--highlighted']
    
    Object.keys(rowElementRefs.value).forEach(rowIndex => {
      const positions = ['main', 'left', 'right']
      positions.forEach(position => {
        const rowEl = rowElementRefs.value[rowIndex]?.[position]
        if (rowEl) {
          stateClasses.forEach(className => {
            if (rowEl.classList.contains(className)) {
              rowEl.classList.remove(className)
              if (isDevelopment.value) {
                console.log(`Removed ${className} from ${position} row ${rowIndex}`)
              }
            }
          })
          // 强制刷新
          rowEl.offsetHeight
        }
      })
    })
    
    // 重置所有相关状态
    selectedRowIndex.value = -1
    hoveredRowIndex.value = -1
  }

  // 处理复选框选中行的高亮
  const updateSelectionHighlight = (selectedRows, getRowKey, filteredAndSortedData) => {
    console.log('🔵 updateSelectionHighlight: 更新选中行高亮', {
      selectedCount: selectedRows.length,
      selectedKeys: selectedRows.map((row, index) => getRowKey(row, index)),
      selectedRows: selectedRows,
      filteredAndSortedDataLength: filteredAndSortedData?.value?.length
    })

    // 先清除所有选中状态的高亮（保留hover状态）
    const positions = ['main', 'left', 'right']
    
    // 通过rowElementRefs清除
    Object.keys(rowElementRefs.value).forEach(rowIndex => {
      positions.forEach(position => {
        const rowEl = rowElementRefs.value[rowIndex]?.[position]
        if (rowEl) {
          rowEl.classList.remove('vant-tr--selected')
        }
      })
    })

    // 通过DOM查询备用清除
    document.querySelectorAll('.vant-tr--selected').forEach(el => {
      el.classList.remove('vant-tr--selected')
    })

    // 为选中的行添加高亮
    let appliedCount = 0
    selectedRows.forEach((selectedRow, selectedIndex) => {
      console.log(`🔍 处理选中行 ${selectedIndex}:`, selectedRow)
      
      // 在filteredAndSortedData中找到这行的索引
      const rowIndex = filteredAndSortedData.value.findIndex((row, index) => {
        const selectedKey = getRowKey(selectedRow, selectedIndex)
        const currentKey = getRowKey(row, index)
        console.log(`🔍 比较键值: selectedKey=${selectedKey}, currentKey=${currentKey}, index=${index}`)
        return selectedKey === currentKey
      })

      console.log(`🔍 找到行索引: ${rowIndex}`)

      if (rowIndex !== -1) {
        // 方法1：通过rowElementRefs设置高亮
        let currentRowApplied = 0
        positions.forEach(position => {
          const rowEl = rowElementRefs.value[rowIndex]?.[position]
          if (rowEl) {
            rowEl.classList.add('vant-tr--selected')
            currentRowApplied++
            console.log(`✅ 通过refs设置第${rowIndex}行${position}区域选中高亮`)
          } else {
            console.log(`❌ 第${rowIndex}行${position}区域元素引用未找到`)
          }
        })

        // 方法2：如果refs不工作，使用DOM查询备用方案
        if (currentRowApplied === 0) {
          console.log(`🔧 第${rowIndex}行refs为空，使用DOM查询备用方案`)
          const mainTableRows = document.querySelectorAll('.vant-table-body tr[data-row-index]')
          const leftFixedRows = document.querySelectorAll('.vant-table-fixed--left tr[data-row-index]')
          const rightFixedRows = document.querySelectorAll('.vant-table-fixed--right tr[data-row-index]')
          
          if (mainTableRows[rowIndex]) {
            mainTableRows[rowIndex].classList.add('vant-tr--selected')
            currentRowApplied++
            console.log(`✅ 通过DOM查询设置主表格第${rowIndex}行选中高亮`)
          }
          
          if (leftFixedRows[rowIndex]) {
            leftFixedRows[rowIndex].classList.add('vant-tr--selected')
            currentRowApplied++
            console.log(`✅ 通过DOM查询设置左侧固定列第${rowIndex}行选中高亮`)
          }
          
          if (rightFixedRows[rowIndex]) {
            rightFixedRows[rowIndex].classList.add('vant-tr--selected')
            currentRowApplied++
            console.log(`✅ 通过DOM查询设置右侧固定列第${rowIndex}行选中高亮`)
          }
        }

        appliedCount += currentRowApplied
      } else {
        console.warn(`❌ 未找到选中行的索引，selectedRow:`, selectedRow)
      }
    })

    console.log(`🔵 updateSelectionHighlight: 完成，共应用${appliedCount}个区域的选中高亮`)
    
    // 🔑 重要：调用VXE风格行高同步函数确保所有区域对齐
    if (window.vxeStyleRowHeightSync && typeof window.vxeStyleRowHeightSync === 'function') {
      setTimeout(() => {
        window.vxeStyleRowHeightSync()
        console.log(`🔧 已调用VXE风格行高同步函数`)
      }, 50) // 延迟确保DOM更新完成
    }
  }

  return {
    ensureSingleRowHighlight,
    forceCleanAllHighlight,
    clearAllRowHighlight,
    handleSingleRowHighlight,
    clearAllSelectedStateSync,
    applyRowStateSync,
    clearAllSelectedState,
    forceResetAllRowStates,
    updateSelectionHighlight,
    lastRowClickTime,
    lastRowClickIndex,
    touchHandledRowIndex
  }
}