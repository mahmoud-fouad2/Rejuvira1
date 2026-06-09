/**
 * Lightweight in-memory token-bucket rate limiter.
 *
 * Suitable for protecting public endpoints (contact form submissions, login)
 * from casual abuse. Each Node.js worker keeps its own state; on multi-region
 * or multi-instance deployments this provides best-effort throttling per
 * worker rather than globally — sufficient given that an external WAF /
 * Cloudflare layer is expected for true distributed limits.
 *
 * The limiter never throws. On overflow it returns `{ ok: false }` with a
 * `retryAfter` value (seconds) the caller can surface to the user.
 */

type Bucket = {
  tokens: number;
  lastRefill: number;
};

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 5_000;

function pruneIfNeeded(now: number) {
  if (buckets.size <= MAX_BUCKETS) return;
  // Drop entries that have been idle for >10 min.
  const cutoff = now - 10 * 60 * 1000;
  for (const [key, bucket] of buckets) {
    if (bucket.lastRefill < cutoff) {
      buckets.delete(key);
    }
  }
  // If still too many, drop arbitrary oldest entries.
  if (buckets.size > MAX_BUCKETS) {
    const overage = buckets.size - MAX_BUCKETS;
    let dropped = 0;
    for (const key of buckets.keys()) {
      if (dropped++ >= overage) break;
      buckets.delete(key);
    }
  }
}

export type RateLimitOptions = {
  /** Unique key for this request — usually `route:ip` or `route:userId`. */
  key: string;
  /** Max requests allowed per window. */
  limit: number;
  /** Window in seconds. */
  windowSeconds: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfter: number;
};

export function rateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const refillPerMs = options.limit / (options.windowSeconds * 1000);

  let bucket = buckets.get(options.key);
  if (!bucket) {
    bucket = { tokens: options.limit, lastRefill: now };
    buckets.set(options.key, bucket);
    pruneIfNeeded(now);
  } else {
    const elapsed = now - bucket.lastRefill;
    bucket.tokens = Math.min(
      options.limit,
      bucket.tokens + elapsed * refillPerMs,
    );
    bucket.lastRefill = now;
  }

  if (bucket.tokens < 1) {
    const needed = 1 - bucket.tokens;
    const retryAfter = Math.max(1, Math.ceil(needed / refillPerMs / 1000));
    return { ok: false, remaining: 0, retryAfter };
  }

  bucket.tokens -= 1;
  return {
    ok: true,
    remaining: Math.floor(bucket.tokens),
    retryAfter: 0,
  };
}

/**
 * Best-effort client IP extraction from forwarded headers.
 *
 * Cloudflare/edge headers are preferred before generic proxy chains.
 */
function normalizeForwardedIp(value: string | null | undefined) {
  const first = value?.split(",")[0]?.trim();
  if (!first) return null;

  const withoutQuotes = first.replace(/^["']|["']$/g, "");
  const bracketedIpv6 = withoutQuotes.match(/^\[([a-f0-9:.]+)\](?::\d+)?$/i);
  if (bracketedIpv6?.[1]) return bracketedIpv6[1];

  const ipv4WithPort = withoutQuotes.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  const candidate = ipv4WithPort?.[1] ?? withoutQuotes;
  return /^[a-f0-9:.]+$/i.test(candidate) ? candidate : null;
}

export function normalizeClientIp(value: string | null | undefined) {
  return normalizeForwardedIp(value);
}

export function extractClientIp(headers: Headers): string {
  const directHeaders = [
    "cf-connecting-ip",
    "true-client-ip",
    "x-real-ip",
    "x-client-ip",
  ];

  for (const header of directHeaders) {
    const ip = normalizeForwardedIp(headers.get(header));
    if (ip) return ip;
  }

  const xff = headers.get("x-forwarded-for");
  if (xff) {
    for (const part of xff.split(",")) {
      const ip = normalizeForwardedIp(part);
      if (ip) return ip;
    }
  }

  return "unknown";
}
