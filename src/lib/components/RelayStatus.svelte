<script lang="ts">
	import type { RelayStatus } from '$lib/relay-status';

	const POLL_MS = 60_000;

	let relays = $state<RelayStatus[] | null>(null);

	// Unknown (grey) until the first answer, and on fetch errors -- not down.
	let status: 'unknown' | 'up' | 'down' = $derived(
		!relays || relays.length === 0 ? 'unknown' : relays.every((r) => r.up) ? 'up' : 'down'
	);

	let label = $derived(
		!relays || relays.length === 0
			? 'Relay status unknown'
			: relays
					.map((r) =>
						r.up
							? `Relay ${r.id}: online · ${r.players} player${r.players === 1 ? '' : 's'}`
							: `Relay ${r.id}: offline`
					)
					.join('\n')
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

<!-- role="img": a named indicator, not a live region that announces every poll. -->
<div
	class="tooltip tooltip-bottom whitespace-pre-line"
	data-tip={label}
	role="img"
	aria-label={label}
>
	<div
		aria-hidden="true"
		class={[
			'status status-md',
			status === 'up' && 'status-success',
			status === 'down' && 'status-error',
			status === 'unknown' && 'status-neutral'
		]}
	></div>
</div>
