import { spawnSync } from "node:child_process";
import { ensurePagesProject } from "./ensure-pages-project.mjs";

const outputDirectory = ".vercel/output/static";
const projectName = "auratreats";

function runWrangler(args) {
  const result = spawnSync("npx", ["wrangler", ...args], {
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`Unable to run Wrangler: ${result.error.message}`);
    return 1;
  }

  return result.status ?? 1;
}

const ensureStatus = ensurePagesProject();
if (ensureStatus !== 0) {
  process.exit(ensureStatus);
}

console.log(`Deploying ${outputDirectory} to Cloudflare Pages...`);

const deployStatus = runWrangler([
  "pages",
  "deploy",
  outputDirectory,
  `--project-name=${projectName}`,
]);

if (deployStatus !== 0) {
  process.exit(deployStatus);
}

console.log(`Successfully deployed "${projectName}".`);
