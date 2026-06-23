import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

export const config: Config = {
	path: '/api/comments',
};

type Comment = {
	id: string;
	name: string;
	content: string;
	createdAt: string;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MAX_NAME_LENGTH = 60;
const MAX_CONTENT_LENGTH = 2000;
const MAX_LINKS = 2;

function getClientIp(req: Request, context: Context): string {
	return context.ip ?? req.headers.get('x-nf-client-connection-ip') ?? 'unknown';
}

function countLinks(text: string): number {
	return (text.match(/https?:\/\//gi) ?? []).length;
}

export default async (req: Request, context: Context) => {
	const url = new URL(req.url);
	const slug = url.searchParams.get('slug');

	if (!slug) {
		return Response.json({ error: 'Missing slug' }, { status: 400 });
	}

	const commentsStore = getStore({ name: 'comments' });

	if (req.method === 'GET') {
		const comments = ((await commentsStore.get(slug, { type: 'json' })) as Comment[] | null) ?? [];
		return Response.json({ comments });
	}

	if (req.method === 'POST') {
		let body: { name?: string; content?: string; website?: string };
		try {
			body = await req.json();
		} catch {
			return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
		}

		const { name, content, website } = body;

		// Honeypot field is hidden from real users via CSS; bots that fill every field trip it.
		if (website) {
			return Response.json({ error: 'Invalid submission' }, { status: 400 });
		}
		if (!name?.trim() || !content?.trim()) {
			return Response.json({ error: 'Missing name or content' }, { status: 400 });
		}
		if (name.length > MAX_NAME_LENGTH) {
			return Response.json({ error: 'Name too long' }, { status: 400 });
		}
		if (content.length > MAX_CONTENT_LENGTH) {
			return Response.json({ error: 'Content too long' }, { status: 400 });
		}
		if (countLinks(content) > MAX_LINKS) {
			return Response.json({ error: 'Too many links' }, { status: 400 });
		}

		const ip = getClientIp(req, context);
		const rateLimitStore = getStore({ name: 'comment-rate-limits' });
		const existing = (await rateLimitStore.get(ip, { type: 'json' })) as { timestamps: string[] } | null;
		const now = Date.now();
		const recentTimestamps = (existing?.timestamps ?? []).filter(
			(ts) => now - new Date(ts).getTime() < RATE_LIMIT_WINDOW_MS,
		);

		if (recentTimestamps.length >= RATE_LIMIT_MAX) {
			const oldest = new Date(recentTimestamps[0]).getTime();
			const retryAfterSeconds = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
			return Response.json(
				{ error: 'Too many comments, please wait before posting again', retryAfterSeconds },
				{ status: 429 },
			);
		}

		const comment: Comment = {
			id: `c_${crypto.randomUUID()}`,
			name: name.trim().slice(0, MAX_NAME_LENGTH),
			content: content.trim().slice(0, MAX_CONTENT_LENGTH),
			createdAt: new Date().toISOString(),
		};

		// Read-modify-write race on concurrent posts to the same slug is accepted at
		// current traffic; revisit with Blobs' onlyIfMatch if it ever becomes an issue.
		const existingComments = ((await commentsStore.get(slug, { type: 'json' })) as Comment[] | null) ?? [];
		existingComments.push(comment);
		await commentsStore.setJSON(slug, existingComments);

		recentTimestamps.push(comment.createdAt);
		await rateLimitStore.setJSON(ip, { timestamps: recentTimestamps });

		return Response.json({ comment }, { status: 201 });
	}

	return Response.json({ error: 'Method not allowed' }, { status: 405 });
};
