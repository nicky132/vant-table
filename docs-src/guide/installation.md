# 安装

## 环境要求

- Node.js >= 16.0.0
- Vue >= 3.2.47
- Vant >= 4.0.0

## 包管理器安装

::: code-group

```bash [npm]
npm install @nicky132/vant-table
```

```bash [yarn]
yarn add @nicky132/vant-table
```

```bash [pnpm]
pnpm add @nicky132/vant-table
```

:::

## 安装依赖

VantTable 依赖于 Vue 3 和 Vant UI，请确保你的项目中已经安装了这些依赖：

```bash
npm install vue@^3.2.47 vant@^4.0.0
```

## CDN 引入

如果你更倾向于通过 CDN 引入，可以使用以下方式：

```html
<!-- Vue 3 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<!-- Vant -->
<script src="https://unpkg.com/vant@4/lib/vant.min.js"></script>
<link rel="stylesheet" href="https://unpkg.com/vant@4/lib/index.css">
<!-- VantTable -->
<script src="https://unpkg.com/@nicky132/vant-table/dist/index.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@nicky132/vant-table/dist/index.css">
```

::: warning 注意
通过 CDN 引入的方式不推荐在生产环境使用，因为无法享受到模块化构建的优势。
:::

## 版本说明

VantTable 遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **主版本号**：当做了不兼容的 API 修改
- **次版本号**：当做了向下兼容的功能性新增
- **修订号**：当做了向下兼容的 Bug 修复

你可以在 [发布页面](https://github.com/nicky132/vant-table/releases) 查看所有版本的更新日志。

## 下一步

安装完成后，让我们开始 [快速开始](./getting-started) 你的第一个 VantTable！