export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.DizqrJRv.js",app:"_app/immutable/entry/app.Dmc-Wd-1.js",imports:["_app/immutable/entry/start.DizqrJRv.js","_app/immutable/chunks/D6VN0yva.js","_app/immutable/chunks/CA9t6-D5.js","_app/immutable/chunks/Cxxy3Yn6.js","_app/immutable/entry/app.Dmc-Wd-1.js","_app/immutable/chunks/Cxxy3Yn6.js","_app/immutable/chunks/CA9t6-D5.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/B1qKSE-w.js","_app/immutable/chunks/CFg0r9tS.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/room/[roomId]",
				pattern: /^\/room\/([^/]+?)\/?$/,
				params: [{"name":"roomId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
