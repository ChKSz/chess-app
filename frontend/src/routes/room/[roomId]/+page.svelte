<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Chessground } from 'chessground';
	import 'chessground/assets/chessground.base.css';
	import { game } from '$lib/chess';
	import type { Key, Color } from 'chessground/types';

	let el: HTMLElement;
	let ws: WebSocket;
	let playerColor: 'w' | 'b' | 'spectator' = 'spectator';
	let ground: any; // Chessground instance
	let gameOverMessage = '';
	let pgn = '';

	const roomId = $page.params.roomId;

	function toDests(moves: any[]) {
		const dests = new Map<Key, Key[]>();
		for (const m of moves) {
			const arr = dests.get(m.from) || [];
			arr.push(m.to);
			dests.set(m.from, arr);
		}
		return dests;
	}

	function updateBoard() {
		if (!ground) return;

		const turnColor = game.turn() === 'w' ? 'white' : 'black';
		const isMovable = playerColor !== 'spectator' && game.turn() === playerColor && !game.isGameOver();

		ground.set({
			fen: game.fen(),
			turnColor,
			movable: {
				color: isMovable ? (turnColor as Color) : undefined,
				dests: isMovable ? toDests(game.moves({ verbose: true })) : new Map(),
			},
		});
	}

	onMount(async () => {
		ground = Chessground(el, {
			fen: game.fen(),
			movable: {
				free: false,
			},
		});

		const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const wsUrl = new URL(`/room/${roomId}`, `${wsProtocol}//${window.location.host}`.replace('http', 'ws'));
		ws = new WebSocket(wsUrl);

		ws.addEventListener('message', (msg) => {
			const data = JSON.parse(msg.data);

			if (data.type === 'role') {
				playerColor = data.color;
				if (playerColor === 'b') {
					ground.set({ orientation: 'black' });
				}
			} else if (data.type === 'state') {
				game.load(data.fen);
				pgn = data.pgn;
			} else if (data.type === 'gameOver') {
				gameOverMessage = data.result;
			}
			updateBoard();
		});

		ground.set({
			movable: {
				events: {
					after: (orig, dest) => {
						if (game.isGameOver()) return;
						ws.send(JSON.stringify({ type: 'move', from: orig, to: dest }));
					},
				},
			},
		});
	});
</script>

<main class="flex flex-col lg:flex-row justify-center items-start min-h-screen bg-base-200 p-4 gap-4">
	<div class="w-full lg:w-auto lg:flex-1 flex justify-center">
		<div class="w-full max-w-lg aspect-square" bind:this={el}></div>
	</div>

	<div class="w-full lg:w-96 flex flex-col gap-4">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Room ID</h2>
				<p class="font-mono break-all">{roomId}</p>
				<div class="card-actions justify-end">
					<button class="btn btn-secondary btn-sm" on:click={() => navigator.clipboard.writeText(window.location.href)}>Copy Link</button>
				</div>
			</div>
		</div>

		{#if gameOverMessage}
			<div role="alert" class="alert alert-success">
				<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
				<span>{gameOverMessage}</span>
			</div>
		{/if}

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Game Info</h2>
				<div class="flex justify-between">
					<span>Your Role:</span>
					<span class="badge badge-primary">{playerColor === 'spectator' ? 'Spectator' : playerColor === 'w' ? 'White' : 'Black'}</span>
				</div>
				<div class="flex justify-between">
					<span>Current Turn:</span>
					<span class="badge badge-secondary">{game.turn() === 'w' ? 'White' : 'Black'}</span>
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">PGN</h2>
				<textarea class="textarea textarea-bordered h-48 font-mono text-xs" readonly>{pgn}</textarea>
			</div>
		</div>
	</div>
</main>

<style>
	:global(.cg-wrap) {
		width: 100%;
		height: 100%;
	}
</style>