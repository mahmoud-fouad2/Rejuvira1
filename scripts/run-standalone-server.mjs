/**
 * Starts the Next.js standalone Node server from `.next/standalone`
 * so static assets and cwd match production Docker/Render setups.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

const cwd = path.join(process.cwd(), ".next", "standalone");
const code =
  spawnSync(process.execPath, ["server.js"], {
    cwd,
    stdio: "inherit",
    env: process.env,
  }).status ?? 1;

process.exit(code);
