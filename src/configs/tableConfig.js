/**
 * VantTable 组件配置
 * 包含 Props 定义、Events 定义和其他配置项
 */

/**
 * 表格 Props 定义
 */
export const tableProps = {
  headers: { type: Array, required: true, default: () => [] },
  data: { type: Array, required: true, default: () => [] },
  width: { type: [Number, String], default: '100%' },
  height: { type: [Number, String], default: 'auto' },
  minWidth: { type: Number, default: 300 },
  totalRowKey: { type: String, default: 'isTotal' },
  bordered: { type: Boolean, default: true },
  striped: { type: Boolean, default: false },
  expandable: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  sortProp: { type: String, default: null },
  sortType: { type: String, default: null },
  highlightIndex: { type: Number, default: -1 },
  
  // 高亮颜色配置
  highlightColor: { type: String, default: '#e6f4ff' }, // 点击高亮背景色
  highlightBorderColor: { type: String, default: '#1677ff' }, // 点击高亮边框色
  
  // 复选行高亮颜色配置
  selectedRowColor: { type: String, default: '#e6f4ff' }, // 复选行背景色
  selectedRowBorderColor: { type: String, default: '#40a9ff' }, // 复选行边框色

  // 选择功能相关Props
  selectable: { type: Boolean, default: false },
  selectMode: {
    type: String,
    default: 'checkbox',
    validator: v => ['checkbox', 'radio'].includes(v)
  },
  selectOnRowClick: { type: Boolean, default: false },
  preserveSelection: { type: Boolean, default: false },
  selectableFilter: { type: Function, default: null },
  maxSelectCount: { type: Number, default: 0 },
  rowKey: { type: [String, Function], default: 'id' },
  selectedKeys: { type: Array, default: () => [] },

  // 加载更多
  enableLoadMore: { type: Boolean, default: false },
  showLoadMoreUi: { type: Boolean, default: false }, // 是否显示加载更多的UI
  loadMoreLoading: { type: Boolean, default: false },
  loadMoreFinished: { type: Boolean, default: false },
  loadMoreError: { type: Boolean, default: false },
  loadMoreOffset: { type: Number, default: 50 },
  loadMoreLoadingText: { type: String, default: '加载中...' },
  loadMoreFinishedText: { type: String, default: '没有更多了' },
  loadMoreErrorText: { type: String, default: '加载失败，点击重试' },
  loadMoreReadyText: { type: String, default: '上拉加载更多' }
}

/**
 * 表格 Events 定义
 */
export const tableEvents = [
  'sort-change',
  'cell-click',
  'row-click',
  'row-mouse-enter',
  'row-mouse-leave',
  'expand-change',
  'load-more',
  'filter-change',
  'update:selected-keys',
  'selection-change',
  'select-all',
  'select',
  'batch-delete',
  'scroll-to-top',         // 纵向滚动到顶部事件
  'scroll-to-bottom',      // 纵向滚动到底部事件
  'scroll-to-left',        // 横向滚动到左边界事件
  'scroll-to-right',       // 横向滚动到右边界事件
  'scroll'                 // 通用滚动事件
]

/**
 * 表格常量配置
 */
export const tableConstants = {
  // 尺寸常量
  EXPAND_WIDTH: 40,
  SELECTION_WIDTH: 48,
  SCROLLBAR_HEIGHT: 16,
  MIN_ROW_HEIGHT: 44,
  DEFAULT_HEADER_HEIGHT: 48,
  
  // 性能配置
  CLICK_DEBOUNCE_TIME: 150,
  SCROLL_DEBOUNCE_TIME: 16,
  RESIZE_DEBOUNCE_TIME: 100,
  
  // iOS检测正则
  IOS_REGEX: /iPad|iPhone|iPod/,
  
  // CSS类名
  CSS_CLASSES: {
    WRAPPER: 'vant-table-wrapper',
    HEADER: 'vant-table-header',
    BODY: 'vant-table-body',
    ROW: 'vant-tr',
    CELL: 'vant-td',
    SELECTED: 'vant-tr--selected',
    HOVER: 'vant-tr--hover',
    HIGHLIGHTED: 'vant-tr--highlighted',
    CHECKBOX_SELECTED: 'vant-tr--checkbox-selected',
    IOS_OPTIMIZED: 'vant-table--ios-optimized'
  }
}

/**
 * 表格默认样式配置
 */
export const tableStyles = {
  // CSS变量
  CSS_VARIABLES: {
    '--van-primary-color': '#1989fa',
    '--van-text-color': '#323233',
    '--van-text-color-2': '#969799',
    '--van-text-color-3': '#c8c9cc',
    '--van-border-color': '#ebedf0',
    '--van-background': '#f7f8fa',
    '--van-white': '#ffffff',
    '--van-hover-color': '#f5f5f5',
    '--van-selected-color': '#e6f4ff',
    '--vant-highlight-color': '#e6f4ff',
    '--vant-selected-row-color': '#e6f4ff'
  }
}

/**
 * 调试配置
 */
export const debugConfig = {
  // 开发环境检测
  isDevelopment: () => process.env.NODE_ENV === 'development',
  
  // 调试标志 - 可以通过这些标志控制不同类型的日志输出
  enableConsoleLog: false, // 改为 false 来减少控制台日志
  enablePerformanceLog: false,
  enableStateLog: false,
  enableScrollLog: false, // 新增：控制滚动相关日志
  enableStyleLog: false,  // 新增：控制样式相关日志
  enableHandlerLog: false, // 新增：控制事件处理日志
  
  // 调试方法名称
  DEBUG_METHODS: [
    'enableDebug',
    'quickDebug',
    'forceHeaderSync',
    'checkAlignment',
    'measureAndSyncHeaderHeight',
    'measureAndSyncRowHeights',
    'testRowHighlight',
    'checkRowElements',
    'forceResetAllRowStates',
    'forceClearSelectedSync',
    'applyRowStateSync',
    'testSingleRowHighlight',
    'forceTestSingleHighlight',
    'checkHighlightState'
  ]
}

/**
 * 移动端优化配置
 */
export const mobileConfig = {
  // 触摸事件配置
  TOUCH_THRESHOLD: 10, // 触摸移动阈值
  TOUCH_DELAY: 150,    // 触摸延迟
  
  // 响应式断点
  BREAKPOINTS: {
    mobile: 480,
    tablet: 768,
    desktop: 1024
  },
  
  // iOS优化选项
  IOS_OPTIMIZATIONS: {
    enableHardwareAcceleration: true,
    preventOverscroll: true,
    optimizeScrolling: true,
    preventBounce: true
  }
}

/**
 * 默认配置导出
 */
export default {
  props: tableProps,
  events: tableEvents,
  constants: tableConstants,
  styles: tableStyles,
  debug: debugConfig,
  mobile: mobileConfig
}