import { nextTick } from 'vue'

export function useScrollRestore(
  bodyRef,
  leftBodyWrapperRef,
  rightBodyWrapperRef,
  scrollTop,
  scrollLeft,
  savedScrollPosition,
  hoveredRowIndex,
  applyRowState,
  vxeStyleAbsoluteSync,
  intoRunScroll,
  lastScrollTop,
  isDevelopment
) {
  // iOS Safari特殊滚动位置恢复函数
  const restoreScrollPositionForIOS = () => {
    if (!bodyRef.value || savedScrollPosition.value <= 0) return
    
    // 保存滚动位置值，避免在异步调用中被清除
    const positionToRestore = savedScrollPosition.value
    
    // 不再应用边界约束，直接恢复保存的位置
    if (isDevelopment.value) {
      console.log('iOS Safari: 恢复滚动位置:', positionToRestore)
    }
    
    // iOS Safari上直接设置滚动位置，不使用动画避免闪动
    bodyRef.value.scrollTop = positionToRestore
    scrollTop.value = positionToRestore
    
    // 同步固定列
    if (leftBodyWrapperRef.value) {
      leftBodyWrapperRef.value.scrollTop = positionToRestore
    }
    if (rightBodyWrapperRef.value) {
      rightBodyWrapperRef.value.scrollTop = positionToRestore
    }
    
    // 重新计算并应用hover状态，保持鼠标所在行的高亮
    if (hoveredRowIndex.value >= 0) {
      // 先清除旧的hover状态
      applyRowState(hoveredRowIndex.value, 'hover', false)
      
      // 触发鼠标位置重新检测，让当前鼠标位置的行重新高亮
      nextTick(() => {
        const mouseEvent = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0
        })
        
        // 只在主表格上触发mousemove事件，固定列会自动同步hover状态
        if (bodyRef.value) {
          bodyRef.value.dispatchEvent(mouseEvent)
        }
        
        if (isDevelopment.value) {
          console.log('iOS: 重新触发hover计算，统一使用主表格逻辑')
        }
      })
    }
    
    if (isDevelopment.value) {
      console.log('iOS Safari: 滚动位置恢复完成:', positionToRestore)
    }
    
    // 在iOS上也使用VXE风格的绝对同步
    setTimeout(() => {
      if (isDevelopment.value) {
        console.log('iOS VXE风格绝对同步')
      }
      vxeStyleAbsoluteSync(positionToRestore, scrollLeft.value)
    }, 100)
  }

  // VXE Table 风格的滚动位置恢复函数 - 无约束版本（用于加载更多后恢复）
  const restoreScrollLocationWithoutConstraint = (targetScrollTop) => {
    return new Promise(resolve => {
      if (bodyRef.value && targetScrollTop > 0) {
        // 设置程序化滚动标志，禁用所有干扰
        intoRunScroll.value = true
        
        if (isDevelopment.value) {
          console.log('无约束恢复滚动位置:', {
            目标位置: targetScrollTop,
            当前scrollHeight: bodyRef.value.scrollHeight,
            当前clientHeight: bodyRef.value.clientHeight
          })
        }
        
        // 直接设置目标位置，不进行约束计算
        // 因为新数据已经加载，表格高度应该支持这个位置
        bodyRef.value.scrollTop = targetScrollTop
        scrollTop.value = targetScrollTop
        
        // 同步固定列
        if (leftBodyWrapperRef.value) {
          leftBodyWrapperRef.value.scrollTop = targetScrollTop
        }
        if (rightBodyWrapperRef.value) {
          rightBodyWrapperRef.value.scrollTop = targetScrollTop
        }
        
        // 更新跟踪位置
        lastScrollTop.value = targetScrollTop
        
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

  // VXE Table 风格的滚动位置恢复函数 - 增强版
  const restoreScrollLocation = (targetScrollTop = lastScrollTop.value) => {
    return new Promise(resolve => {
      if (bodyRef.value && targetScrollTop > 0) {
        // 设置程序化滚动标志，禁用所有干扰
        intoRunScroll.value = true
        
        // 计算安全的滚动位置
        const maxScrollTop = bodyRef.value.scrollHeight - bodyRef.value.clientHeight
        const safeScrollTop = Math.max(0, Math.min(maxScrollTop, targetScrollTop))
        
        if (isDevelopment.value) {
          console.log('VXE 风格恢复滚动位置:', {
            目标位置: targetScrollTop,
            安全位置: safeScrollTop,
            最大位置: maxScrollTop
          })
        }
        
        // 精确设置滚动位置
        bodyRef.value.scrollTop = safeScrollTop
        scrollTop.value = safeScrollTop
        
        // 同步固定列
        if (leftBodyWrapperRef.value) {
          leftBodyWrapperRef.value.scrollTop = safeScrollTop
        }
        if (rightBodyWrapperRef.value) {
          rightBodyWrapperRef.value.scrollTop = safeScrollTop
        }
        
        // 更新跟踪位置
        lastScrollTop.value = safeScrollTop
        
        // 给DOM更新时间，然后清理标志
        setTimeout(() => {
          // 二次确认位置
          if (bodyRef.value && Math.abs(bodyRef.value.scrollTop - safeScrollTop) > 5) {
            bodyRef.value.scrollTop = safeScrollTop
          }
          resolve()
        }, 50)
      } else {
        resolve()
      }
    })
  }

  return {
    restoreScrollPositionForIOS,
    restoreScrollLocationWithoutConstraint,
    restoreScrollLocation
  }
}