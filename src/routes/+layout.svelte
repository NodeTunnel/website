<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen w-full flex-col items-center">
	<div class="min-h-screen w-full max-w-6xl border-base-300 md:border-x-2">
		<Navbar />
		{@render children()}
	</div>
</div>
