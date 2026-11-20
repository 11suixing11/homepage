<script lang="ts">
	import Icon from "@iconify/svelte";
	import { onMount } from "svelte";
	import type { PostForList } from "../utils/content-utils";
	import { formatDateToYYYYMMDD } from "../utils/date-utils";
	import { getCategoryUrl, getPostUrlBySlug, getTagUrl, url } from "../utils/url-utils";

	let { sortedPosts }: { sortedPosts: PostForList[] } = $props();
	let params = $state(new URLSearchParams());

	const categories = $derived([...new Set(sortedPosts.flatMap(({ data }) => data.category ? [data.category] : []))]
		.sort((first, second) => first.localeCompare(second, "zh-CN")));
	const tags = $derived([...new Set(sortedPosts.flatMap(({ data }) => data.tags))]
		.sort((first, second) => first.localeCompare(second, "zh-CN")));
	const unclassified = $derived(sortedPosts.some(({ data }) => !data.category));
	const activeCategories = $derived(params.getAll("category"));
	const activeTags = $derived(params.getAll("tag"));
	const onlyUnclassified = $derived(params.has("uncategorized"));
	const filtered = $derived(activeCategories.length > 0 || activeTags.length > 0 || onlyUnclassified);

	const groups = $derived.by(() => {
		const postsByYear = new Map<string, PostForList[]>();
		for (const post of sortedPosts) {
			const { category, tags, published } = post.data;
			if (activeCategories.length && (!category || !activeCategories.includes(category))) continue;
			if (activeTags.length && !tags.some((tag) => activeTags.includes(tag))) continue;
			if (onlyUnclassified && category) continue;
			const year = formatDateToYYYYMMDD(published).slice(0, 4);
			const group = postsByYear.get(year);
			if (group) group.push(post);
			else postsByYear.set(year, [post]);
		}
		return [...postsByYear];
	});

	onMount(() => {
		const readFilters = () => { params = new URLSearchParams(window.location.search); };
		readFilters();
		document.addEventListener("swup:page:view", readFilters);
		window.addEventListener("popstate", readFilters);
		return () => {
			document.removeEventListener("swup:page:view", readFilters);
			window.removeEventListener("popstate", readFilters);
		};
	});
</script>

<div class="archive">
	<nav class="filter-links" aria-label="按分类查看文章">
		<a href={url("/archive/")} aria-current={!filtered ? "true" : undefined}>全部</a>
		{#each categories as category (category)}
			<a href={getCategoryUrl(category)} aria-current={activeCategories.includes(category) ? "true" : undefined}>{category}</a>
		{/each}
		{#if unclassified}
			<a href={getCategoryUrl(null)} aria-current={onlyUnclassified ? "true" : undefined}>未分类</a>
		{/if}
	</nav>

	{#if tags.length}
		<details class="tag-filter" open={activeTags.length > 0}>
			<summary>按标签查看</summary>
			<nav class="filter-links" aria-label="按标签查看文章">
				{#each tags as tag (tag)}
					<a href={getTagUrl(tag)} aria-current={activeTags.includes(tag) ? "true" : undefined}>{tag}</a>
				{/each}
			</nav>
		</details>
	{/if}

	{#each groups as [year, posts] (year)}
		<section aria-labelledby={`archive-${year}`} class="archive-year">
			<h2 id={`archive-${year}`}>{year}</h2>
			<ul class="site-card archive-list">
				{#each posts as post (post.slug)}
					<li>
						<a class="archive-item" href={getPostUrlBySlug(post.slug)}>
							<time datetime={formatDateToYYYYMMDD(post.data.published)}>{formatDateToYYYYMMDD(post.data.published).slice(5)}</time>
							<div>
								<h3>{post.data.title}</h3>
								{#if post.data.description}<p>{post.data.description}</p>{/if}
							</div>
							<Icon icon="material-symbols:arrow-forward-rounded" aria-hidden="true" />
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{:else}
		<p class="archive-empty" role="status">没有符合当前筛选条件的文章。</p>
	{/each}
</div>

<style>
	.filter-links { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
	.filter-links a { padding: 0.5rem 0.75rem; border: 1px solid var(--site-border); border-radius: 0.55rem; color: var(--site-muted); font-size: 0.875rem; line-height: 1.4; }
	.filter-links a:hover { color: var(--primary); background: var(--site-hover); }
	.filter-links a[aria-current="true"] { border-color: var(--primary); background: var(--site-hover); color: var(--primary); font-weight: 700; }
	.tag-filter { margin-top: 0.9rem; color: var(--site-muted); font-size: 0.875rem; }
	.tag-filter summary { cursor: pointer; width: max-content; padding: 0.3rem 0; }
	.tag-filter nav { margin-top: 0.55rem; }
	.archive-year { margin-top: 2rem; }
	.archive-year h2 { margin-bottom: 0.7rem; font: 700 1.2rem/1.4 var(--site-mono); }
	.archive-list { padding: 0.5rem; }
	.archive-list > li + li { border-top: 1px solid var(--site-border); }
	.archive-item { display: grid; grid-template-columns: 4.25rem minmax(0, 1fr) auto; align-items: start; gap: 0.5rem; padding: 0.95rem; border-radius: 0.5rem; }
	.archive-item:hover { background: var(--site-hover); }
	.archive-item time { padding-top: 0.23rem; font: 0.8rem/1.4 var(--site-mono); color: var(--site-muted); }
	.archive-item h3 { font-size: 1.04rem; font-weight: 700; line-height: 1.55; }
	.archive-item p { margin-top: 0.3rem; font-size: 0.875rem; line-height: 1.6; color: var(--site-muted); }
	.archive-item :global(svg) { margin-top: 0.2rem; color: var(--primary); }
	.archive-empty { padding: 2rem 0; color: var(--site-muted); }

	@media (max-width: 540px) {
		.archive-item { grid-template-columns: minmax(0, 1fr) auto; }
		.archive-item time { grid-column: 1 / -1; padding-top: 0; }
	}
</style>
