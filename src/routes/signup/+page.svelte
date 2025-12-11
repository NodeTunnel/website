<script lang="ts">
	import { pb } from "$lib/pocketbase";
	import { goto } from "$app/navigation";
	import { browser } from "$app/environment";

	let email = "";
	let password = "";
	let confirm = "";
	let loading = false;
	let error = "";
	let success = "";

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		if (!browser) return;

		error = "";
		success = "";

		if (!email || !password) {
			error = "Email and password are required.";
			return;
		}

		if (password !== confirm) {
			error = "Passwords must match.";
			return;
		}

		loading = true;
		try {
			await pb.collection("users").create({
				email,
				password,
				passwordConfirm: confirm
			});

			await pb.collection("users").authWithPassword(email, password);
			success = "Account created. Redirecting...";
			setTimeout(() => goto("/dashboard"), 800);
		} catch (err: any) {
			error = err?.message ?? "Sign up failed.";
		} finally {
			loading = false;
		}
	};
</script>

<svelte:head>
	<title>Sign Up</title>
</svelte:head>

<div class="flex justify-center px-4 py-10">
	<div class="card w-full max-w-md bg-base-200 shadow">
		<div class="card-body space-y-4">
			<h1 class="text-2xl font-bold">Create an account</h1>

			<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Email</span>
					</div>
					<input
						class="input input-bordered w-full"
						type="email"
						name="email"
						placeholder="you@example.com"
						bind:value={email}
						required
					/>
				</label>

				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Password</span>
					</div>
					<input
						class="input input-bordered w-full"
						type="password"
						name="password"
						minlength="8"
						placeholder="********"
						bind:value={password}
						required
					/>
				</label>

				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Confirm password</span>
					</div>
					<input
						class="input input-bordered w-full"
						type="password"
						name="confirm"
						minlength="8"
						placeholder="********"
						bind:value={confirm}
						required
					/>
				</label>

				{#if error}
					<div class="alert alert-error">{error}</div>
				{/if}
				{#if success}
					<div class="alert alert-success">{success}</div>
				{/if}

				<button class="btn btn-primary w-full mt-2" type="submit" disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner"></span>
						<span>Creating account...</span>
					{:else}
						<span>Sign up</span>
					{/if}
				</button>

				<p class="text-sm text-center">
					Already have an account? <a class="link" href="/login">Log in</a>
				</p>
			</form>
		</div>
	</div>
</div>
