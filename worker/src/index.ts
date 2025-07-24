import { RoomDO } from './RoomDO';

export interface Env {
	ROOM: DurableObjectNamespace;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		// CORS preflight for development
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		if (path === '/api/new') {
			if (request.method !== 'POST') {
				return new Response('Method Not Allowed', { status: 405 });
			}

			const id = env.ROOM.newUniqueId();
			const roomId = id.toString();
			
			const wssUrl = `/room/${roomId}`;

			return new Response(JSON.stringify({ roomId, wssUrl }), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*', // Allow CORS for the frontend dev server
				},
			});
		}

		const roomMatch = path.match(/^\/room\/([a-f0-9]{64})$/);
		if (roomMatch) {
			const roomId = roomMatch[1];
			let id;
			try {
				id = env.ROOM.idFromString(roomId);
			} catch (err) {
				return new Response('Invalid room ID format', { status: 400 });
			}
			const room = env.ROOM.get(id);
			return room.fetch(request);
		}

		return new Response('Not Found', { status: 404 });
	},
};

export { RoomDO };
