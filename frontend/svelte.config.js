import adapter from '@sveltejs/adapter-cloudflare';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		postcss: true,
		typescript: false,
	}),

	kit: {
		adapter: adapter(),
	},
	vite: {
		css: {
			postcss: './postcss.config.js',
		},
	},
};

export default config;
