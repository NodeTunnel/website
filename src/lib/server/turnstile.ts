const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const TURNSTILE_FIELD = 'cf-turnstile-response';

// True when the challenge passed, or when no secret is bound (local dev).
export async function verifyTurnstile(
	secret: string | undefined,
	token: string,
	remoteIp?: string
): Promise<boolean> {
	if (!secret) {
		console.warn('TURNSTILE_SECRET_KEY not bound; skipping challenge verification');
		return true;
	}
	if (!token) return false;

	const body = new URLSearchParams({ secret, response: token });
	// Cloudflare rejects the placeholder used when CF-Connecting-IP is absent.
	if (remoteIp && remoteIp !== 'unknown') body.set('remoteip', remoteIp);

	try {
		const res = await fetch(SITEVERIFY_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body
		});
		if (!res.ok) {
			console.error(`turnstile: siteverify returned ${res.status}`);
			return false;
		}
		const result = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
		if (!result.success) {
			console.warn('turnstile: challenge failed', result['error-codes']?.join(',') ?? 'no codes');
		}
		return result.success === true;
	} catch (err) {
		// Fail open on a siteverify outage; the signup rate limiter still applies.
		console.error('turnstile: siteverify unreachable', err instanceof Error ? err.message : err);
		return true;
	}
}
