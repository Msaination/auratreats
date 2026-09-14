const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const http = require("http");
const { parse } = require("url");

const next = require("next");

const appDir = __dirname;
const hostname = process.env.HOST || process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || process.env.CPANEL_PORT || 8080);

process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.PORT = String(port);
process.env.HOST = hostname;
process.env.HOSTNAME = hostname;

const buildDir = path.join(appDir, ".next");
const hasProductionBuild = fs.existsSync(path.join(buildDir, "BUILD_ID"));

if (!hasProductionBuild) {
  console.log("No production build found. Running next build...");
  execSync("npm run build", {
    cwd: appDir,
    stdio: "inherit",
    env: process.env,
  });
}

const app = next({
  dev: false,
  dir: appDir,
  hostname,
  port,
});

const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });

    server.on("error", (error) => {
      if (error && error.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Please set PORT to a free port.`);
      } else {
        console.error("Server error:", error);
      }
      process.exit(1);
    });

    server.listen(port, hostname, () => {
      console.log(`Production server running at http://${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start the Next.js production server:", error);
    process.exit(1);
  });
