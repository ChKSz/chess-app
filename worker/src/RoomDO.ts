import { Chess } from 'chess.js';

// Session-specific player data.
interface Player {
	socket: WebSocket;
	color: 'w' | 'b';
}

export class RoomDO implements DurableObject {
	state: DurableObjectState;
	game: Chess;
	sessions: WebSocket[] = [];
	players: Player[] = [];

	constructor(state: DurableObjectState) {
		this.state = state;
		this.game = new Chess();
		// Load the game state from storage on startup.
		this.state.blockConcurrencyWhile(async () => {
			const pgn = await this.state.storage.get<string>('pgn');
			if (pgn) {
				this.game.loadPgn(pgn);
			}
		});
	}

	async fetch(request: Request): Promise<Response> {
		const upgradeHeader = request.headers.get('Upgrade');
		if (!upgradeHeader || upgradeHeader !== 'websocket') {
			return new Response('Expected Upgrade: websocket', { status: 426 });
		}

		const [client, server] = Object.values(new WebSocketPair());
		this.handleSession(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	handleSession(socket: WebSocket) {
		this.sessions.push(socket);
		socket.accept();

		// Assign player color if spots are available.
		let playerColor: 'w' | 'b' | 'spectator' = 'spectator';
		if (!this.players.find((p) => p.color === 'w')) {
			playerColor = 'w';
			this.players.push({ socket, color: 'w' });
		} else if (!this.players.find((p) => p.color === 'b')) {
			playerColor = 'b';
			this.players.push({ socket, color: 'b' });
		}

		// Inform the client of their role.
		socket.send(JSON.stringify({ type: 'role', color: playerColor }));
		// Send the current board state.
		this.broadcastState();

		socket.addEventListener('message', async (msg) => {
			try {
				const data = JSON.parse(msg.data as string);
				const player = this.players.find((p) => p.socket === socket);

				if (!player) return;

				if (data.type === 'move' && player.color === this.game.turn()) {
					this.game.move({ from: data.from, to: data.to });
					await this.state.storage.put('pgn', this.game.pgn());
					this.broadcastState();

					if (this.game.isGameOver()) {
						this.broadcastGameOver();
					}
				}
			} catch (e) {
				const error = e instanceof Error ? e.message : 'Invalid move';
				socket.send(JSON.stringify({ type: 'error', message: error }));
			}
		});

		socket.addEventListener('close', () => {
			this.sessions = this.sessions.filter((s) => s !== socket);
			this.players = this.players.filter((p) => p.socket !== socket);
		});
	}

	broadcastState() {
		const state = {
			type: 'state',
			fen: this.game.fen(),
			pgn: this.game.pgn(),
		};
		this.broadcast(JSON.stringify(state));
	}

	broadcastGameOver() {
		let result = 'Game over';
		if (this.game.isCheckmate()) {
			result = `Checkmate! ${this.game.turn() === 'w' ? 'Black' : 'White'} wins.`;
		} else if (this.game.isDraw()) {
			result = 'Draw!';
		} else if (this.game.isStalemate()) {
			result = 'Stalemate!';
		} else if (this.game.isThreefoldRepetition()) {
			result = 'Draw by threefold repetition!';
		}
		this.broadcast(JSON.stringify({ type: 'gameOver', result }));
	}

	broadcast(message: string) {
		for (const session of this.sessions) {
			try {
				session.send(message);
			} catch (e) {
				this.sessions = this.sessions.filter((s) => s !== session);
				this.players = this.players.filter((p) => p.socket !== session);
			}
		}
	}
}