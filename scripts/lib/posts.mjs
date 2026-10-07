// Reads blog frontmatter outside Astro (build scripts, astro.config) where astro:content isn't available.
// Mirrors Astro's glob loader default id: each path segment through github-slugger,
// extension dropped, trailing /index removed; a frontmatter `slug:` overrides it.
import { readdir, readFile } from 'fs/promises';
import { join, relative, sep, extname } from 'path';
import { slug } from 'github-slugger';

const CONTENT_DIR = 'src/content/blog';

async function walk(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])),
	);
	return files.flat();
}

function field(frontmatter, name) {
	return frontmatter.match(new RegExp(`^${name}:\s*['"]?(.+?)['"]?\s*$`, 'm'))?.[1];
}

export async function readPosts() {
	const files = (await walk(CONTENT_DIR)).filter((f) => ['.md', '.mdx'].includes(extname(f)));

	return Promise.all(
		files.map(async (file) => {
			const fm = (await readFile(file, 'utf8')).match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
			const rel = relative(CONTENT_DIR, file).slice(0, -extname(file).length);
			const id =
				field(fm, 'slug') ?? rel.split(sep).map((segment) => slug(segment)).join('/').replace(/\/index$/, '');
			const pubDate = field(fm, 'pubDate');
			const updatedDate = field(fm, 'updatedDate');
			// tags 慣例是單行陣列：tags: ['a', 'b']
			const tagsLine = fm.match(/^tags:\s*\[(.*)\]\s*$/m)?.[1] ?? '';
			const tags = [...tagsLine.matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);

			return {
				id,
				pubDate: pubDate ? new Date(pubDate) : undefined,
				updatedDate: updatedDate ? new Date(updatedDate) : undefined,
				tags,
			};
		}),
	);
}
