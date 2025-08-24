import { computed, watch, ref } from 'vue'

/**
 * 表格样式计算逻辑
 */
export function useTableStyles(props, columnsInfo, leftFixedTotalWidth, hasRightFixedColumns, hasLeftFixedContent, scrollLeft, containerWidth, headerHeight, EXPAND_WIDTH, SELECTION_WIDTH, SCROLLBAR_HEIGHT) {
  
  // 🔑 关键调试：在函数开始就记录scrollLeft引用信息
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 useTableStyles 接收到的 scrollLeft 引用:', {
      scrollLeft引用: scrollLeft,
      scrollLeft类型: typeof scrollLeft,
      scrollLeft当前值: scrollLeft?.value,
      scrollLeft是否为RefImpl: scrollLeft && scrollLeft.__v_isRef,
      参数列表长度: arguments.length
    })
  }
  
  // 🔑 创建一个本地的响应式变量来强制监听scrollLeft变化
  const localScrollLeft = ref(0)
  
  // 🔑 监听外部传入的scrollLeft变化，并同步到本地变量
  watch(
    () => scrollLeft.value,
    (newValue) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 useTableStyles watch到scrollLeft变化:', {
          新值: newValue,
          旧值: localScrollLeft.value,
          外部scrollLeft引用: scrollLeft,
          是否相等: newValue === localScrollLeft.value
        })
      }
      localScrollLeft.value = newValue
    },
    { immediate: true, flush: 'sync' }
  )
  
  // 🔑 新增：阴影状态更新函数（参考VantTable copy 15.vue）
  const updateShadowState = (layoutWrapperRef) => {
    if (!layoutWrapperRef?.value) return
    
    const totalWidth = columnsInfo.value?.totalWidth || 0
    const containerWidthValue = containerWidth.value
    const currentScrollLeft = getCurrentScrollLeft()
    const maxScrollLeft = Math.max(0, totalWidth - containerWidthValue)
    
    // 🔑 重新计算阴影状态，确保与computed属性保持同步
    const leftShadowVisible = shouldShowLeftShadow.value
    const rightShadowVisible = shouldShowRightShadow.value
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 阴影状态更新:', {
        当前滚动: currentScrollLeft,
        本地滚动: localScrollLeft.value,
        最大滚动: maxScrollLeft,
        总宽度: totalWidth,
        容器宽度: containerWidthValue,
        显示左侧阴影: leftShadowVisible,
        显示右侧阴影: rightShadowVisible,
        有左固定列: hasLeftFixedContent.value,
        有右固定列: hasRightFixedColumns.value,
        外部scrollLeft: scrollLeft.value
      })
    }
    
    // 阴影状态现在由computed属性控制，这里只做调试输出
 }
  
  // 选择列样式
  const selectionColStyle = computed(() => ({
    width: `${SELECTION_WIDTH}px`,
    minWidth: `${SELECTION_WIDTH}px`,
    maxWidth: `${SELECTION_WIDTH}px`
  }))

  const getSelectionHeaderStyle = () => ({
    width: `${SELECTION_WIDTH}px`,
    minWidth: `${SELECTION_WIDTH}px`,
    maxWidth: `${SELECTION_WIDTH}px`,
    textAlign: 'center'
  })

  const getSelectionCellStyle = () => ({
    width: `${SELECTION_WIDTH}px`,
    minWidth: `${SELECTION_WIDTH}px`,
    maxWidth: `${SELECTION_WIDTH}px`,
    textAlign: 'center'
  })

  // 展开列样式
  const expandColStyle = computed(() => ({
    width: `${EXPAND_WIDTH}px`,
    minWidth: `${EXPAND_WIDTH}px`,
    maxWidth: `${EXPAND_WIDTH}px`,
  }))

  // 是否隐藏固定列
  const shouldHideFixedColumns = computed(() => {
    // 禁用自动隐藏固定列，确保固定列结构始终保持
    return false
  })

  // 判断是否滚动到最右侧
  const isScrolledToRight = computed(() => {
    const containerWidthValue = containerWidth.value
    const totalWidth = columnsInfo.value.totalWidth
    const maxScrollLeft = Math.max(0, totalWidth - containerWidthValue)
    
    // 🔑 修复：与VantTable copy 15.vue保持完全一致的逻辑
    // 当内容宽度小于等于容器宽度时，没有滚动，因此"已滚动到最右侧"
    // 只有当内容超出容器且未滚动到最右侧时才显示阴影
    return localScrollLeft.value >= maxScrollLeft - 5 // 5px 的容差，使用本地scrollLeft变量
  })

  // 🔑 创建独立的滚动跟踪系统，不受VXE约束影响
  const shadowScrollLeft = ref(0)
  
  // 🔑 直接从DOM获取真实的滚动位置，绕过VXE约束
  const getCurrentScrollLeft = () => {
    // 优先使用外部传入的scrollLeft，因为它总是最新的
    // 如果外部scrollLeft为0但shadowScrollLeft不为0，说明存在VXE约束问题，使用shadowScrollLeft
    const externalScrollLeft = scrollLeft.value || 0
    const shadowScrollLeftValue = shadowScrollLeft.value || 0
    
    // 如果外部scrollLeft被重置为0但shadowScrollLeft有值，使用shadowScrollLeft
    if (externalScrollLeft === 0 && shadowScrollLeftValue > 0) {
      return shadowScrollLeftValue
    }
    
    // 否则使用外部scrollLeft
    return externalScrollLeft
  }
  
  // 🔑 监听滚动事件更新独立的滚动跟踪
  const updateShadowScrollPosition = (scrollLeftValue) => {
    if (typeof scrollLeftValue === 'number' && scrollLeftValue >= 0) {
      const oldValue = shadowScrollLeft.value
      shadowScrollLeft.value = scrollLeftValue
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 更新阴影滚动位置:', {
          新位置: scrollLeftValue,
          旧位置: oldValue,
          外部scrollLeft: scrollLeft.value,
          更新成功: shadowScrollLeft.value === scrollLeftValue
        })
      }
    }
  }

  // 🔑 阴影状态计算属性 - 根据需求实现左右固定列阴影逻辑
  const shouldShowLeftShadow = computed(() => {
    if (!hasLeftFixedContent.value) return false
    
    const containerWidthValue = containerWidth.value
    const totalWidth = columnsInfo.value?.totalWidth || 0
    // 🔑 直接使用 shadowScrollLeft，它是最准确的滚动位置
    const currentScrollLeft = shadowScrollLeft.value
    scrollLeft.value // 强制依赖以确保响应式更新
    
    // 表格宽度不够时的逻辑：
    // 1. 默认不展示左侧固定列竖向阴影
    // 2. 用户右滑主表格时立马展示
    // 3. 滚动到底时阴影消失
    // 4. 再次右滑时立马展示
    
    if (totalWidth <= containerWidthValue) {
      // 表格宽度足够，不需要阴影
      return false
    }
    
    // 计算最大滚动距离
    const maxScrollLeft = Math.max(0, totalWidth - containerWidthValue)
    
    // 左侧阴影逻辑：只有在滚动超过5px时才显示阴影
    const shouldShow = currentScrollLeft > 5
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 左侧阴影逻辑:', {
        当前滚动: currentScrollLeft,
        外部scrollLeft: scrollLeft.value,
        shadowScrollLeft: shadowScrollLeft.value,
        最大滚动: maxScrollLeft,
        总宽度: totalWidth,
        容器宽度: containerWidthValue,
        显示阴影: shouldShow,
        '🎯关键判断': `${currentScrollLeft} > 5 = ${shouldShow}`,
        '滚动状态': currentScrollLeft === 0 ? '初始位置' : 
                   currentScrollLeft > 5 ? '已开始滚动' : '微小滚动'
      })
    }
    
    return shouldShow
  })

  const shouldShowRightShadow = computed(() => {
    if (!hasRightFixedColumns.value) return false
    
    const containerWidthValue = containerWidth.value
    const totalWidth = columnsInfo.value?.totalWidth || 0
    
    if (totalWidth <= containerWidthValue) {
      // 表格宽度足够，不需要阴影
      return false
    }
    
    // 🔑 使用多个数据源，确保响应性
    const externalScrollLeft = scrollLeft.value || 0
    const shadowScrollLeft_value = shadowScrollLeft.value || 0
    const localScrollLeft_value = localScrollLeft.value || 0
    
    // 选择最可靠的滚动值
    const currentScrollLeft = Math.max(externalScrollLeft, shadowScrollLeft_value, localScrollLeft_value)
    
    // 🔑 重新计算最大滚动距离，考虑固定列的影响
    // 实际可滚动的内容宽度 = 总宽度 - 左固定列宽度 - 右固定列宽度
    const leftFixedWidth = columnsInfo.value?.leftFixedWidth || 0
    const rightFixedWidth = columnsInfo.value?.rightFixedWidth || 0
    const scrollableContentWidth = totalWidth - leftFixedWidth - rightFixedWidth
    const scrollableContainerWidth = containerWidthValue - leftFixedWidth - rightFixedWidth
    
    // 真实的最大滚动距离
    const realMaxScrollLeft = Math.max(0, scrollableContentWidth - scrollableContainerWidth)
    
    // 🔑 右侧阴影逻辑：当未滚动到底时显示阴影
    // 使用realMaxScrollLeft来准确判断是否滚动到底
    const shouldShow = currentScrollLeft < realMaxScrollLeft - 5 // 5px容差
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 右侧阴影逻辑 - 修复版:', {
        '所有滚动值': {
          external: externalScrollLeft,
          shadow: shadowScrollLeft_value, 
          local: localScrollLeft_value,
          chosen: currentScrollLeft
        },
        '宽度计算': {
          totalWidth,
          containerWidth: containerWidthValue,
          leftFixedWidth,
          rightFixedWidth,
          scrollableContentWidth,
          scrollableContainerWidth
        },
        '滚动距离': {
          realMaxScrollLeft,
          threshold: realMaxScrollLeft - 5,
          hasScrollableContent: realMaxScrollLeft > 0
        },
        '阴影判断': {
          condition: `${currentScrollLeft} < ${realMaxScrollLeft - 5}`,
          result: shouldShow,
          state: currentScrollLeft === 0 ? '初始(应显示)' : 
                 currentScrollLeft >= realMaxScrollLeft - 5 ? '到底(应隐藏)' : '中间(应显示)'
        }
      })
      
      // 🔑 简单的状态报告  
      console.log(`🎨 右侧阴影修复版: ${shouldShow ? '✅显示' : '❌隐藏'} | 滚动=${currentScrollLeft}/${realMaxScrollLeft}`)
    }
    
    return shouldShow
  })

  // 左侧固定列样式
  const leftFixedStyle = computed(() => {
    const height = typeof props.height === 'string' ? props.height : `${props.height}px`
    // 固定列需要减去横向滚动条高度，让加载更多UI底部对齐滚动条顶部
    const scrollbarHeight = hasHorizontalScrollbar.value ? SCROLLBAR_HEIGHT : 0

    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: `${leftFixedTotalWidth.value}px`,
      height: `calc(${height} - ${scrollbarHeight}px)`,
      zIndex: 50,
      backgroundColor: '#fff',
      // 当应该隐藏固定列时，设置 display: none
      display: shouldHideFixedColumns.value ? 'none' : 'block',
      // 🔑 修复：参考VXE Table的阴影效果 - 右侧阴影 8px 0px 10px -5px
      boxShadow: shouldShowLeftShadow.value ? '8px 0px 10px -5px rgba(0, 0, 0, 0.12)' : 'none'
    }
  })

  // 右侧固定列样式
  const rightFixedStyle = computed(() => {
    const height = typeof props.height === 'string' ? props.height : `${props.height}px`
    const scrollbarHeight = hasHorizontalScrollbar.value ? SCROLLBAR_HEIGHT : 0

    // 🔑 使用统一的阴影逻辑 - 强制依赖所有滚动状态
    const shouldShowShadow = shouldShowRightShadow.value
    const _shadowScrollLeft = shadowScrollLeft.value // 强制依赖
    const _scrollLeft = scrollLeft.value // 强制依赖
    const _localScrollLeft = localScrollLeft.value // 强制依赖

    if (process.env.NODE_ENV === 'development') {
      console.log('🎨 右侧固定列样式计算:', {
        shouldShowShadow,
        rightFixedWidth: columnsInfo.value.rightFixedWidth,
        shouldHideFixedColumns: shouldHideFixedColumns.value,
        boxShadow: shouldShowShadow ? '-8px 0px 10px -5px rgba(0, 0, 0, 0.12)' : 'none',
        scrollLeft: _scrollLeft,
        shadowScrollLeft: _shadowScrollLeft,
        localScrollLeft: _localScrollLeft
      })
    }

    return {
      position: 'absolute',
      top: 0,
      right: '0px',
      width: `${columnsInfo.value.rightFixedWidth}px`,
      height: `calc(${height} - ${scrollbarHeight}px)`,
      zIndex: 50,
      backgroundColor: '#fff',
      display: shouldHideFixedColumns.value ? 'none' : 'block',
      // 🔑 修复：参考VXE Table的阴影效果 - -8px 0px 10px -5px
      boxShadow: shouldShowShadow ? '-8px 0px 10px -5px rgba(0, 0, 0, 0.12)' : 'none',
      boxSizing: 'border-box'
    }
  })

  // 固定表头包装样式
  const fixedHeaderWrapperStyle = computed(() => ({
    height: `${headerHeight.value}px`
  }))

  // 左侧表头表格样式
  const leftHeaderTableStyle = computed(() => {
    const selectionWidth = props.selectable ? SELECTION_WIDTH : 0
    return {
      width: `${
        columnsInfo.value.leftFixedWidth + (props.expandable ? EXPAND_WIDTH : 0) + selectionWidth
      }px`,
      tableLayout: 'fixed',
      borderCollapse: 'separate',
      borderSpacing: 0
    }
  })

  // 右侧表头表格样式
  const rightHeaderTableStyle = computed(() => ({
    width: `${columnsInfo.value.rightFixedWidth}px`,
    tableLayout: 'fixed',
    borderCollapse: 'separate',
    borderSpacing: 0
  }))

  // 左侧主体包装样式 - 修复高度计算与主表格保持一致
  const leftBodyWrapperStyle = computed(() => {
    const headerHeightValue = headerHeight.value
    const toolbarHeight = 0 // 工具栏已禁用
    // 修复：使用与主表格相同的高度计算逻辑
    const loadMoreHeight = (props.enableLoadMore && props.showLoadMoreUi) ? 60 + SCROLLBAR_HEIGHT : SCROLLBAR_HEIGHT
    const scrollbarHeight = hasHorizontalScrollbar.value ? SCROLLBAR_HEIGHT : 0
    const height = typeof props.height === 'string' ? props.height : `${props.height}px`
    
    // 强制输出调试信息，不受环境变量限制
    console.log('🔍 左侧固定列高度计算调试:', {
      原始height: props.height,
      处理后height: height,
      headerHeightValue,
      toolbarHeight,
      loadMoreHeight,
      scrollbarHeight,
      enableLoadMore: props.enableLoadMore,
      showLoadMoreUi: props.showLoadMoreUi,
      hasHorizontalScrollbar: hasHorizontalScrollbar.value,
      最终高度公式: `calc(${height} - ${headerHeightValue}px - ${toolbarHeight}px - ${loadMoreHeight}px - ${scrollbarHeight}px)`
    })
    
    return {
      height: `calc(${height} - ${headerHeightValue}px - ${toolbarHeight}px - ${loadMoreHeight}px - ${scrollbarHeight}px)`,
      overflow: 'hidden',
      pointerEvents: 'auto'
    }
  })

  // 右侧主体包装样式 - 修复高度计算与主表格保持一致  
  const rightBodyWrapperStyle = computed(() => {
    const headerHeightValue = headerHeight.value
    const toolbarHeight = 0 // 工具栏已禁用
    // 修复：使用与主表格相同的高度计算逻辑
    const loadMoreHeight = (props.enableLoadMore && props.showLoadMoreUi) ? 60 + SCROLLBAR_HEIGHT : SCROLLBAR_HEIGHT
    const scrollbarHeight = hasHorizontalScrollbar.value ? SCROLLBAR_HEIGHT : 0
    const height = typeof props.height === 'string' ? props.height : `${props.height}px`
    
    // 强制输出调试信息，不受环境变量限制
    console.log('🔍 右侧固定列高度计算调试:', {
      原始height: props.height,
      处理后height: height,
      headerHeightValue,
      toolbarHeight,
      loadMoreHeight,
      scrollbarHeight,
      enableLoadMore: props.enableLoadMore,
      showLoadMoreUi: props.showLoadMoreUi,
      hasHorizontalScrollbar: hasHorizontalScrollbar.value,
      最终高度公式: `calc(${height} - ${headerHeightValue}px - ${toolbarHeight}px - ${loadMoreHeight}px - ${scrollbarHeight}px)`
    })
    
    return {
      height: `calc(${height} - ${headerHeightValue}px - ${toolbarHeight}px - ${loadMoreHeight}px - ${scrollbarHeight}px)`,
      overflow: 'hidden',
      pointerEvents: 'auto'
    }
  })

  // 固定列加载更多位置样式
  const fixedColumnLoadMorePositionStyle = computed(() => {
    const scrollbarHeight = hasHorizontalScrollbar.value ? SCROLLBAR_HEIGHT : 0
    return {
      bottom: `${scrollbarHeight}px`
    }
  })

  // 左侧主体表格样式
  const leftBodyTableStyle = computed(() => {
    const selectionWidth = props.selectable ? SELECTION_WIDTH : 0
    return {
      width: `${
        columnsInfo.value.leftFixedWidth + (props.expandable ? EXPAND_WIDTH : 0) + selectionWidth
      }px`,
      tableLayout: 'fixed',
      borderCollapse: 'separate',
      borderSpacing: 0
    }
  })

  // 右侧主体表格样式
  const rightBodyTableStyle = computed(() => ({
    width: `${columnsInfo.value.rightFixedWidth}px`,
    tableLayout: 'fixed',
    borderCollapse: 'separate',
    borderSpacing: 0
  }))

  // 加载更多区域样式
  const loadMoreAreaStyle = computed(() => {
    const scrollbarHeight = hasHorizontalScrollbar.value ? SCROLLBAR_HEIGHT : 0
    return {
      position: 'absolute',
      bottom: `${scrollbarHeight}px`,
      left: hasLeftFixedContent.value ? `${leftFixedTotalWidth.value}px` : 0,
      right: hasRightFixedColumns.value ? `${columnsInfo.value.rightFixedWidth}px` : 0,
      height: '60px',
      zIndex: 10,
      backgroundColor: '#fff',
      borderTop: '1px solid var(--van-border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  })

  // 需要hasHorizontalScrollbar来避免循环依赖
  const hasHorizontalScrollbar = computed(() => {
    if (!columnsInfo.value.totalWidth || !containerWidth.value) return false
    return columnsInfo.value.totalWidth > containerWidth.value
  })

  return {
    // 样式计算
    selectionColStyle,
    getSelectionHeaderStyle,
    getSelectionCellStyle,
    expandColStyle,
    shouldHideFixedColumns,
    isScrolledToRight,
    leftFixedStyle,
    rightFixedStyle,
    fixedHeaderWrapperStyle,
    leftHeaderTableStyle,
    rightHeaderTableStyle,
    leftBodyWrapperStyle,
    rightBodyWrapperStyle,
    fixedColumnLoadMorePositionStyle,
    leftBodyTableStyle,
    rightBodyTableStyle,
    loadMoreAreaStyle,
    hasHorizontalScrollbar,
    
    // 🔑 新增：阴影状态更新函数和阴影控制
    updateShadowState,
    updateShadowScrollPosition,
    shouldShowLeftShadow,
    shouldShowRightShadow
  }
}
