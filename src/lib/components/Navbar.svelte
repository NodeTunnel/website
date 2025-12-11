<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { pb } from '$lib/pocketbase';

	let loggedIn = false;

	onMount(() => {
		if (!browser) return;

		loggedIn = pb.authStore.isValid;
		const unsubscribe = pb.authStore.onChange(() => {
			loggedIn = pb.authStore.isValid;
		});

		return unsubscribe;
	});

	const logout = () => {
		if (!browser) return;
		pb.authStore.clear();
		goto('/login');
	};
</script>

<div class="navbar sticky top-0 z-20 bg-base-100 shadow-sm">
	<div class="navbar-start">
		<div class="dropdown">
			<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h8m-8 6h16"
					/>
				</svg>
			</div>
			<ul
				tabindex="-1"
				class="dropdown-content menu z-1 mt-3 w-52 menu-sm rounded-box bg-base-100 p-2 shadow"
			>
				<li><a href="https://nodetunnel.github.io/docs/">Docs</a></li>
				<li>
					<a href="https://github.com/NodeTunnel/godot-plugin/releases/latest">Download</a>
					<ul class="p-2">
						<li>
							<a href="https://github.com/NodeTunnel/godot-plugin/releases/latest">Godot Plugin</a>
						</li>
						<li><a href="https://github.com/NodeTunnel/relay-server">Relay Server</a></li>
					</ul>
				</li>
				<li><a href="https://discord.gg/yDHnKmw7AS">Discord</a></li>
			</ul>
		</div>
		<a href="/" class="font-tomorrow text-4xl lg:ml-6">nt</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="https://nodetunnel.github.io/docs/">Docs</a></li>
			<li>
				<details>
					<summary>Download</summary>
					<ul class="z-1 w-40 bg-base-100 p-2">
						<li>
							<a href="https://github.com/NodeTunnel/godot-plugin/releases/latest">Godot Plugin</a>
						</li>
						<li><a href="https://github.com/NodeTunnel/relay-server">Relay Server</a></li>
					</ul>
				</details>
			</li>
			<li><a href="https://discord.gg/yDHnKmw7AS">Discord</a></li>
		</ul>
	</div>
	<div class="mr-4 navbar-end gap-2">
		{#if loggedIn}
			<a href="/dashboard" class="btn btn-ghost">Dashboard</a>
			<button class="btn btn-outline" on:click={logout}>Log Out</button>
		{:else}
			<a href="/login" class="btn btn-ghost">Log In</a>
			<a href="/signup" class="btn btn-primary">Sign Up</a>
		{/if}
	</div>
</div>
