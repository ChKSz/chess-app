import { G as store_get, I as unsubscribe_stores, D as pop, z as push } from "../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import { w as writable } from "../../chunks/index2.js";
import { e as escape_html } from "../../chunks/state.svelte.js";
const replacements = {
  translate: /* @__PURE__ */ new Map([
    [true, "yes"],
    [false, "no"]
  ])
};
function attr(name, value, is_boolean = false) {
  if (value == null || !value && is_boolean) return "";
  const normalized = name in replacements && replacements[name].get(value) || value;
  const assignment = is_boolean ? "" : `="${escape_html(normalized, true)}"`;
  return ` ${name}${assignment}`;
}
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  const loading = writable(false);
  $$payload.out.push(`<div class="hero min-h-screen bg-base-200"><div class="hero-content text-center"><div class="max-w-md"><h1 class="text-5xl font-bold">Cloudflare Chess</h1> <p class="py-6">A real-time, minimalist chess application powered by Cloudflare Workers and SvelteKit. Create a room and share the link to play.</p> <button class="btn btn-primary"${attr("disabled", store_get($$store_subs ??= {}, "$loading", loading), true)}>`);
  if (store_get($$store_subs ??= {}, "$loading", loading)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<span class="loading loading-spinner"></span> Creating Room...`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`Create New Game`);
  }
  $$payload.out.push(`<!--]--></button></div></div></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
