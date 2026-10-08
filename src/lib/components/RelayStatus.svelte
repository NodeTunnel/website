<script lang="ts">
	import type { RelayStatus } from '$lib/relay-status';

	const POLL_MS = 60_000;

	// Public relays, by RELAY_ID. Listed even before their first heartbeat.
	const PUBLIC_RELAYS = ['us-east'];

	let relays = $state<RelayStatus[] | null>(null);

	let rows = $derived(
		PUBLIC_RELAYS.map((id) => {
			const relay = relays?.find((r) => r.id === id);
			// Unknown until the first answer, and on fetch errors -- not down.
			const status: 'unknown' | 'up' | 'down' = !relays ? 'unknown' : relay?.up ? 'up' : 'down';
			return { host: `${id}.nodetunnel.io`, status };
		})
	);

	async function refresh() {
		try {
			const res = await fetch('/relay-status');
			relays = res.ok ? (await res.json()).relays : null;
		} catch {
			relays = null;
		}
	}

	$effect(() => {
		refresh();
		const timer = setInterval(refresh, POLL_MS);
		return () => clearInterval(timer);
	});
</script>

<div class="mt-4 max-w-md overflow-x-auto rounded-box border border-base-300">
	<table class="table">
		<thead>
			<tr>
				<th>Relay</th>
				<th>Status</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.host)}
				<tr>
					<td class="font-mono">{row.host}</td>
					<td>
						<span class="flex items-center gap-2">
							<span
								aria-hidden="true"
								class={[
									'status status-md',
									row.status === 'up' && 'status-success',
									row.status === 'down' && 'status-error',
									row.status === 'unknown' && 'status-neutral'
								]}
							></span>
							{row.status === 'up' ? 'Online' : row.status === 'down' ? 'Offline' : 'Checking…'}
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
