export function useStickyStyles(props, columnsInfo, SELECTION_WIDTH, EXPAND_WIDTH) {
  // Sticky表头样式类
  const getStickyHeaderClass = (header, fixed) => {
    const classes = ['vant-th']
    
    if (header === 'selection') {
      classes.push('vant-th--selection', 'vant-th--sticky')
      // 如果只有选择列或选择列是最后一个左固定列
      if (!props.expandable && columnsInfo.value.leftFixedColumns.length === 0) {
        classes.push('vant-th--sticky-left-last')
      }
    } else if (header === 'expand') {
      classes.push('vant-th--expand', 'vant-th--sticky')
      // 如果展开列是最后一个左固定列
      if (columnsInfo.value.leftFixedColumns.length === 0) {
        classes.push('vant-th--sticky-left-last')
      }
    } else {
      if (header.sortable) classes.push('vant-th--sortable')
      if (fixed) {
        classes.push('vant-th--sticky', `vant-th--sticky-${fixed}`)
        
        // 为最后一个左固定列添加特殊类
        if (fixed === 'left') {
          const leftIndex = columnsInfo.value.leftFixedColumns.findIndex(h => h.key === header.key)
          if (leftIndex === columnsInfo.value.leftFixedColumns.length - 1) {
            classes.push('vant-th--sticky-left-last')
          }
        }
        
        // 为第一个右固定列添加特殊类
        if (fixed === 'right') {
          const rightIndex = columnsInfo.value.rightFixedColumns.findIndex(h => h.key === header.key)
          if (rightIndex === 0) {
            classes.push('vant-th--sticky-right-first')
          }
        }
      }
    }
    
    return classes
  }

  // Sticky表头样式
  const getStickyHeaderStyle = (header, fixed) => {
    const baseStyle = {}
    
    if (header === 'selection') {
      baseStyle.width = `${SELECTION_WIDTH}px`
      baseStyle.minWidth = `${SELECTION_WIDTH}px`
      baseStyle.maxWidth = `${SELECTION_WIDTH}px`
      baseStyle.textAlign = 'center'
      baseStyle.position = 'sticky'
      baseStyle.left = '0px'
      baseStyle.zIndex = '100'
      baseStyle.backgroundColor = 'var(--van-background)'
    } else if (header === 'expand') {
      baseStyle.width = `${EXPAND_WIDTH}px`
      baseStyle.minWidth = `${EXPAND_WIDTH}px`
      baseStyle.maxWidth = `${EXPAND_WIDTH}px`
      baseStyle.textAlign = 'center'
      baseStyle.position = 'sticky'
      baseStyle.left = props.selectable ? `${SELECTION_WIDTH}px` : '0px'
      baseStyle.zIndex = '100'
      baseStyle.backgroundColor = 'var(--van-background)'
    } else {
      baseStyle.width = `${header.computedWidth}px`
      baseStyle.minWidth = `${header.computedWidth}px`
      baseStyle.maxWidth = `${header.computedWidth}px`
      baseStyle.textAlign = header.align || 'left'
      baseStyle.boxSizing = 'border-box'
      
      if (fixed === 'left') {
        let leftOffset = 0
        if (props.selectable) leftOffset += SELECTION_WIDTH
        if (props.expandable) leftOffset += EXPAND_WIDTH
        
        // 计算前面左固定列的宽度
        const leftIndex = columnsInfo.value.leftFixedColumns.findIndex(h => h.key === header.key)
        if (leftIndex >= 0) {
          for (let i = 0; i < leftIndex; i++) {
            leftOffset += columnsInfo.value.leftFixedColumns[i].computedWidth
          }
        }
        
        baseStyle.position = 'sticky'
        baseStyle.left = `${leftOffset}px`
        baseStyle.zIndex = '100'
        baseStyle.backgroundColor = 'var(--van-background)'
      } else if (fixed === 'right') {
        let rightOffset = 0
        
        // 计算后面右固定列的宽度
        const rightIndex = columnsInfo.value.rightFixedColumns.findIndex(h => h.key === header.key)
        if (rightIndex >= 0) {
          for (let i = rightIndex + 1; i < columnsInfo.value.rightFixedColumns.length; i++) {
            rightOffset += columnsInfo.value.rightFixedColumns[i].computedWidth
          }
        }
        
        baseStyle.position = 'sticky'
        baseStyle.right = `${rightOffset}px`
        baseStyle.zIndex = '100'
        baseStyle.backgroundColor = 'var(--van-background)'
      }
    }
    
    return baseStyle
  }

  // Sticky单元格样式类
  const getStickyColumnClass = (header, fixed) => {
    const classes = ['vant-td']
    
    if (header === 'selection') {
      classes.push('vant-td--selection', 'vant-td--sticky')
      // 如果只有选择列或选择列是最后一个左固定列
      if (!props.expandable && columnsInfo.value.leftFixedColumns.length === 0) {
        classes.push('vant-td--sticky-left-last')
      }
    } else if (header === 'expand') {
      classes.push('vant-td--expand', 'vant-td--sticky')
      // 如果展开列是最后一个左固定列
      if (columnsInfo.value.leftFixedColumns.length === 0) {
        classes.push('vant-td--sticky-left-last')
      }
    } else {
      if (fixed) {
        classes.push('vant-td--sticky', `vant-td--sticky-${fixed}`)
        
        // 为最后一个左固定列添加特殊类
        if (fixed === 'left') {
          const leftIndex = columnsInfo.value.leftFixedColumns.findIndex(h => h.key === header.key)
          if (leftIndex === columnsInfo.value.leftFixedColumns.length - 1) {
            classes.push('vant-td--sticky-left-last')
          }
        }
        
        // 为第一个右固定列添加特殊类
        if (fixed === 'right') {
          const rightIndex = columnsInfo.value.rightFixedColumns.findIndex(h => h.key === header.key)
          if (rightIndex === 0) {
            classes.push('vant-td--sticky-right-first')
          }
        }
      }
    }
    
    return classes
  }

  // Sticky单元格样式
  const getStickyColumnStyle = (header, fixed) => {
    const baseStyle = {}
    
    if (header === 'selection') {
      baseStyle.width = `${SELECTION_WIDTH}px`
      baseStyle.minWidth = `${SELECTION_WIDTH}px`
      baseStyle.maxWidth = `${SELECTION_WIDTH}px`
      baseStyle.textAlign = 'center'
      baseStyle.position = 'sticky'
      baseStyle.left = '0px'
      baseStyle.zIndex = '90'
      baseStyle.backgroundColor = 'var(--van-white)'
    } else if (header === 'expand') {
      baseStyle.width = `${EXPAND_WIDTH}px`
      baseStyle.minWidth = `${EXPAND_WIDTH}px`
      baseStyle.maxWidth = `${EXPAND_WIDTH}px`
      baseStyle.textAlign = 'center'
      baseStyle.position = 'sticky'
      baseStyle.left = props.selectable ? `${SELECTION_WIDTH}px` : '0px'
      baseStyle.zIndex = '90'
      baseStyle.backgroundColor = 'var(--van-white)'
    } else {
      baseStyle.width = `${header.computedWidth}px`
      baseStyle.minWidth = `${header.computedWidth}px`
      baseStyle.maxWidth = `${header.computedWidth}px`
      baseStyle.textAlign = header.align || 'left'
      baseStyle.boxSizing = 'border-box'
      
      if (fixed === 'left') {
        let leftOffset = 0
        if (props.selectable) leftOffset += SELECTION_WIDTH
        if (props.expandable) leftOffset += EXPAND_WIDTH
        
        // 计算前面左固定列的宽度
        const leftIndex = columnsInfo.value.leftFixedColumns.findIndex(h => h.key === header.key)
        if (leftIndex >= 0) {
          for (let i = 0; i < leftIndex; i++) {
            leftOffset += columnsInfo.value.leftFixedColumns[i].computedWidth
          }
        }
        
        baseStyle.position = 'sticky'
        baseStyle.left = `${leftOffset}px`
        baseStyle.zIndex = '90'
        baseStyle.backgroundColor = 'var(--van-white)'
      } else if (fixed === 'right') {
        let rightOffset = 0
        
        // 计算后面右固定列的宽度
        const rightIndex = columnsInfo.value.rightFixedColumns.findIndex(h => h.key === header.key)
        if (rightIndex >= 0) {
          for (let i = rightIndex + 1; i < columnsInfo.value.rightFixedColumns.length; i++) {
            rightOffset += columnsInfo.value.rightFixedColumns[i].computedWidth
          }
        }
        
        baseStyle.position = 'sticky'
        baseStyle.right = `${rightOffset}px`
        baseStyle.zIndex = '90'
        baseStyle.backgroundColor = 'var(--van-white)'
      }
    }
    
    return baseStyle
  }

  return {
    getStickyHeaderClass,
    getStickyHeaderStyle,
    getStickyColumnClass,
    getStickyColumnStyle
  }
}