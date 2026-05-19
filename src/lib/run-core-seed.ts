import { spawnSync } from "node:child_process";
import path from "node:path";

export type CoreSeedRunResult = {
  ok: boolean;
  status: number;
  stdout: string;
  stderr: string;
};

export function runCoreSeed(options?: { force?: boolean }): CoreSeedRunResult {
  const scriptPath = path.join(process.cwd(), "scripts/seed-core-content.mjs");
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      ...(options?.force ? { SEED_CORE_FORCE: "1" } : {}),
    },
  });

  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}
