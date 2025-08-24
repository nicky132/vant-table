import { nextTick } from 'vue'

/**
 * 样式更新组合函数
 * 处理阴影状态更新和容器宽度更新等样式相关逻辑
 */
export function useStyleUpdater(
  props,
  columnsInfo,
  containerWidth,
  scrollLeft,
  hasLeftFixedContent,
  hasRightFixedColumns,
  leftFixedTotalWidth,
  showHorizontalScrollbar,
  layoutWrapperRef,
  bodyRef,
  headerRef,
  leftBodyWrapperRef,
  rightBodyWrapperRef
) {

  // 更新阴影状态的统一方法 - 优化固定列阴影逻辑
  const updateShadowState = () => {
    // 🔑 关键修复：基于主表格的实际滚动需求来判断阴影显示
    const leftWidth = hasLeftFixedContent.value ? leftFixedTotalWidth.value + 1 : 0
    const rightWidth = hasRightFixedColumns.value ? (columnsInfo.value.rightFixedWidth + 1) : 0
    const contentWidth = containerWidth.value - leftWidth - rightWidth
    const mainTableWidth = columnsInfo.value.mainHeadersWidth || 0
    const currentScrollLeft = scrollLeft.value
    const maxScrollLeft = Math.max(0, mainTableWidth - contentWidth)
    
    // 🔑 修复：只有主表格内容真正超出可用空间时才有可滚动内容
    const hasScrollableContent = mainTableWidth > contentWidth
    
    // 🔑 调试信息
    console.log('🔍 阴影状态调试:', {
      containerWidth: containerWidth.value,
      leftWidth,
      rightWidth,
      contentWidth,
      mainTableWidth,
      hasScrollableContent,
      currentScrollLeft,
      maxScrollLeft,
      hasLeftFixedContent: hasLeftFixedContent.value,
      hasRightFixedColumns: hasRightFixedColumns.value
    })
    
    // 只有在有固定列且有可滚动内容的情况下才显示阴影
    const hasLeftScroll = hasScrollableContent && currentScrollLeft > 5 && hasLeftFixedContent.value
    const hasRightScroll = hasScrollableContent && currentScrollLeft < maxScrollLeft - 5 && hasRightFixedColumns.value
    
    // 🔑 新增：当有可滚动内容且有右侧固定列时，显示右侧阴影
    const hasScrollableContentWithRightFixed = hasScrollableContent && hasRightFixedColumns.value && currentScrollLeft < maxScrollLeft - 5
    
    const leftShadowPosition = hasLeftFixedContent.value ? leftFixedTotalWidth.value : 0
    const rightShadowPosition = hasRightFixedColumns.value ? columnsInfo.value.rightFixedWidth : 0
    
    // 🔑 调试：输出最终的阴影状态
    console.log('🔍 最终阴影状态:', {
      hasLeftScroll,
      hasRightScroll,
      hasScrollableContentWithRightFixed,
      leftShadowPosition,
      rightShadowPosition
    })
    
    // 更新布局容器的阴影状态 - 这样可以确保阴影始终是连续的
    if (layoutWrapperRef.value) {
      layoutWrapperRef.value.setAttribute('data-scroll-left', hasLeftScroll ? '1' : '0')
      layoutWrapperRef.value.setAttribute('data-scroll-right', hasRightScroll ? '1' : '0')
      // 🔑 新增：设置可滚动内容标记
      layoutWrapperRef.value.setAttribute('data-has-scrollable-content', hasScrollableContentWithRightFixed ? '1' : '0')
      layoutWrapperRef.value.style.setProperty('--left-shadow-position', `${leftShadowPosition}px`)
      layoutWrapperRef.value.style.setProperty('--right-shadow-position', `${rightShadowPosition}px`)
    }
    
    // 保持原有的表体和表头更新（用于备用）
    if (bodyRef.value) {
      bodyRef.value.setAttribute('data-scroll-left', hasLeftScroll ? '1' : '0')
      bodyRef.value.setAttribute('data-scroll-right', hasRightScroll ? '1' : '0')
      bodyRef.value.setAttribute('data-has-scrollable-content', hasScrollableContentWithRightFixed ? '1' : '0')
      bodyRef.value.style.setProperty('--left-shadow-position', `${leftShadowPosition}px`)
      bodyRef.value.style.setProperty('--right-shadow-position', `${rightShadowPosition}px`)
    }
    
    if (headerRef.value) {
      headerRef.value.setAttribute('data-scroll-left', hasLeftScroll ? '1' : '0')
      headerRef.value.setAttribute('data-scroll-right', hasRightScroll ? '1' : '0')
      headerRef.value.setAttribute('data-has-scrollable-content', hasScrollableContentWithRightFixed ? '1' : '0')
      headerRef.value.style.setProperty('--left-shadow-position', `${leftShadowPosition}px`)
      headerRef.value.style.setProperty('--right-shadow-position', `${rightShadowPosition}px`)
    }
  }

  // 更新容器宽度和自定义颜色
  const updateContainerWidth = () => {
    if (bodyRef.value) {
      const container = bodyRef.value.parentElement
      if (container) {
        const rect = container.getBoundingClientRect()
        containerWidth.value = Math.max(rect.width, props.minWidth)
        
        // 设置自定义高亮颜色到主容器
        container.style.setProperty('--vant-highlight-color', props.highlightColor)
        container.style.setProperty('--vant-highlight-border-color', props.highlightBorderColor)
        // 设置自定义复选行颜色
        container.style.setProperty('--vant-selected-row-color', props.selectedRowColor)
        container.style.setProperty('--vant-selected-row-border-color', props.selectedRowBorderColor)
        
        // 确保包装容器也有这些CSS变量（用于:active状态）
        const wrapper = container.closest('.vant-table-wrapper')
        if (wrapper && wrapper !== container) {
          wrapper.style.setProperty('--vant-highlight-color', props.highlightColor)
          wrapper.style.setProperty('--vant-selected-row-color', props.selectedRowColor)
          wrapper.style.setProperty('--vant-highlight-border-color', props.highlightBorderColor)
          wrapper.style.setProperty('--vant-selected-row-border-color', props.selectedRowBorderColor)
          
          // VXETable风格：动态控制表格容器的底部填充
          if (showHorizontalScrollbar.value) {
            wrapper.classList.add('has-horizontal-scrollbar')
          } else {
            wrapper.classList.remove('has-horizontal-scrollbar')
          }
        }
      }
    } else if (typeof props.width === 'number') {
      containerWidth.value = props.width
    }
    
    // 确保固定列容器也继承这些CSS变量
    nextTick(() => {
      // 为左固定列设置颜色变量
      if (leftBodyWrapperRef.value) {
        const leftContainer = leftBodyWrapperRef.value.closest('.vant-table-fixed--left')
        if (leftContainer) {
          leftContainer.style.setProperty('--vant-highlight-color', props.highlightColor)
          leftContainer.style.setProperty('--vant-selected-row-color', props.selectedRowColor)
          leftContainer.style.setProperty('--vant-highlight-border-color', props.highlightBorderColor)
          leftContainer.style.setProperty('--vant-selected-row-border-color', props.selectedRowBorderColor)
          // 设置data属性确保CSS选择器生效
          leftContainer.setAttribute('data-active-fix', 'true')
        }
        
        // 同时设置到leftBodyWrapperRef本身
        leftBodyWrapperRef.value.style.setProperty('--vant-highlight-color', props.highlightColor)
        leftBodyWrapperRef.value.style.setProperty('--vant-selected-row-color', props.selectedRowColor)
        leftBodyWrapperRef.value.style.setProperty('--vant-highlight-border-color', props.highlightBorderColor)
        leftBodyWrapperRef.value.style.setProperty('--vant-selected-row-border-color', props.selectedRowBorderColor)
      }
      
      // 为右固定列设置颜色变量
      if (rightBodyWrapperRef.value) {
        const rightContainer = rightBodyWrapperRef.value.closest('.vant-table-fixed--right')
        if (rightContainer) {
          rightContainer.style.setProperty('--vant-highlight-color', props.highlightColor)
          rightContainer.style.setProperty('--vant-selected-row-color', props.selectedRowColor)
          rightContainer.style.setProperty('--vant-highlight-border-color', props.highlightBorderColor)
          rightContainer.style.setProperty('--vant-selected-row-border-color', props.selectedRowBorderColor)
          // 设置data属性确保CSS选择器生效
          rightContainer.setAttribute('data-active-fix', 'true')
        }
        
        // 同时设置到rightBodyWrapperRef本身
        rightBodyWrapperRef.value.style.setProperty('--vant-highlight-color', props.highlightColor)
        rightBodyWrapperRef.value.style.setProperty('--vant-selected-row-color', props.selectedRowColor)
        rightBodyWrapperRef.value.style.setProperty('--vant-highlight-border-color', props.highlightBorderColor)
        rightBodyWrapperRef.value.style.setProperty('--vant-selected-row-border-color', props.selectedRowBorderColor)
      }
      
      updateShadowState()
    })
  }

  return {
    updateShadowState,
    updateContainerWidth
  }
}