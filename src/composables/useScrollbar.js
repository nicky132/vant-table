import { ref } from 'vue'

/**
 * 横向滚动条处理逻辑
 */
export function useScrollbar(bodyRef, scrollLeft, containerWidth, columnsInfo, isDragging, isScrollbarVisible, autoHideTimer, smoothScrollAnimation, syncScroll, updateShadowState) {
  
  // 平滑滚动到指定位置
  const smoothScrollTo = (targetScrollLeft, duration = 300) => {
    if (smoothScrollAnimation.value) {
      cancelAnimationFrame(smoothScrollAnimation.value)
    }

    const startScrollLeft = scrollLeft.value
    const distance = targetScrollLeft - startScrollLeft
    const startTime = performance.now()

    const animate = currentTime => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 使用easeOutQuart缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 4)
      const newScrollLeft = startScrollLeft + distance * easeProgress

      if (bodyRef.value) {
        bodyRef.value.scrollLeft = newScrollLeft
        scrollLeft.value = newScrollLeft
        syncScroll()
        updateShadowState()
      }

      if (progress < 1) {
        smoothScrollAnimation.value = requestAnimationFrame(animate)
      } else {
        smoothScrollAnimation.value = null
      }
    }

    smoothScrollAnimation.value = requestAnimationFrame(animate)
  }

  // 显示滚动条
  const showScrollbar = () => {
    isScrollbarVisible.value = true
    if (autoHideTimer.value) {
      clearTimeout(autoHideTimer.value)
    }
  }

  // 自动隐藏滚动条
  const startAutoHideTimer = () => {
    if (autoHideTimer.value) {
      clearTimeout(autoHideTimer.value)
    }
    autoHideTimer.value = setTimeout(() => {
      if (!isDragging.value) {
        isScrollbarVisible.value = false
      }
    }, 1500)
  }

  // 鼠标进入滚动条
  const handleScrollbarMouseEnter = () => {
    showScrollbar()
  }

  // 鼠标离开滚动条
  const handleScrollbarMouseLeave = () => {
    if (!isDragging.value) {
      startAutoHideTimer()
    }
  }

  // 滚动条拖拽开始
  const handleScrollbarMouseDown = (event) => {
    if (!columnsInfo.value.totalWidth || !containerWidth.value) return

    event.preventDefault()
    event.stopPropagation()

    isDragging.value = true
    const dragStartX = event.clientX
    const dragStartScrollLeft = scrollLeft.value
    showScrollbar()

    // 添加视觉反馈
    const target = event.currentTarget
    target.style.transform = 'scale(1.05)'
    target.style.transition = 'transform 0.1s ease'

    const handleMouseMove = (moveEvent) => {
      if (!isDragging.value) return
      
      moveEvent.preventDefault()
      const deltaX = moveEvent.clientX - dragStartX
      
      // 🔑 关键修复：基于VXE Table模式 - 拖拽基于主表格区域
      const leftFixedW = columnsInfo.value.leftFixedWidth || 0
      const rightFixedW = columnsInfo.value.rightFixedWidth || 0
      const mainVisibleWidth = containerWidth.value - leftFixedW - rightFixedW
      const mainContentWidth = columnsInfo.value.mainHeadersWidth || 0
      const maxScrollLeft = Math.max(0, mainContentWidth - mainVisibleWidth)
      
      if (maxScrollLeft === 0) return

      // 🔑 关键修复：拖拽比例基于主表格区域宽度
      const scrollRatio = deltaX / mainVisibleWidth
      const newScrollLeft = dragStartScrollLeft + (scrollRatio * maxScrollLeft)
      const clampedScrollLeft = Math.max(0, Math.min(maxScrollLeft, newScrollLeft))

      if (bodyRef.value) {
        bodyRef.value.scrollLeft = clampedScrollLeft
      }

      // 清除文本选择
      if (document.getSelection) {
        document.getSelection().removeAllRanges()
      }
    }

    const handleMouseUp = () => {
      isDragging.value = false
      target.style.transform = ''
      target.style.transition = ''
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      
      startAutoHideTimer()
    }

    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // 滚动条轨道点击
  const handleScrollbarTrackClick = (event) => {
    if (!columnsInfo.value.totalWidth || !containerWidth.value || isDragging.value) return

    const trackElement = event.currentTarget.querySelector('.vant-table-scroll-x-wrapper')
    if (!trackElement) return

    const trackRect = trackElement.getBoundingClientRect()
    const clickX = event.clientX - trackRect.left
    
    // 🔑 关键修复：基于VXE Table模式 - 只有主表格区域响应点击
    const leftFixedW = columnsInfo.value.leftFixedWidth || 0
    const rightFixedW = columnsInfo.value.rightFixedWidth || 0
    const mainVisibleWidth = containerWidth.value - leftFixedW - rightFixedW
    const mainContentWidth = columnsInfo.value.mainHeadersWidth || 0
    
    // 检查点击是否在主表格对应的滚动区域内
    if (clickX < leftFixedW || clickX > containerWidth.value - rightFixedW) {
      return // 点击在固定列区域，不响应
    }
    
    const maxScrollLeft = Math.max(0, mainContentWidth - mainVisibleWidth)
    if (maxScrollLeft === 0) return

    // 🔑 关键修复：计算在主表格区域内的点击位置
    const clickXInMainArea = clickX - leftFixedW
    const totalRatio = mainVisibleWidth / mainContentWidth
    const scrollbarHandleWidth = Math.max(30, mainVisibleWidth * totalRatio)
    const targetLeftInMainArea = Math.max(0, Math.min(mainVisibleWidth - scrollbarHandleWidth, clickXInMainArea - scrollbarHandleWidth / 2))
    const targetScrollLeft = maxScrollLeft > 0 ? (targetLeftInMainArea / (mainVisibleWidth - scrollbarHandleWidth)) * maxScrollLeft : 0

    smoothScrollTo(targetScrollLeft, 400)
    showScrollbar()
    startAutoHideTimer()
  }

  // 滚动到左侧
  const scrollToLeft = () => smoothScrollTo(0)

  // 滚动到右侧
  const scrollToRight = () => {
    // 🔑 关键修复：使用与滚动同步逻辑一致的计算方式
    const leftFixedW = columnsInfo.value.leftFixedWidth || 0
    const rightFixedW = columnsInfo.value.rightFixedWidth || 0
    const mainVisibleWidth = containerWidth.value - leftFixedW - rightFixedW
    const mainContentWidth = columnsInfo.value.mainHeadersWidth || 0
    const maxScrollLeft = Math.max(0, mainContentWidth - mainVisibleWidth)
    smoothScrollTo(maxScrollLeft)
  }

  // 滚动到指定列
  const scrollToColumn = (columnKey) => {
    const headers = columnsInfo.value.computedHeaders
    const columnIndex = headers.findIndex(header => header.key === columnKey)
    
    if (columnIndex >= 0) {
      let scrollLeft = 0
      for (let i = 0; i < columnIndex; i++) {
        scrollLeft += headers[i].computedWidth
      }
      smoothScrollTo(scrollLeft)
    }
  }

  return {
    smoothScrollTo,
    showScrollbar,
    startAutoHideTimer,
    handleScrollbarMouseEnter,
    handleScrollbarMouseLeave,
    handleScrollbarMouseDown,
    handleScrollbarTrackClick,
    scrollToLeft,
    scrollToRight,
    scrollToColumn
  }
}