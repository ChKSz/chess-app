import adapter from '@sveltejs/adapter-cloudflare';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		postcss: true,
	}),

	kit: {
		adapter: adapter(),
	},
	// Move vite config here, outside of kit
	vite: {
		css: {
			postcss: './postcss.config.js',
		},
	},
};

export default config;
