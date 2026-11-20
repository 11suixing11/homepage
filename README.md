# core 的工程笔记

[@11suixing11](https://github.com/11suixing11) 的个人博客，记录本地工具、浏览器白板、在线评测与开源开发。站点基于 [Astro](https://astro.build) 和 [Fuwari](https://github.com/saicaca/fuwari)。

<https://11suixing11.github.io/homepage/>

## 运行和检查

使用 Node.js 22 或更新版本，以及 `package.json` 指定的 pnpm 版本。

```sh
pnpm install --frozen-lockfile
pnpm run dev
pnpm run check
pnpm run build
pnpm run preview
```

`pnpm run build` 构建页面并生成 Pagefind 索引。用 `pnpm run preview` 可以体验搜索。

## 更新内容

| 位置 | 内容 |
| --- | --- |
| `src/config.ts` | 显示名、GitHub 账号、站点介绍和导航 |
| `src/content/portfolio.ts` | 首页与项目页共用的项目资料、源码链接和精选上游 PR |
| `src/content/spec/about.md` | 关于页正文 |
| `src/content/posts/` | 文章与元数据 |

执行 `pnpm run new-post` 生成 Markdown 骨架。文件名决定文章地址，`published` 决定排序，分类和标签可在文章归档中筛选。草稿用 `draft: true` 标记。文章支持 KaTeX、提示框和代码高亮。

首页项目星图由本站代码生成 SVG；项目切换读取同一份项目资料，不请求外部接口。视觉灵感来自 [Remit Race](https://motionsites.ai/?prompt=remit-race)，未使用其素材。

## 部署

推送到 `main` 会通过 `.github/workflows/deploy.yml` 构建并部署到 GitHub Pages。流程使用 `BASE_PATH=/homepage/`，产物包括文章、RSS、站点地图和搜索索引。
