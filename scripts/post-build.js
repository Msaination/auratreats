/**
 * Post-build transformation for Workers + Assets deployment.
 *
 * next-on-pages generates a _worker.js/ directory with:
 * - index.js: Worker script that uses import() to load edge function modules
 * - __next-on-pages-dist__/: edge function scripts, cache, manifest
 *
 * In Workers + Assets, import() can't resolve from the ASSETS binding.
 * This script patches the Worker script to replace dynamic import() calls
 * with ASSETS.fetch()-based module loading.
 *
 * The function modules use webpack-style module format (not pure ESM),
 * so we load them via fetch() + Blob URL + import().
 */
const fs = require("fs");
const path = require("path");

const BASE_DIR = ".vercel/output/static";
const WORKER_DIR = path.join(BASE_DIR, "_worker.js");
const WORKER_SCRIPT = path.join(WORKER_DIR, "index.js");
const OUTPUT_FILE = path.join(BASE_DIR, "worker.js");
const DIST_DIR = path.join(WORKER_DIR, "__next-on-pages-dist__");

if (!fs.existsSync(WORKER_SCRIPT)) {
  console.error("Error: _worker.js/index.js not found. Did next-on-pages run?");
  process.exit(1);
}

let content = fs.readFileSync(WORKER_SCRIPT, "utf8");

console.log("Patching Worker script for Workers + Assets...");

// Patch 1: Replace import(e.entrypoint) with ASSETS.fetch + Blob URL import
// The entrypoint path is relative (e.g., "__next-on-pages-dist__/functions/index.func.js")
// We need to load it via ASSETS.fetch(), create a Blob URL, and import that.
content = content.replace(
  /await import\(e\.entrypoint\)/g,
  `(await (async()=>{const p=e.entrypoint.startsWith("./")?e.entrypoint:"./ "+e.entrypoint;const r=await t.ASSETS.fetch(new URL(p,"https://worker.local/").href);const s=await r.arrayBuffer();const u=new URL("blob:"+location.origin);const b=new Blob([s],{type:"text/javascript"});const url=URL.createObjectURL(b);try{const m=await import(url);return m.__esModule?m:{default:m};}finally{URL.revokeObjectURL(url);}})())`
);

// Patch 2: Replace import(e) in cache module loader (j function)
// Path e is like "./__next-on-pages-dist__/cache/kv.js"
content = content.replace(
  /async function j\(e\)\{return import\(e\)\}/,
  `async function j(e){const r=await t.ASSETS.fetch(new URL(e,"https://worker.local/").href);const s=await r.arrayBuffer();const b=new Blob([s],{type:"text/javascript"});const url=URL.createObjectURL(b);try{const m=await import(url);return m.__esModule?m:{default:m};}finally{URL.revokeObjectURL(url);}}`
);

// Write the patched Worker script
fs.writeFileSync(OUTPUT_FILE, content);

// Move __next-on-pages-dist__ to the assets root — these files are needed
// at runtime by the patched Worker (loaded via ASSETS.fetch + Blob URL import)
const DIST_DST = path.join(BASE_DIR, "__next-on-pages-dist__");
if (fs.existsSync(DIST_DST)) {
  fs.rmSync(DIST_DST, { recursive: true, force: true });
}
fs.renameSync(DIST_DIR, DIST_DST);

// Clean up the _worker.js directory — index.js is now worker.js, dist is at assets root
fs.rmSync(WORKER_DIR, { recursive: true, force: true });

const stats = fs.statSync(OUTPUT_FILE);
const sizeKB = (stats.size / 1024).toFixed(1);
console.log(`Patched worker.js created: ${sizeKB}KB`);
console.log("Removed _worker.js/ directory (files will be served via ASSETS)");
console.log("Build assets ready in .vercel/output/static/");
