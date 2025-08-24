export function useScrollUtils(
  bodyRef,
  leftBodyWrapperRef,
  rightBodyWrapperRef,
  scrollTop,
  scrollLeft,
  isLoadingMore,
  vxeStyleAbsoluteSync,
  isDevelopment
) {
  // VXE Table 风格的全局边界约束计算 - 解决固定列错位问题
  const getGlobalMaxScrollTop = () => {
    if (!bodyRef.value) return 0
    
    const mainScrollHeight = bodyRef.value.scrollHeight
    const mainClientHeight = bodyRef.value.clientHeight
    const mainMaxScrollTop = Math.max(0, mainScrollHeight - mainClientHeight)
    let globalMaxScrollTop = mainMaxScrollTop
    
    if (isDevelopment.value) {
      console.log('🔍 getGlobalMaxScrollTop 计算详情:', {
        主表格scrollHeight: mainScrollHeight,
        主表格clientHeight: mainClientHeight,
        主表格maxScrollTop: mainMaxScrollTop
      })
    }
    
    // 检查左固定列的最大滚动位置
    if (leftBodyWrapperRef.value) {
      const leftScrollHeight = leftBodyWrapperRef.value.scrollHeight
      const leftClientHeight = leftBodyWrapperRef.value.clientHeight
      const leftMaxScrollTop = Math.max(0, leftScrollHeight - leftClientHeight)
      
      if (isDevelopment.value) {
        console.log('🔍 左固定列高度详情:', {
          左固定列scrollHeight: leftScrollHeight,
          左固定列clientHeight: leftClientHeight,
          左固定列maxScrollTop: leftMaxScrollTop,
          与主表格高度差: Math.abs(leftScrollHeight - mainScrollHeight)
        })
      }
      
      globalMaxScrollTop = Math.min(globalMaxScrollTop, leftMaxScrollTop)
    }
    
    // 检查右固定列的最大滚动位置
    if (rightBodyWrapperRef.value) {
      const rightScrollHeight = rightBodyWrapperRef.value.scrollHeight
      const rightClientHeight = rightBodyWrapperRef.value.clientHeight
      const rightMaxScrollTop = Math.max(0, rightScrollHeight - rightClientHeight)
      
      if (isDevelopment.value) {
        console.log('🔍 右固定列高度详情:', {
          右固定列scrollHeight: rightScrollHeight,
          右固定列clientHeight: rightClientHeight,
          右固定列maxScrollTop: rightMaxScrollTop,
          与主表格高度差: Math.abs(rightScrollHeight - mainScrollHeight)
        })
      }
      
      globalMaxScrollTop = Math.min(globalMaxScrollTop, rightMaxScrollTop)
    }
    
    if (isDevelopment.value) {
      console.log('🎯 最终全局边界约束结果:', {
        最终globalMaxScrollTop: Math.max(0, globalMaxScrollTop),
        原始主表格maxScrollTop: mainMaxScrollTop,
        被约束程度: mainMaxScrollTop - Math.max(0, globalMaxScrollTop)
      })
    }
    
    return Math.max(0, globalMaxScrollTop)
  }

  // 安全设置滚动位置的辅助函数 - 确保所有滚动容器都遵循全局边界约束
  const safeSetScrollPosition = (targetScrollTop, forceSet = false) => {
    if (!bodyRef.value) return
    
    // 如果不是强制设置，应用全局边界约束
    const finalScrollTop = forceSet ? targetScrollTop : Math.max(0, Math.min(getGlobalMaxScrollTop(), targetScrollTop))
    
    // 设置主表格滚动位置
    bodyRef.value.scrollTop = finalScrollTop
    scrollTop.value = finalScrollTop
    
    // 同步固定列滚动位置
    if (leftBodyWrapperRef.value) {
      leftBodyWrapperRef.value.scrollTop = finalScrollTop
    }
    if (rightBodyWrapperRef.value) {
      rightBodyWrapperRef.value.scrollTop = finalScrollTop
    }
    
    if (isDevelopment.value) {
      console.log('Safe scroll position set:', {
        target: targetScrollTop,
        final: finalScrollTop,
        constrained: !forceSet,
        globalMax: getGlobalMaxScrollTop()
      })
    }
  }

  // 同步滚动函数
  const syncScroll = () => {
    // 不再在加载更多期间跳过同步，确保表格一体性
    if (isLoadingMore.value && isDevelopment.value) {
      console.log('syncScroll: 加载更多期间仍进行同步，保持表格一体性')
    }
    
    if (!bodyRef.value) {
      return
    }
    
    // VXE-table风格：直接使用当前滚动位置，不做任何边界检查
    const currentScrollTop = bodyRef.value.scrollTop || 0
    const currentScrollLeft = bodyRef.value.scrollLeft || 0
    
    // 使用VXE风格的绝对同步
    vxeStyleAbsoluteSync(currentScrollTop, currentScrollLeft)
  }

  // iOS Safari 检测
  const detectIOSSafari = () => {
    const ua = navigator.userAgent.toLowerCase()
    return /iphone|ipad|ipod/.test(ua) && /safari/.test(ua) && !/chrome|firefox|opera/.test(ua)
  }

  return {
    getGlobalMaxScrollTop,
    safeSetScrollPosition,
    syncScroll,
    detectIOSSafari
  }
}