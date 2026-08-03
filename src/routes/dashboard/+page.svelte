<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<section class="px-4 py-10 md:px-8">
	<div class="rounded-xl border border-base-300 bg-base-200 p-6 shadow-sm">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<p class="text-sm text-base-content/70">Signed in as</p>
				<p class="text-xl font-semibold">{data.user?.email ?? 'User'}</p>
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
					<form
						class="space-y-4"
						method="POST"
						action="?/create"
						use:enhance={() => {
							loading = true;
							return async ({ update }) => {
								await update();
								loading = false;
							};
						}}
					>
						<label class="form-control w-full">
							<div class="label">
								<span class="label-text">Name (required)</span>
							</div>
							<input
								class="input-bordered input w-full"
								type="text"
								name="name"
								placeholder="Game name here"
								required
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
							></textarea>
						</label>

						{#if form?.error}
							<div class="alert alert-error">{form.error}</div>
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

			{#if data.apps.length === 0}
				<p class="text-center text-info italic">apps you create will appear here</p>
			{:else}
				<div class="grid gap-3 sm:grid-cols-2">
					{#each data.apps as app (app.id)}
						<div class="card border border-base-300 bg-base-100">
							<div class="card-body">
								<h3 class="card-title text-base">{app.name}</h3>
								<p>{app.description}</p>
								<button
									class="tooltip badge cursor-pointer badge-dash font-mono badge-primary"
									data-tip="click to copy"
									onclick={() => navigator.clipboard.writeText(app.id)}
								>
									ID: {app.id}
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>
