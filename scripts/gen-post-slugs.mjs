// Writes the list of published post ids for the comment API's slug allowlist.
// Mirrors Astro's glob loader default id: each path segment through github-slugger,
// extension dropped, trailing /index removed. Runs before `astro build` and `netlify dev`.
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, relative, sep, extname } from 'path';
import { slug } from 'github-slugger';

const CONTENT_DIR = 'src/content/blog';
const OUT_FILE = 'netlify/functions/_shared/post-slugs.json';

async function walk(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])),
	);
	return files.flat();
}

const files = (await walk(CONTENT_DIR)).filter((f) => ['.md', '.mdx'].includes(extname(f)));

const ids = await Promise.all(
	files.map(async (file) => {
		// A frontmatter `slug:` overrides the generated id in Astro.
		const fm = (await readFile(file, 'utf8')).match(/^---\r?\n([\s\S]*?)\r?\n---/);
		const override = fm?.[1].match(/^slug:\s*['"]?(.+?)['"]?\s*$/m);
		if (override) return override[1];

		const rel = relative(CONTENT_DIR, file).slice(0, -extname(file).length);
		return rel.split(sep).map((segment) => slug(segment)).join('/').replace(/\/index$/, '');
	}),
);

await writeFile(OUT_FILE, JSON.stringify([...new Set(ids)].sort(), null, '\t') + '\n');
console.log(`gen-post-slugs: wrote ${ids.length} slugs to ${OUT_FILE}`);
