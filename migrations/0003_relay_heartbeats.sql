-- One row per relay, upserted by its heartbeat; powers the site's status light.
CREATE TABLE relay_heartbeats (
	relay_id TEXT PRIMARY KEY,
	last_seen INTEGER NOT NULL, -- unix seconds
	version TEXT,
	players INTEGER NOT NULL DEFAULT 0,
	rooms INTEGER NOT NULL DEFAULT 0
);
