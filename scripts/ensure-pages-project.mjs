import { spawnSync } from "node:child_process";

const projectName = "auratreats";
const productionBranch = "main";
const compatibilityDate = "2026-10-25";
const compatibilityFlags = ["nodejs_compat"];

function runWrangler(args, options = {}) {
  const result = spawnSync("npx", ["wrangler", ...args], {
    encoding: "utf8",
    ...options,
  });

  if (result.error) {
    console.error(`Unable to run Wrangler: ${result.error.message}`);
    return { status: 1, stdout: "", stderr: result.error.message };
  }

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

export function ensurePagesProject() {
  console.log(`Checking Cloudflare Pages project "${projectName}"...`);

  const listResult = runWrangler(["pages", "project", "list", "--json"]);

  if (listResult.status !== 0) {
    console.error("Unable to list Cloudflare Pages projects.");
    return listResult.status;
  }

  let projects;
  try {
    projects = JSON.parse(listResult.stdout);
  } catch {
    console.error("Wrangler returned invalid JSON while listing Pages projects.");
    return 1;
  }

  const projectExists = projects.some(
    (project) => project["Project Name"] === projectName,
  );

  if (projectExists) {
    console.log(`Cloudflare Pages project "${projectName}" already exists.`);
    return 0;
  }

  console.log(`Creating Cloudflare Pages project "${projectName}"...`);

  const createResult = runWrangler(
    [
      "pages",
      "project",
      "create",
      projectName,
      "--force",
      "--production-branch",
      productionBranch,
      "--compatibility-date",
      compatibilityDate,
      ...compatibilityFlags.flatMap((flag) => ["--compatibility-flag", flag]),
    ],
    { stdio: "inherit" },
  );

  if (createResult.status !== 0) {
    console.error(`Unable to create Cloudflare Pages project "${projectName}".`);
    return createResult.status;
  }

  console.log(`Created Cloudflare Pages project "${projectName}".`);
  return 0;
}
