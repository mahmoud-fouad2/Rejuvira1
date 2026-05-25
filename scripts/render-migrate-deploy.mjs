/**
 * Render build helper: retry `prisma migrate deploy` when Prisma hits P1002
 * (postgres advisory lock acquisition timed out after 10s — not configurable in Prisma).
 *
 * Env:
 *   PRISMA_MIGRATE_DEPLOY_RETRIES — attempts (default 6)
 *   PRISMA_MIGRATE_DEPLOY_RETRY_DELAY_MS — pause between attempts (default 15000)
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), "prisma", ".env"));

if (!process.env.DATABASE_URL) {
  const message =
    "[render-migrate-deploy] DATABASE_URL is not set; Prisma migrate deploy cannot run.";
  if (
    process.env.RENDER ||
    process.env.RENDER_SERVICE_ID ||
    process.env.RENDER_EXTERNAL_HOSTNAME
  ) {
    console.error(message);
    process.exit(1);
  }
  console.warn(`${message} Skipping outside Render.`);
  process.exit(0);
}

if (process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
  console.warn(
    "[render-migrate-deploy] DIRECT_URL is not set; using DATABASE_URL for Prisma migrate deploy.",
  );
}

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
