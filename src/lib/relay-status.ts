// Shape returned by GET /relay-status.
export interface RelayStatus {
	id: string;
	up: boolean;
	last_seen: number;
	players: number;
	rooms: number;
}
