# Release v1.0.1

## 🎉 首次发布

这是 @nicky132/vant-table 的首次正式发布！

## ✨ 主要特性

- 🚀 **高性能表格组件**：基于 Vant UI，支持大量数据渲染
- 🎯 **强大的选择功能**：支持单选/多选模式，选择过滤，最大选择限制
- 📌 **固定列支持**：左右固定列，自动阴影效果
- 🔄 **排序与过滤**：多列排序和自定义过滤功能
- 📱 **响应式设计**：完美适配移动端和桌面端
- 🎨 **自定义渲染**：支持单元格自定义渲染
- 📦 **TypeScript 支持**：完整的类型定义
- 🧪 **测试覆盖**：完善的单元测试

## 📦 安装

### NPM 安装（即将上线）
```bash
npm install @nicky132/vant-table
```

### 手动安装
1. 下载本次发布的 `dist.zip` 文件
2. 解压到你的项目目录
3. 在项目中引入：
   ```javascript
   import VantTable from './path/to/dist/index.mjs'
   import './path/to/dist/index.css'
   ```

## 🚀 快速开始

```vue
<template>
  <VantTable
    :headers="headers"
    :data="data"
    :selectable="true"
    select-mode="checkbox"
    @selection-change="handleSelectionChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import { VantTable } from '@nicky132/vant-table'
import '@nicky132/vant-table/dist/index.css'

const headers = ref([
  { key: 'id', label: 'ID', width: 100, sortable: true },
  { key: 'name', label: '姓名', width: 120, fixed: 'left' },
  { key: 'department', label: '部门', sortable: true },
  { key: 'salary', label: '薪资', type: 'currency', sortable: true },
  { key: 'status', label: '状态', width: 100, fixed: 'right' }
])

const data = ref([
  { id: 1, name: '张三', department: '技术部', salary: 25000, status: '在职' },
  { id: 2, name: '李四', department: '产品部', salary: 20000, status: '在职' },
])

const handleSelectionChange = (event) => {
  console.log('选择变化:', event.selectedRows)
}
</script>
```

## 📚 文档

详细的 API 文档和使用示例请查看：
- [README.md](https://github.com/nicky132/vant-table/blob/main/README.md)
- [在线示例](https://github.com/nicky132/vant-table/tree/main/example)

## 🐛 问题反馈

如果遇到问题或有功能建议，请：
- [提交 Issue](https://github.com/nicky132/vant-table/issues)
- [参与讨论](https://github.com/nicky132/vant-table/discussions)

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](https://github.com/nicky132/vant-table/blob/main/CONTRIBUTING.md)

## 📄 许可证

[MIT](https://github.com/nicky132/vant-table/blob/main/LICENSE)

---

**完整更新日志**

- feat: 初始发布 VantTable 组件
- feat: 添加开发工具和项目模板
- feat: 完善文档和示例
- fix: 更新包名为 @nicky132/vant-table