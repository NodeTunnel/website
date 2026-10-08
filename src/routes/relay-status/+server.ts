import { json } from '@sveltejs/kit';
import type { RelayStatus } from '$lib/relay-status';
import type { RequestHandler } from './$types';

// Relays heartbeat every 30s; three misses and they read as down.
const STALE_AFTER_SECS = 90;

// Public: the navbar status light polls this.
export const GET: RequestHandler = async ({ platform }) => {
	const db = platform?.env.DB;
	if (!db) {
		return json({ relays: [] });
	}

	const { results } = await db
		.prepare('SELECT relay_id, last_seen, players, rooms FROM relay_heartbeats ORDER BY relay_id')
		.all<{ relay_id: string; last_seen: number; players: number; rooms: number }>();

	const now = Math.floor(Date.now() / 1000);
	const relays: RelayStatus[] = results.map((r) => ({
		id: r.relay_id,
		up: now - r.last_seen < STALE_AFTER_SECS,
		last_seen: r.last_seen,
		players: r.players,
		rooms: r.rooms
	}));

	return json({ relays }, { headers: { 'Cache-Control': 'public, max-age=15' } });
};
