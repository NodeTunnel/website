import { json } from '@sveltejs/kit';
import { timingSafeEqualString } from '$lib/server/auth';
import { allow, clientKey } from '$lib/server/ratelimit';
import type { RequestHandler } from './$types';

const RELAY_ID = /^[A-Za-z0-9_-]{1,32}$/;
const VERSION = /^[A-Za-z0-9._+-]{1,32}$/;

const isCount = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 0;

// Relay liveness ping: 204 = recorded, 400 = bad body, 401 = bad token.
export const POST: RequestHandler = async ({ request, platform }) => {
	if (!(await allow(platform?.env.RELAY_LIMITER, clientKey(request)))) {
		return json({ error: 'rate_limited' }, { status: 429 });
	}

	const expected = platform?.env.RELAY_TOKEN;
	const token = request.headers.get('X-Relay-Token');

	if (!expected || !token || !timingSafeEqualString(token, expected)) {
		return json({ error: 'unauthorized' }, { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const { relay_id, version, players, rooms } = body ?? {};

	if (
		typeof relay_id !== 'string' ||
		!RELAY_ID.test(relay_id) ||
		typeof version !== 'string' ||
		!VERSION.test(version) ||
		!isCount(players) ||
		!isCount(rooms)
	) {
		return json({ error: 'bad_request' }, { status: 400 });
	}

	await platform!.env.DB.prepare(
		`INSERT INTO relay_heartbeats (relay_id, last_seen, version, players, rooms)
		 VALUES (?, unixepoch(), ?, ?, ?)
		 ON CONFLICT(relay_id) DO UPDATE SET
		   last_seen = excluded.last_seen,
		   version = excluded.version,
		   players = excluded.players,
		   rooms = excluded.rooms`
	)
		.bind(relay_id, version, players, rooms)
		.run();

	return new Response(null, { status: 204 });
};
