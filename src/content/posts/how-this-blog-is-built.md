---
title: 本站是怎么搭起来的
published: 2026-09-29
description: 从参考站分析到自建框架，再到换用 Fuwari 主题——本站的"建造日志"。
tags: [Astro, 建站]
category: 建站日志
draft: false
---

一切从一个参考站开始：[hongshi.cc.cd](https://hongshi.cc.cd/)（红石の空间站），它使用 Hexo + Solitude 主题搭建。分析之后我选了 **Astro** 而非同款 Hexo——纯内容站点用 Astro 默认零 JS、构建快，Markdown 体验也好。这篇日志记录本站的进化过程。

## 第一版：自建 MVP

先用 Astro 从零搭了一版：首页文章流、文章页（TOC + 代码高亮）、归档、标签、搜索（Pagefind）、深浅色切换、RSS，两栏卡片布局模仿 Solitude 的观感。

## 第二版：换用 Fuwari

自建版功能齐全，但细节打磨是场持久战。于是换成了开源的 Fuwari 主题——中文博客圈最流行的 Astro 主题之一，圆角卡片 + 渐变 + 过渡动画的气质与参考站一脉相承，而且自带：

- 站内搜索（Pagefind）与 RSS、sitemap
- KaTeX 数学公式、Expressive Code 代码高亮
- GitHub 仓库卡片、提示框（Admonitions）、剧透文本
- swup 页面过渡动画、Photoswipe 灯箱
- 主题色自由调节（访客可换色相）

::github{repo="saicaca/fuwari"}

## 目录速览

```
src/
├── config.ts          ★ 站点配置（站名/语言/导航/个人资料/主题色）
├── content/
│   ├── posts/         ★ 文章（Markdown）
│   └── spec/          关于页等内容
├── assets/images/     头像、横幅图
└── ...
```

带 ★ 的是日常最常改的地方。

## 一些经验

- **选主题就是选生态**：Fuwari 用 pnpm 管理（`preinstall` 有 only-allow 校验），务必 `pnpm install`；
- **中文标签路由**：静态托管会把 URL 解码一次再映射文件，所以生成链接时 `encodeURIComponent`，而生成路由目录时要用原始中文；
- **搜索索引是构建产物**：Pagefind 在 `astro build` 之后生成，开发模式下站内搜索不可用属正常现象。

## 下一步

评论系统、友链页、自定义头像与横幅……按需添加。底盘是成熟主题，往上加装东西都快。
