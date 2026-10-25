#!/usr/bin/env bash
set -euo pipefail

# Build the Next.js app for Cloudflare using next-on-pages,
# then flatten the _worker.js directory into a file for Workers+Assets compatibility.
#
# next-on-pages generates a Pages-style _worker.js/ directory (with index.js +
# __next-on-pages-dist__/). Cloudflare Workers+Assets rejects _worker.js as a
# Pages-specific convention. This script:
#   1. Moves __next-on-pages-dist__/ to the assets root
#   2. Converts _worker.js/index.js → worker.js (avoiding the reserved _worker.js name)
#   3. Removes the old _worker.js/ directory

echo "Building with @cloudflare/next-on-pages..."
npx @cloudflare/next-on-pages@1

WORKER_DIR=".vercel/output/static/_worker.js"
ASSETS_DIR=".vercel/output/static"

echo "Flattening _worker.js directory for Workers+Assets..."
cp -r "$WORKER_DIR/__next-on-pages-dist__" "$ASSETS_DIR/"
cp "$WORKER_DIR/index.js" "$ASSETS_DIR/worker.js"
rm -rf "$WORKER_DIR"

echo "Done."
