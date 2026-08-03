import type { Cookies } from '@sveltejs/kit';
import type { D1Database } from '@cloudflare/workers-types';
import { SESSION_COOKIE, SESSION_TTL_MS, generateSessionId } from './auth';

// Cap on concurrent sessions per user; oldest are evicted beyond this.
const MAX_SESSIONS_PER_USER = 10;

const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	secure: true,
	sameSite: 'lax'
} as const;

// Deletes any incoming session id first, preventing session fixation.
export async function startSession(
	db: D1Database,
	cookies: Cookies,
	userId: string
): Promise<void> {
	const existing = cookies.get(SESSION_COOKIE);
	if (existing) {
		await db.prepare('DELETE FROM sessions WHERE id = ?').bind(existing).run();
	}

	const id = generateSessionId();
	const expires = Date.now() + SESSION_TTL_MS;

	await db
		.prepare('INSERT INTO sessions (id, user_id, expires) VALUES (?, ?, ?)')
		.bind(id, userId, expires)
		.run();

	// Evict this user's oldest sessions beyond the cap.
	await db
		.prepare(
			`DELETE FROM sessions
			 WHERE user_id = ?1
			   AND id NOT IN (
			     SELECT id FROM sessions WHERE user_id = ?1
			     ORDER BY expires DESC LIMIT ?2
			   )`
		)
		.bind(userId, MAX_SESSIONS_PER_USER)
		.run();

	cookies.set(SESSION_COOKIE, id, {
		...COOKIE_OPTIONS,
		maxAge: Math.floor(SESSION_TTL_MS / 1000)
	});
}

export async function destroySession(db: D1Database, cookies: Cookies): Promise<void> {
	const id = cookies.get(SESSION_COOKIE);
	if (id) {
		await db.prepare('DELETE FROM sessions WHERE id = ?').bind(id).run();
	}
	cookies.delete(SESSION_COOKIE, COOKIE_OPTIONS);
}

export async function destroyAllSessions(db: D1Database, userId: string): Promise<void> {
	await db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();
}

export async function purgeExpiredSessions(db: D1Database): Promise<void> {
	await db
		.prepare(
			'DELETE FROM sessions WHERE id IN (SELECT id FROM sessions WHERE expires <= ? LIMIT 500)'
		)
		.bind(Date.now())
		.run();
}
