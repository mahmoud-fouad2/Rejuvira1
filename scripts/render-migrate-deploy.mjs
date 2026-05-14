/**
 * Render build helper: retry `prisma migrate deploy` when Prisma hits P1002
 * (postgres advisory lock acquisition timed out after 10s — not configurable in Prisma).
 *
 * Env:
 *   PRISMA_MIGRATE_DEPLOY_RETRIES — attempts (default 6)
 *   PRISMA_MIGRATE_DEPLOY_RETRY_DELAY_MS — pause between attempts (default 15000)
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const maxAttempts = Math.max(
  1,
  Number.parseInt(process.env.PRISMA_MIGRATE_DEPLOY_RETRIES ?? "6", 10) || 6,
);
const delayMs = Math.max(
  0,
  Number.parseInt(
    process.env.PRISMA_MIGRATE_DEPLOY_RETRY_DELAY_MS ?? "15000",
    10,
  ) || 15000,
);

function sleep(ms) {
  if (ms <= 0) return;
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  } catch {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      /* spin fallback */
    }
  }
}

const require = createRequire(import.meta.url);
const useShell = process.platform === "win32";

function migrateSpawnArgs() {
  try {
    const prismaPkg = require.resolve("prisma/package.json", {
      paths: [process.cwd()],
    });
    const cli = path.join(path.dirname(prismaPkg), "build/index.js");
    if (existsSync(cli)) {
      return {
        cmd: process.execPath,
        argv: [cli, "migrate", "deploy"],
        shell: false,
      };
    }
  } catch {
    /* use npx */
  }
  return {
    cmd: "npx",
    argv: ["prisma", "migrate", "deploy"],
    shell: useShell,
  };
}

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  const { cmd, argv, shell } = migrateSpawnArgs();
  const result = spawnSync(cmd, argv, {
    stdio: "inherit",
    shell,
    env: process.env,
  });

  const code = result.status;
  if (code === 0) {
    process.exit(0);
  }

  console.error(
    `[render-migrate-deploy] Attempt ${attempt}/${maxAttempts} failed (exit ${code ?? "signal"}).`,
  );

  if (attempt < maxAttempts) {
    console.error(
      `[render-migrate-deploy] Waiting ${delayMs}ms before retry (Neon wake / concurrent deploy / advisory lock contention).`,
    );
    sleep(delayMs);
  }
}

process.exit(1);
