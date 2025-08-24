import { computed } from 'vue'

/**
 * 表格计算属性逻辑
 */
export function useTableComputed(props, containerWidth, scrollTop, scrollLeft, headerHeight, filteredAndSortedData, rowHeightMap) {
  
  // 常量定义
  const EXPAND_WIDTH = 40
  const SELECTION_WIDTH = 48
  const SCROLLBAR_HEIGHT = 15

  // 🔑 添加宽度稳定性检查
  let lastCalculatedWidth = 0
  
  // 列信息计算
  const columnsInfo = computed(() => {
    const totalWidth = containerWidth.value || 375
    
    // 🔑 避免频繁重新计算：只有当宽度变化超过10px时才重新计算
    if (Math.abs(totalWidth - lastCalculatedWidth) < 10 && lastCalculatedWidth > 0) {
      // console.log('🔍 跳过宽度重新计算，变化幅度小于10px:', { totalWidth, lastCalculatedWidth })
      // 返回缓存结果，但这需要更复杂的缓存机制，暂时跳过
    }
    lastCalculatedWidth = totalWidth
    const leftFixedColumns = []
    const rightFixedColumns = []
    const normalColumns = []

    // 分类列
    props.headers.forEach(header => {
      if (header.fixed === 'left') {
        leftFixedColumns.push({ ...header })
      } else if (header.fixed === 'right') {
        rightFixedColumns.push({ ...header })
      } else {
        normalColumns.push({ ...header })
      }
    })
    
    // 计算固定列宽度
    let leftFixedWidth = 0
    leftFixedColumns.forEach(col => {
      const width = col.width || 120
      col.computedWidth = width
      leftFixedWidth += width
    })

    let rightFixedWidth = 0
    rightFixedColumns.forEach(col => {
      // 操作列通常较窄，给一个更合理的默认宽度
      const width = col.width || (col.key === 'action' || col.key === 'actions' || col.key === '操作' ? 80 : 120)
      col.computedWidth = width
      rightFixedWidth += width
    })

    // 计算扩展列宽度
    const expandWidth = props.expandable ? EXPAND_WIDTH : 0
    const selectionWidth = props.selectable ? SELECTION_WIDTH : 0
    const fixedColumnsWidth = leftFixedWidth + rightFixedWidth + expandWidth + selectionWidth

    // 计算普通列可用宽度
    // 🔑 关键修复：使用实际容器可用宽度，让弹性列填满空间
    const containerAvailableWidth = Math.max(0, totalWidth - fixedColumnsWidth)
    
    // 计算固定宽度列占用的空间
    const fixedContentWidth = normalColumns.reduce((sum, col) => sum + (col.width || 0), 0)
    const flexColumnsCount = normalColumns.filter(col => !col.width).length
    
    // 如果容器宽度足够，使用容器宽度；否则使用最小需求宽度
    const minFlexWidth = flexColumnsCount * 120 // 每个弹性列最少120px
    const minRequiredWidth = fixedContentWidth + minFlexWidth
    
    // 优先使用容器可用宽度，确保弹性列能填满空间
    const availableWidth = Math.max(containerAvailableWidth, minRequiredWidth)
    
    // 分配普通列宽度
    const fixedWidthColumns = []
    const flexColumns = []

    normalColumns.forEach(col => {
      if (col.width) {
        fixedWidthColumns.push({ ...col, computedWidth: col.width })
      } else {
        flexColumns.push({ ...col })
      }
    })

    console.log('🔍 列分类调试:', {
      totalWidth,
      fixedColumnsWidth,
      leftFixedWidth,
      rightFixedWidth,
      expandWidth,
      selectionWidth,
      containerAvailableWidth,
      fixedContentWidth,
      flexColumnsCount,
      minFlexWidth,
      minRequiredWidth,
      availableWidth,
      normalColumns: normalColumns.map(c => ({ key: c.key, width: c.width })),
      fixedWidthColumns: fixedWidthColumns.map(c => ({ key: c.key, width: c.computedWidth })),
      flexColumns: flexColumns.map(c => ({ key: c.key }))
    })

    // 为弹性列分配宽度
    if (flexColumns.length > 0) {
      const fixedWidthTotal = fixedWidthColumns.reduce((sum, col) => sum + col.computedWidth, 0)
      
      // 🔑 关键修复：精确计算可用宽度，避免像素误差
      // 减去1px间距补偿，确保完全填满空间
      const actualAvailableWidth = Math.max(containerAvailableWidth, availableWidth)
      const spacingCompensation = 2 // 左右各1px间距补偿
      const remainingWidth = Math.max(0, actualAvailableWidth - fixedWidthTotal - spacingCompensation)
      const flexColumnWidth = Math.max(120, Math.floor(remainingWidth / flexColumns.length))
      
      // 🔑 修复表头闪现：使用稳定的宽度分配，避免余数造成的宽度变化
      const remainder = remainingWidth - (flexColumnWidth * flexColumns.length)
      
      // 如果余数太小（<10px），平均分配到所有列，避免单列突出
      const stableWidth = remainder < 10 
        ? flexColumnWidth 
        : Math.floor((remainingWidth) / flexColumns.length)
      
      console.log('🔍 弹性列宽度分配（稳定模式）:', {
        containerAvailableWidth,
        availableWidth,
        actualAvailableWidth,
        fixedWidthTotal,
        spacingCompensation,
        remainingWidth,
        flexColumnsCount: flexColumns.length,
        baseFlexColumnWidth: flexColumnWidth,
        remainder,
        stableWidth,
        calculation: `使用稳定宽度: ${stableWidth}px (避免闪现)`
      })
      
      flexColumns.forEach((col) => {
        // 🔑 使用稳定宽度，避免余数分配造成的宽度变化和闪现
        col.computedWidth = stableWidth
        console.log(`🔧 弹性列 ${col.key}: -> ${col.computedWidth}px (稳定)`)
      })
    }

    // 合并并排序列 - 应该包含所有列（固定列 + 普通列）
    const computedHeaders = [...leftFixedColumns, ...rightFixedColumns, ...fixedWidthColumns, ...flexColumns]
      .sort((a, b) => {
        const aIndex = props.headers.findIndex(h => h.key === a.key)
        const bIndex = props.headers.findIndex(h => h.key === b.key)
        return aIndex - bIndex
      })

    // 主表头和主表体使用的非固定列 - 应该是所有普通列（非固定列）
    const mainHeaders = normalColumns.map(col => {
      // 查找对应的计算后的列（可能在fixedWidthColumns或flexColumns中）
      const computedCol = [...fixedWidthColumns, ...flexColumns].find(c => c.key === col.key)
      return computedCol || col
    })

    console.log('🔍 主表头调试:', {
      totalNormalColumns: normalColumns.length,
      fixedWidthColumns: fixedWidthColumns.map(c => ({ key: c.key, width: c.computedWidth })),
      flexColumns: flexColumns.map(c => ({ key: c.key, width: c.computedWidth })),
      mainHeaders: mainHeaders.map(c => ({ key: c.key, width: c.computedWidth })),
      mainHeadersCount: mainHeaders.length
    })

    // 计算主表格（非固定列）的总宽度
    const mainHeadersWidth = mainHeaders.reduce((sum, col) => sum + col.computedWidth, 0)
    
    // 🔑 修复：正确计算普通列宽度（不包含固定列）
    const normalColumnsWidth = [...fixedWidthColumns, ...flexColumns].reduce((sum, col) => sum + col.computedWidth, 0)
    const calculatedTotalWidth = leftFixedWidth + rightFixedWidth + normalColumnsWidth + expandWidth + selectionWidth
    // 🔑 修复：不强制设置totalWidth，使用实际计算的宽度
    // 这样阴影逻辑能正确判断是否需要滚动
    const totalTableWidth = calculatedTotalWidth
    
    console.log('🔍 总宽度计算调试:', {
      leftFixedWidth,
      rightFixedWidth,
      normalColumnsWidth,
      expandWidth,
      selectionWidth,
      calculatedTotalWidth,
      totalTableWidth,
      containerWidth: containerWidth.value,
      '应该显示阴影': totalTableWidth > containerWidth.value
    })

    return {
      leftFixedColumns,
      rightFixedColumns,
      computedHeaders,
      mainHeaders, // 新增：主表头/主表体使用的非固定列
      mainHeadersWidth, // 新增：主表格宽度
      totalWidth: totalTableWidth,
      leftFixedWidth,
      rightFixedWidth,
      normalColumnsWidth,
      containerWidth: containerWidth.value
    }
  })

  // 移动端检测
  const isMobile = computed(() => false) // 简化的实现 - 在桌面端应该返回false

  // 布局相关计算
  const hasLeftFixedContent = computed(() => {
    return props.selectable || props.expandable || columnsInfo.value.leftFixedColumns.length > 0
  })

  const hasRightFixedColumns = computed(() => {
    return columnsInfo.value.rightFixedColumns.length > 0
  })

  const leftFixedTotalWidth = computed(() => {
    if (isMobile.value) return 0
    return (props.selectable ? SELECTION_WIDTH : 0) + 
           (props.expandable ? EXPAND_WIDTH : 0) + 
           columnsInfo.value.leftFixedWidth
  })

  const normalColumnsTotalWidth = computed(() => {
    if (!containerWidth.value) return 0
    const leftWidth = leftFixedTotalWidth.value
    const rightWidth = hasRightFixedColumns.value ? columnsInfo.value.rightFixedWidth : 0
    return Math.max(0, containerWidth.value - leftWidth - rightWidth)
  })

  // 水平滚动相关
  const hasHorizontalScrollbar = computed(() => {
    if (!columnsInfo.value.mainHeadersWidth || !containerWidth.value) return false
    
    // 🔑 关键修复：基于主表格的实际内容与可用空间比较
    const leftWidth = hasLeftFixedContent.value ? leftFixedTotalWidth.value : 0
    const rightWidth = hasRightFixedColumns.value ? columnsInfo.value.rightFixedWidth : 0
    const contentWidth = containerWidth.value - leftWidth - rightWidth
    const mainTableWidth = columnsInfo.value.mainHeadersWidth
    
    // 只有主表格内容真正超出可用空间时才需要滚动条
    return !isMobile.value && mainTableWidth > contentWidth
  })

  const scrollbarHandleWidth = computed(() => {
    if (!hasHorizontalScrollbar.value) return 0
    
    const containerW = containerWidth.value
    const leftFixedW = columnsInfo.value.leftFixedWidth || 0
    const rightFixedW = columnsInfo.value.rightFixedWidth || 0
    
    // 🔑 关键修复：主表格可视宽度（不包括固定列）
    const mainVisibleWidth = containerW - leftFixedW - rightFixedW
    const mainContentWidth = columnsInfo.value.mainHeadersWidth || 0
    
    // 🔑 关键修复：使用与滚动同步逻辑一致的计算方式
    const maxScrollLeft = Math.max(0, mainContentWidth - mainVisibleWidth)
    
    if (maxScrollLeft === 0) return mainVisibleWidth // 无需滚动时，手柄占满中间区域
    
    if (isMobile.value) return containerW
    
    // 🔑 VXE-table风格修复：基于VXE-table的比例计算，确保手柄能到达最右端
    // VXE-table使用: clientWidth / totalWidth 的比例来计算手柄宽度
    const viewportRatio = mainVisibleWidth / mainContentWidth
    const minHandleWidth = 30 // 最小手柄宽度
    const calculatedWidth = mainVisibleWidth * viewportRatio
    
    // 🔑 关键：确保手柄宽度不会让轨道空间过小，避免无法到达边界
    const maxAllowedWidth = mainVisibleWidth * 0.8 // 最多占轨道80%，留20%用于移动
    
    return Math.max(minHandleWidth, Math.min(calculatedWidth, maxAllowedWidth))
  })

  const scrollbarHandleLeft = computed(() => {
    if (!hasHorizontalScrollbar.value) return 0
    
    const containerW = containerWidth.value
    const leftFixedW = columnsInfo.value.leftFixedWidth || 0
    const rightFixedW = columnsInfo.value.rightFixedWidth || 0
    const handleWidth = scrollbarHandleWidth.value
    
    // 主表格可见区域宽度
    const mainVisibleWidth = containerW - leftFixedW - rightFixedW
    
    // 🔑 关键修复：使用与滚动同步逻辑一致的计算方式
    const mainContentWidth = columnsInfo.value.mainHeadersWidth || 0
    const maxScrollLeft = Math.max(0, mainContentWidth - mainVisibleWidth)
    
    // 🔑 修复：滚动条手柄在中间区域内的位置（相对于中间区域）
    if (maxScrollLeft === 0) return 0  // 没有滚动需要时，手柄在中间区域最左边
    if (isMobile.value) return 0
    
    // 🔑 VXE-table风格修复：确保手柄能到达最右端的位置计算
    const scrollProgress = scrollLeft.value / maxScrollLeft
    
    // 🔑 关键修复：使用VXE-table的边界检测逻辑
    // 当接近右边界时，确保手柄能到达最右端
    const isNearRightBoundary = scrollProgress >= 0.98 // 98%以上认为接近边界
    
    if (isNearRightBoundary) {
      // 在右边界时，手柄应该贴到轨道右端
      return mainVisibleWidth - handleWidth
    }
    
    // 常规情况下的位置计算：使用更宽松的轨道空间
    const availableTrackWidth = mainVisibleWidth - handleWidth
    const handleLeftInMainArea = scrollProgress * availableTrackWidth
    
    // 🔧 调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 滚动条手柄位置计算:', {
        scrollLeft: scrollLeft.value,
        mainContentWidth,
        containerW,
        maxScrollLeft,
        scrollProgress,
        mainVisibleWidth,
        handleWidth,
        availableTrackWidth,
        handleLeftInMainArea,
        isNearRightBoundary,
        '修复': 'VXE-table风格的边界检测和位置计算',
        '计算公式': isNearRightBoundary 
          ? `边界情况: ${mainVisibleWidth} - ${handleWidth} = ${mainVisibleWidth - handleWidth}`
          : `(${scrollLeft.value} / ${maxScrollLeft}) * ${availableTrackWidth} = ${handleLeftInMainArea}`
      })
    }
    
    // 手柄位置相对于中间区域（不需要加左固定列宽度，因为手柄在中间区域内）
    return handleLeftInMainArea
  })

  // 样式计算
  const containerStyle = computed(() => {
    const styles = {}
    
    if (typeof props.width === 'string') {
      styles.width = props.width
      if (props.minWidth) {
        styles.minWidth = `${props.minWidth}px`
      }
    } else {
      styles.width = `${props.width}px`
    }
    
    if (typeof props.height === 'string') {
      styles.height = props.height
    } else {
      styles.height = `${props.height}px`
    }
    
    return styles
  })

  const tableStyle = computed(() => {
    const availableWidth = containerWidth.value || 375
    const leftWidth = hasLeftFixedContent.value ? leftFixedTotalWidth.value : 0
    const rightWidth = hasRightFixedColumns.value ? columnsInfo.value.rightFixedWidth : 0
    const contentWidth = Math.max(200, availableWidth - leftWidth - rightWidth)
    
    // 🔑 关键修复：表格table宽度精确匹配容器可用宽度
    const mainTableWidth = columnsInfo.value.mainHeadersWidth || 0
    
    // 🔑 关键：当宽度足够时，强制使用容器宽度，避免多余的滚动
    const finalWidth = mainTableWidth <= contentWidth ? contentWidth : mainTableWidth

    console.log('🔍 表格宽度计算调试:', {
      availableWidth,
      leftWidth,
      rightWidth,
      contentWidth,
      mainTableWidth,
      finalWidth,
      needsScroll: mainTableWidth > contentWidth,
      mainHeaders: columnsInfo.value.mainHeaders?.map(h => ({ key: h.key, width: h.computedWidth })),
      message: `主表格宽度${mainTableWidth}px，可用空间${contentWidth}px，最终宽度${finalWidth}px${mainTableWidth > contentWidth ? '（需要滚动）' : '（无需滚动）'}`
    })

    return {
      width: `${finalWidth}px`,
      minWidth: `${finalWidth}px`,
      tableLayout: 'fixed',
      borderCollapse: 'separate',
      borderSpacing: 0
    }
  })

  const bodyWrapperStyle = computed(() => {
    const height = headerHeight.value
    // 🔑 回到简单逻辑：重新分析问题
    const loadMoreHeight = (props.enableLoadMore && props.showLoadMoreUi) ? 60 : 0
    // 🔑 尝试不减去scrollbar高度，看看是否解决问题
    const scrollbarHeight = 0 // hasHorizontalScrollbar.value ? SCROLLBAR_HEIGHT : 0
    
    const paddingBottomWithoutLoadMore = hasHorizontalScrollbar.value ? 35 : 18
    console.log("hasHorizontalScrollbar=",hasHorizontalScrollbar.value, paddingBottomWithoutLoadMore)
    const result = {
      height: `calc(${typeof props.height === 'string' ? props.height : `${props.height}px`} - ${height}px - ${loadMoreHeight}px - ${scrollbarHeight}px)`,
      overflow: 'auto',
      marginLeft: hasLeftFixedContent.value ? `${leftFixedTotalWidth.value}px` : '0',
      marginRight: hasRightFixedColumns.value ? `${columnsInfo.value.rightFixedWidth}px` : '0',
      // 🔑 关键修复：添加底部padding避免水平滚动条遮挡最后一行
      // 根据加载更多UI状态设置不同的padding值
      // paddingBottom: (props.enableLoadMore && props.showLoadMoreUi) ? '20px' : '35px'
      paddingBottom: (props.enableLoadMore && props.showLoadMoreUi) ? '20px' : `${ paddingBottomWithoutLoadMore }px`
    }
    
    console.log('🔍 Main table bodyWrapperStyle debug:', {
      enableLoadMore: props.enableLoadMore,
      showLoadMoreUi: props.showLoadMoreUi,
      hasHorizontalScrollbar: hasHorizontalScrollbar.value,
      loadMoreHeight,
      scrollbarHeight,
      heightFormula: result.height,
      propsHeight: props.height,
      headerHeight: height,
      SCROLLBAR_HEIGHT,
      'paddingBottom方案': {
        'height': '给表格最大高度 282px',
        'paddingBottom': '没有加载更多UI时添加20px底部间距',
        '原因': '水平滚动条overlay在表格内容上方，需要padding推开最后一行'
      },
      '最终计算': {
        'showLoadMoreUi=false': '高度282px + 底部padding20px = 有效高度262px',
        'showLoadMoreUi=true': '高度222px + 底部padding0px = 有效高度222px'
      }
    });
    
    return result
  })

  // 行样式计算
  const getRowStyle = (rowIndex) => {
    const height = rowHeightMap.value.get(rowIndex)
    return height ? {
      height: `${height}px`,
      minHeight: `${height}px`,
      maxHeight: `${height}px`
    } : {
      minHeight: '44px'
      // 🔑 关键修复：不设置 maxHeight，允许行根据内容自动撑开
    }
  }

  const getColStyle = (header) => ({
    width: `${header.computedWidth}px`,
    minWidth: `${header.computedWidth}px`,
    maxWidth: `${header.computedWidth}px`
  })

  const getHeaderClass = (header) => {
    const classes = ['vant-th']
    if (header.sortable) {
      classes.push('vant-th--sortable')
    }
    return classes
  }

  const getHeaderStyle = (header) => ({
    width: `${header.computedWidth}px`,
    minWidth: `${header.computedWidth}px`,
    maxWidth: `${header.computedWidth}px`,
    textAlign: header.align || 'left',
    boxSizing: 'border-box'
  })

  const getRowClass = (rowIndex, row) => {
    const classes = ['vant-tr']
    
    // 总计行样式
    if (row[props.totalRowKey]) {
      classes.push('vant-tr--total')
    }
    
    // 斑马纹样式
    if (props.striped && rowIndex % 2 === 1) {
      classes.push('vant-tr--striped')
    }
    
    // 高亮行样式
    if (props.highlightIndex === rowIndex) {
      classes.push('vant-tr--highlighted')
    }
    
    return classes
  }

  return {
    // 计算属性
    columnsInfo,
    isMobile,
    hasLeftFixedContent,
    hasRightFixedColumns,
    leftFixedTotalWidth,
    normalColumnsTotalWidth,
    hasHorizontalScrollbar,
    scrollbarHandleWidth,
    scrollbarHandleLeft,
    containerStyle,
    tableStyle,
    bodyWrapperStyle,
    
    // 样式方法
    getRowStyle,
    getColStyle,
    getHeaderClass,
    getHeaderStyle,
    getRowClass,
    
    // 常量
    EXPAND_WIDTH,
    SELECTION_WIDTH,
    SCROLLBAR_HEIGHT
  }
}