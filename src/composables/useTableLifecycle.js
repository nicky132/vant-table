/**
 * 表格生命周期管理组合函数
 * 处理组件的挂载、卸载和各种事件监听器
 */

import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { tableConstants, debugConfig } from '../configs/tableConfig.js'

export function useTableLifecycle(props, emit, refs, composableResults) {
  const {
    layoutWrapperRef,
    bodyRef,
    headerRef,
    leftBodyWrapperRef,
    rightBodyWrapperRef
  } = refs

  const {
    initializeTable,
    updateContainerWidth,
    measureAndSyncHeaderHeight,
    measureAndSyncRowHeights,
    forceResetAllRowStates,
    applyRowState,
    closeAllFilterPopups,
    isDevelopment,
    selectedRowIndex,
    autoHideTimer,
    smoothScrollAnimation,
    forceHeaderHeightSync
  } = composableResults

  // iOS优化清理函数
  let cleanupTouchOptimization = null
  
  // 全局按钮点击监听器清理函数
  let globalButtonClickHandler = null

  // iOS Safari 检测和特殊处理
  const isIOSSafari = ref(false)
  const iosScrollTimeout = ref(null)

  /**
   * 检测 iOS Safari 环境
   */
  const detectIOSSafari = () => {
    const ua = navigator.userAgent
    const isIOS = tableConstants.IOS_REGEX.test(ua)
    const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua)
    return isIOS && isSafari
  }

  /**
   * 键盘事件处理 - ESC键关闭所有过滤弹窗
   */
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeAllFilterPopups()
    }
  }

  /**
   * iOS优化：处理触摸事件防止固定列跟随拖拽
   */
  const handleTouchOptimization = () => {
    // 检测是否为iOS设备
    const isIOS = tableConstants.IOS_REGEX.test(navigator.userAgent)
    
    if (isIOS && layoutWrapperRef.value) {
      // 为表格容器添加触摸优化
      const tableWrapper = layoutWrapperRef.value
      
      // 添加CSS类用于iOS优化
      tableWrapper.classList.add(tableConstants.CSS_CLASSES.IOS_OPTIMIZED)
      
      // 防止过度滚动
      let startY = 0
      let startX = 0
      
      const touchStart = (e) => {
        startY = e.touches[0].clientY
        startX = e.touches[0].clientX
      }
      
      const touchMove = (e) => {
        const currentY = e.touches[0].clientY
        const currentX = e.touches[0].clientX
        const deltaY = currentY - startY
        const deltaX = currentX - startX
        
        // 如果是主要的水平滚动，允许继续
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          return
        }
        
        // 如果滚动到边界，防止回弹
        const scrollTop = bodyRef.value?.scrollTop || 0
        const scrollHeight = bodyRef.value?.scrollHeight || 0
        const clientHeight = bodyRef.value?.clientHeight || 0
        
        if ((scrollTop === 0 && deltaY > 0) || 
            (scrollTop + clientHeight >= scrollHeight && deltaY < 0)) {
          e.preventDefault()
        }
      }
      
      tableWrapper.addEventListener('touchstart', touchStart, { passive: true })
      tableWrapper.addEventListener('touchmove', touchMove, { passive: false })
      
      // 返回清理函数
      return () => {
        tableWrapper.removeEventListener('touchstart', touchStart)
        tableWrapper.removeEventListener('touchmove', touchMove)
      }
    }
    
    return () => {}
  }

  /**
   * 全局按钮点击监听器 - 编辑删除按钮高亮当前行
   */
  const setupGlobalButtonClickHandler = () => {
    globalButtonClickHandler = (event) => {
      // 检查是否点击的是编辑按钮或其他操作按钮
      const isEditButtonClick = event.target.closest('button, .van-button, [role="button"], .edit-btn, .action-btn')
      
      if (isEditButtonClick) {
        // 找到按钮所在的行
        const row = event.target.closest('tr')
        if (row && row.dataset.rowIndex !== undefined) {
          const rowIndex = parseInt(row.dataset.rowIndex)
          
          // 先清除所有现有高亮
          const allHighlightClasses = [
            `.${tableConstants.CSS_CLASSES.SELECTED}`,
            `.${tableConstants.CSS_CLASSES.HOVER}`,
            '.vant-tr--active',
            `.${tableConstants.CSS_CLASSES.HIGHLIGHTED}`
          ]
          
          allHighlightClasses.forEach(className => {
            document.querySelectorAll(className).forEach(el => {
              el.classList.remove(className.substring(1))
            })
          })
          
          // 高亮当前行（所有区域：主表格、左固定列、右固定列）
          document.querySelectorAll(`[data-row-index="${rowIndex}"]`).forEach(el => {
            if (el.classList.contains(tableConstants.CSS_CLASSES.ROW)) {
              el.classList.add(tableConstants.CSS_CLASSES.SELECTED)
            }
          })
          
          // 更新状态
          selectedRowIndex.value = rowIndex
          
          if (isDevelopment.value) {
            console.log(`🎯 编辑/删除按钮点击：高亮第${rowIndex}行`)
          }
        }
        
        // 不阻止事件传播，让编辑/删除功能正常执行
      }
    }
    
    document.addEventListener('click', globalButtonClickHandler, true) // 使用捕获阶段确保优先执行
  }

  /**
   * 窗口大小调整处理
   */
  const handleWindowResize = () => {
    setTimeout(() => {
      updateContainerWidth()
      // forceHeaderSync()
    }, tableConstants.RESIZE_DEBOUNCE_TIME)
  }

  /**
   * 设置开发调试工具
   */
  const setupDevelopmentDebugger = () => {
    if (isDevelopment.value && debugConfig.enableConsoleLog) {
      window.tableDebugger = {
        ...composableResults, // 所有组合函数的方法
        
        // 额外的调试方法
        forceHeaderSync: forceHeaderHeightSync,
        
        // 选择相关调试方法
        testRowHighlight: (rowIndex) => {
          console.log(`Testing row ${rowIndex} highlight...`)
          // clearAllSelectedState()
          applyRowState(rowIndex, 'selected', true)
          selectedRowIndex.value = rowIndex
        },
        
        checkRowElements: (rowIndex) => {
          const positions = ['main', 'left', 'right']
          console.log(`Checking row ${rowIndex} elements:`)
          positions.forEach(position => {
            const rowEl = composableResults.rowElementRefs?.value[rowIndex]?.[position]
            console.log(`${position}:`, rowEl ? 'Found' : 'Missing', rowEl)
          })
        },
        
        checkHighlightState: () => {
          const selectedElements = document.querySelectorAll(`.${tableConstants.CSS_CLASSES.SELECTED}`)
          console.log(`Current highlight state: ${selectedElements.length} elements`)
          selectedElements.forEach((el, index) => {
            const rowIndex = el.getAttribute('data-row-index')
            console.log(`  ${index + 1}. Row ${rowIndex}:`, el)
          })
          return {
            count: selectedElements.length,
            selectedRowIndex: selectedRowIndex.value,
            elements: selectedElements
          }
        }
      }
    }
  }

  /**
   * 设置表头内容引用
   */
  const setupHeaderContentRef = () => {
    // 尝试设置headerContentRef引用
    const trySetupRef = (retryCount = 0) => {
      if (refs.tableHeaderRef && refs.tableHeaderRef.value && refs.tableHeaderRef.value.headerContentRef && refs.tableHeaderRef.value.headerContentRef.value) {
        refs.headerContentRef.value = refs.tableHeaderRef.value.headerContentRef.value
        if (debugConfig.enableConsoleLog) {
          console.log('✅ 表头内容引用已正确设置:', {
            获取到的DOM元素: !!refs.headerContentRef.value,
            元素类名: refs.headerContentRef.value?.className,
            可滚动性: refs.headerContentRef.value?.scrollWidth > refs.headerContentRef.value?.clientWidth
          })
        }
        return true
      } else {
        if (retryCount < 5) {
          // 重试最多5次
          setTimeout(() => {
            trySetupRef(retryCount + 1)
          }, 100 * (retryCount + 1)) // 递增延迟时间
        } else {
          if (debugConfig.enableConsoleLog) {
            console.warn('⚠️ 表头内容引用获取失败，已达到最大重试次数:', {
              tableHeaderRef: !!refs.tableHeaderRef?.value,
              headerContentRef: !!refs.tableHeaderRef?.value?.headerContentRef,
              headerContentRefValue: !!refs.tableHeaderRef?.value?.headerContentRef?.value
            })
          }
        }
        return false
      }
    }
    
    return trySetupRef()
  }

  /**
   * 初始化表格高度和同步
   */
  const initializeTableHeights = () => {
    nextTick(() => {
      // 🔑 关键修复：正确设置headerContentRef引用
      setupHeaderContentRef()
      
      // 🔑 修复表头闪现：一次性批量执行初始化，避免多次延迟调整
      const performInitialization = () => {
        if (debugConfig.enableConsoleLog) {
          console.log('表格初始化，开始高度同步（批量执行）')
        }

        // 🔑 修复表头闪现：暂时禁用表头高度同步，避免强制调整
        // measureAndSyncHeaderHeight() // 禁用以避免闪现
        measureAndSyncRowHeights()
        
        // 初始化时清理任何可能的残留状态
        forceResetAllRowStates()

        if (props.highlightIndex >= 0) {
          applyRowState(props.highlightIndex, 'highlighted', true)
        }

        if (debugConfig.enableConsoleLog) {
          console.log('✅ 表格高度同步完成（批量）')
        }
      }
      
      // 只使用一次短延迟，避免多重嵌套timeout
      setTimeout(performInitialization, 50)
    })
  }

  /**
   * 清理函数
   */
  const cleanup = () => {
    // 移除窗口大小调整监听器
    window.removeEventListener('resize', handleWindowResize)
    
    // 移除键盘事件监听
    document.removeEventListener('keydown', handleKeyDown)
    
    // 移除全局按钮点击监听器
    if (globalButtonClickHandler) {
      document.removeEventListener('click', globalButtonClickHandler, true)
    }

    // 清理iOS触摸优化
    if (cleanupTouchOptimization) {
      cleanupTouchOptimization()
    }

    // 清理定时器和动画
    if (autoHideTimer?.value) {
      clearTimeout(autoHideTimer.value)
    }
    if (smoothScrollAnimation?.value) {
      cancelAnimationFrame(smoothScrollAnimation.value)
    }

    // 清理iOS滚动定时器
    if (iosScrollTimeout.value) {
      clearTimeout(iosScrollTimeout.value)
    }

    // 清理开发调试工具
    if (isDevelopment.value && window.tableDebugger) {
      delete window.tableDebugger
    }
  }

  // 组件挂载时的处理
  onMounted(() => {
    // 检测iOS Safari环境
    isIOSSafari.value = detectIOSSafari()
    if (isIOSSafari.value && isDevelopment.value) {
      console.log('检测到iOS Safari环境，启用特殊滚动处理')
    }

    // 初始化表格核心功能
    initializeTable()
    
    // 🔑 关键修复：确保容器宽度在DOM完全渲染后再次更新
    nextTick(() => {
      // 🔑 修复表头闪现：减少容器宽度更新次数，避免重复计算列宽
      setTimeout(() => {
        console.log('🔧 DOM渲染完成后更新容器宽度（一次性）')
        updateContainerWidth()
      }, 100)
    })
    
    // 添加事件监听器
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleWindowResize)
    
    // 设置全局按钮点击监听器
    setupGlobalButtonClickHandler()
    
    // iOS触摸优化
    cleanupTouchOptimization = handleTouchOptimization()
    
    // 设置开发调试工具
    setupDevelopmentDebugger()
    
    // 初始化表格高度
    initializeTableHeights()
  })

  // 组件卸载时的清理
  onUnmounted(() => {
    cleanup()
  })

  return {
    // 状态
    isIOSSafari,
    iosScrollTimeout,
    
    // 方法
    detectIOSSafari,
    handleKeyDown,
    handleTouchOptimization,
    setupGlobalButtonClickHandler,
    handleWindowResize,
    setupDevelopmentDebugger,
    setupHeaderContentRef,
    initializeTableHeights,
    cleanup
  }
}