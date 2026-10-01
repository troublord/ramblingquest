import type { JSONStore } from './atomic-json.ts';

// In-memory stand-in for a Netlify Blobs store that honours onlyIfMatch / onlyIfNew.
// Every call yields to the event loop so concurrent callers genuinely interleave.
export class FakeStore implements JSONStore {
	private entries = new Map<string, { data: unknown; etag: string }>();
	private version = 0;

	async getWithMetadata(key: string) {
		await new Promise((r) => setTimeout(r, 0));
		const entry = this.entries.get(key);
		return entry ? { data: structuredClone(entry.data), etag: entry.etag } : null;
	}

	async get(key: string) {
		return (await this.getWithMetadata(key))?.data ?? null;
	}

	async setJSON(key: string, data: unknown, options?: { onlyIfMatch?: string; onlyIfNew?: boolean }) {
		await new Promise((r) => setTimeout(r, 0));
		const entry = this.entries.get(key);
		if (options?.onlyIfNew && entry) return { modified: false };
		if (options?.onlyIfMatch !== undefined && entry?.etag !== options.onlyIfMatch) return { modified: false };
		this.entries.set(key, { data: structuredClone(data), etag: `"${++this.version}"` });
		return { modified: true };
	}

	async list() {
		return { blobs: [...this.entries.keys()].map((key) => ({ key, etag: this.entries.get(key)!.etag })), directories: [] };
	}

	peek(key: string) {
		return this.entries.get(key)?.data;
	}
}
