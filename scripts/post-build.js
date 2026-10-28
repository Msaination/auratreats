// The Cloudflare dashboard's Build command may reference "node scripts/post-build.js".
// Ensure the Pages project exists even when the platform invokes Wrangler
// directly instead of `npm run deploy`.
import("./ensure-pages-project.mjs")
  .then(({ ensurePagesProject }) => {
    const status = ensurePagesProject();
    if (status !== 0) {
      process.exit(status);
    }
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
