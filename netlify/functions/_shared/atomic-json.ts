// Minimal slice of the Netlify Blobs Store API, so tests can pass an in-memory fake.
export interface JSONStore {
	getWithMetadata(
		key: string,
		options: { type: 'json'; consistency: 'strong' },
	): Promise<{ data: unknown; etag?: string } | null>;
	setJSON(
		key: string,
		data: unknown,
		options?: { onlyIfMatch: string } | { onlyIfNew: true },
	): Promise<{ modified: boolean }>;
}

export type UpdateStep<T, R> = { write: T; value: R } | { skip: R };

export type UpdateOutcome<R> =
	| { status: 'written'; value: R }
	| { status: 'skipped'; value: R }
	| { status: 'conflict' };

const DEFAULT_ATTEMPTS = 8;

// Random, growing pause so writers that lost the same race don't retry in lockstep.
const backoff = (attempt: number) => new Promise((r) => setTimeout(r, Math.random() * 15 * (attempt + 1)));

// Read-modify-write on one key that never loses a concurrent update: each write is
// conditional on the ETag we read (or on the key still not existing), and a lost race
// re-reads and re-applies `step` to the fresh value. `step` must be pure — it can run
// more than once.
export async function updateJSON<T, R>(
	store: JSONStore,
	key: string,
	step: (current: T | null) => UpdateStep<T, R>,
	attempts: number = DEFAULT_ATTEMPTS,
	allowUnconditional: boolean = process.env.NETLIFY_DEV === 'true',
): Promise<UpdateOutcome<R>> {
	for (let i = 0; i < attempts; i++) {
		if (i > 0) await backoff(i);
		const current = await store.getWithMetadata(key, { type: 'json', consistency: 'strong' });
		const next = step((current?.data as T | undefined) ?? null);
		if ('skip' in next) return { status: 'skipped', value: next.skip };

		if (current && !current.etag) {
			// The `netlify dev` Blobs emulator (as of @netlify/blobs 10.7.9) returns no ETag on
			// reads, so locally we fall back to a plain write. Production always returns one;
			// if it ever doesn't, fail closed rather than silently lose atomicity.
			if (!allowUnconditional) return { status: 'conflict' };
			console.warn(`[updateJSON] no ETag for "${key}"; writing unconditionally (local dev only)`);
			await store.setJSON(key, next.write);
			return { status: 'written', value: next.value };
		}
		const condition = current ? { onlyIfMatch: current.etag as string } : { onlyIfNew: true as const };
		const { modified } = await store.setJSON(key, next.write, condition);
		if (modified) return { status: 'written', value: next.value };
	}
	return { status: 'conflict' };
}
