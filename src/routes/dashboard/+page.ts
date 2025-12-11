import { pb } from '$lib/pocketbase';
import { redirect } from '@sveltejs/kit';

export const ssr = false;

export const load = async () => {
	if (!pb.authStore.isValid) {
		throw redirect(303, '/login');
	}

	const user = pb.authStore.record ? { ...pb.authStore.record } : null;

	const apps = await pb.collection('apps').getFullList({
		filter: user ? `dev="${user.id}"` : ''
	});

	return {
		user,
		apps
	};
};
