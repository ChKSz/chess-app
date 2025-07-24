import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
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
