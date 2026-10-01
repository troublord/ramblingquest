import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeStore } from '../_shared/test-store.ts';
import postSlugs from '../_shared/post-slugs.json' with { type: 'json' };

const stores = new Map<string, FakeStore>();
vi.mock('@netlify/blobs', () => ({
	getStore: ({ name }: { name: string }) => {
		if (!stores.has(name)) stores.set(name, new FakeStore());
		return stores.get(name);
	},
}));

const { default: comments } = await import('../comments.mts');
const { default: contact } = await import('../contact.mts');
const { default: deleteComment } = await import('../comments-delete.mts');

const SLUG = postSlugs[0];
const context = (ip: string, params: Record<string, string> = {}) =>
	({ ip, params, waitUntil: () => {} }) as never;

const postComment = (ip: string, body: unknown = { name: 'dummy', content: 'hello' }, slug = SLUG) =>
	comments(
		new Request(`https://example.test/api/comments?slug=${encodeURIComponent(slug)}`, {
			method: 'POST',
			body: JSON.stringify(body),
		}),
		context(ip),
	);

const statuses = (responses: Response[]) =>
	responses.reduce<Record<number, number>>((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {});

beforeEach(() => {
	stores.clear();
	vi.stubEnv('DISCORD_WEBHOOK_URL', '');
	vi.stubEnv('COMMENT_ADMIN_SECRET', 'test-secret');
});

describe('POST /api/comments', () => {
	it('holds the 5-per-window limit under a concurrent burst from one IP', async () => {
		const responses = await Promise.all(Array.from({ length: 20 }, () => postComment('198.51.100.1')));
		expect(statuses(responses)).toEqual({ 201: 5, 429: 15 });
		expect(stores.get('comments')!.peek(SLUG)).toHaveLength(5);
	});

	it('keeps every accepted comment when different clients post concurrently', async () => {
		const responses = await Promise.all(Array.from({ length: 8 }, (_, i) => postComment(`198.51.100.${i + 10}`)));
		expect(statuses(responses)).toEqual({ 201: 8 });
		expect(stores.get('comments')!.peek(SLUG)).toHaveLength(8);
	});

	it('rejects slugs that are not published posts', async () => {
		const res = await postComment('198.51.100.2', undefined, 'not-a-real-post');
		expect(res.status).toBe(404);
		expect(stores.get('comments')?.peek('not-a-real-post')).toBeUndefined();
	});

	it('rejects non-string fields and a null body with 400 instead of crashing', async () => {
		expect((await postComment('198.51.100.3', { name: 1, content: 'x' })).status).toBe(400);
		expect((await postComment('198.51.100.3', { name: 'x', content: ['x'] })).status).toBe(400);
		expect((await postComment('198.51.100.3', null)).status).toBe(400);
	});
});

describe('DELETE /api/comments/:id', () => {
	it('does not let a concurrent post resurrect the deleted comment', async () => {
		const first = await (await postComment('198.51.100.4')).json();
		const del = deleteComment(
			new Request(`https://example.test/api/comments/${first.comment.id}?slug=${SLUG}`, {
				method: 'DELETE',
				headers: { 'x-admin-secret': 'test-secret' },
			}),
			context('198.51.100.4', { id: first.comment.id }),
		);
		const [delRes, postRes] = await Promise.all([del, postComment('198.51.100.5')]);
		expect(delRes.status).toBe(200);
		expect(postRes.status).toBe(201);
		const remaining = stores.get('comments')!.peek(SLUG) as { id: string }[];
		expect(remaining.map((c) => c.id)).not.toContain(first.comment.id);
		expect(remaining).toHaveLength(1);
	});

	it('rejects a wrong secret', async () => {
		const res = await deleteComment(
			new Request(`https://example.test/api/comments/c_x?slug=${SLUG}`, {
				method: 'DELETE',
				headers: { 'x-admin-secret': 'wrong' },
			}),
			context('198.51.100.6', { id: 'c_x' }),
		);
		expect(res.status).toBe(401);
	});
});

describe('POST /api/contact', () => {
	it('holds the 5-per-window limit under a concurrent burst from one IP', async () => {
		const send = () =>
			contact(
				new Request('https://example.test/api/contact', {
					method: 'POST',
					body: JSON.stringify({ name: 'dummy', email: 'a@b.cd', message: 'hi' }),
				}),
				context('198.51.100.7'),
			);
		const responses = await Promise.all(Array.from({ length: 20 }, send));
		expect(statuses(responses)).toEqual({ 200: 5, 429: 15 });
	});
});
