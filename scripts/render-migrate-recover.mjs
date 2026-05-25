/**
 * Render dashboard currently runs `npx prisma migrate deploy` directly.
 * If the earlier BOM-broken gallery migration was recorded as failed,
 * resolve it before that command runs so Prisma can apply the fixed SQL.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const migrationName = "20260514180000_add_gallery_initial_split_percent";
const migrationPath = path.join(
  process.cwd(),
  "prisma",
  "migrations",
  migrationName,
  "migration.sql",
);

if (!process.env.DATABASE_URL || !existsSync(migrationPath)) {
  loadEnvFile(path.join(process.cwd(), ".env"));
  loadEnvFile(path.join(process.cwd(), "prisma", ".env"));
  if (!process.env.DATABASE_URL || !existsSync(migrationPath)) {
    process.exit(0);
  }
}

if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const require = createRequire(import.meta.url);

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

function prismaSpawnArgs() {
  try {
    const prismaPkg = require.resolve("prisma/package.json", {
      paths: [process.cwd()],
    });
    const cli = path.join(path.dirname(prismaPkg), "build/index.js");
    if (existsSync(cli)) {
      return {
        cmd: process.execPath,
        argv: [cli, "migrate", "resolve", "--rolled-back", migrationName],
        shell: false,
      };
    }
  } catch {
    /* use npx */
  }

  return {
    cmd: "npx",
    argv: ["prisma", "migrate", "resolve", "--rolled-back", migrationName],
    shell: process.platform === "win32",
  };
}

const { cmd, argv, shell } = prismaSpawnArgs();
const result = spawnSync(cmd, argv, {
  env: process.env,
  encoding: "utf8",
  shell,
  stdio: "pipe",
});

if (result.status === 0) {
  console.log(
    `[render-migrate-recover] Marked failed migration ${migrationName} as rolled back.`,
  );
  process.exit(0);
}

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
if (output) {
  console.log(
    `[render-migrate-recover] No recovery needed or recovery unavailable: ${output}`,
  );
}

process.exit(0);
