export const MAX_EMAIL = 254;
export const MAX_PASSWORD = 200;
export const MIN_PASSWORD = 8;
export const MAX_APP_NAME = 100;
export const MAX_APP_DESCRIPTION = 500;

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function field(data: FormData, name: string, max: number): string {
	return String(data.get(name) ?? '')
		.trim()
		.slice(0, max);
}

// Not trimmed: leading/trailing spaces are legal in a password.
export function passwordField(data: FormData, name: string): string {
	return String(data.get(name) ?? '').slice(0, MAX_PASSWORD + 1);
}

export function isValidEmail(email: string): boolean {
	return email.length > 0 && email.length <= MAX_EMAIL && EMAIL_RE.test(email);
}

export function passwordProblem(password: string): string | null {
	if (password.length < MIN_PASSWORD) {
		return `Password must be at least ${MIN_PASSWORD} characters.`;
	}
	if (password.length > MAX_PASSWORD) {
		return `Password must be at most ${MAX_PASSWORD} characters.`;
	}
	return null;
}

export function normalizeEmail(email: string): string {
	return email.toLowerCase();
}
