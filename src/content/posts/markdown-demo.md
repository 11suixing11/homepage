---
title: Markdown 排版示例
published: 2026-09-29
description: 标题、列表、引用、表格、代码高亮、数学公式、提示框——一篇文章的排版元素在这里都能找到，可当作写作模板使用。
tags: [教程, Markdown]
category: 教程
draft: false
---

这篇文章演示站点支持的 Markdown 排版元素，写新文章时可以直接复制这里的语法。

## 文字排版

**加粗**、*斜体*、`行内代码`、~~删除线~~，以及 [链接](https://astro.build)。还可以把内容 :spoiler[隐藏起来 **像这样**]！

> 引用块：这里可以放一段名人名言，或者重要提示。
> 引用可以有多行。

## 列表

无序列表：

- 项目一
- 项目二
  - 嵌套项目

有序列表：

1. 第一步
2. 第二步
3. 第三步

任务列表（构建后会渲染成复选框样式）：

- [x] 已完成的事
- [ ] 待办的事

## 提示框（Admonitions）

支持五种类型：`note` `tip` `important` `warning` `caution`：

:::note
提示信息，阅读时也不应该错过。
:::

:::tip[自定义标题]
提示框的标题可以自定义。
:::

:::warning
警告：这里是需要特别注意的内容。
:::

也支持 GitHub 风格语法：

> [!TIP]
> `> [!NOTE]` / `> [!TIP]` 这种写法同样有效。

## 代码高亮

代码块基于 [Expressive Code](https://expressive-code.com/)，支持文件名标题、行号和终端样式，配色跟随站点深浅色：

```ts title="example.ts"
// TypeScript
interface Post {
  title: string;
  tags: string[];
}

export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.title.localeCompare(a.title));
}
```

```bash title="常用命令"
pnpm run dev      # 开发
pnpm run build    # 构建 + 搜索索引
pnpm run preview  # 预览构建产物
```

## 表格

| 命令 | 说明 |
| ---- | ---- |
| `pnpm run dev` | 启动开发服务器 |
| `pnpm run new-post` | 新建文章脚手架 |
| `pnpm run build` | 构建 + 生成搜索索引 |

## 数学公式

数学公式由 KaTeX 渲染：

行内公式：质能方程 $E = mc^2$。

块级公式：

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$

## GitHub 仓库卡片

正文里可以嵌入 GitHub 仓库卡片（加载时从 GitHub API 拉取信息）：

::github{repo="saicaca/fuwari"}

## 分隔线

---

以上就是全部常用元素，写文章时直接对照抄语法即可。
