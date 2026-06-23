import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

export const config: Config = {
	path: '/api/comments/:id',
};

type Comment = {
	id: string;
	name: string;
	content: string;
	createdAt: string;
};

export default async (req: Request, context: Context) => {
	if (req.method !== 'DELETE') {
		return Response.json({ error: 'Method not allowed' }, { status: 405 });
	}

	const secret = req.headers.get('x-admin-secret');
	if (!secret || secret !== process.env.COMMENT_ADMIN_SECRET) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const url = new URL(req.url);
	const slug = url.searchParams.get('slug');
	const id = context.params.id;

	if (!slug || !id) {
		return Response.json({ error: 'Missing slug or id' }, { status: 400 });
	}

	const commentsStore = getStore({ name: 'comments' });
	const comments = ((await commentsStore.get(slug, { type: 'json' })) as Comment[] | null) ?? [];

	const index = comments.findIndex((c) => c.id === id);
	if (index === -1) {
		return Response.json({ error: 'Comment not found' }, { status: 404 });
	}

	comments.splice(index, 1);
	await commentsStore.setJSON(slug, comments);

	return Response.json({ deleted: true, id });
};
