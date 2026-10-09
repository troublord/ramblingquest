// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { readPosts } from './scripts/lib/posts.mjs';
import { MIN_INDEXED_TAG_POSTS } from './src/consts.ts';

const posts = await readPosts();
const postLastmod = new Map(posts.map((p) => [p.id, p.updatedDate ?? p.pubDate]));
const tagCounts = new Map();
for (const tag of posts.flatMap((p) => p.tags)) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);

// https://astro.build/config
export default defineConfig({
	site: 'https://ramblingquest.com',
	// canonical、sitemap、站內連結統一帶結尾斜線，避免 Netlify 多一次 301
	trailingSlash: 'always',
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => {
				if (page.includes('/admin')) return false;
				const tag = decodeURIComponent(page).match(/\/blog\/tag\/([^/]+)\//)?.[1];
				return !tag || (tagCounts.get(tag) ?? 0) >= MIN_INDEXED_TAG_POSTS;
			},
			serialize(item) {
				const id = decodeURIComponent(new URL(item.url).pathname).match(/^\/blog\/([^/]+)\/$/)?.[1];
				const lastmod = id && postLastmod.get(id);
				if (lastmod && !Number.isNaN(lastmod.valueOf())) item.lastmod = lastmod.toISOString();
				return item;
			},
		}),
	],
	vite: {
		build: {
			rollupOptions: {
				external: ['/pagefind/pagefind.js'],
			},
		},
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
