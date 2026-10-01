import { describe, expect, it } from 'vitest';
import { updateJSON } from './atomic-json.ts';
import { rateLimitKey } from './client-ip.ts';
import { EMBED_FIELD_VALUE_MAX, splitIntoFields, truncate } from './discord.ts';
import { isAdminRequest } from './admin-auth.ts';
import { FakeStore } from './test-store.ts';

describe('updateJSON', () => {
	it('creates the key when it does not exist', async () => {
		const store = new FakeStore();
		const result = await updateJSON<number[], number>(store, 'k', (cur) => ({ write: [...(cur ?? []), 1], value: 1 }));
		expect(result).toEqual({ status: 'written', value: 1 });
		expect(store.peek('k')).toEqual([1]);
	});

	it('loses no update under concurrent appends', async () => {
		const store = new FakeStore();
		await Promise.all(
			Array.from({ length: 10 }, (_, i) =>
				updateJSON<number[], null>(store, 'k', (cur) => ({ write: [...(cur ?? []), i], value: null }), 50),
			),
		);
		expect((store.peek('k') as number[]).sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});

	it('returns skipped without writing', async () => {
		const store = new FakeStore();
		const result = await updateJSON(store, 'k', () => ({ skip: 'nope' }));
		expect(result).toEqual({ status: 'skipped', value: 'nope' });
		expect(store.peek('k')).toBeUndefined();
	});

	it('gives up with conflict after the attempt budget', async () => {
		const store = new FakeStore();
		await store.setJSON('k', []);
		// Another writer changes the key between every read and write.
		const result = await updateJSON<number[], null>(
			store,
			'k',
			(cur) => {
				void store.setJSON('k', [...(cur ?? []), -1]);
				return { write: [...(cur ?? []), 1], value: null };
			},
			3,
		);
		expect(result).toEqual({ status: 'conflict' });
	});
});

describe('updateJSON without ETags (netlify dev emulator)', () => {
	const noEtagStore = () => {
		const store = new FakeStore();
		const read = store.getWithMetadata.bind(store);
		store.getWithMetadata = async (key: string) => {
			const r = await read(key);
			return r ? { data: r.data, etag: undefined as unknown as string } : null;
		};
		return store;
	};

	it('fails closed outside local dev', async () => {
		const store = noEtagStore();
		await store.setJSON('k', [0]);
		const result = await updateJSON<number[], null>(store, 'k', (cur) => ({ write: [...(cur ?? []), 1], value: null }), 3, false);
		expect(result).toEqual({ status: 'conflict' });
		expect(store.peek('k')).toEqual([0]);
	});

	it('writes unconditionally when local dev is allowed', async () => {
		const store = noEtagStore();
		await store.setJSON('k', [0]);
		const result = await updateJSON<number[], null>(store, 'k', (cur) => ({ write: [...(cur ?? []), 1], value: null }), 3, true);
		expect(result).toEqual({ status: 'written', value: null });
		expect(store.peek('k')).toEqual([0, 1]);
	});
});

describe('rateLimitKey', () => {
	it('keeps IPv4 as-is', () => {
		expect(rateLimitKey('198.51.100.7')).toBe('198.51.100.7');
		expect(rateLimitKey('unknown')).toBe('unknown');
	});

	it('groups IPv6 addresses by /64', () => {
		expect(rateLimitKey('2001:db8:1:2:aaaa::1')).toBe('2001:0db8:0001:0002::/64');
		expect(rateLimitKey('2001:db8:1:2:ffff:ffff:ffff:ffff')).toBe('2001:0db8:0001:0002::/64');
		expect(rateLimitKey('2001:DB8:1:2::')).toBe('2001:0db8:0001:0002::/64');
		expect(rateLimitKey('::1')).toBe('0000:0000:0000:0000::/64');
	});

	it('falls back to the raw string for malformed IPv6', () => {
		expect(rateLimitKey('1:2:3')).toBe('1:2:3');
		expect(rateLimitKey('zz::1')).toBe('zz::1');
	});
});

describe('discord helpers', () => {
	it('truncates by code point with an ellipsis', () => {
		expect(truncate('abc', 5)).toBe('abc');
		expect(truncate('abcdef', 4)).toBe('abc…');
		expect(Array.from(truncate('留'.repeat(300), 256))).toHaveLength(256);
	});

	it('splits long text into fields within the limit without dropping anything', () => {
		const text = 'x'.repeat(2000);
		const fields = splitIntoFields('訊息', text);
		expect(fields.map((f) => f.name)).toEqual(['訊息 (1/2)', '訊息 (2/2)']);
		expect(fields.every((f) => f.value.length <= EMBED_FIELD_VALUE_MAX)).toBe(true);
		expect(fields.map((f) => f.value).join('')).toBe(text);
		expect(splitIntoFields('訊息', 'short')).toEqual([{ name: '訊息', value: 'short' }]);
	});
});

describe('isAdminRequest', () => {
	const req = (secret?: string) =>
		new Request('https://example.test/', secret === undefined ? {} : { headers: { 'x-admin-secret': secret } });

	it('accepts only the exact secret', () => {
		expect(isAdminRequest(req('s3cret'), 's3cret')).toBe(true);
		expect(isAdminRequest(req('s3cre'), 's3cret')).toBe(false);
		expect(isAdminRequest(req('s3cret!'), 's3cret')).toBe(false);
	});

	it('fails closed when the header or the configured secret is missing', () => {
		expect(isAdminRequest(req(), 's3cret')).toBe(false);
		expect(isAdminRequest(req(''), 's3cret')).toBe(false);
		expect(isAdminRequest(req('anything'), undefined)).toBe(false);
		expect(isAdminRequest(req(''), '')).toBe(false);
	});
});
