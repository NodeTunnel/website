import { fail, redirect } from '@sveltejs/kit';
import { hashPassword, needsRehash, verifyPassword } from '$lib/server/auth';
import { startSession } from '$lib/server/session';
import { allow, clientKey } from '$lib/server/ratelimit';
import { MAX_EMAIL, field, normalizeEmail, passwordField } from '$lib/server/validate';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(303, '/dashboard');
};

export const actions: Actions = {
	default: async ({ request, cookies, platform }) => {
		const data = await request.formData();
		const email = field(data, 'email', MAX_EMAIL);
		const password = passwordField(data, 'password');

		if (!email || !password) {
			return fail(400, { email, error: 'Email and password are required.' });
		}

		if (!(await allow(platform?.env.LOGIN_LIMITER, clientKey(request)))) {
			return fail(429, { email, error: 'Too many attempts. Please try again in a minute.' });
		}

		const db = platform!.env.DB;
		const user = await db
			.prepare('SELECT id, password_hash FROM users WHERE email = ?')
			.bind(normalizeEmail(email))
			.first<{ id: string; password_hash: string }>();

		if (!user || !(await verifyPassword(password, user.password_hash))) {
			return fail(400, { email, error: 'Invalid email or password.' });
		}

		// Login is the only point where the plaintext is available to re-hash.
		if (needsRehash(user.password_hash)) {
			await db
				.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
				.bind(await hashPassword(password), user.id)
				.run();
		}

		await startSession(db, cookies, user.id);
		throw redirect(303, '/dashboard');
	}
};
