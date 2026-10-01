import { createHash, timingSafeEqual } from 'node:crypto';

const digest = (value: string) => createHash('sha256').update(value).digest();

// Fails closed when the header or COMMENT_ADMIN_SECRET is missing. Comparing digests
// keeps the comparison constant-time regardless of input length.
export function isAdminRequest(req: Request, expected: string | undefined = process.env.COMMENT_ADMIN_SECRET): boolean {
	const provided = req.headers.get('x-admin-secret');
	if (!provided || !expected) return false;
	return timingSafeEqual(digest(provided), digest(expected));
}
