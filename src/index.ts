import VantTable from './VantTable.vue'
import type { App } from 'vue'

// 导出类型定义
export interface TableHeader {
  key: string
  label: string
  width?: number
  fixed?: 'left' | 'right'
  sortable?: boolean
  filterable?: boolean
  align?: 'left' | 'center' | 'right'
  type?: 'text' | 'number' | 'currency' | 'percent'
  link?: boolean
  showDataBar?: boolean
  renderCell?: (value: any, row: any, column: any, rowIndex: number, colIndex: number, h: any) => any
  computedWidth?: number
}

export interface SelectionEvent {
  selectedRowKeys: string[]
  selectedRows: any[]
  selectableRows: any[]
  isAllSelected: boolean
  isIndeterminate: boolean
}

export interface SelectEvent {
  row: any
  rowIndex: number
  selected: boolean
  selectedRowKeys: string[]
  selectedRows: any[]
}

export interface SelectAllEvent {
  checked: boolean
  selectedRowKeys: string[]
  selectedRows: any[]
  selectableRows: any[]
}

export interface BatchDeleteEvent {
  selectedRows: any[]
  selectedRowKeys: string[]
}

export interface SortChangeEvent {
  key: string
  direction: 'asc' | 'desc' | null
  column: TableHeader
}

export interface CellClickEvent {
  row: any
  column: TableHeader
  rowIndex: number
  colIndex: number
  value: any
}

export interface RowClickEvent {
  row: any
  rowIndex: number
}

export interface ExpandChangeEvent {
  row: any
  rowIndex: number
  expanded: boolean
  expandedKeys: string[]
}

// VantTable Props 类型定义
export interface VantTableProps {
  headers: TableHeader[]
  data: any[]
  width?: number | string
  height?: number | string
  minWidth?: number
  totalRowKey?: string
  bordered?: boolean
  striped?: boolean
  expandable?: boolean
  loading?: boolean
  sortProp?: string | null
  sortType?: string | null
  highlightIndex?: number
  selectable?: boolean
  selectMode?: 'checkbox' | 'radio'
  selectOnRowClick?: boolean
  preserveSelection?: boolean
  selectableFilter?: (row: any, index: number) => boolean
  maxSelectCount?: number
  rowKey?: string | ((row: any, index: number) => string)
  selectedKeys?: string[]
  enableLoadMore?: boolean
  showLoadMoreUi?: boolean
  loadMoreLoading?: boolean
  loadMoreFinished?: boolean
  loadMoreError?: boolean
  loadMoreOffset?: number
  loadMoreLoadingText?: string
  loadMoreFinishedText?: string
  loadMoreErrorText?: string
}

// 组件实例方法类型定义
export interface VantTableInstance {
  forceHeaderSync: () => void
  measureAndSyncHeaderHeight: () => void
  measureAndSyncRowHeights: () => void
  quickDebug: () => void
  enableDebug: () => void
  checkAlignment: () => void
  setSelectedRowKeys: (keys: string[]) => void
  setSelectedRows: (rows: any[]) => void
  getSelectedRowKeys: () => string[]
  getSelectedRows: () => any[]
  clearSelection: () => void
  toggleRowSelection: (row: any, selected?: boolean) => void
  selectAllCurrentPage: () => void
  invertSelection: () => void
  isRowSelected: (row: any, rowIndex: number) => boolean
  isRowDisabled: (row: any, rowIndex: number) => boolean
  selectedRowKeys: () => string[]
  selectedRows: () => any[]
  selectableRows: () => any[]
  isAllSelected: () => boolean
  isIndeterminate: () => boolean
}

// 安装插件函数
VantTable.install = (app: App) => {
  app.component('VantTable', VantTable)
}

// 导出组件和类型
export default VantTable
export { VantTable }

// 导出所有类型供 TypeScript 用户使用