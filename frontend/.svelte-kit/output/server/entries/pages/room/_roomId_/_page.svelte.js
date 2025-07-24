import { F as getContext, G as store_get, I as unsubscribe_stores, D as pop, z as push } from "../../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import { e as escape_html } from "../../../../chunks/state.svelte.js";
import "chessground";
import { Chess } from "chess.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
const game = new Chess();
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let pgn = "";
  const roomId = store_get($$store_subs ??= {}, "$page", page).params.roomId;
  $$payload.out.push(`<main class="flex flex-col lg:flex-row justify-center items-start min-h-screen bg-base-200 p-4 gap-4"><div class="w-full lg:w-auto lg:flex-1 flex justify-center"><div class="w-full max-w-lg aspect-square"></div></div> <div class="w-full lg:w-96 flex flex-col gap-4"><div class="card bg-base-100 shadow-xl"><div class="card-body"><h2 class="card-title">Room ID</h2> <p class="font-mono break-all">${escape_html(roomId)}</p> <div class="card-actions justify-end"><button class="btn btn-secondary btn-sm">Copy Link</button></div></div></div> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <div class="card bg-base-100 shadow-xl"><div class="card-body"><h2 class="card-title">Game Info</h2> <div class="flex justify-between"><span>Your Role:</span> <span class="badge badge-primary">${escape_html("Spectator")}</span></div> <div class="flex justify-between"><span>Current Turn:</span> <span class="badge badge-secondary">${escape_html(game.turn() === "w" ? "White" : "Black")}</span></div></div></div> <div class="card bg-base-100 shadow-xl"><div class="card-body"><h2 class="card-title">PGN</h2> <textarea class="textarea textarea-bordered h-48 font-mono text-xs" readonly>`);
  const $$body = escape_html(pgn);
  if ($$body) {
    $$payload.out.push(`${$$body}`);
  }
  $$payload.out.push(`</textarea></div></div></div></main>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
