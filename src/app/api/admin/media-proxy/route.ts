import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PROXY_BYTES = 12 * 1024 * 1024;
const TRUSTED_STATIC_HOSTS = new Set([
  "rejuvera.sa",
  "www.rejuvera.sa",
  "rejuvira1.onrender.com",
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
  ].filter((value): value is string => Boolean(value));

  return (
    TRUSTED_STATIC_HOSTS.has(host) ||
    configuredHosts.includes(host) ||
    host.endsWith(".r2.dev") ||
    host.endsWith(".r2.cloudflarestorage.com")
  );
}

function badRequest(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
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
  if (!rawUrl) return badRequest("Missing url");

  let sourceUrl: URL;
  try {
    sourceUrl = new URL(rawUrl);
  } catch {
    return badRequest("Invalid url");
  }

  if (!["https:", "http:"].includes(sourceUrl.protocol)) {
    return badRequest("Unsupported url protocol");
  }

  if (!allowedMediaHost(sourceUrl.hostname)) {
    return badRequest("Media host is not allowed", 403);
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
