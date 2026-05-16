import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import {
  isR2Configured,
  storageKey,
  uploadObject,
  type StorageNamespace,
} from "@/lib/storage/r2";
import { recordAppLog } from "@/lib/app-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_NAMESPACES: readonly StorageNamespace[] = [
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

const ALLOWED_CONTENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "application/pdf",
]);

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

function badRequest(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.role || !canAccessAdminRoute("/admin/media", session.user.role)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (!isR2Configured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Cloudflare R2 is not configured. Set R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY.",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return badRequest("Invalid multipart payload");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return badRequest("Missing 'file' field");
  }

  const namespaceRaw = String(form.get("namespace") ?? "media/uploads");
  const namespace = ALLOWED_NAMESPACES.includes(namespaceRaw as StorageNamespace)
    ? (namespaceRaw as StorageNamespace)
    : "media/uploads";

  const fileName = file.name || "upload.bin";
  const lowerName = fileName.toLowerCase();
  const contentType =
    file.type ||
    (lowerName.endsWith(".ico") ? "image/x-icon" : "application/octet-stream");
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return badRequest(
      `Unsupported content type: ${contentType}. Allowed: ${Array.from(ALLOWED_CONTENT_TYPES).join(", ")}`,
    );
  }
  const maxBytes = contentType === "application/pdf" ? MAX_DOCUMENT_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return badRequest(
      `File too large (${file.size} bytes). Limit is ${maxBytes} bytes.`,
      413,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = storageKey(namespace, fileName);

  try {
    const uploaded = await uploadObject(key, buffer, contentType);
    await recordAppLog({
      level: "info",
      kind: "media",
      message: `Uploaded ${uploaded.key}`,
      meta: {
        size: uploaded.size,
        contentType: uploaded.contentType,
        namespace,
        actor: session.user.email ?? session.user.id ?? "unknown",
      },
    });
    return NextResponse.json({
      ok: true,
      key: uploaded.key,
      url: uploaded.url,
      publicUrl: uploaded.publicUrl ?? uploaded.url,
      size: uploaded.size,
      contentType: uploaded.contentType,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await recordAppLog({
      level: "error",
      kind: "media",
      message: `Upload failed: ${message}`,
      meta: { namespace },
    });
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
