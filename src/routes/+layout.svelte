<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-w-screen items-center flex flex-col">
	<div class="max-w-6xl md:border-x-2 border-base-300">
		{@render children()}
	</div>
</div>
