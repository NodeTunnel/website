import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE } from '$lib/server/auth';
import { destroySession } from '$lib/server/session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, platform }) => {
	if (platform) {
		await destroySession(platform.env.DB, cookies);
	} else {
		cookies.delete(SESSION_COOKIE, { path: '/' });
	}
	throw redirect(303, '/');
};
