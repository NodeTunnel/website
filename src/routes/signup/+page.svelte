<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let loading = $state(false);

	// Turnstile tokens are single-use; must reset after a failed submit.
	function resetTurnstile() {
		(globalThis as { turnstile?: { reset: () => void } }).turnstile?.reset();
	}
</script>

<svelte:head>
	<title>Sign Up</title>
	{#if data.turnstileSiteKey}
		<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
	{/if}
</svelte:head>

<div class="flex justify-center px-4 py-10">
	<div class="card w-full max-w-md bg-base-200 shadow">
		<div class="card-body space-y-4">
			<h1 class="text-2xl font-bold">Create an account</h1>

			<form
				class="space-y-4"
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
						resetTurnstile();
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
						minlength="8"
						placeholder="********"
						required
					/>
				</label>

				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Confirm password</span>
					</div>
					<input
						class="input-bordered input w-full"
						type="password"
						name="confirm"
						minlength="8"
						placeholder="********"
						required
					/>
				</label>

				{#if data.turnstileSiteKey}
					<div
						class="cf-turnstile"
						data-sitekey={data.turnstileSiteKey}
						data-theme="auto"
						data-appearance="interaction-only"
					></div>
				{/if}

				{#if form?.error}
					<div class="alert alert-error">{form.error}</div>
				{/if}

				<button class="btn mt-2 w-full btn-primary" type="submit" disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner"></span>
						<span>Creating account...</span>
					{:else}
						<span>Sign up</span>
					{/if}
				</button>

				<p class="text-center text-sm">
					Already have an account? <a class="link" href="/login">Log in</a>
				</p>
			</form>
		</div>
	</div>
</div>
