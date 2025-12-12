<script lang="ts">
	import { browser } from '$app/environment';
	import { goto, invalidateAll } from '$app/navigation';
	import { pb } from '$lib/pocketbase.js';

	export let data;
	const { user } = data;

	let apps = data.apps;
	let name = '';
	let desc = '';
	let loading = false;
	let error = '';

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		if (!browser) return;

		error = '';
		loading = true;
		try {
			const created = await pb.collection('apps').create({
				name,
				description: desc,
				dev: user?.id
			});

			apps = [...apps, created];
		} catch (err: any) {
			error = err?.message ?? 'Login failed.';
		} finally {
			loading = false;
			name = '';
			desc = '';
		}
	};
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<section class="px-4 py-10 md:px-8">
	<div class="rounded-xl border border-base-300 bg-base-200 p-6 shadow-sm">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<p class="text-sm text-base-content/70">Signed in as</p>
				<p class="text-xl font-semibold">{user?.email ?? 'User'}</p>
			</div>
		</div>

		<div class="mt-6 space-y-3">
			<h2 class="text-lg font-bold">Your applications</h2>
			<p class="text-sm text-base-content/80">
				NodeTunnel's provided relay servers require unique application IDs to connect. Create and
				manage your apps below.
			</p>
			<div class="card border border-base-300 bg-base-100">
				<div class="card-body">
					<h3 class="card-title text-base">Create a new app</h3>
					<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
						<label class="form-control w-full">
							<div class="label">
								<span class="label-text">Name (required)</span>
							</div>
							<input
								class="input-bordered input w-full"
								type="text"
								name="name"
								placeholder="Game name here"
								bind:value={name}
							/>
						</label>

						<label class="form-control w-full">
							<div class="label">
								<span class="label-text">Description (optional)</span>
							</div>
							<textarea
								class="textarea w-full"
								name="description"
								placeholder="Enter a description here"
								bind:value={desc}
							></textarea>
						</label>

						{#if error}
							<div class="alert alert-error">{error}</div>
						{/if}

						<button class="btn mt-2 w-full btn-primary" type="submit" disabled={loading}>
							{#if loading}
								<span class="loading loading-spinner"></span>
								<span>Creating app...</span>
							{:else}
								<span>Create</span>
							{/if}
						</button>
					</form>
				</div>
			</div>

			{#if apps.length === 0}
				<p class="text-center text-info italic">apps you create will appear here</p>
			{:else}
				<div class="grid gap-3 sm:grid-cols-2">
					{#each apps as app}
						<div class="card border border-base-300 bg-base-100">
							<div class="card-body">
								<h3 class="card-title text-base">{app.name}</h3>
								<p>{app.description}</p>
								<button
									class="tooltip badge cursor-pointer badge-dash font-mono badge-primary"
									data-tip="click to copy"
									on:click={() => navigator.clipboard.writeText(app.app_id)}
								>
									ID: {app.app_id}
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>
