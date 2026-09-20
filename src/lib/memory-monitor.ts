import { readFileSync } from "node:fs";
import { getHeapStatistics } from "node:v8";

const MB = 1024 * 1024;
const SAMPLE_INTERVAL_MS = 60_000;
const INFO_EVERY_N_SAMPLES = 5;
const WARN_RSS_MB = Number(process.env.MEMORY_WARN_MB) || 400;

function readNumber(paths: string[]) {
  for (const path of paths) {
    try {
      const value = Number(readFileSync(path, "utf8").trim());
      if (Number.isFinite(value)) return value;
    } catch {
      // Not a Linux cgroup host (or file missing): try the next path.
    }
  }
  return null;
}

function toMb(bytes: number) {
  return Math.round(bytes / MB);
}

// Who launched this server and how much memory each wrapper process holds.
function describeProcessChain() {
  const chain: string[] = [];
  let pid = process.pid;
  for (let depth = 0; depth < 4 && pid > 1; depth++) {
    try {
      const status = readFileSync(`/proc/${pid}/status`, "utf8");
      const rssKb = Number(/VmRSS:\s+(\d+)/.exec(status)?.[1]);
      const parent = Number(/PPid:\s+(\d+)/.exec(status)?.[1]);
      const command = readFileSync(`/proc/${pid}/cmdline`, "utf8")
        .split("\0")
        .filter(Boolean)
        .join(" ")
        .slice(0, 120);
      chain.push(
        `${pid}[${command}] rss=${Number.isFinite(rssKb) ? Math.round(rssKb / 1024) : "?"}MB`,
      );
      pid = parent;
    } catch {
      break;
    }
  }
  return chain;
}

export function startMemoryMonitor() {
  const state = globalThis as typeof globalThis & {
    __memoryMonitorStarted?: boolean;
  };
  if (state.__memoryMonitorStarted) return;
  state.__memoryMonitorStarted = true;

  const chain = describeProcessChain();
  console.info(
    `[mem] started heapLimit=${toMb(getHeapStatistics().heap_size_limit)}MB` +
      (chain.length ? ` processChain=${chain.join(" <- ")}` : ""),
  );

  let samples = 0;
  const timer = setInterval(() => {
    samples += 1;
    const usage = process.memoryUsage();
    const rssMb = toMb(usage.rss);
    const overWarn = rssMb >= WARN_RSS_MB;
    if (!overWarn && samples % INFO_EVERY_N_SAMPLES !== 1) return;

    const container = readNumber([
      "/sys/fs/cgroup/memory.current",
      "/sys/fs/cgroup/memory/memory.usage_in_bytes",
    ]);
    const limit = readNumber([
      "/sys/fs/cgroup/memory.max",
      "/sys/fs/cgroup/memory/memory.limit_in_bytes",
    ]);

    const fields = [
      `rss=${rssMb}MB`,
      `heapUsed=${toMb(usage.heapUsed)}MB`,
      `heapTotal=${toMb(usage.heapTotal)}MB`,
      `external=${toMb(usage.external)}MB`,
      `arrayBuffers=${toMb(usage.arrayBuffers)}MB`,
      `up=${Math.round(process.uptime() / 60)}m`,
    ];
    if (container !== null) fields.push(`container=${toMb(container)}MB`);
    if (limit !== null && limit < 2 ** 50) fields.push(`limit=${toMb(limit)}MB`);

    (overWarn ? console.warn : console.info)(`[mem] ${fields.join(" ")}`);
  }, SAMPLE_INTERVAL_MS);
  timer.unref();
}
