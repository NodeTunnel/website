import { fail, redirect } from '@sveltejs/kit';
import { generateId } from '$lib/server/auth';
import { MAX_APP_DESCRIPTION, MAX_APP_NAME, field } from '$lib/server/validate';
import type { Actions, PageServerLoad } from './$types';

const MAX_APPS_PER_USER = 50;

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) throw redirect(303, '/login');

	const { results } = await platform!.env.DB.prepare(
		'SELECT id, name, description FROM apps WHERE dev = ? ORDER BY created DESC'
	)
		.bind(locals.user.id)
		.all<{ id: string; name: string; description: string }>();

	return { user: locals.user, apps: results };
};

export const actions: Actions = {
	create: async ({ request, locals, platform }) => {
		if (!locals.user) throw redirect(303, '/login');

		const data = await request.formData();
		const name = field(data, 'name', MAX_APP_NAME);
		const description = field(data, 'description', MAX_APP_DESCRIPTION);

		if (!name) {
			return fail(400, { error: 'Name is required.' });
		}

		const db = platform!.env.DB;
		const count = await db
			.prepare('SELECT COUNT(*) AS n FROM apps WHERE dev = ?')
			.bind(locals.user.id)
			.first<{ n: number }>();

		if (count && count.n >= MAX_APPS_PER_USER) {
			return fail(400, { error: `You can create at most ${MAX_APPS_PER_USER} apps.` });
		}

		const id = generateId();
		await db
			.prepare('INSERT INTO apps (id, name, description, dev) VALUES (?, ?, ?, ?)')
			.bind(id, name, description, locals.user.id)
			.run();

		return { success: true };
	}
};
