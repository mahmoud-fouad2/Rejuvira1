import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import {
  getSignedReadUrl,
  isR2Configured,
  type StorageNamespace,
} from "@/lib/storage/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PROXY_BYTES = 12 * 1024 * 1024;
const READABLE_NAMESPACES: readonly StorageNamespace[] = [
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
];
const TRUSTED_STATIC_HOSTS = new Set([
  "rejuvera.sa",
  "www.rejuvera.sa",
  "cdn.rejuvera.sa",
  "media.rejuvera.sa",
  "rejuveracenter.sa",
  "www.rejuveracenter.sa",
  "cdn.rejuveracenter.sa",
  "media.rejuveracenter.sa",
  "rejuvira1.onrender.com",
  "localhost",
  "127.0.0.1",
  "ma-fo.info",
]);

function hostFromEnvUrl(value: string | undefined) {
  if (!value) return null;
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function allowedMediaHost(hostname: string) {
  const host = hostname.toLowerCase();
  const configuredHosts = [
    hostFromEnvUrl(process.env.R2_PUBLIC_BASE_URL),
    hostFromEnvUrl(process.env.R2_ENDPOINT),
    hostFromEnvUrl(process.env.NEXT_PUBLIC_SITE_URL),
    hostFromEnvUrl(process.env.APP_URL),
  ].filter((value): value is string => Boolean(value));

  return (
    TRUSTED_STATIC_HOSTS.has(host) ||
    configuredHosts.includes(host) ||
    host.endsWith(".r2.dev") ||
    host.endsWith(".r2.cloudflarestorage.com") ||
    host.endsWith(".cloudflarestorage.com") ||
    host.endsWith(".onrender.com") ||
    host.endsWith(".rejuvera.sa") ||
    host.endsWith(".rejuveracenter.sa")
  );
}

function badRequest(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function isReadableR2Key(value: string) {
  const key = value.trim().replace(/^\/+/, "");
  return (
    key.length > 0 &&
    key.length <= 512 &&
    !key.includes("..") &&
    READABLE_NAMESPACES.some(
      (namespace) => key === namespace || key.startsWith(`${namespace}/`),
    )
  );
}

export async function GET(request: Request) {
  const session = await auth();
  if (
    !session?.user?.role ||
    !canAccessAdminRoute("/admin/media", session.user.role)
  ) {
    return badRequest("Unauthorized", 401);
  }

  const requestUrl = new URL(request.url);
  const rawUrl = requestUrl.searchParams.get("url");
  const rawKey = requestUrl.searchParams.get("key")?.trim() ?? "";
  if (!rawUrl && !rawKey) return badRequest("Missing url or key");

  let sourceUrl: URL;
  if (rawKey) {
    if (!isReadableR2Key(rawKey)) return badRequest("Invalid media key");
    if (!isR2Configured()) return badRequest("R2 is not configured", 503);
    sourceUrl = new URL(getSignedReadUrl(rawKey));
  } else {
    try {
      sourceUrl = new URL(rawUrl!);
    } catch {
      return badRequest("Invalid url");
    }

    if (!["https:", "http:"].includes(sourceUrl.protocol)) {
      return badRequest("Unsupported url protocol");
    }

    if (!allowedMediaHost(sourceUrl.hostname)) {
      return badRequest("Media host is not allowed", 403);
    }
  }

  const upstream = await fetch(sourceUrl, {
    redirect: "follow",
    cache: "no-store",
  });
  if (!upstream.ok) {
    return badRequest(`Could not fetch image (${upstream.status})`, 502);
  }

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";
  if (!contentType.toLowerCase().startsWith("image/")) {
    return badRequest("Only image responses can be proxied", 415);
  }

  const contentLength = Number(upstream.headers.get("content-length") ?? "0");
  if (contentLength > MAX_PROXY_BYTES) {
    return badRequest("Image is too large", 413);
  }

  const buffer = Buffer.from(await upstream.arrayBuffer());
  if (buffer.byteLength > MAX_PROXY_BYTES) {
    return badRequest("Image is too large", 413);
  }

  return new NextResponse(buffer, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Length": String(buffer.byteLength),
      "Content-Type": contentType,
    },
  });
}
