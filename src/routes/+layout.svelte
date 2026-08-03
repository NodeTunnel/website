<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="sticky top-0 w-full bg-purple-600 py-2 text-center text-sm font-medium text-white">
	NOTICE: NodeTunnel @ AndrooDev
</div>

<div class="flex min-h-screen w-full flex-col items-center">
	<div class="min-h-screen w-full max-w-6xl border-base-300 md:border-x-2">
		<Navbar user={data.user} />
		{@render children()}
	</div>
</div>
