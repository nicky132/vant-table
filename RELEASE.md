# 发布指南

本项目支持多种发布标签，包括 alpha、beta、rc 等预发布版本，类似于 `@sentry/browser` 的发布方式。

## 发布命令

### 自动化发布脚本（推荐）

使用我们提供的自动化发布脚本，会自动处理版本号、Git 标签、构建和发布：

```bash
# 发布 alpha 版本
npm run release prerelease alpha

# 发布 beta 版本  
npm run release prerelease beta

# 发布 rc 版本
npm run release prerelease rc

# 发布正式补丁版本
npm run release patch

# 发布正式小版本
npm run release minor

# 发布正式大版本
npm run release major
```

### 手动发布命令

如果需要更精细的控制，可以使用以下分步命令：

#### 预发布版本

```bash
# Alpha 版本 (内测)
npm run release:alpha

# Beta 版本 (公测)
npm run release:beta

# RC 版本 (候选)
npm run release:rc
```

#### 正式版本

```bash
# 补丁版本 (bug 修复)
npm run release:patch

# 小版本 (新功能)
npm run release:minor

# 大版本 (重大变更)
npm run release:major
```

## 版本号示例

假设当前版本是 `1.0.0`：

| 命令 | 新版本 | 说明 |
|------|--------|------|
| `npm run release prerelease alpha` | `1.0.1-alpha.0` | Alpha 测试版 |
| `npm run release prerelease beta` | `1.0.1-beta.0` | Beta 测试版 |
| `npm run release prerelease rc` | `1.0.1-rc.0` | 候选发布版 |
| `npm run release patch` | `1.0.1` | 补丁版本 |
| `npm run release minor` | `1.1.0` | 小版本更新 |
| `npm run release major` | `2.0.0` | 大版本更新 |

## 安装指定版本

用户可以通过以下方式安装不同标签的版本：

```bash
# 安装最新正式版本
npm install @cc/vant-table
npm install @cc/vant-table@latest

# 安装最新 alpha 版本
npm install @cc/vant-table@alpha

# 安装最新 beta 版本
npm install @cc/vant-table@beta

# 安装最新 rc 版本
npm install @cc/vant-table@rc

# 安装特定版本
npm install @cc/vant-table@1.0.1-alpha.0
npm install @cc/vant-table@1.0.1
```

## 发布流程说明

自动化发布脚本会执行以下步骤：

1. 检查工作目录是否干净（无未提交的更改）
2. 运行测试套件 (`npm run test:run`)
3. 运行代码检查 (`npm run lint`)
4. 构建项目 (`npm run lib`)
5. 更新版本号
6. 提交版本更改到 Git
7. 创建 Git 标签
8. 推送到远程仓库
9. 发布到 npm

## 发布前检查清单

在执行发布命令前，请确保：

- [ ] 所有代码已提交到 Git
- [ ] 测试全部通过
- [ ] 代码检查无错误
- [ ] 更新日志已准备好
- [ ] 已登录 npm 账户 (`npm login`)

## 排除发布问题

如果发布失败，可能的原因：

1. **Git 工作目录不干净**：提交或暂存所有更改
2. **测试失败**：修复失败的测试
3. **代码检查失败**：运行 `npm run lint` 修复问题
4. **npm 权限不足**：确保已登录且有发布权限
5. **版本号冲突**：检查是否已存在相同版本

## 示例工作流

### 发布 Alpha 版本

```bash
# 1. 确保代码已提交
git add .
git commit -m "feat: add new feature"

# 2. 发布 alpha 版本
npm run release prerelease alpha

# 版本号变为: 1.0.1-alpha.0
# 用户安装: npm install @cc/vant-table@alpha
```

### 发布正式版本

```bash
# 1. 确保代码已提交
git add .
git commit -m "chore: prepare for release"

# 2. 发布正式版本
npm run release patch

# 版本号变为: 1.0.1
# 用户安装: npm install @cc/vant-table@latest
```

## 查看发布历史

```bash
# 查看所有已发布版本
npm view @cc/vant-table versions --json

# 查看特定标签的版本
npm view @cc/vant-table@alpha version
npm view @cc/vant-table@beta version
npm view @cc/vant-table@rc version
```

## 版本文件

每次构建时会自动生成版本信息文件：

- `dist/version.txt` - 包含 Git commit hash
- `dist/version.json` - 包含完整版本信息（包名、版本号、提交信息、构建时间等）

## 发布历史记录

项目会自动维护发布历史，包括：

- Git 标签记录每次发布的代码版本
- npm 版本历史记录所有已发布的包版本
- 构建时间和提交信息记录在版本文件中

## 注意事项

1. **预发布版本**：alpha、beta、rc 版本不会作为默认安装版本
2. **版本排序**：npm 会按照语义化版本规则排序版本
3. **标签管理**：每个标签（alpha、beta、rc、latest）都有独立的版本线
4. **回滚处理**：如需回滚，可以发布新版本或使用 `npm deprecate` 命令