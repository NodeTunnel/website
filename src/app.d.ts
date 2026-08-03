import type { D1Database } from '@cloudflare/workers-types';
import type { RateLimiter } from '$lib/server/ratelimit';

declare global {
	namespace App {
		interface Locals {
			user: { id: string; email: string } | null;
		}
		interface Platform {
			env: {
				DB: D1Database;
				RELAY_TOKEN: string;
				TURNSTILE_SITE_KEY?: string;
				TURNSTILE_SECRET_KEY?: string;
				LOGIN_LIMITER: RateLimiter;
				SIGNUP_LIMITER: RateLimiter;
				RELAY_LIMITER: RateLimiter;
			};
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}
}

export {};
