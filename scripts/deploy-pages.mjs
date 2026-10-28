import { spawnSync } from "node:child_process";

const projectName = "auratreats";
const productionBranch = "main";
const outputDirectory = ".vercel/output/static";
const compatibilityDate = "2026-10-25";
const compatibilityFlags = ["nodejs_compat"];

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

console.log(`Ensuring Cloudflare Pages project "${projectName}" exists...`);

const createStatus = runWrangler([
  "pages",
  "project",
  "create",
  projectName,
  "--production-branch",
  productionBranch,
  "--compatibility-date",
  compatibilityDate,
  ...compatibilityFlags.flatMap((flag) => ["--compatibility-flag", flag]),
]);

if (createStatus === 0) {
  console.log(`Created Cloudflare Pages project "${projectName}".`);
} else {
  console.log(
    `Could not create "${projectName}"; continuing in case the project already exists.`,
  );
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
