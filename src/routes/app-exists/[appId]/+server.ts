import { json } from '@sveltejs/kit';
import { timingSafeEqualString } from '$lib/server/auth';
import { allow, clientKey } from '$lib/server/ratelimit';
import type { RequestHandler } from './$types';

// Relay whitelist check: 200 = app exists, 404 = not, 401 = bad token.
export const GET: RequestHandler = async ({ params, request, platform }) => {
	// Throttle first: this endpoint must not be an unmetered oracle.
	if (!(await allow(platform?.env.RELAY_LIMITER, clientKey(request)))) {
		return json({ error: 'rate_limited' }, { status: 429 });
	}

	const expected = platform?.env.RELAY_TOKEN;
	const token = request.headers.get('X-Relay-Token');

	if (!expected || !token || !timingSafeEqualString(token, expected)) {
		return json({ error: 'unauthorized' }, { status: 401 });
	}

	const app = await platform!.env.DB.prepare('SELECT id FROM apps WHERE id = ?')
		.bind(params.appId)
		.first<{ id: string }>();

	return json({}, { status: app ? 200 : 404 });
};
