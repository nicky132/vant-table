import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'


/**
 * 表格状态管理逻辑
 */
export function useTableState(props, emit, bodyRef, leftBodyWrapperRef, rightBodyWrapperRef, layoutWrapperRef, isDevelopment) {
  // 基础状态
  const hoveredRowIndex = ref(-1)
  const selectedRowIndex = ref(-1)
  const expandedRows = ref(new Set())

  // 滚动状态
  const isDragging = ref(false)
  const dragStartX = ref(0)
  const dragStartScrollLeft = ref(0)
  const isScrollbarVisible = ref(false)
  const autoHideTimer = ref(null)
  const smoothScrollAnimation = ref(null)

  // 容器尺寸状态
  const containerWidth = ref(0)
  const scrollTop = ref(0)
  const scrollLeft = ref(0)
  const lastScrollTop = ref(0)
  const lastScrollLeft = ref(0)

  // 高度测量状态
  const headerHeight = ref(48)
  const isHeaderMeasuring = ref(false)
  const isInitialHeaderHeightSet = ref(false)
  const isRowMeasuring = ref(false)
  const rowHeightMap = ref(new Map())
  const expandedRowHeightMap = ref(new Map())

  // DOM 引用管理
  const headerElementRefs = ref({})
  const rowElementRefs = ref({})

  // 行状态管理
  const setHeaderElementRef = (el, key, position) => {
    if (el) {
      if (!headerElementRefs.value[key]) {
        headerElementRefs.value[key] = {}
      }
      headerElementRefs.value[key][position] = el
    }
  }

  const setRowElementRef = (el, rowIndex, position) => {
    // console.log(`🔧 setRowElementRef 被调用:`, { el: !!el, rowIndex, position });
    if (el) {
      if (!rowElementRefs.value[rowIndex]) {
        rowElementRefs.value[rowIndex] = {}
      }
      rowElementRefs.value[rowIndex][position] = el
      // console.log(`✅ 已保存第${rowIndex}行${position}区域元素引用`);
      // console.log(`🔍 当前 rowElementRefs:`, rowElementRefs.value);
    } else {
      console.warn(`❌ setRowElementRef: 第${rowIndex}行${position}区域元素为空`);
    }
  }

  // 行展开状态管理
  const isRowExpanded = (row, rowIndex) => {
    const getRowKey = (row, rowIndex) => {
      if (typeof props.rowKey === 'function') {
        return props.rowKey(row, rowIndex)
      }
      return row[props.rowKey] || `row-${rowIndex}`
    }
    const key = getRowKey(row, rowIndex)
    return expandedRows.value.has(key)
  }

  const toggleRowExpansion = (row, rowIndex) => {
    const getRowKey = (row, rowIndex) => {
      if (typeof props.rowKey === 'function') {
        return props.rowKey(row, rowIndex)
      }
      return row[props.rowKey] || `row-${rowIndex}`
    }
    const key = getRowKey(row, rowIndex)
    
    if (expandedRows.value.has(key)) {
      expandedRows.value.delete(key)
    } else {
      expandedRows.value.add(key)
    }
    
    emit('expand-change', {
      row,
      rowIndex,
      expanded: expandedRows.value.has(key),
      expandedKeys: Array.from(expandedRows.value)
    })
    
    // 重新测量行高
    nextTick(() => {
      setTimeout(() => {
        measureAndSyncRowHeights()
      }, 50)
    })
  }

  // 高度测量函数 - 智能同步，确保所有表头高度一致
  // 手动强制表头高度同步的函数（用于调试）
  const forceHeaderHeightSync = () => {
    console.log('🔧 手动强制表头高度同步')
    
    // 重置防抖标志
    isHeaderMeasuring.value = false
    
    // 强制重新计算表头高度
    measureAndSyncHeaderHeight(true)
  }
  
  const resetHeaderHeightLock = () => {
    isInitialHeaderHeightSet.value = false
    console.log('🔓 表头高度锁定已重置，下次调用将重新计算')
  }

  const measureAndSyncHeaderHeight = (forceRecalculation = false) => {
    console.log('🚀 measureAndSyncHeaderHeight 被调用，参数:', {
      forceRecalculation,
      isHeaderMeasuring: isHeaderMeasuring.value,
      isInitialHeaderHeightSet: isInitialHeaderHeightSet.value,
      headerHeight: headerHeight.value
    })
    
    // 🔑 临时禁用表头高度同步以修复排序后样式变化问题
    console.log('🔒 表头高度同步已被禁用以保持原有样式')
    return
    
    if (isHeaderMeasuring.value) {
      console.log('⏸️ 表头正在测量中，跳过本次调用')
      return
    }
    
    // 🔒 强化锁定检查：检查DOM元素是否已经有固定高度样式
    if (!forceRecalculation) {
      console.log('🔍 开始DOM锁定检查，forceRecalculation:', forceRecalculation)
      
      const firstHeader = document.querySelector('.vant-table-header .vant-thead-row')
      console.log('🔍 DOM查询结果:', {
        找到表头: !!firstHeader,
        表头className: firstHeader?.className,
        表头style: firstHeader?.style.cssText
      })
      
      if (firstHeader) {
        const hasFixedHeight = firstHeader.style.height && firstHeader.style.height !== 'auto'
        const hasMaxHeight = firstHeader.style.maxHeight && firstHeader.style.maxHeight.includes('!important')
        
        console.log('🔍 DOM样式检查:', {
          height: firstHeader.style.height,
          maxHeight: firstHeader.style.maxHeight,
          hasFixedHeight,
          hasMaxHeight,
          锁定状态: isInitialHeaderHeightSet.value
        })
        
        if (hasFixedHeight || hasMaxHeight) {
          console.log('🔒 检测到表头已有固定高度样式，跳过重新计算:', {
            height: firstHeader.style.height,
            maxHeight: firstHeader.style.maxHeight,
            hasFixedHeight,
            hasMaxHeight
          })
          
          // 确保锁定标志被设置
          if (!isInitialHeaderHeightSet.value) {
            isInitialHeaderHeightSet.value = true
            console.log('🔒 DOM检查后设置表头高度锁定标志')
          }
          return
        }
      }
    }
    
    // 如果已经设置了初始表头高度且不强制重新计算，则跳过
    if (isInitialHeaderHeightSet.value && !forceRecalculation) {
      console.log('🔒 表头高度已锁定，跳过重新计算:', headerHeight.value + 'px')
      return
    }
    
    isHeaderMeasuring.value = true
    
    nextTick(() => {
      try {
        console.log('🔄 开始表头高度同步')
        
        // 🔧 关键修复：直接使用DOM查询，避免Vue ref传递问题
        const mainHeaders = document.querySelectorAll('.vant-table-header .vant-thead-row')
        const leftHeaders = document.querySelectorAll('.vant-table-fixed--left .vant-thead-row')
        const rightHeaders = document.querySelectorAll('.vant-table-fixed--right .vant-thead-row')
        
        const allHeaders = [...mainHeaders, ...leftHeaders, ...rightHeaders]
        console.log(`🔍 DOM查询找到 ${allHeaders.length} 个表头行`)
        
        if (allHeaders.length === 0) {
          console.log('⚠️ 表头高度同步 - 未找到表头行元素，稍后重试')
          
          // 重试机制：等待更长时间后再次尝试
          setTimeout(() => {
            isHeaderMeasuring.value = false
            measureAndSyncHeaderHeight()
          }, 200)
          return
        }
        
        console.log(`📏 找到 ${allHeaders.length} 个表头行，开始重置高度`)
        
        // 🎯 特别处理：确保右侧固定列宽度正确
        rightHeaders.forEach(header => {
          // 检查右侧固定列表格的宽度设置
          const table = header.closest('table')
          if (table) {
            const computedStyle = window.getComputedStyle(table)
            console.log('🔍 右侧固定列表格宽度:', {
              设置宽度: table.style.width,
              计算宽度: computedStyle.width,
              实际宽度: table.getBoundingClientRect().width
            })
            
            // 强制重新设置表格宽度
            table.style.width = table.style.width || 'auto'
            table.style.tableLayout = 'fixed'
            table.style.borderCollapse = 'separate'
            table.style.borderSpacing = '0'
          }
          
          // 检查右侧固定列容器的宽度
          const container = header.closest('.vant-table-fixed--right')
          if (container) {
            const computedStyle = window.getComputedStyle(container)
            console.log('🔍 右侧固定列容器宽度:', {
              设置宽度: container.style.width,
              计算宽度: computedStyle.width,
              实际宽度: container.getBoundingClientRect().width
            })
          }
        })
        
        // 首先重置所有表头高度为auto，让内容自然扩展
        allHeaders.forEach(row => {
          if (row) {
            row.style.height = 'auto'
            row.style.minHeight = '90px'  // 提高最小高度基线
            row.style.maxHeight = 'none'
            
            // 同时重置表头单元格
            const cells = row.querySelectorAll('th')
            cells.forEach(cell => {
              cell.style.height = 'auto'
              cell.style.minHeight = '90px'  // 提高最小高度基线
              cell.style.maxHeight = 'none'
              cell.style.padding = '12px'  // 统一内边距
              cell.style.boxSizing = 'border-box'
            })
          }
        })
        
        // 等待DOM更新后测量实际高度
        requestAnimationFrame(() => {
          const heights = allHeaders.map((row, index) => {
            if (row) {
              const rect = row.getBoundingClientRect()
              console.log(`📏 表头行 ${index + 1} 当前高度: ${rect.height}px`)
              return rect.height
            }
            return 48
          })
          
          // 取最大高度作为统一高度，确保至少90px
          const maxHeight = Math.max(...heights, 90)
          headerHeight.value = maxHeight
          
          // 标记初始表头高度已设置
          if (!isInitialHeaderHeightSet.value) {
            isInitialHeaderHeightSet.value = true
            console.log('🔒 初始表头高度已锁定:', maxHeight + 'px')
          }
          
          console.log('📐 表头高度同步结果', {
            测量高度: heights,
            统一高度: maxHeight,
            应用到: allHeaders.length + ' 个表头行'
          })
          
          // 🔑 修复排序后表头样式变化问题：大幅简化样式设置，让CSS样式表控制
          allHeaders.forEach((row, index) => {
            if (row) {
              // 只设置必要的高度，不强制覆盖其他样式
              // 让CSS样式表控制表头的 display、border、padding 等样式
              
              // 同时设置表头单元格高度 - 最小化设置
              const cells = row.querySelectorAll('th')
              cells.forEach(cell => {
                // 只设置高度相关属性，不强制覆盖其他样式
                // 这样排序时不会添加大量 !important 样式
                
                // 计算内容高度（总高度减去边距）
                const contentHeight = maxHeight - 24 // 12px 上下边距
                
                // 设置内容容器 - 只设置必要的高度
                const content = cell.querySelector('.vant-th__content')
                if (content) {
                  // 只设置最小高度，让CSS样式表控制其他样式
                  content.style.setProperty('min-height', `${contentHeight}px`)
                  // 移除所有其他强制样式设置，避免排序时样式变化
                }
              })
              
              console.log(`✅ 表头行 ${index + 1} 已设置内容最小高度 (包含 ${cells.length} 个单元格)`)
            }
          })
          
          // 🎯 特别处理右侧固定列：确保宽度和对齐正确
          setTimeout(() => {
            rightHeaders.forEach((header, index) => {
              const container = header.closest('.vant-table-fixed--right')
              const table = header.closest('table')
              
              if (container && table) {
                // 获取容器的实际宽度
                const containerRect = container.getBoundingClientRect()
                const tableRect = table.getBoundingClientRect()
                
                console.log(`🔧 右侧固定列 ${index + 1} 宽度校正:`, {
                  容器宽度: containerRect.width,
                  表格宽度: tableRect.width,
                  宽度差异: Math.abs(containerRect.width - tableRect.width)
                })
                
                // 🔥 修复：禁用宽度自动校正，避免无限增长循环
                // 只记录原始宽度，不再主动调整表格宽度
                if (!table.getAttribute('data-original-width')) {
                  table.setAttribute('data-original-width', table.style.width || containerRect.width + 'px')
                }
                
                // 确保表格宽度与设计值一致，但不超过容器宽度
                const originalWidth = table.getAttribute('data-original-width')
                const targetWidth = Math.min(parseFloat(originalWidth), containerRect.width)
                
                if (Math.abs(tableRect.width - targetWidth) > 2) {
                  table.style.setProperty('width', `${targetWidth}px`, 'important')
                  console.log(`✅ 右侧固定列 ${index + 1} 宽度稳定为: ${targetWidth}px`)
                }
                
                // 确保右侧固定列没有多余的边距
                container.style.setProperty('right', '0px', 'important')
                container.style.setProperty('margin-right', '0px', 'important')
                container.style.setProperty('padding-right', '0px', 'important')
              }
            })
            
            // 额外等待一帧，确保样式应用完成
            requestAnimationFrame(() => {
              const finalHeights = allHeaders.map((row, index) => {
                if (row) {
                  const rect = row.getBoundingClientRect()
                  console.log(`🔍 表头行 ${index + 1} 最终高度: ${rect.height}px`)
                  return rect.height
                }
                return 0
              })
              console.log('🎯 最终高度验证:', finalHeights)
              
              // 检查右侧固定列的最终状态
              rightHeaders.forEach((header, index) => {
                const container = header.closest('.vant-table-fixed--right')
                if (container) {
                  const rect = container.getBoundingClientRect()
                  console.log(`🔍 右侧固定列 ${index + 1} 最终状态:`, {
                    位置: rect.right,
                    宽度: rect.width,
                    高度: rect.height
                  })
                }
              })
            })
          }, 50)
        })
        
      } catch (error) {
        console.error('❌ 表头高度同步失败:', error)
      } finally {
        setTimeout(() => {
          isHeaderMeasuring.value = false
        }, 50)
      }
    })
  }

  const measureAndSyncRowHeights = () => {
    if (isRowMeasuring.value) return
    
    isRowMeasuring.value = true
    nextTick(() => {
      try {
        const newRowHeightMap = new Map()
        const newExpandedRowHeightMap = new Map()

        // 重置所有行高度
        Object.keys(rowElementRefs.value).forEach(rowIndex => {
          ['main', 'left', 'right'].forEach(position => {
            const rowEl = rowElementRefs.value[rowIndex]?.[position]
            if (rowEl) {
              rowEl.style.height = 'auto'
              rowEl.style.minHeight = 'auto'
              rowEl.style.maxHeight = 'none'
              
              rowEl.querySelectorAll('td').forEach(td => {
                td.style.height = 'auto'
                td.style.minHeight = 'auto'
                td.style.maxHeight = 'none'
              })
            }
          })
        })

        requestAnimationFrame(() => {
          // 测量普通行高度
          Object.keys(rowElementRefs.value).forEach(rowIndex => {
            const heights = []
            const positions = ['main', 'left', 'right']
            
            positions.forEach(position => {
              const rowEl = rowElementRefs.value[rowIndex]?.[position]
              if (rowEl) {
                const rect = rowEl.getBoundingClientRect()
                heights.push(rect.height)
              }
            })

            if (heights.length > 0) {
              const maxHeight = Math.max(...heights, 44)
              newRowHeightMap.set(parseInt(rowIndex), maxHeight)
              
              // 同步设置行高
              positions.forEach(position => {
                const rowEl = rowElementRefs.value[rowIndex]?.[position]
                if (rowEl) {
                  rowEl.style.height = `${maxHeight}px`
                  rowEl.style.minHeight = `${maxHeight}px`
                  rowEl.style.maxHeight = `${maxHeight}px`
                  
                  rowEl.querySelectorAll('td').forEach(td => {
                    td.style.height = `${maxHeight}px`
                    td.style.minHeight = `${maxHeight}px`
                    td.style.maxHeight = `${maxHeight}px`
                  })
                }
              })
            }
          })

          // 测量展开行高度
          expandedRows.value.forEach((expandedKey) => {
            console.log('处理展开行:', expandedKey) // 使用expandedKey避免警告
            const expandedRowElements = document.querySelectorAll(`[data-expanded-row-index]`)
            expandedRowElements.forEach(expandedEl => {
              const rowIndex = expandedEl.getAttribute('data-expanded-row-index')
              if (rowIndex) {
                const heights = []
                const expandedEls = document.querySelectorAll(`[data-expanded-row-index="${rowIndex}"]`)
                
                expandedEls.forEach(el => {
                  const rect = el.getBoundingClientRect()
                  heights.push(rect.height)
                })

                if (heights.length > 0) {
                  const maxHeight = Math.max(...heights, 60)
                  newExpandedRowHeightMap.set(parseInt(rowIndex), maxHeight)
                  
                  // 同步设置展开行高度
                  expandedEls.forEach(el => {
                    el.style.height = `${maxHeight}px`
                    el.style.minHeight = `${maxHeight}px`
                    el.style.maxHeight = `${maxHeight}px`
                    
                    el.querySelectorAll('td').forEach(td => {
                      td.style.height = `${maxHeight}px`
                      td.style.minHeight = `${maxHeight}px`
                      td.style.maxHeight = `${maxHeight}px`
                    })
                  })
                }
              }
            })
          })

          rowHeightMap.value = newRowHeightMap
          expandedRowHeightMap.value = newExpandedRowHeightMap
        })
      } finally {
        setTimeout(() => {
          isRowMeasuring.value = false
        }, 50)
      }
    })
  }

  // 容器宽度更新
  const updateContainerWidth = () => {
    if (bodyRef.value) {
      const parentElement = bodyRef.value.parentElement
      if (parentElement) {
        const rect = parentElement.getBoundingClientRect()
        containerWidth.value = Math.max(rect.width, props.minWidth)
      }
    } else if (typeof props.width === 'number') {
      containerWidth.value = props.width
    }
  }

  // 监听器
  watch(() => expandedRows.value, () => {
    nextTick(() => {
      setTimeout(() => {
        measureAndSyncRowHeights()
      }, 50)
    })
  }, { deep: true })

  watch(() => props.width, () => {
    nextTick(() => {
      updateContainerWidth()
      // 宽度变化时也需要重新同步表头高度
      setTimeout(() => {
        measureAndSyncHeaderHeight()
      }, 50)
    })
  })

  return {
    // 状态
    hoveredRowIndex,
    selectedRowIndex,
    expandedRows,
    isDragging,
    dragStartX,
    dragStartScrollLeft,
    isScrollbarVisible,
    autoHideTimer,
    smoothScrollAnimation,
    containerWidth,
    scrollTop,
    scrollLeft,
    lastScrollTop,
    lastScrollLeft,
    headerHeight,
    isHeaderMeasuring,
    isInitialHeaderHeightSet,
    isRowMeasuring,
    rowHeightMap,
    expandedRowHeightMap,
    headerElementRefs,
    rowElementRefs,
    
    // 方法
    setHeaderElementRef,
    setRowElementRef,
    isRowExpanded,
    toggleRowExpansion,
    measureAndSyncHeaderHeight,
    forceHeaderHeightSync,
    resetHeaderHeightLock,
    measureAndSyncRowHeights,
    updateContainerWidth
  }
}