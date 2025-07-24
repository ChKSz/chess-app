<script lang="ts">
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';

	const loading = writable(false);

	async function createNewGame() {
		loading.set(true);
		try {
			const res = await fetch('http://127.0.0.1:8787/api/new', { method: 'POST' });
			const { roomId } = await res.json();
			goto(`/room/${roomId}`);
		} catch (error) {
			console.error('Failed to create new game:', error);
			// Optionally, show an error message to the user.
			loading.set(false);
		}
	}
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Cloudflare Chess</h1>
			<p class="py-6">A real-time, minimalist chess application powered by Cloudflare Workers and SvelteKit. Create a room and share the link to play.</p>
			<button on:click={createNewGame} class="btn btn-primary" disabled={$loading}>
				{#if $loading}
					<span class="loading loading-spinner"></span>
					Creating Room...
				{:else}
					Create New Game
				{/if}
			</button>
		</div>
	</div>
</div>
