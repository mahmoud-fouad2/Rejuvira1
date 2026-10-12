/** Server-only, fixed-key cache for catalog/settings reads, never leads or sessions. */
export const PUBLIC_CONTENT_KEYS = [
  "doctors",
  "services",
  "devices",
  "categories",
  "settings",
] as const;
export type PublicContentKey = (typeof PUBLIC_CONTENT_KEYS)[number];
type Entry = {
  pending?: Promise<unknown>;
  value?: unknown;
  expires: number;
  bytes: number;
};

export class PublicContentCache {
  private entries = new Map<PublicContentKey, Entry>();
  private bytes = 0;
  private counters = { hits: 0, misses: 0, joined: 0 };
  private ttlMs: number;
  private maxBytes: number;
  private now: () => number;
  constructor(ttlMs = 10_000, maxBytes = 8 * 1024 * 1024, now = Date.now) {
    this.ttlMs = ttlMs;
    this.maxBytes = maxBytes;
    this.now = now;
  }

  clear() {
    this.entries.clear();
    this.bytes = 0;
  }

  stats() {
    return {
      ...this.counters,
      entries: this.entries.size,
      bytes: this.bytes,
      pending: [...this.entries.values()].filter((e) => e.pending).length,
    };
  }

  async read<T>(key: PublicContentKey, load: () => Promise<T>): Promise<T> {
    if (!(PUBLIC_CONTENT_KEYS as readonly string[]).includes(key))
      throw new Error("Unsupported public content key");
    const existing = this.entries.get(key);
    if (existing?.pending) {
      this.counters.joined++;
      return structuredClone(await existing.pending) as T;
    }
    if (existing && existing.expires > this.now()) {
      this.counters.hits++;
      return structuredClone(existing.value) as T;
    }
    if (existing) {
      this.bytes -= existing.bytes;
      this.entries.delete(key);
    }
    this.counters.misses++;
    const entry: Entry = { expires: 0, bytes: 0 };
    this.entries.set(key, entry);
    entry.pending = Promise.resolve().then(load);
    try {
      const value = (await entry.pending) as T;
      // An edit may invalidate the cache while this DB query is still running.
      if (this.entries.get(key) === entry) {
        const bytes = Buffer.byteLength(JSON.stringify(value) ?? "null");
        if (bytes <= Math.min(this.maxBytes, 2 * 1024 * 1024)) {
          for (const [otherKey, other] of this.entries) {
            if (this.bytes + bytes <= this.maxBytes) break;
            if (otherKey !== key && !other.pending) {
              this.entries.delete(otherKey);
              this.bytes -= other.bytes;
            }
          }
          if (this.bytes + bytes <= this.maxBytes) {
            entry.value = structuredClone(value);
            entry.bytes = bytes;
            entry.expires = this.now() + this.ttlMs;
            this.bytes += bytes;
          } else this.entries.delete(key);
        } else this.entries.delete(key);
      }
      return structuredClone(value);
    } catch (error) {
      if (this.entries.get(key) === entry) this.entries.delete(key);
      throw error; // Failures/seed fallbacks never poison the shared cache.
    } finally {
      delete entry.pending;
    }
  }
}

const shared = globalThis as typeof globalThis & {
  __rejuveraPublicContentCache?: PublicContentCache;
};
export const publicContentCache = (shared.__rejuveraPublicContentCache ??=
  new PublicContentCache());
export const invalidatePublicContentCache = () => publicContentCache.clear();
