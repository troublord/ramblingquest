// Writes the list of published post ids for the comment API's slug allowlist.
// Runs before `astro build` and `netlify dev`.
import { writeFile } from 'fs/promises';
import { readPosts } from './lib/posts.mjs';

const OUT_FILE = 'netlify/functions/_shared/post-slugs.json';

const ids = (await readPosts()).map((p) => p.id);

await writeFile(OUT_FILE, JSON.stringify([...new Set(ids)].sort(), null, '\t') + '\n');
console.log(`gen-post-slugs: wrote ${ids.length} slugs to ${OUT_FILE}`);
