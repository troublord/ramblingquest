import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { checkRateLimit } from './_shared/rate-limit.ts';

export const config: Config = {
	path: '/api/contact',
};

const MAX_NAME_LENGTH = 60;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getClientIp(req: Request, context: Context): string {
	return context.ip ?? req.headers.get('x-nf-client-connection-ip') ?? 'unknown';
}

export default async (req: Request, context: Context) => {
	if (req.method !== 'POST') {
		return Response.json({ error: 'Method not allowed' }, { status: 405 });
	}

	let body: { name?: string; email?: string; message?: string; website?: string };
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { name, email, message, website } = body;

	// Honeypot field is hidden from real users via CSS; bots that fill every field trip it.
	if (website) {
		return Response.json({ error: '請手動輸入' }, { status: 400 });
	}
	if (!name?.trim() || !email?.trim() || !message?.trim()) {
		return Response.json({ error: 'Missing name, email, or message' }, { status: 400 });
	}
	if (name.length > MAX_NAME_LENGTH) {
		return Response.json({ error: 'Name too long' }, { status: 400 });
	}
	if (email.length > MAX_EMAIL_LENGTH) {
		return Response.json({ error: 'Email too long' }, { status: 400 });
	}
	if (!EMAIL_RE.test(email.trim())) {
		return Response.json({ error: 'Invalid email address' }, { status: 400 });
	}
	if (message.length > MAX_MESSAGE_LENGTH) {
		return Response.json({ error: 'Message too long' }, { status: 400 });
	}

	const ip = getClientIp(req, context);
	const rateLimitStore = getStore({ name: 'contact-rate-limits' });
	const existing = (await rateLimitStore.get(ip, { type: 'json' })) as { timestamps: string[] } | null;
	const now = Date.now();
	const rateLimitResult = checkRateLimit(existing?.timestamps ?? [], now);

	if (rateLimitResult.limited) {
		return Response.json(
			{
				error: 'Too many messages, please wait before sending again',
				retryAfterSeconds: rateLimitResult.retryAfterSeconds,
			},
			{ status: 429 },
		);
	}

	const trimmedName = name.trim().slice(0, MAX_NAME_LENGTH);
	const trimmedEmail = email.trim().slice(0, MAX_EMAIL_LENGTH);
	const trimmedMessage = message.trim().slice(0, MAX_MESSAGE_LENGTH);
	const submittedAt = new Date().toISOString();

	rateLimitResult.recentTimestamps.push(submittedAt);
	await rateLimitStore.setJSON(ip, { timestamps: rateLimitResult.recentTimestamps });

	const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
	if (webhookUrl) {
		// waitUntil keeps this fetch alive after the response is returned; a bare
		// un-awaited fetch can get cut off when Netlify freezes the container.
		context.waitUntil(
			fetch(webhookUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					embeds: [
						{
							title: '✉️ 新聯絡表單訊息',
							color: 0x4a90d9,
							fields: [
								{ name: '名字', value: trimmedName, inline: true },
								{ name: 'Email', value: trimmedEmail, inline: true },
								{
									name: '時間',
									value: new Date(submittedAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
									inline: true,
								},
								{ name: '訊息', value: trimmedMessage },
							],
						},
					],
				}),
			}).catch(() => {}),
		);
	}

	return Response.json({ success: true }, { status: 200 });
};
