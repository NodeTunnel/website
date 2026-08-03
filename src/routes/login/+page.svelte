<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Log In</title>
</svelte:head>

<div class="flex justify-center px-4 py-10">
	<div class="card w-full max-w-md bg-base-200 shadow">
		<div class="card-body space-y-4">
			<h1 class="text-2xl font-bold">Welcome back</h1>

			<form
				class="space-y-4"
				method="POST"
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
						<span class="label-text">Email</span>
					</div>
					<input
						class="input-bordered input w-full"
						type="email"
						name="email"
						placeholder="you@example.com"
						value={form?.email ?? ''}
						required
					/>
				</label>

				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Password</span>
					</div>
					<input
						class="input-bordered input w-full"
						type="password"
						name="password"
						placeholder="********"
						required
					/>
				</label>

				{#if form?.error}
					<div class="alert alert-error">{form.error}</div>
				{/if}

				<button class="btn mt-2 w-full btn-primary" type="submit" disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner"></span>
						<span>Logging in...</span>
					{:else}
						<span>Log in</span>
					{/if}
				</button>

				<p class="text-center text-sm">
					Need an account? <a class="link" href="/signup">Sign up</a>
				</p>
			</form>
		</div>
	</div>
</div>
