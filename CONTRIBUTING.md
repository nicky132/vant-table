# 贡献指南

感谢您对 @cc/vant-table 的关注和贡献！

## 开发环境

确保您的开发环境满足以下要求：

- Node.js >= 16.0.0
- npm >= 8.0.0

## 开始开发

1. Fork 本仓库
2. 克隆到本地：
   ```bash
   git clone https://github.com/your-username/vant-table.git
   cd vant-table
   ```

3. 安装依赖：
   ```bash
   npm install
   ```

4. 启动开发服务器：
   ```bash
   npm run dev:example
   ```

## 开发流程

### 分支策略

- `main` - 主分支，包含稳定的发布版本
- `develop` - 开发分支，包含最新的开发功能
- `feature/*` - 功能分支
- `fix/*` - 修复分支

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
type(scope): description

[optional body]

[optional footer]
```

类型：
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式（不影响代码含义）
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat(table): add sorting functionality
fix(selection): resolve checkbox alignment issue
docs: update API documentation
```

## 测试

在提交 PR 前，请确保：

1. 运行类型检查：
   ```bash
   npm run type-check
   ```

2. 运行测试：
   ```bash
   npm run test:run
   ```

3. 构建成功：
   ```bash
   npm run build
   ```

## 代码风格

- 使用 TypeScript
- 遵循 Vue 3 Composition API 最佳实践
- 保持代码简洁和可读性

## Pull Request

1. 确保您的分支是基于最新的 `develop` 分支
2. 提供清晰的 PR 描述
3. 包含相关的测试
4. 更新相关文档

## 报告问题

如果您发现了 bug 或有功能建议：

1. 检查是否已有相关的 issue
2. 使用 issue 模板创建新的 issue
3. 提供详细的重现步骤和环境信息

## 许可证

通过贡献代码，您同意您的贡献将根据 MIT 许可证进行许可。