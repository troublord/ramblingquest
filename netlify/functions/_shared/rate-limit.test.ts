import { describe, expect, it } from 'vitest';
import { checkRateLimit } from './rate-limit.ts';

describe('checkRateLimit', () => {
	it('allows the request when there are no prior timestamps', () => {
		const result = checkRateLimit([], Date.now(), 10 * 60 * 1000, 5);
		expect(result.limited).toBe(false);
		if (!result.limited) expect(result.recentTimestamps).toEqual([]);
	});

	it('drops timestamps older than the window', () => {
		const now = Date.now();
		const stale = new Date(now - 11 * 60 * 1000).toISOString();
		const result = checkRateLimit([stale], now, 10 * 60 * 1000, 5);
		expect(result.limited).toBe(false);
		if (!result.limited) expect(result.recentTimestamps).toEqual([]);
	});

	it('keeps a timestamp exactly at the window boundary as expired', () => {
		const now = Date.now();
		// now - ts < windowMs is false when they're exactly equal, so this counts as expired.
		const boundary = new Date(now - 10 * 60 * 1000).toISOString();
		const result = checkRateLimit([boundary], now, 10 * 60 * 1000, 5);
		expect(result.limited).toBe(false);
		if (!result.limited) expect(result.recentTimestamps).toEqual([]);
	});

	it('allows the request when under the max', () => {
		const now = Date.now();
		const recent = Array.from({ length: 4 }, () => new Date(now).toISOString());
		const result = checkRateLimit(recent, now, 10 * 60 * 1000, 5);
		expect(result.limited).toBe(false);
		if (!result.limited) expect(result.recentTimestamps).toHaveLength(4);
	});

	it('blocks the request once at the max and reports retryAfterSeconds', () => {
		const now = Date.now();
		const timestamps = Array.from({ length: 5 }, (_, i) =>
			new Date(now - (5 - i) * 1000).toISOString(),
		);
		const result = checkRateLimit(timestamps, now, 10 * 60 * 1000, 5);
		expect(result.limited).toBe(true);
		if (result.limited) {
			// oldest entry is 5s old, window is 600s, so ~595s remain.
			expect(result.retryAfterSeconds).toBe(595);
		}
	});

	it('computes retryAfterSeconds relative to the oldest surviving timestamp', () => {
		const now = Date.now();
		const oldest = new Date(now - 9 * 60 * 1000).toISOString(); // 1 min left in its window
		const timestamps = [oldest, ...Array.from({ length: 4 }, () => new Date(now).toISOString())];
		const result = checkRateLimit(timestamps, now, 10 * 60 * 1000, 5);
		expect(result.limited).toBe(true);
		if (result.limited) expect(result.retryAfterSeconds).toBe(60);
	});
});
