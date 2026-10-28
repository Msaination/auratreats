// This file is a no-op placeholder.
// The Cloudflare dashboard's Build command may reference "node scripts/post-build.js".
// The separate deployment workflow lives in scripts/deploy-pages.mjs, which
// ensures the Pages project exists before deploying the output directory.
// This script exists only to prevent "Cannot find module" errors if the
// dashboard Build command includes it.
console.log("post-build.js: no-op");
