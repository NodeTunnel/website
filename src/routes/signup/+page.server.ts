import { fail, redirect } from '@sveltejs/kit';
import { generateId, hashPassword } from '$lib/server/auth';
import { startSession } from '$lib/server/session';
import { allow, clientKey } from '$lib/server/ratelimit';
import { TURNSTILE_FIELD, verifyTurnstile } from '$lib/server/turnstile';
import {
	MAX_EMAIL,
	field,
	isValidEmail,
	normalizeEmail,
	passwordField,
	passwordProblem
} from '$lib/server/validate';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (locals.user) throw redirect(303, '/dashboard');
	return { turnstileSiteKey: platform?.env.TURNSTILE_SITE_KEY ?? null };
};

export const actions: Actions = {
	default: async ({ request, cookies, platform }) => {
		const data = await request.formData();
		const email = field(data, 'email', MAX_EMAIL);
		const password = passwordField(data, 'password');
		const confirm = passwordField(data, 'confirm');

		if (!email || !password) {
			return fail(400, { email, error: 'Email and password are required.' });
		}
		if (!isValidEmail(email)) {
			return fail(400, { email, error: 'Please enter a valid email address.' });
		}
		const problem = passwordProblem(password);
		if (problem) {
			return fail(400, { email, error: problem });
		}
		if (password !== confirm) {
			return fail(400, { email, error: 'Passwords must match.' });
		}

		if (!(await allow(platform?.env.SIGNUP_LIMITER, clientKey(request)))) {
			return fail(429, { email, error: 'Too many signups from this address. Try again shortly.' });
		}

		const token = String(data.get(TURNSTILE_FIELD) ?? '');

		// Secret bound but no token: the widget never rendered, which means
		// TURNSTILE_SITE_KEY is unset. Every signup fails until both are set.
		if (platform?.env.TURNSTILE_SECRET_KEY && !token && !platform?.env.TURNSTILE_SITE_KEY) {
			console.error('signup: TURNSTILE_SECRET_KEY is set but TURNSTILE_SITE_KEY is not');
		}

		// Verified before hashing, which is the expensive part of this request.
		const passed = await verifyTurnstile(
			platform?.env.TURNSTILE_SECRET_KEY,
			token,
			clientKey(request)
		);
		if (!passed) {
			return fail(400, {
				email,
				error: 'Could not verify that you are human. Please try again.'
			});
		}

		const db = platform!.env.DB;
		const id = generateId();
		const passwordHash = await hashPassword(password);

		try {
			await db
				.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)')
				.bind(id, normalizeEmail(email), passwordHash)
				.run();
		} catch (err) {
			// UNIQUE constraint on email; discloses registration, throttled above.
			if (err instanceof Error && err.message.includes('UNIQUE')) {
				return fail(400, { email, error: 'An account with that email already exists.' });
			}
			throw err;
		}

		await startSession(db, cookies, id);
		throw redirect(303, '/dashboard');
	}
};
