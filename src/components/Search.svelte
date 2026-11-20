<script lang="ts">
	import { onMount, type Snippet } from "svelte";
	import type { SearchResult } from "@/global";
	import { url } from "../utils/url-utils";

	interface PagefindIndex {
		search: Window["pagefind"]["search"];
		options: (options: { baseUrl: string; excerptLength: number }) => Promise<void>;
	}

	let { label, searchIcon, closeIcon }: { label: string; searchIcon?: Snippet; closeIcon?: Snippet } = $props();
	let dialog: HTMLDialogElement;
	let searchField: HTMLInputElement;
	let ready = $state(false);
	let results = $state<SearchResult[]>([]);
	let message = $state("");
	let indexPromise: Promise<PagefindIndex> | undefined;
	let requestId = 0;

	onMount(() => { ready = true; });

	function loadIndex() {
		indexPromise ??= import(/* @vite-ignore */ url("/pagefind/pagefind.js"))
			.then(async (index: PagefindIndex) => {
				await index.options({ baseUrl: url("/"), excerptLength: 18 });
				return index;
			})
			.catch((error) => {
				indexPromise = undefined;
				throw error;
			});
		return indexPromise;
	}

	function openSearch() {
		dialog.showModal();
		searchField.focus();
	}

	async function search(value: string) {
		const keyword = value.trim();
		const id = ++requestId;
		results = [];
		if (!keyword) {
			message = "";
			return;
		}
		if (import.meta.env.DEV) {
			message = "构建站点后，可在预览中使用搜索。";
			return;
		}

		message = "搜索中…";
		try {
			const index = await loadIndex();
			const response = await index.search(keyword);
			if (id !== requestId) return;
			const matches = await Promise.all(response.results.slice(0, 10).map((match) => match.data()));
			if (id !== requestId) return;
			results = matches;
			message = matches.length === 0 ? "没有匹配的文章。" : "";
		} catch {
			if (id === requestId) message = "暂时无法载入搜索索引，请重新输入关键词再试。";
		}
	}
</script>

<button class="btn-plain search-button" type="button" aria-label={label} aria-haspopup="dialog" disabled={!ready} onclick={openSearch}>
	{@render searchIcon?.()}
</button>

<dialog bind:this={dialog} aria-labelledby="site-search-title" class="site-search">
	<div class="search-heading">
		<h2 id="site-search-title">{label}</h2>
		<form method="dialog">
			<button type="submit" class="btn-plain search-button" aria-label="关闭搜索">
				{@render closeIcon?.()}
			</button>
		</form>
	</div>
	<input bind:this={searchField} type="search" aria-label="搜索关键词" placeholder="输入文章关键词" oninput={(event) => search(event.currentTarget.value)} />
	{#if message}<p role="status" class="search-message">{message}</p>{/if}
	{#if results.length}
		<ul class="search-results" aria-label="搜索结果">
			{#each results as item (item.url)}
				<li>
					<a href={item.url} onclick={() => dialog.close()}>
						<strong>{item.meta.title}</strong>
						<span>{@html item.excerpt}</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</dialog>

<style>
	.search-button { width: 2.75rem; height: 2.75rem; border-radius: 0.55rem; font-size: 1.25rem; }
	.search-button:disabled { cursor: progress; opacity: 0.6; }
	.site-search {
		position: fixed;
		inset: clamp(2rem, 12vh, 6rem) 0 auto;
		width: min(36rem, calc(100% - 2rem));
		max-height: 75vh;
		margin: 0 auto;
		padding: clamp(1rem, 3vw, 1.5rem);
		border: 1px solid var(--site-border);
		border-radius: 1.1rem;
		background: var(--card-bg);
		color: var(--site-ink);
		box-shadow: 0 1rem 3rem #10181145;
	}
	.site-search::backdrop { background: #111c15b0; }
	.search-heading { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; }
	.search-heading h2 { font-size: 1.25rem; font-weight: 700; }
	.site-search input { width: 100%; min-height: 2.75rem; border: 1px solid var(--site-border); border-radius: 0.55rem; background: var(--page-bg); padding: 0.6rem 0.75rem; }
	.search-message { padding-top: 1rem; color: var(--site-muted); font-size: 0.875rem; }
	.search-results { margin-top: 0.8rem; }
	.search-results a { display: block; padding: 0.75rem; border-radius: 0.55rem; }
	.search-results a:hover { background: var(--site-hover); }
	.search-results a strong { display: block; color: var(--primary); }
	.search-results a span { display: block; margin-top: 0.3rem; color: var(--site-muted); font-size: 0.875rem; line-height: 1.55; }
	.search-results :global(mark) { background: var(--selection-bg); color: inherit; }
</style>
