/**
 * Cloudflare R2 storage helper — zero-dependency.
 *
 * R2 exposes an S3-compatible API, so we sign every request ourselves
 * using AWS Signature V4 (HMAC-SHA256) via Node's `crypto` module.
 * That keeps the runtime free of any AWS SDK and works on Render.com
 * out of the box.
 *
 * Public surface:
 *   - uploadObject(key, body, contentType): PUT to the bucket
 *   - deleteObject(key):                   DELETE from the bucket
 *   - getSignedReadUrl(key, ttl):          presigned GET URL
 *   - publicUrl(key):                      public CDN URL when configured,
 *                                          otherwise a signed read URL
 *   - storageKey(namespace, fileName):     organize keys consistently
 */

import { createHash, createHmac, randomBytes } from "node:crypto";

export type R2Credentials = {
  accountId: string;
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl?: string;
};

export type UploadResult = {
  key: string;
  url: string;
  publicUrl?: string;
  size: number;
  contentType: string;
};

const REGION = "auto";
const SERVICE = "s3";
const DEFAULT_SIGNED_URL_TTL = 60 * 60; // 1 hour
const STORAGE_NAMESPACES = [
  "doctors",
  "services",
  "devices",
  "gallery",
  "journal",
  "brand",
  "trust",
  "payments",
  "pages",
  "media/uploads",
  "backups",
] as const;

export type StorageNamespace = (typeof STORAGE_NAMESPACES)[number];

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ENDPOINT &&
    process.env.R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY,
  );
}

export function getR2Credentials(): R2Credentials {
  const endpoint = process.env.R2_ENDPOINT;
  const bucket = process.env.R2_BUCKET;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const accountId = process.env.R2_ACCOUNT_ID ?? "";

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloudflare R2 is not configured. Set R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY.",
    );
  }

  return {
    accountId,
    endpoint: endpoint.replace(/\/$/, ""),
    bucket,
    accessKeyId,
    secretAccessKey,
    ...(process.env.R2_PUBLIC_BASE_URL
      ? { publicBaseUrl: process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, "") }
      : {}),
  };
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256(data: string | Buffer | Uint8Array): string {
  const hash = createHash("sha256");
  if (typeof data === "string") {
    hash.update(data, "utf8");
  } else {
    hash.update(data);
  }
  return hash.digest("hex");
}

function getSignatureKey(
  secret: string,
  dateStamp: string,
  region: string,
  service: string,
): Buffer {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

function uriEncode(value: string, encodeSlash = true): string {
  return value.replace(/[^A-Za-z0-9_.~\-/]/g, (char) => {
    if (char === "/" && !encodeSlash) return char;
    return char
      .split("")
      .map(
        (c) =>
          `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`,
      )
      .join("");
  });
}

function buildAmzDate(date: Date): { amzDate: string; dateStamp: string } {
  const pad = (n: number) => `${n}`.padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  const mm = pad(date.getUTCMonth() + 1);
  const dd = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const mi = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  return {
    amzDate: `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`,
    dateStamp: `${yyyy}${mm}${dd}`,
  };
}

type SignedRequestOptions = {
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  key: string;
  body?: Buffer | Uint8Array | string;
  contentType?: string;
};

function buildObjectUrl(creds: R2Credentials, key: string): URL {
  const safeKey = key.replace(/^\/+/, "");
  return new URL(`${creds.endpoint}/${creds.bucket}/${uriEncode(safeKey)}`);
}

function signRequest(
  creds: R2Credentials,
  opts: SignedRequestOptions,
): {
  url: URL;
  headers: Record<string, string>;
  body?: Buffer | Uint8Array | string;
} {
  const url = buildObjectUrl(creds, opts.key);
  const now = new Date();
  const { amzDate, dateStamp } = buildAmzDate(now);
  const payload =
    typeof opts.body === "string"
      ? Buffer.from(opts.body, "utf8")
      : (opts.body ?? Buffer.alloc(0));
  const payloadHash = sha256(payload);

  const headers: Record<string, string> = {
    host: url.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  if (opts.contentType) {
    headers["content-type"] = opts.contentType;
  }
  if (opts.body && (opts.body as { length?: number }).length !== undefined) {
    headers["content-length"] = String(
      (opts.body as { length: number }).length,
    );
  }

  const sortedHeaderKeys = Object.keys(headers).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map((k) => `${k}:${headers[k]!.trim()}\n`)
    .join("");
  const signedHeaders = sortedHeaderKeys.join(";");

  const canonicalRequest = [
    opts.method,
    url.pathname,
    url.search ? url.search.slice(1) : "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");

  const signingKey = getSignatureKey(
    creds.secretAccessKey,
    dateStamp,
    REGION,
    SERVICE,
  );
  const signature = createHmac("sha256", signingKey)
    .update(stringToSign, "utf8")
    .digest("hex");

  headers["authorization"] =
    `AWS4-HMAC-SHA256 Credential=${creds.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { url, headers, ...(opts.body ? { body: opts.body } : {}) };
}

export async function uploadObject(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
): Promise<UploadResult> {
  const creds = getR2Credentials();
  const payload =
    typeof body === "string" ? Buffer.from(body, "utf8") : Buffer.from(body);
  const signed = signRequest(creds, {
    method: "PUT",
    key,
    body: payload,
    contentType,
  });

  const response = await fetch(signed.url, {
    method: "PUT",
    headers: signed.headers,
    body: payload,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `R2 upload failed (${response.status} ${response.statusText}): ${text || "no body"}`,
    );
  }

  const url = publicUrl(key);
  const result: UploadResult = {
    key,
    url,
    size: payload.length,
    contentType,
  };
  if (creds.publicBaseUrl) {
    result.publicUrl = `${creds.publicBaseUrl}/${key.replace(/^\/+/, "")}`;
  }
  return result;
}

export async function deleteObject(key: string): Promise<void> {
  const creds = getR2Credentials();
  const signed = signRequest(creds, { method: "DELETE", key });
  const response = await fetch(signed.url, {
    method: "DELETE",
    headers: signed.headers,
  });
  if (!response.ok && response.status !== 404) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `R2 delete failed (${response.status} ${response.statusText}): ${text || "no body"}`,
    );
  }
}

/**
 * Generate a query-string-signed GET URL for a single object.
 * The URL is valid for `ttlSeconds` (default 1 hour) and includes
 * the bucket. This is the right thing to give to the browser when
 * R2_PUBLIC_BASE_URL is not configured.
 */
export function getSignedReadUrl(
  key: string,
  ttlSeconds: number = DEFAULT_SIGNED_URL_TTL,
): string {
  const creds = getR2Credentials();
  const url = buildObjectUrl(creds, key);
  const now = new Date();
  const { amzDate, dateStamp } = buildAmzDate(now);
  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const expires = Math.min(Math.max(ttlSeconds, 1), 7 * 24 * 60 * 60);

  url.searchParams.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
  url.searchParams.set(
    "X-Amz-Credential",
    `${creds.accessKeyId}/${credentialScope}`,
  );
  url.searchParams.set("X-Amz-Date", amzDate);
  url.searchParams.set("X-Amz-Expires", String(expires));
  url.searchParams.set("X-Amz-SignedHeaders", "host");

  const canonicalQuery = Array.from(url.searchParams.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(
      ([name, value]) =>
        `${uriEncode(name)}=${uriEncode(value, true).replace(/\//g, "%2F")}`,
    )
    .join("&");

  const canonicalHeaders = `host:${url.host}\n`;
  const signedHeaders = "host";
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalRequest = [
    "GET",
    url.pathname,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");

  const signingKey = getSignatureKey(
    creds.secretAccessKey,
    dateStamp,
    REGION,
    SERVICE,
  );
  const signature = createHmac("sha256", signingKey)
    .update(stringToSign, "utf8")
    .digest("hex");

  url.searchParams.set("X-Amz-Signature", signature);
  return url.toString();
}

export function publicUrl(key: string): string {
  const creds = getR2Credentials();
  if (creds.publicBaseUrl) {
    return `${creds.publicBaseUrl}/${key.replace(/^\/+/, "")}`;
  }
  return getSignedReadUrl(key);
}

/** Build a normalized storage key under a logical namespace. */
export function storageKey(
  namespace: StorageNamespace,
  fileName: string,
): string {
  const safeName = fileName
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  const id = randomBytes(8).toString("hex");
  return `${namespace}/${id}-${safeName || "file"}`;
}

export function backupKey(date: Date = new Date()): string {
  const pad = (n: number) => `${n}`.padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  const mm = pad(date.getUTCMonth() + 1);
  const dd = pad(date.getUTCDate());
  const id = randomBytes(6).toString("hex");
  return `backups/${yyyy}/${mm}/${dd}-${id}.json`;
}

export const STORAGE_NAMESPACES_LIST = STORAGE_NAMESPACES;
