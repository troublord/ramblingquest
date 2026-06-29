import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

export const config: Config = {
	path: '/api/comments-all',
};

type Comment = {
	id: string;
	name: string;
	content: string;
	createdAt: string;
};

export default async (req: Request) => {
	if (req.method !== 'GET') {
		return Response.json({ error: 'Method not allowed' }, { status: 405 });
	}

	const secret = req.headers.get('x-admin-secret');
	if (!secret || secret !== process.env.COMMENT_ADMIN_SECRET) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const commentsStore = getStore({ name: 'comments' });
	const { blobs } = await commentsStore.list();

	const allComments: (Comment & { slug: string })[] = [];
	for (const blob of blobs) {
		const comments =
			((await commentsStore.get(blob.key, { type: 'json' })) as Comment[] | null) ?? [];
		for (const comment of comments) {
			allComments.push({ ...comment, slug: blob.key });
		}
	}

	allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	return Response.json({ comments: allComments });
};
