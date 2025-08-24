import { ref } from 'vue'

/**
 * 表格触摸事件处理逻辑
 */
export function useTableEvents(bodyRef, leftBodyWrapperRef, rightBodyWrapperRef, scrollTop, scrollLeft, vxeStyleAbsoluteSync, getGlobalMaxScrollTop, updateShadowState, isDevelopment, emit, props, isLoadingMore, savedScrollPosition) {
  
  // 固定列触摸状态
  let fixedColumnTouchStartY = 0
  let fixedColumnTouchStartScrollTop = 0
  let isFixedColumnTouching = false
  let touchStartTime = 0

  // 主表格触摸状态
  let mainTableTouchStartY = 0
  let mainTableTouchStartX = 0
  let mainTableTouchStartScrollTop = 0
  let mainTableTouchStartScrollLeft = 0
  let isMainTableTouching = false
  let mainTableTouchStartTime = 0

  // 固定列触摸开始处理
  const handleFixedColumnTouchStart = (event) => {
    if (!bodyRef.value) return

    const touch = event.touches[0]
    fixedColumnTouchStartY = touch.clientY
    fixedColumnTouchStartScrollTop = bodyRef.value.scrollTop
    isFixedColumnTouching = true
    touchStartTime = Date.now()

    if (isDevelopment.value) {
      console.log('Fixed column touch start:', {
        startY: fixedColumnTouchStartY,
        startScrollTop: fixedColumnTouchStartScrollTop,
        target: event.target.closest('tr')?.dataset?.rowIndex
      })
    }

    // 阻止默认行为，防止页面滚动
    event.preventDefault()
  }

  // 固定列触摸移动处理
  const handleFixedColumnTouchMove = (event) => {
    if (!isFixedColumnTouching || !bodyRef.value) return

    const touch = event.touches[0]
    const deltaY = fixedColumnTouchStartY - touch.clientY
    const newScrollTop = fixedColumnTouchStartScrollTop + deltaY

    // 使用全局边界约束
    const globalMaxScrollTop = getGlobalMaxScrollTop()
    const constrainedScrollTop = Math.max(0, Math.min(globalMaxScrollTop, newScrollTop))

    // 使用VXE风格同步机制
    vxeStyleAbsoluteSync(constrainedScrollTop, bodyRef.value.scrollLeft || 0)

    // 强制更新阴影状态
    updateShadowState()

    if (isDevelopment.value) {
      console.log('Fixed column touch move:', {
        deltaY,
        newScrollTop,
        constrainedScrollTop,
        globalMaxScrollTop
      })
    }

    event.preventDefault()
  }

  // 固定列触摸结束处理
  const handleFixedColumnTouchEnd = (event) => {
    if (!isFixedColumnTouching || !bodyRef.value) return

    const touchEndTime = Date.now()
    const touchDuration = touchEndTime - touchStartTime
    const finalScrollTop = bodyRef.value.scrollTop

    // 检查是否触发加载更多（快速向下滑动到底部）
    if (props.enableLoadMore && touchDuration < 1000 && !isLoadingMore.value && !props.loadMoreLoading && !props.loadMoreFinished && !props.loadMoreError) {
      const { scrollHeight, clientHeight } = bodyRef.value
      const distanceFromBottom = scrollHeight - finalScrollTop - clientHeight

      if (distanceFromBottom < props.loadMoreOffset) {
        if (isDevelopment.value) {
          console.log('Fixed column touch triggered load more:', {
            touchDuration,
            finalScrollTop,
            distanceFromBottom,
            loadMoreOffset: props.loadMoreOffset
          })
        }

        isLoadingMore.value = true
        savedScrollPosition.value = finalScrollTop
        emit('load-more')
      }
    }

    if (isDevelopment.value) {
      console.log('Fixed column touch end:', {
        touchDuration,
        finalScrollTop,
        startScrollTop: fixedColumnTouchStartScrollTop,
        scrollDelta: finalScrollTop - fixedColumnTouchStartScrollTop
      })
    }

    // 重置触摸状态
    isFixedColumnTouching = false
    fixedColumnTouchStartY = 0
    fixedColumnTouchStartScrollTop = 0
    touchStartTime = 0

    event.preventDefault()
  }

  // 主表格触摸开始处理
  const handleMainTableTouchStart = (event) => {
    if (!bodyRef.value) return

    const touch = event.touches[0]
    mainTableTouchStartY = touch.clientY
    mainTableTouchStartX = touch.clientX
    mainTableTouchStartScrollTop = bodyRef.value.scrollTop
    mainTableTouchStartScrollLeft = bodyRef.value.scrollLeft
    isMainTableTouching = true
    mainTableTouchStartTime = Date.now()

    if (isDevelopment.value) {
      console.log('Main table touch start:', {
        startY: mainTableTouchStartY,
        startX: mainTableTouchStartX,
        startScrollTop: mainTableTouchStartScrollTop,
        startScrollLeft: mainTableTouchStartScrollLeft
      })
    }
  }

  // 主表格触摸移动处理
  const handleMainTableTouchMove = (event) => {
    if (!isMainTableTouching || !bodyRef.value) return

    const touch = event.touches[0]
    const deltaY = mainTableTouchStartY - touch.clientY
    const deltaX = mainTableTouchStartX - touch.clientX

    const newScrollTop = mainTableTouchStartScrollTop + deltaY
    const newScrollLeft = mainTableTouchStartScrollLeft + deltaX

    // 使用全局边界约束
    const globalMaxScrollTop = getGlobalMaxScrollTop()
    const maxScrollLeft = Math.max(0, (props.columnsInfo?.totalWidth || 0) - (props.containerWidth || 0))

    const constrainedScrollTop = Math.max(0, Math.min(globalMaxScrollTop, newScrollTop))
    const constrainedScrollLeft = Math.max(0, Math.min(maxScrollLeft, newScrollLeft))

    // 使用VXE风格同步机制
    vxeStyleAbsoluteSync(constrainedScrollTop, constrainedScrollLeft)

    // 强制更新阴影状态
    updateShadowState()

    if (isDevelopment.value) {
      console.log('Main table touch move:', {
        deltaY,
        deltaX,
        newScrollTop,
        newScrollLeft,
        constrainedScrollTop,
        constrainedScrollLeft
      })
    }
  }

  // 主表格触摸结束处理
  const handleMainTableTouchEnd = (event) => {
    if (!isMainTableTouching || !bodyRef.value) return

    const touchEndTime = Date.now()
    const touchDuration = touchEndTime - mainTableTouchStartTime
    const finalScrollTop = bodyRef.value.scrollTop
    const finalScrollLeft = bodyRef.value.scrollLeft

    // 检查是否触发加载更多（快速向下滑动到底部）
    if (props.enableLoadMore && touchDuration < 1000 && !isLoadingMore.value && !props.loadMoreLoading && !props.loadMoreFinished && !props.loadMoreError) {
      const { scrollHeight, clientHeight } = bodyRef.value
      const distanceFromBottom = scrollHeight - finalScrollTop - clientHeight

      if (distanceFromBottom < props.loadMoreOffset) {
        if (isDevelopment.value) {
          console.log('Main table touch triggered load more:', {
            touchDuration,
            finalScrollTop,
            distanceFromBottom,
            loadMoreOffset: props.loadMoreOffset
          })
        }

        isLoadingMore.value = true
        savedScrollPosition.value = finalScrollTop
        emit('load-more')
      }
    }

    if (isDevelopment.value) {
      console.log('Main table touch end:', {
        touchDuration,
        finalScrollTop,
        finalScrollLeft,
        scrollTopDelta: finalScrollTop - mainTableTouchStartScrollTop,
        scrollLeftDelta: finalScrollLeft - mainTableTouchStartScrollLeft
      })
    }

    // 重置触摸状态
    isMainTableTouching = false
    mainTableTouchStartY = 0
    mainTableTouchStartX = 0
    mainTableTouchStartScrollTop = 0
    mainTableTouchStartScrollLeft = 0
    mainTableTouchStartTime = 0
  }

  return {
    handleFixedColumnTouchStart,
    handleFixedColumnTouchMove,
    handleFixedColumnTouchEnd,
    handleMainTableTouchStart,
    handleMainTableTouchMove,
    handleMainTableTouchEnd
  }
}