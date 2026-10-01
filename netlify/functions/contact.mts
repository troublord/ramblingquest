import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { checkRateLimit, type RateLimitResult } from './_shared/rate-limit.ts';
import { updateJSON } from './_shared/atomic-json.ts';
import { getClientIp, rateLimitKey } from './_shared/client-ip.ts';
import { postWebhook, splitIntoFields } from './_shared/discord.ts';

export const config: Config = {
	path: '/api/contact',
};

const MAX_NAME_LENGTH = 60;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async (req: Request, context: Context) => {
	if (req.method !== 'POST') {
		return Response.json({ error: '不支援這個請求方法' }, { status: 405 });
	}

	let body: { name?: unknown; email?: unknown; message?: unknown; website?: unknown } | null;
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: '送出的資料格式不正確' }, { status: 400 });
	}
	if (typeof body !== 'object' || body === null) {
		return Response.json({ error: '送出的資料格式不正確' }, { status: 400 });
	}

	const { name, email, message, website } = body;

	// Honeypot field is hidden from real users via CSS; bots that fill every field trip it.
	if (website) {
		return Response.json({ error: '請手動輸入' }, { status: 400 });
	}
	if (
		typeof name !== 'string' ||
		typeof email !== 'string' ||
		typeof message !== 'string' ||
		!name.trim() ||
		!email.trim() ||
		!message.trim()
	) {
		return Response.json({ error: '名字、Email 和訊息都要填喔' }, { status: 400 });
	}
	if (name.length > MAX_NAME_LENGTH) {
		return Response.json({ error: '名字太長了（最多 60 字）' }, { status: 400 });
	}
	if (email.length > MAX_EMAIL_LENGTH) {
		return Response.json({ error: 'Email 太長了' }, { status: 400 });
	}
	if (!EMAIL_RE.test(email.trim())) {
		return Response.json({ error: 'Email 格式不正確' }, { status: 400 });
	}
	if (message.length > MAX_MESSAGE_LENGTH) {
		return Response.json({ error: '訊息太長了（最多 2000 字）' }, { status: 400 });
	}

	const now = Date.now();
	const submittedAt = new Date(now).toISOString();
	const rateLimitStore = getStore({ name: 'contact-rate-limits' });
	const reservation = await updateJSON<{ timestamps: string[] }, RateLimitResult>(
		rateLimitStore,
		rateLimitKey(getClientIp(req, context)),
		(current) => {
			const result = checkRateLimit(current?.timestamps ?? [], now);
			if (result.limited) return { skip: result };
			return { write: { timestamps: [...result.recentTimestamps, submittedAt] }, value: result };
		},
	);

	if (reservation.status !== 'written') {
		return Response.json(
			{
				error: '送太多次了，請稍後再試',
				...(reservation.status === 'skipped' && reservation.value.limited
					? { retryAfterSeconds: reservation.value.retryAfterSeconds }
					: {}),
			},
			{ status: 429 },
		);
	}

	const trimmedName = name.trim().slice(0, MAX_NAME_LENGTH);
	const trimmedEmail = email.trim().slice(0, MAX_EMAIL_LENGTH);
	const trimmedMessage = message.trim().slice(0, MAX_MESSAGE_LENGTH);

	const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
	if (webhookUrl) {
		// waitUntil keeps this fetch alive after the response is returned; a bare
		// un-awaited fetch can get cut off when Netlify freezes the container.
		context.waitUntil(
			postWebhook(
				webhookUrl,
				{
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
								// The webhook is the only copy of the message, so split instead of truncating.
								...splitIntoFields('訊息', trimmedMessage),
							],
						},
					],
				},
				'contact',
			),
		);
	}

	return Response.json({ success: true }, { status: 200 });
};
