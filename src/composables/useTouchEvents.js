import { ref } from 'vue'

export function useTouchEvents(props, emit, bodyRef, leftBodyWrapperRef, rightBodyWrapperRef, scrollLeft, vxeStyleAbsoluteSync, getGlobalMaxScrollTop, filteredAndSortedData, handleSingleRowHighlight, handleRowClick, isLoadingMore, savedScrollPosition, isDevelopment, touchHandledRowIndex, columnsInfo, containerWidth) {
  // 固定列触摸事件处理状态
  let fixedColumnTouchStartY = 0
  let fixedColumnTouchStartScrollTop = 0
  let isFixedColumnTouching = false
  let touchStartTime = 0

  // 主表格触摸事件处理状态
  let mainTableTouchStartY = 0
  let mainTableTouchStartX = 0
  let mainTableStartScrollTop = 0
  let mainTableStartScrollLeft = 0
  let isMainTableTouching = false
  let mainTableTouchStartTime = 0

  const handleFixedColumnTouchStart = event => {
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
  }

  const handleFixedColumnTouchMove = event => {
    if (!isFixedColumnTouching || !bodyRef.value) return

    const touch = event.touches[0]
    const deltaY = fixedColumnTouchStartY - touch.clientY
    
    if (Math.abs(deltaY) > 3) {
      const getGlobalMaxScrollTopInternal = () => {
        if (!bodyRef.value) return 0
        
        const mainMaxScrollTop = bodyRef.value.scrollHeight - bodyRef.value.clientHeight
        let globalMaxScrollTop = mainMaxScrollTop
        
        if (leftBodyWrapperRef.value) {
          const leftMaxScrollTop = leftBodyWrapperRef.value.scrollHeight - leftBodyWrapperRef.value.clientHeight
          globalMaxScrollTop = Math.min(globalMaxScrollTop, leftMaxScrollTop)
        }
        
        if (rightBodyWrapperRef.value) {
          const rightMaxScrollTop = rightBodyWrapperRef.value.scrollHeight - rightBodyWrapperRef.value.clientHeight
          globalMaxScrollTop = Math.min(globalMaxScrollTop, rightMaxScrollTop)
        }
        
        return Math.max(0, globalMaxScrollTop)
      }
      
      const globalMaxScrollTop = getGlobalMaxScrollTopInternal()
      const newScrollTop = Math.max(0, Math.min(globalMaxScrollTop, fixedColumnTouchStartScrollTop + deltaY))
      
      const isAtTopBoundary = newScrollTop === 0 && deltaY > 0
      const isAtBottomBoundary = newScrollTop === globalMaxScrollTop && deltaY < 0
      
      vxeStyleAbsoluteSync(newScrollTop, scrollLeft.value)
      
      // 固定列触摸移动检测加载更多
      if (props.enableLoadMore && !props.loadMoreLoading && !props.loadMoreFinished && !props.loadMoreError) {
        const { scrollHeight, clientHeight } = bodyRef.value
        const distanceFromBottom = scrollHeight - newScrollTop - clientHeight
        
        if (isDevelopment.value) {
          console.log('固定列触摸移动 - 加载更多检测:', {
            scrollHeight,
            scrollTop: newScrollTop,
            clientHeight,
            distanceFromBottom,
            loadMoreOffset: props.loadMoreOffset,
            globalMaxScrollTop: globalMaxScrollTop,
            useMainTableHeight: true
          })
        }
        
        if (distanceFromBottom < props.loadMoreOffset) {
          if (isDevelopment.value) {
            console.log('固定列触发加载更多 (使用主表格高度检测)')
            console.log('当前滚动位置:', newScrollTop)
          }
          
          const estimatedRowHeight = 44
          const visibleRowIndex = Math.floor(newScrollTop / estimatedRowHeight)
          
          isLoadingMore.value = true
          savedScrollPosition.value = newScrollTop
          
          if (isDevelopment.value) {
            console.log('固定列触摸触发加载更多，保存滚动位置:', savedScrollPosition.value)
          }
          
          emit('load-more')
        }
      }
      
      if (isDevelopment.value) {
        console.log('Fixed column touch move:', {
          deltaY,
          newScrollTop,
          globalMaxScrollTop,
          isAtTopBoundary,
          isAtBottomBoundary
        })
      }

      if (!isAtTopBoundary && !isAtBottomBoundary) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
  }

  const handleFixedColumnTouchEnd = event => {
    const touchEndTime = Date.now()
    const touchDuration = touchEndTime - touchStartTime
    const touchDistance = Math.abs(event.changedTouches[0].clientY - fixedColumnTouchStartY)
    
    if (isDevelopment.value) {
      console.log('Fixed column touch end:', {
        duration: touchDuration,
        distance: touchDistance,
        isClick: touchDuration < 200 && touchDistance < 10,
        target: event.target.closest('tr')?.dataset?.rowIndex,
        targetElement: event.target.tagName,
        targetClasses: event.target.className
      })
    }
    
    if (touchDuration < 200 && touchDistance < 10) {
      const isButton = event.target.closest('button, .van-button, [role="button"]')
      const isClickableElement = event.target.closest('a, input, select, textarea')
      
      if (isButton || isClickableElement) {
        if (isDevelopment.value) {
          console.log('Fixed column touch end: clicked on interactive element, allowing normal flow')
        }
      } else {
        const targetRow = event.target.closest('tr')
        if (targetRow && targetRow.dataset.rowIndex !== undefined) {
          const rowIndex = parseInt(targetRow.dataset.rowIndex)
          if (isDevelopment.value) {
            console.log(`Fixed column touch click: triggering unified row click for row ${rowIndex}`)
          }
          
          const row = filteredAndSortedData.value[rowIndex]
          if (isDevelopment.value) {
            console.log(`Fixed column touch click: rowIndex=${rowIndex}, row=`, row, `filteredAndSortedData.length=${filteredAndSortedData.value.length}`)
          }
          
          if (row) {
            if (isDevelopment.value) {
              console.log(`Fixed column touch click: calling handleRowClick for row ${rowIndex}`)
            }
            
            handleSingleRowHighlight({ target: targetRow }, rowIndex)
            handleRowClick(row, rowIndex)
            
            touchHandledRowIndex = rowIndex
            
            event.preventDefault()
            event.stopPropagation()
            
            setTimeout(() => {
              touchHandledRowIndex = -1
            }, 100)
          } else {
            if (isDevelopment.value) {
              console.error(`Fixed column touch click: row not found for index ${rowIndex}`)
            }
          }
        } else {
          if (isDevelopment.value) {
            console.log('Fixed column touch end: no target row found, allowing normal event flow')
          }
        }
      }
    }

    isFixedColumnTouching = false
    fixedColumnTouchStartY = 0
    fixedColumnTouchStartScrollTop = 0
    touchStartTime = 0
  }

  const handleMainTableTouchStart = event => {
    if (!bodyRef.value) return
    
    const touch = event.touches[0]
    mainTableTouchStartY = touch.clientY
    mainTableTouchStartX = touch.clientX
    mainTableStartScrollTop = bodyRef.value.scrollTop
    mainTableStartScrollLeft = bodyRef.value.scrollLeft
    isMainTableTouching = true
    mainTableTouchStartTime = Date.now()
    
    if (isDevelopment.value) {
      console.log('Main table touch start:', {
        startY: mainTableTouchStartY,
        startX: mainTableTouchStartX,
        startScrollTop: mainTableStartScrollTop,
        startScrollLeft: mainTableStartScrollLeft
      })
    }
  }

  const handleMainTableTouchMove = event => {
    if (!isMainTableTouching || !bodyRef.value) return
    
    const touch = event.touches[0]
    const deltaY = mainTableTouchStartY - touch.clientY
    const deltaX = mainTableTouchStartX - touch.clientX
    
    const getGlobalMaxScrollTopInternal = () => {
      if (!bodyRef.value) return 0
      
      const mainMaxScrollTop = bodyRef.value.scrollHeight - bodyRef.value.clientHeight
      let globalMaxScrollTop = mainMaxScrollTop
      
      if (leftBodyWrapperRef.value) {
        const leftMaxScrollTop = leftBodyWrapperRef.value.scrollHeight - leftBodyWrapperRef.value.clientHeight
        globalMaxScrollTop = Math.min(globalMaxScrollTop, leftMaxScrollTop)
      }
      
      if (rightBodyWrapperRef.value) {
        const rightMaxScrollTop = rightBodyWrapperRef.value.scrollHeight - rightBodyWrapperRef.value.clientHeight
        globalMaxScrollTop = Math.min(globalMaxScrollTop, rightMaxScrollTop)
      }
      
      return Math.max(0, globalMaxScrollTop)
    }
    
    const globalMaxScrollTop = getGlobalMaxScrollTopInternal()
    const maxScrollLeft = Math.max(0, columnsInfo.value.totalWidth - containerWidth.value)
    
    const newScrollTop = Math.max(0, Math.min(globalMaxScrollTop, mainTableStartScrollTop + deltaY))
    const newScrollLeft = Math.max(0, Math.min(maxScrollLeft, mainTableStartScrollLeft + deltaX))
    
    const isAtTopBoundary = newScrollTop === 0 && deltaY > 0
    const isAtBottomBoundary = newScrollTop === globalMaxScrollTop && deltaY < 0
    const isAtLeftBoundary = newScrollLeft === 0 && deltaX > 0
    const isAtRightBoundary = newScrollLeft === maxScrollLeft && deltaX < 0
    
    const isVerticalScroll = Math.abs(deltaY) > Math.abs(deltaX)
    const isHorizontalScroll = Math.abs(deltaX) > Math.abs(deltaY)
    
    let shouldPreventDefault = false
    
    if (isVerticalScroll) {
      if (!isAtTopBoundary && !isAtBottomBoundary) {
        shouldPreventDefault = true
      }
    } else if (isHorizontalScroll) {
      if (!isAtLeftBoundary && !isAtRightBoundary) {
        shouldPreventDefault = true
      }
    }
    
    if (Math.abs(deltaY) > 3 || Math.abs(deltaX) > 3) {
      vxeStyleAbsoluteSync(newScrollTop, newScrollLeft)
      
      // 主表格触摸移动检测加载更多
      if (props.enableLoadMore && !props.loadMoreLoading && !props.loadMoreFinished && !props.loadMoreError && isVerticalScroll) {
        const { scrollHeight, clientHeight } = bodyRef.value
        const distanceFromBottom = scrollHeight - newScrollTop - clientHeight
        
        if (isDevelopment.value) {
          console.log('主表格触摸移动 - 加载更多检测:', {
            scrollHeight,
            scrollTop: newScrollTop,
            clientHeight,
            distanceFromBottom,
            loadMoreOffset: props.loadMoreOffset,
            globalMaxScrollTop: globalMaxScrollTop,
            isVerticalScroll
          })
        }
        
        if (distanceFromBottom < props.loadMoreOffset) {
          if (isDevelopment.value) {
            console.log('主表格触发加载更多 (触摸移动检测)')
            console.log('当前滚动位置:', newScrollTop)
          }
          
          const estimatedRowHeight = 44
          const visibleRowIndex = Math.floor(newScrollTop / estimatedRowHeight)
          
          isLoadingMore.value = true
          savedScrollPosition.value = newScrollTop
          
          if (isDevelopment.value) {
            console.log('主表格触摸触发加载更多，保存滚动位置:', savedScrollPosition.value)
          }
          
          emit('load-more')
        }
      }
      
      if (isDevelopment.value) {
        console.log('Main table touch move:', {
          deltaY, deltaX,
          newScrollTop, newScrollLeft,
          isAtTopBoundary, isAtBottomBoundary,
          isAtLeftBoundary, isAtRightBoundary,
          shouldPreventDefault,
          isVerticalScroll, isHorizontalScroll
        })
      }
    }
    
    if (shouldPreventDefault) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const handleMainTableTouchEnd = event => {
    const touchEndTime = Date.now()
    const touchDuration = touchEndTime - mainTableTouchStartTime
    const touchDistanceY = Math.abs(event.changedTouches[0].clientY - mainTableTouchStartY)
    const touchDistanceX = Math.abs(event.changedTouches[0].clientX - mainTableTouchStartX)
    const totalTouchDistance = Math.sqrt(touchDistanceY * touchDistanceY + touchDistanceX * touchDistanceX)
    
    if (isDevelopment.value) {
      console.log('Main table touch end:', {
        duration: touchDuration,
        distanceY: touchDistanceY,
        distanceX: touchDistanceX,
        totalDistance: totalTouchDistance,
        isClick: touchDuration < 200 && totalTouchDistance < 10
      })
    }
    
    if (touchDuration < 200 && totalTouchDistance < 10) {
      if (isDevelopment.value) {
        console.log('Main table: detected click, allowing normal event flow')
      }
    }
    
    isMainTableTouching = false
    mainTableTouchStartY = 0
    mainTableTouchStartX = 0
    mainTableStartScrollTop = 0
    mainTableStartScrollLeft = 0
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