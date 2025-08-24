# VantTable 重构指南

## 当前状态
- **文件大小**: 7000+ 行
- **主要问题**: 单文件过大，难以维护

## 重构策略：组合式函数抽离

### 已创建的组合式函数

#### 1. `useScrollHandlers.js`
**功能**: 滚动处理逻辑
- `vxeStyleAbsoluteSync` - VXE风格的滚动同步
- `handleMainTableWheel` - 主表格滚轮事件
- `handleFixedColumnWheel` - 固定列滚轮事件
- 滚动状态管理

**减少行数**: ~500行

#### 2. `useLoadMore.js`
**功能**: 加载更多功能
- `loadMoreLoading` 监听器
- iPhone/PC端位置恢复逻辑
- 滚动位置保护机制

**减少行数**: ~300行

### 建议的进一步拆分

#### 3. `useSelection.js` (未创建)
**功能**: 选择功能
```javascript
// 选择相关状态和方法
const {
  selectedKeys,
  isRowSelected,
  handleRowSelect,
  handleSelectAll,
  clearSelection
} = useSelection(props, emit, filteredAndSortedData)
```
**预计减少**: ~200行

#### 4. `useTableEvents.js` (未创建)
**功能**: 触摸事件处理
```javascript
// 触摸事件处理
const {
  handleMainTableTouchStart,
  handleMainTableTouchMove,
  handleMainTableTouchEnd,
  handleFixedColumnTouchStart,
  handleFixedColumnTouchMove,
  handleFixedColumnTouchEnd
} = useTableEvents(bodyRef, leftBodyWrapperRef, rightBodyWrapperRef)
```
**预计减少**: ~400行

#### 5. `useTableFilters.js` (未创建)
**功能**: 过滤功能
```javascript
// 过滤相关功能
const {
  filterStates,
  filteredData,
  handleFilter,
  clearFilters
} = useTableFilters(props, rawData)
```
**预计减少**: ~300行

#### 6. `useTableSorting.js` (未创建)
**功能**: 排序功能
```javascript
// 排序相关功能
const {
  sortConfig,
  sortedData,
  handleSort
} = useTableSorting(props, emit, filteredData)
```
**预计减少**: ~200行

## 重构实施步骤

### 第一阶段：已完成
- ✅ 创建 `useScrollHandlers.js`
- ✅ 创建 `useLoadMore.js`  
- ✅ 在主文件中导入组合函数

### 第二阶段：建议实施
1. **创建 `useSelection.js`**
   ```bash
   # 移动选择相关代码到组合函数
   # 预计减少200行
   ```

2. **创建 `useTableEvents.js`**
   ```bash
   # 移动触摸事件处理代码
   # 预计减少400行
   ```

3. **创建其他组合函数**
   ```bash
   # 继续按功能模块拆分
   # 总计可减少1500+行
   ```

### 第三阶段：模板优化
```vue
<!-- 可以考虑将复杂的表头、表体拆分为子组件 -->
<TableHeader />
<TableBody />
<TableFixedColumns />
```

## 预期效果

### 重构前
- **主文件**: 7000+ 行
- **可读性**: 差
- **维护性**: 困难

### 重构后
- **主文件**: ~4000 行 (减少40%+)
- **组合函数**: 6个文件，各100-500行
- **可读性**: 大幅提升
- **维护性**: 显著改善

## 实施建议

1. **渐进式重构**: 一次抽离一个功能模块
2. **保持功能**: 确保重构过程中功能不受影响
3. **类型安全**: 为组合函数添加TypeScript类型定义
4. **测试验证**: 每个重构步骤后进行功能测试

## 注意事项

- 🔄 重构过程中保持原有API不变
- 🧪 重构后需要全面测试所有功能
- 📝 更新相关文档和注释
- 🔍 注意组合函数之间的依赖关系