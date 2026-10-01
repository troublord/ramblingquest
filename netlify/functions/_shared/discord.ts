// Discord rejects the whole webhook when any embed field breaks these limits.
export const EMBED_TITLE_MAX = 256;
export const EMBED_FIELD_VALUE_MAX = 1024;

export function truncate(text: string, max: number): string {
	const chars = Array.from(text);
	return chars.length <= max ? text : `${chars.slice(0, max - 1).join('')}…`;
}

// Splits long text into consecutive fields so nothing is dropped (used where the
// webhook is the only copy of the message).
export function splitIntoFields(name: string, text: string): { name: string; value: string }[] {
	const chars = Array.from(text);
	const chunks: string[] = [];
	for (let i = 0; i < chars.length; i += EMBED_FIELD_VALUE_MAX) {
		chunks.push(chars.slice(i, i + EMBED_FIELD_VALUE_MAX).join(''));
	}
	if (chunks.length <= 1) return [{ name, value: text }];
	return chunks.map((value, i) => ({ name: `${name} (${i + 1}/${chunks.length})`, value }));
}

export async function postWebhook(webhookUrl: string, payload: unknown, label: string): Promise<void> {
	try {
		const res = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		if (!res.ok) console.error(`[${label}] Discord webhook rejected: ${res.status} ${await res.text()}`);
	} catch (err) {
		console.error(`[${label}] Discord webhook failed:`, err);
	}
}
