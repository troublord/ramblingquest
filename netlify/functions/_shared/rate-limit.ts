export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const RATE_LIMIT_MAX = 5;

export type RateLimitResult =
	| { limited: false; recentTimestamps: string[] }
	| { limited: true; retryAfterSeconds: number };

// `existingTimestamps` must already be in ascending (insertion) order — callers
// only ever append, so the oldest surviving entry is index 0.
export function checkRateLimit(
	existingTimestamps: string[],
	now: number,
	windowMs: number = RATE_LIMIT_WINDOW_MS,
	max: number = RATE_LIMIT_MAX,
): RateLimitResult {
	const recentTimestamps = existingTimestamps.filter((ts) => now - new Date(ts).getTime() < windowMs);

	if (recentTimestamps.length >= max) {
		const oldest = new Date(recentTimestamps[0]).getTime();
		const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
		return { limited: true, retryAfterSeconds };
	}

	return { limited: false, recentTimestamps };
}
