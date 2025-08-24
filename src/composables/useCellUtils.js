import { h } from 'vue'

export function useCellUtils(props, getCellValue, isRowSelected, isRowTotal) {
  // 常量定义
  const EXPAND_WIDTH = 40
  const SELECTION_WIDTH = 48
  // 自定义单元格渲染
  const renderCustomCell = (value, row, column, rowIndex, colIndex) => {
    if (typeof column.renderCell === 'function') {
      const result = column.renderCell(value, row, column, rowIndex, colIndex, h)

      if (result && typeof result === 'object' && result.type) {
        return result
      }

      if (typeof result === 'string' || typeof result === 'number') {
        return h('span', result)
      }

      return h('span', String(value || ''))
    }

    return h('span', String(value || ''))
  }

  // 数据条样式
  const getDataBarStyle = (value, key) => {
    return {
      width: '0%',
      backgroundColor: 'var(--van-primary-color)',
      transition: 'width 0.3s ease'
    }
  }

  // 基础表头样式类
  const getHeaderClass = header => {
    const classes = ['vant-th']
    if (header.sortable) classes.push('vant-th--sortable')
    return classes
  }

  // 基础表头样式
  const getHeaderStyle = header => {
    return {
      width: `${header.computedWidth}px`,
      minWidth: `${header.computedWidth}px`,
      maxWidth: `${header.computedWidth}px`,
      textAlign: header.align || 'left',
      boxSizing: 'border-box',
      height: 'auto',
      minHeight: '48px',
      lineHeight: '1.4',
      padding: '8px 12px',
      verticalAlign: 'middle'
    }
  }

  // 单元格样式类
  const getCellClass = (header, row, rowIndex) => {
    const classes = ['vant-td']
    if (props.highlightIndex === rowIndex) classes.push('vant-td--highlighted')
    if (header.link) classes.push('vant-td--link')
    // 移除选中单元格样式：if (isRowSelected(row, rowIndex)) classes.push('vant-td--selected')
    return classes
  }

  // 单元格样式
  const getCellStyle = header => {
    return {
      width: `${header.computedWidth}px`,
      minWidth: `${header.computedWidth}px`,
      maxWidth: `${header.computedWidth}px`,
      textAlign: header.align || 'left',
      boxSizing: 'border-box',
      // 🔑 关键修复：添加文本换行支持，避免内容溢出
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      wordBreak: 'break-all',
      padding: '8px 12px',
      verticalAlign: 'top', // 改为顶部对齐，支持多行内容
      lineHeight: '1.4'
    }
  }

  // 固定列表头样式类
  const getFixedHeaderClass = (header, position) => {
    const classes = ['vant-th', 'vant-th--fixed']
    
    // 处理特殊列类型
    if (header === 'selection') {
      classes.push('vant-th--selection')
    } else if (header === 'expand') {
      classes.push('vant-th--expand')
    } else {
      // 普通列的样式逻辑
      if (header.sortable) classes.push('vant-th--sortable')
    }
    
    classes.push(`vant-th--fixed-${position}`)
    return classes
  }

  // 固定列表头样式
  const getFixedHeaderStyle = header => {
    return {
      width: `${header.computedWidth}px`,
      minWidth: `${header.computedWidth}px`,
      maxWidth: `${header.computedWidth}px`,
      textAlign: header.align || 'left',
      boxSizing: 'border-box',
      height: 'auto',
      minHeight: '48px',
      lineHeight: '1.4',
      padding: '8px 12px',
      verticalAlign: 'middle'
    }
  }

  // 固定列单元格样式类
  const getFixedCellClass = (header, row, rowIndex, position) => {
    const classes = ['vant-td', 'vant-td--fixed']
    
    // 处理特殊列类型
    if (header === 'selection') {
      classes.push('vant-td--selection')
    } else if (header === 'expand') {
      classes.push('vant-td--expand')
    } else {
      // 普通列的样式逻辑
      if (props.highlightIndex === rowIndex) classes.push('vant-td--highlighted')
      if (header.link) classes.push('vant-td--link')
    }
    
    // 移除选中单元格样式（固定列）：if (isRowSelected(row, rowIndex)) classes.push('vant-td--selected')
    classes.push(`vant-td--fixed-${position}`)
    return classes
  }

  // 固定列单元格样式
  const getFixedCellStyle = header => {
    return {
      width: `${header.computedWidth}px`,
      minWidth: `${header.computedWidth}px`,
      maxWidth: `${header.computedWidth}px`,
      textAlign: header.align || 'left',
      boxSizing: 'border-box'
    }
  }

  // 行样式类
  const getRowClass = (index, row) => {
    const classes = ['vant-tr']
    if (isRowTotal(row)) classes.push('vant-tr--total')
    if (props.striped && index % 2 === 1) classes.push('vant-tr--striped')
    if (props.highlightIndex === index) classes.push('vant-tr--highlighted')
    // 添加复选框选中行高亮样式
    if (isRowSelected(row, index)) classes.push('vant-tr--checkbox-selected')
    return classes
  }

  // 单元格值格式化
  const formatCellValue = (value, header) => {
    if (value == null) return ''
    switch (header.type) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value
      case 'percent':
        return typeof value === 'number' ? `${value}%` : value
      case 'currency':
        return typeof value === 'number' ? `¥${value.toLocaleString()}` : value
      default:
        return value
    }
  }

  // 选择列样式函数
  const getSelectionHeaderStyle = () => ({
    width: `${SELECTION_WIDTH}px`,
    minWidth: `${SELECTION_WIDTH}px`,
    maxWidth: `${SELECTION_WIDTH}px`,
    textAlign: 'center',
    height: 'auto',
    minHeight: '48px',
    lineHeight: '1.4',
    padding: '8px 12px',
    verticalAlign: 'middle'
  })

  const getSelectionCellStyle = () => ({
    width: `${SELECTION_WIDTH}px`,
    minWidth: `${SELECTION_WIDTH}px`,
    maxWidth: `${SELECTION_WIDTH}px`,
    textAlign: 'center'
  })

  // 展开列样式函数
  const getExpandHeaderStyle = () => ({
    width: `${EXPAND_WIDTH}px`,
    minWidth: `${EXPAND_WIDTH}px`,
    maxWidth: `${EXPAND_WIDTH}px`,
    textAlign: 'center',
    height: 'auto',
    minHeight: '48px',
    lineHeight: '1.4',
    padding: '8px 12px',
    verticalAlign: 'middle'
  })

  const getExpandCellStyle = () => ({
    width: `${EXPAND_WIDTH}px`,
    minWidth: `${EXPAND_WIDTH}px`,
    maxWidth: `${EXPAND_WIDTH}px`,
    textAlign: 'center'
  })

  return {
    renderCustomCell,
    getDataBarStyle,
    getHeaderClass,
    getHeaderStyle,
    getCellClass,
    getCellStyle,
    getFixedHeaderClass,
    getFixedHeaderStyle,
    getFixedCellClass,
    getFixedCellStyle,
    getRowClass,
    formatCellValue,
    getSelectionHeaderStyle,
    getSelectionCellStyle,
    getExpandHeaderStyle,
    getExpandCellStyle
  }
}