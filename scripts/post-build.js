// This file is a no-op placeholder.
// The Cloudflare dashboard's Build command may reference "node scripts/post-build.js".
// With the current wrangler.toml config (pages_build_output_dir), the Pages deployment
// auto-deploys the output directory — no post-build processing is needed.
// This script exists only to prevent "Cannot find module" errors if the
// dashboard Build command includes it.
console.log("post-build.js: no-op (Pages deployment uses auto-deploy)");
