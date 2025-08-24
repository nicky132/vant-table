import { ref, nextTick } from 'vue'

/**
 * 表格滚动管理组合式函数
 * 处理滚动位置恢复、加载更多后的位置调整等
 */
export function useTableScroll(isDevelopment) {
  // 滚动状态
  const scrollTop = ref(0)
  const scrollLeft = ref(0)
  const lastScrollTop = ref(0)
  const lastScrollLeft = ref(0)
  const intoRunScroll = ref(false)
  const savedScrollPosition = ref(0)
  const isLoadingMore = ref(false)

  /**
   * VXE Table 风格的滚动位置恢复函数 - 智能调整版本
   * 确保加载更多后最后一行完全可见
   */
  const restoreScrollLocationWithoutConstraint = (bodyRef, leftBodyWrapperRef, rightBodyWrapperRef, targetScrollTop) => {
    return new Promise(resolve => {
      if (bodyRef.value && targetScrollTop > 0) {
        // 设置程序化滚动标志，禁用所有干扰
        intoRunScroll.value = true
        
        // 计算当前表格的实际可滚动范围
        const scrollHeight = bodyRef.value.scrollHeight
        const clientHeight = bodyRef.value.clientHeight
        const maxScrollTop = Math.max(0, scrollHeight - clientHeight)
        
        // 计算安全的滚动位置，确保最后一行完全可见
        const rowHeight = 44 // 估算行高
        const safeBuffer = Math.max(rowHeight * 1.5, 50) // 使用1.5倍行高作为安全缓冲
        
        // 如果目标位置接近最大滚动位置，进行智能调整
        let adjustedScrollTop = targetScrollTop
        if (targetScrollTop > maxScrollTop - safeBuffer) {
          // 调整到安全位置，确保最后一行完全可见
          adjustedScrollTop = Math.max(0, maxScrollTop - safeBuffer)
          
          if (isDevelopment.value) {
            console.log('智能调整滚动位置，确保最后一行完全可见:', {
              原始目标位置: targetScrollTop,
              调整后位置: adjustedScrollTop,
              最大滚动位置: maxScrollTop,
              安全缓冲: safeBuffer,
              行高: rowHeight
            })
          }
        }
        
        if (isDevelopment.value) {
          console.log('智能恢复滚动位置:', {
            目标位置: adjustedScrollTop,
            当前scrollHeight: scrollHeight,
            当前clientHeight: clientHeight,
            最大滚动位置: maxScrollTop
          })
        }
        
        // 设置调整后的滚动位置
        bodyRef.value.scrollTop = adjustedScrollTop
        scrollTop.value = adjustedScrollTop
        
        // 同步固定列
        if (leftBodyWrapperRef.value) {
          leftBodyWrapperRef.value.scrollTop = adjustedScrollTop
        }
        if (rightBodyWrapperRef.value) {
          rightBodyWrapperRef.value.scrollTop = adjustedScrollTop
        }
        
        // 更新跟踪位置
        lastScrollTop.value = adjustedScrollTop
        
        // 等待一帧确保滚动位置设置完成
        requestAnimationFrame(() => {
          // 清除程序化滚动标志
          setTimeout(() => {
            intoRunScroll.value = false
            resolve()
          }, 50)
        })
      } else {
        resolve()
      }
    })
  }

  /**
   * VXE风格的绝对同步机制
   */
  const vxeStyleAbsoluteSync = (bodyRef, leftBodyWrapperRef, rightBodyWrapperRef, targetScrollTop, targetScrollLeft) => {
    // 在加载更多期间完全跳过同步，避免干扰
    if (isLoadingMore.value || intoRunScroll.value) {
      if (isDevelopment.value) {
        console.log('跳过 VXE 同步 - 加载更多中或程序化滚动中', {
          isLoadingMore: isLoadingMore.value,
          intoRunScroll: intoRunScroll.value
        })
      }
      return
    }

    if (!bodyRef.value) return

    // 设置程序化滚动标志
    intoRunScroll.value = true

    try {
      // 主体区域滚动同步
      if (Math.abs(bodyRef.value.scrollTop - targetScrollTop) > 1) {
        bodyRef.value.scrollTop = targetScrollTop
        scrollTop.value = targetScrollTop
      }
      if (Math.abs(bodyRef.value.scrollLeft - targetScrollLeft) > 1) {
        bodyRef.value.scrollLeft = targetScrollLeft
        scrollLeft.value = targetScrollLeft
      }

      // 固定列垂直滚动同步
      if (leftBodyWrapperRef.value && Math.abs(leftBodyWrapperRef.value.scrollTop - targetScrollTop) > 1) {
        leftBodyWrapperRef.value.scrollTop = targetScrollTop
      }
      if (rightBodyWrapperRef.value && Math.abs(rightBodyWrapperRef.value.scrollTop - targetScrollTop) > 1) {
        rightBodyWrapperRef.value.scrollTop = targetScrollTop
      }

      if (isDevelopment.value) {
        console.log('VXE绝对同步完成:', { 
          scrollTop: targetScrollTop, 
          scrollLeft: targetScrollLeft 
        })
      }
    } finally {
      // 短暂延迟后清除标志，避免触发连锁反应
      setTimeout(() => {
        intoRunScroll.value = false
      }, 16) // 一帧的时间
    }
  }

  return {
    // 状态
    scrollTop,
    scrollLeft,
    lastScrollTop,
    lastScrollLeft,
    intoRunScroll,
    savedScrollPosition,
    isLoadingMore,
    
    // 方法
    restoreScrollLocationWithoutConstraint,
    vxeStyleAbsoluteSync
  }
}