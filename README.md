# myblog

基于 [Astro](https://astro.build) + [Fuwari](https://github.com/saicaca/fuwari) 主题的个人博客。
设计参考：[hongshi.cc.cd](https://hongshi.cc.cd/)（Hexo Solitude 风格）。

## 常用命令（用 pnpm，模板 preinstall 强制）

| 命令 | 说明 |
| --- | --- |
| `pnpm install` | 安装依赖 |
| `pnpm run dev` | 开发服务器（http://localhost:4321） |
| `pnpm run new-post` | 新建文章脚手架 |
| `pnpm run build` | 构建 + 生成 Pagefind 搜索索引 |
| `pnpm run preview` | 预览构建产物（搜索功能可用） |
| `pnpm run format` / `lint` | Biome 格式化 / 检查 |

## 写文章

用 `pnpm run new-post` 或在 `src/content/posts/` 下新建 Markdown：

```md
---
title: 文章标题
published: 2026-09-29
description: 一句话摘要
image: ./cover.jpg   # 可选封面图
tags: [随笔, 教程]
category: 随笔
draft: false
---

正文……
```

排版语法（提示框、数学公式、GitHub 卡片等）参见站内文章《Markdown 排版示例》。

## 自定义清单

| 文件 | 用途 |
| --- | --- |
| `src/config.ts` | ★ 站名 / 语言 / 导航 / 个人资料 / 主题色 hue |
| `src/content/posts/` | ★ 文章 |
| `src/content/spec/about.md` | 关于页内容 |
| `src/assets/images/` | 头像（demo-avatar.png）、横幅图 |
| `astro.config.mjs` | site 域名（部署前必改） |
| `.backup-v0.1.0/` | 旧自建框架备份，确认不需要后可删 |

## 站内功能

Pagefind 搜索（构建后可用）、RSS（`/rss.xml`）、sitemap、KaTeX 数学公式、
Expressive Code 代码高亮、GitHub 仓库卡片、提示框、swup 页面过渡、
深浅色模式 + 主题色相调节。

## 炫彩增强包 v2

| 效果 | 位置 | 单独关闭方式 |
| --- | --- | --- |
| 极光横幅大图 + 流动光幕 | `src/config.ts` 的 `banner` / `bling.css` §4 | `enable: false` / 注释段落 |
| 站名/侧栏名字彩虹流光 | `src/styles/bling.css` §1 | 注释对应段落 |
| 卡片常驻淡彩虹描边 + 悬浮旋转发光 | `src/styles/bling.css` §2 | 注释对应段落 |
| 全屏极光色雾背景（深色更浓） | `src/styles/bling.css` §3 | 注释对应段落 |
| 滚动条彩虹渐变 | `src/styles/bling.css` §5 | 注释对应段落 |
| 光点星尘 + 深色流星雨 + 鼠标彩色光晕 | `src/components/Effects.astro` | 删掉 Layout.astro 里的 `<Effects />` |
| 点击彩色粒子 + 双色扩散波纹 | `src/components/Effects.astro` | 同上 |

访客开启系统"减弱动画"时全部动画自动关闭。
横幅图为 AI 生成（极光星空风），想换图直接替换 `src/assets/images/banner.png`。

Fuwari 官方文档：<https://github.com/saicaca/fuwari/tree/main/docs>
