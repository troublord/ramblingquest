import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { updateJSON } from './_shared/atomic-json.ts';
import { isAdminRequest } from './_shared/admin-auth.ts';

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

	if (!isAdminRequest(req)) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const url = new URL(req.url);
	const slug = url.searchParams.get('slug');
	const id = context.params.id;

	if (!slug || !id) {
		return Response.json({ error: 'Missing slug or id' }, { status: 400 });
	}

	// Conditional write, so a comment posted concurrently isn't lost and a stale reader
	// can't write the deleted comment back.
	const commentsStore = getStore({ name: 'comments' });
	const removed = await updateJSON<Comment[], 'deleted' | 'missing'>(commentsStore, slug, (current) => {
		const comments = current ?? [];
		if (!comments.some((c) => c.id === id)) return { skip: 'missing' };
		return { write: comments.filter((c) => c.id !== id), value: 'deleted' };
	});

	if (removed.status === 'skipped') {
		return Response.json({ error: 'Comment not found' }, { status: 404 });
	}
	if (removed.status === 'conflict') {
		return Response.json({ error: 'Busy, please try again' }, { status: 503 });
	}

	return Response.json({ deleted: true, id });
};
