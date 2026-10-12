/** Pure launch policy, shared with tests. Never reads credentials or writes env files. */
export function standaloneHeapFlags(env, memoryLimitBytes) {
  if (/--max[-_]old[-_]space[-_]size(?:=|\s)/.test(env.NODE_OPTIONS ?? ""))
    return [];
  const requested = Number(env.MAX_OLD_SPACE_SIZE || 384);
  const heap = Number.isInteger(requested) && requested >= 64 ? requested : 384;
  // Low-memory containers need room for native memory, buffers and runtime overhead.
  const limitMb = memoryLimitBytes / (1024 * 1024);
  const budget =
    Number.isFinite(limitMb) && limitMb >= 128 && limitMb <= 1024
      ? Math.max(64, Math.floor(limitMb / 2))
      : heap;
  return [`--max-old-space-size=${Math.min(heap, budget)}`];
}
