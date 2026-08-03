// Wraps Cloudflare Rate Limiting bindings; counters are per-colo, best-effort.

export interface RateLimiter {
	limit(options: { key: string }): Promise<{ success: boolean }>;
}

// Falls back to a shared bucket so a missing header doesn't disable the limit.
export function clientKey(request: Request): string {
	return request.headers.get('CF-Connecting-IP') ?? 'unknown';
}

// True when allowed; a missing binding is allowed through (local dev).
export async function allow(limiter: RateLimiter | undefined, key: string): Promise<boolean> {
	if (!limiter) {
		console.warn('rate limiter binding missing; request allowed unthrottled');
		return true;
	}
	const { success } = await limiter.limit({ key });
	return success;
}
