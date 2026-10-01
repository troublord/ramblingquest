import type { Context } from '@netlify/functions';

export function getClientIp(req: Request, context: Context): string {
	return context.ip ?? req.headers.get('x-nf-client-connection-ip') ?? 'unknown';
}

// One IPv6 client usually controls a whole /64, so bucketing by the full address would
// hand it a fresh quota per address. IPv4 (and anything unparseable) is used as-is.
export function rateLimitKey(ip: string): string {
	if (!ip.includes(':')) return ip;

	const address = ip.split('%')[0].toLowerCase();
	const [head, tail] = address.includes('::') ? address.split('::') : [address, undefined];
	const headParts = head ? head.split(':') : [];
	const tailParts = tail ? tail.split(':') : [];
	const missing = 8 - headParts.length - tailParts.length;
	if (tail === undefined ? missing !== 0 : missing < 0) return address;

	const groups = [...headParts, ...Array(Math.max(missing, 0)).fill('0'), ...tailParts];
	if (groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return address;

	return `${groups.slice(0, 4).map((g) => g.padStart(4, '0')).join(':')}::/64`;
}
