// 100k is the ceiling here: higher exceeds the Workers request CPU budget.
const PBKDF2_ITERATIONS = 100_000;
// Work factor implied by the legacy unversioned `salt:hash` format.
const LEGACY_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

const encoder = new TextEncoder();

function toHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
	const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
	for (let i = 0; i < bytes.length; i++) {
		bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	}
	return bytes;
}

async function derive(
	password: string,
	salt: Uint8Array<ArrayBuffer>,
	iterations: number
): Promise<Uint8Array> {
	const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
		'deriveBits'
	]);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
		key,
		HASH_BYTES * 8
	);
	return new Uint8Array(bits);
}

export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}

export function timingSafeEqualString(a: string, b: string): boolean {
	return timingSafeEqual(encoder.encode(a), encoder.encode(b));
}

// Format: pbkdf2$<iterations>$<salt>$<hash> -- work factor travels with the hash.
export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
	const hash = await derive(password, salt, PBKDF2_ITERATIONS);
	return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(hash)}`;
}

// Accepts the versioned format or the legacy `salt:hash` one.
function parseStored(
	stored: string
): { saltHex: string; hashHex: string; iterations: number } | null {
	if (stored.startsWith('pbkdf2$')) {
		const [, iterStr, saltHex, hashHex] = stored.split('$');
		const iterations = Number(iterStr);
		if (!saltHex || !hashHex || !Number.isInteger(iterations) || iterations <= 0) return null;
		return { saltHex, hashHex, iterations };
	}
	const [saltHex, hashHex] = stored.split(':');
	if (!saltHex || !hashHex) return null;
	return { saltHex, hashHex, iterations: LEGACY_ITERATIONS };
}

export function needsRehash(stored: string): boolean {
	const parsed = parseStored(stored);
	return !parsed || parsed.iterations < PBKDF2_ITERATIONS;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const parsed = parseStored(stored);
	if (!parsed) return false;

	let actual: Uint8Array;
	try {
		actual = await derive(password, fromHex(parsed.saltHex), parsed.iterations);
	} catch (err) {
		// Fail closed rather than 500 on an unaffordable/unsupported work factor.
		console.error(
			`verifyPassword: derivation failed at ${parsed.iterations} iterations`,
			err instanceof Error ? err.message : err
		);
		return false;
	}

	return timingSafeEqual(actual, fromHex(parsed.hashHex));
}

const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function generateId(length = 15): string {
	const bytes = crypto.getRandomValues(new Uint8Array(length));
	let out = '';
	for (let i = 0; i < length; i++) out += ID_ALPHABET[bytes[i] % ID_ALPHABET.length];
	return out;
}

export function generateSessionId(): string {
	return toHex(crypto.getRandomValues(new Uint8Array(32)));
}

export const SESSION_COOKIE = 'session';
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
