/**
 * Starts the Next.js standalone Node server from `.next/standalone`
 * so static assets and cwd match production Docker/Render setups.
 *
 * On Render Starter (512 MB) the V8 heap is capped at ~460 MB so the
 * total RSS stays under the plan limit.  Override with the env var
 * MAX_OLD_SPACE_SIZE (e.g. "1800" on a Standard-2 GB plan) or pass
 * NODE_OPTIONS="--max-old-space-size=…" to disable the default cap.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

const cwd = path.join(process.cwd(), ".next", "standalone");

const defaultHeap = process.env.MAX_OLD_SPACE_SIZE || "384";
const nodeOptions = process.env.NODE_OPTIONS ?? "";
const heapFlag = nodeOptions.includes("--max-old-space-size")
  ? []
  : [`--max-old-space-size=${defaultHeap}`];

const env = {
  ...process.env,
  HOSTNAME: process.env.BIND_HOST || "0.0.0.0",
};

const code =
  spawnSync(process.execPath, [...heapFlag, "server.js"], {
    cwd,
    stdio: "inherit",
    env,
  }).status ?? 1;

process.exit(code);
