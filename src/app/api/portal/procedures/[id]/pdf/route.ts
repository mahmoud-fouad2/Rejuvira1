import { NextRequest, NextResponse } from "next/server";
import { PortalActorType } from "@prisma/client";

import { buildInstructionsPdf, type PdfLanguage } from "@/lib/portal/instructions-pdf";
import { writePortalAudit } from "@/lib/portal/audit";
import { getPatientSession } from "@/lib/portal/patient-auth";
import { getPortalSettings } from "@/lib/portal/settings";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getPatientSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  // The patient may only print their own, published instructions.
  const procedure = await prisma.procedure.findFirst({
    where: {
      id,
      patientId: session.patientId,
      archivedAt: null,
      instructionsPublishedAt: { not: null },
    },
    select: { id: true },
  });
  if (!procedure) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const settings = await getPortalSettings();
  const langParam = request.nextUrl.searchParams.get("lang");
  const language: PdfLanguage =
    langParam === "en" || langParam === "both" || langParam === "ar"
      ? langParam
      : (settings.defaultPrintLanguage as PdfLanguage);

  const result = await buildInstructionsPdf({
    procedureId: id,
    language,
    generatedByName: session.fullNameAr,
    maskPatientPhone: true,
  });
  if (!result) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await writePortalAudit({
    actorType: PortalActorType.PATIENT,
    actorId: session.patientId,
    actorName: session.fullNameAr,
    action: "procedure.pdf_generated",
    entityType: "procedure",
    entityId: id,
    patientId: session.patientId,
    changes: { language, channel: "patient" },
  });

  return new NextResponse(new Uint8Array(result.buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${result.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
