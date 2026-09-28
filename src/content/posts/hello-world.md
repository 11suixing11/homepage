---
title: 你好，世界
published: 2026-09-29
description: 博客的第一篇文章——说说这个站点是怎么来的，以及怎么写一篇新文章。
tags: [随笔]
category: 随笔
draft: false
---

欢迎来到我的博客！👋

这是本站的第一篇文章。站点由 [Astro](https://astro.build) 驱动，主题使用开源的 [Fuwari](https://github.com/saicaca/fuwari)。如果你也想要一个这样的博客，可以照着折腾。

## 为什么要有这个博客

写博客最直接的好处是**倒逼输出**：学了新东西，只有能把它讲明白，才算真的学会了。其次，把自己的折腾过程记录下来，日后翻起来会特别省事——很多坑没必要踩第二遍。

## 怎么写一篇新文章

最方便的方式是用模板自带的脚手架：

```bash
pnpm run new-post
```

它会自动生成文件骨架，或者你也可以直接在 `src/content/posts/` 目录下新建一个 `.md` 文件，手动写好头部元信息：

```md
---
title: 文章标题
published: 2026-09-29
description: 一句话摘要（会显示在列表卡片上）
tags: [随笔, 教程]
category: 随笔
draft: false
---

正文内容（Markdown）……
```

几个约定：

- `published` 决定排序，越新越靠前；
- `tags` 会自动聚合成标签云，`category` 是分类；
- `image` 可以设置封面图（支持相对路径、`/public` 路径或网络图片）；
- `draft: true` 的文章不会发布；
- 文件名就是文章 URL，例如 `hello-world.md` → `/posts/hello-world/`。

## 接下来的计划

- [ ] 把关于页和头像换成自己的
- [ ] 加上评论系统
- [ ] 折腾一些好玩的页面

> 建站的乐趣一半在于折腾本身。慢慢来，比较快。
