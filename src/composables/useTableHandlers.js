import { nextTick } from 'vue'
import { useRowClickHandler } from './useRowClickHandler.js'

/**
 * 表格事件处理逻辑
 */
export function useTableHandlers(props, emit, scrollTop, scrollLeft, lastScrollTop, lastScrollLeft, intoRunScroll, isLoadingMore, isDevelopment, vxeStyleAbsoluteSync, handleLoadMore, updateShadowState, syncScroll, MIN_ROW_HEIGHT, dynamicRowHeights, EXPAND_WIDTH, rowHighlightHandlers) {

  // 行样式计算
  const getRowStyle = rowIndex => {
    const height = dynamicRowHeights.value.get(rowIndex)
    if (height) {
      return {
        height: `${height}px`,
        minHeight: `${height}px`,
        maxHeight: `${height}px`
      }
    }
    return {
      minHeight: `${MIN_ROW_HEIGHT}px`
    }
  }

  // 展开相关样式
  const getExpandHeaderStyle = () => ({
    width: `${EXPAND_WIDTH}px`,
    minWidth: `${EXPAND_WIDTH}px`,
    maxWidth: `${EXPAND_WIDTH}px`,
    textAlign: 'center'
  })

  const getExpandCellStyle = () => ({
    width: `${EXPAND_WIDTH}px`,
    minWidth: `${EXPAND_WIDTH}px`,
    maxWidth: `${EXPAND_WIDTH}px`,
    textAlign: 'center'
  })

  // 主要滚动事件处理
  const handleScroll = event => {
    const { scrollTop: currentScrollTop, scrollLeft: currentScrollLeft } = event.target

    // 如果正在程序化滚动中，跳过处理
    if (intoRunScroll.value) {
      if (isDevelopment.value) {
        console.log('跳过滚动处理 - 程序化滚动中', {
          intoRunScroll: intoRunScroll.value
        })
      }
      return
    }
    
    // 如果正在加载更多，仍然需要进行滚动同步，但跳过上拉加载更多的触发逻辑
    const isInLoadingMore = isLoadingMore.value
    if (isInLoadingMore && isDevelopment.value) {
      console.log('加载更多期间的滚动 - 仅进行同步，不触发新的加载', {
        currentScrollTop,
        currentScrollLeft
      })
    }

    // 记录新的滚动位置
    const hasScrollTopChanged = currentScrollTop !== scrollTop.value
    const hasScrollLeftChanged = currentScrollLeft !== scrollLeft.value

    if (hasScrollTopChanged) {
      lastScrollTop.value = scrollTop.value
      scrollTop.value = currentScrollTop
    }

    if (hasScrollLeftChanged) {
      lastScrollLeft.value = scrollLeft.value
      scrollLeft.value = currentScrollLeft
    }

    // 处理加载更多逻辑（仅在不是程序化滚动且未在加载时）
    if (!isInLoadingMore && props.enableLoadMore && hasScrollTopChanged) {
      const { scrollHeight, clientHeight } = event.target
      const scrollPercentage = (currentScrollTop + clientHeight) / scrollHeight
      
      if (scrollPercentage >= 0.9) {
        handleLoadMore()
      }
    }

    // 同步滚动位置
    if (hasScrollTopChanged || hasScrollLeftChanged) {
      vxeStyleAbsoluteSync(currentScrollTop, currentScrollLeft)
      updateShadowState()
      syncScroll()
    }

    // 发出滚动事件
    emit('scroll', {
      scrollTop: currentScrollTop,
      scrollLeft: currentScrollLeft,
      scrollHeight: event.target.scrollHeight,
      clientHeight: event.target.clientHeight,
      clientWidth: event.target.clientWidth
    })
  }

  // 表头点击处理
  const handleHeaderClick = (header, event) => {
    if (header.sortable) {
      emit('sort-change', { header, event })
    }
    emit('header-click', { header, event })
  }

  // 行点击处理
  const handleRowClick = (row, rowIndex, event) => {
    emit('row-click', { row, rowIndex, event })
  }

  // 本地行点击处理（包含高亮逻辑）
  const handleRowClickLocal = (row, rowIndex) => {
    if (isDevelopment.value) {
      console.log('Row clicked locally:', { rowIndex })
    }
    
    // 触发外部行点击事件
    emit('row-click', { row, rowIndex })
  }

  // 单元格点击处理
  const handleCellClick = (row, column, rowIndex, colIndex, value, event) => {
    emit('cell-click', {
      row,
      column,
      rowIndex,
      colIndex,
      value,
      event
    })
  }

  // 双击处理
  const handleRowDoubleClick = (row, rowIndex, event) => {
    emit('row-double-click', { row, rowIndex, event })
  }

  const handleCellDoubleClick = (row, column, rowIndex, colIndex, value, event) => {
    emit('cell-double-click', {
      row,
      column,
      rowIndex,
      colIndex,
      value,
      event
    })
  }

  // 鼠标悬停处理
  const handleRowMouseEnter = (row, rowIndex, event) => {
    // 🔑 关键修复：添加hover样式到所有区域的行元素
    const rowElements = document.querySelectorAll(`[data-row-index="${rowIndex}"]`)
    rowElements.forEach(el => {
      if (el.classList.contains('vant-tr')) {
        el.classList.add('vant-tr--hover')
      }
    })
    
    emit('row-mouse-enter', { row, rowIndex, event })
    
    if (isDevelopment.value) {
      console.log(`🎯 鼠标进入第${rowIndex}行`)
    }
  }

  const handleRowMouseLeave = (row, rowIndex, event) => {
    // 🔑 关键修复：移除hover样式从所有区域的行元素
    const rowElements = document.querySelectorAll(`[data-row-index="${rowIndex}"]`)
    rowElements.forEach(el => {
      if (el.classList.contains('vant-tr')) {
        el.classList.remove('vant-tr--hover')
      }
    })
    
    emit('row-mouse-leave', { row, rowIndex, event })
    
    if (isDevelopment.value) {
      console.log(`🎯 鼠标离开第${rowIndex}行`)
    }
  }

  // 右键菜单处理
  const handleRowContextMenu = (row, rowIndex, event) => {
    emit('row-context-menu', { row, rowIndex, event })
  }

  const handleCellContextMenu = (row, column, rowIndex, colIndex, value, event) => {
    emit('cell-context-menu', {
      row,
      column,
      rowIndex,
      colIndex,
      value,
      event
    })
  }

  return {
    // 样式函数
    getRowStyle,
    getExpandHeaderStyle,
    getExpandCellStyle,
    
    // 事件处理函数
    handleScroll,
    handleHeaderClick,
    handleRowClick,
    handleRowClickLocal,
    handleCellClick,
    handleRowDoubleClick,
    handleCellDoubleClick,
    handleRowMouseEnter,
    handleRowMouseLeave,
    handleRowContextMenu,
    handleCellContextMenu,
    
    // 行高亮处理函数
    handleSingleRowHighlight: rowHighlightHandlers?.handleSingleRowHighlight
  }
}