/**
 * Starts the Next.js standalone Node server from `.next/standalone`
 * so static assets and cwd match production Docker/Render setups.
 *
 * On low-memory Linux containers, reserve half the memory for native allocations
 * and runtime overhead. MAX_OLD_SPACE_SIZE is an upper bound; an explicit
 * NODE_OPTIONS heap flag retains priority. Linux execve replaces this launcher
 * rather than keeping an extra Node process resident for the server lifetime.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { readFileSync } from "node:fs";
import { standaloneHeapFlags } from "./standalone-runtime.mjs";

const cwd = path.join(process.cwd(), ".next", "standalone");

let memoryLimitBytes;
for (const file of [
  "/sys/fs/cgroup/memory.max",
  "/sys/fs/cgroup/memory/memory.limit_in_bytes",
]) {
  try {
    const value = Number(readFileSync(file, "utf8").trim());
    if (Number.isFinite(value) && value > 0 && value < 2 ** 50) {
      memoryLimitBytes = value;
      break;
    }
  } catch {
    /* Local Windows/macOS: use the explicit/default budget. */
  }
}
const heapFlag = standaloneHeapFlags(process.env, memoryLimitBytes);

const env = {
  ...process.env,
  HOSTNAME: process.env.BIND_HOST || "0.0.0.0",
};

if (process.platform === "linux" && typeof process.execve === "function") {
  process.chdir(cwd);
  process.execve(
    process.execPath,
    [process.execPath, ...heapFlag, "server.js"],
    env,
  );
}

const code =
  spawnSync(process.execPath, [...heapFlag, "server.js"], {
    cwd,
    stdio: "inherit",
    env,
  }).status ?? 1;

process.exit(code);
