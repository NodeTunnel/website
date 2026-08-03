import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE } from '$lib/server/auth';
import { purgeExpiredSessions } from '$lib/server/session';

// 1-in-N requests also sweeps a batch of expired session rows.
const PURGE_ODDS = 200;

// CSP is omitted here on purpose; SvelteKit emits it from svelte.config.js.
const SECURITY_HEADERS: Record<string, string> = {
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()'
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;

	const sessionId = event.cookies.get(SESSION_COOKIE);
	const db = event.platform?.env.DB;

	if (sessionId && db) {
		const row = await db
			.prepare(
				`SELECT s.expires AS expires, u.id AS id, u.email AS email
				 FROM sessions s JOIN users u ON u.id = s.user_id
				 WHERE s.id = ?`
			)
			.bind(sessionId)
			.first<{ expires: number; id: string; email: string }>();

		if (row && row.expires > Date.now()) {
			event.locals.user = { id: row.id, email: row.email };
		} else if (row) {
			await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
			event.cookies.delete(SESSION_COOKIE, { path: '/' });
		}
	}

	if (db && event.platform?.ctx && Math.floor(Math.random() * PURGE_ODDS) === 0) {
		event.platform.ctx.waitUntil(purgeExpiredSessions(db));
	}

	const response = await resolve(event);

	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(name, value);
	}

	return response;
};
