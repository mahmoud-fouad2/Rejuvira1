import { PortalActorType } from "@prisma/client";
import { writePortalAudit } from "@/lib/portal/audit";
import { getPatientSession } from "@/lib/portal/patient-auth";
import { prisma } from "@/lib/prisma";
import { readPatientDocumentObject } from "@/lib/storage/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateHeaders = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};

function unavailable(status: number) {
  return Response.json(
    { error: status === 401 ? "Unauthorized" : status === 404 ? "Not found" : "Document unavailable" },
    { status, headers: privateHeaders },
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getPatientSession();
  if (!session || session.mustChangePassword) return unavailable(401);

  const { id } = await params;
  const document = await prisma.patientDocument.findFirst({
    where: {
      id,
      patientId: session.patientId,
      visibility: "PATIENT_VISIBLE",
      archivedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
    select: { id: true, storageKey: true, fileName: true },
  });
  if (!document) return unavailable(404);

  const object = await readPatientDocumentObject(document.storageKey).catch(() => null);
  if (object?.status === 404) {
    await object.body?.cancel();
    return unavailable(404);
  }
  if (!object?.ok || !object.body) {
    await object?.body?.cancel();
    return unavailable(503);
  }

  await writePortalAudit({
    actorType: PortalActorType.PATIENT,
    actorId: session.patientId,
    actorName: session.fullNameAr,
    action: "document.downloaded",
    entityType: "document",
    entityId: document.id,
    patientId: session.patientId,
  });
  const filename = (document.fileName || "document").replace(/[/\\\u0000-\u001f\u007f]/g, "_");
  const asciiName = filename.replace(/[^a-zA-Z0-9_.-]/g, "_") || "document";
  const encodedName = encodeURIComponent(filename).replace(/['()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return new Response(object.body, {
    headers: {
      ...privateHeaders,
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
    },
  });
}
