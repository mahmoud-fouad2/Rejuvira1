import { NextRequest, NextResponse } from "next/server";
import { PortalActorType } from "@prisma/client";

import { auth } from "@/auth";
import { buildInstructionsPdf, type PdfLanguage } from "@/lib/portal/instructions-pdf";
import { writePortalAudit } from "@/lib/portal/audit";
import { hasPortalCapability } from "@/lib/portal/permissions";
import { getPortalSettings } from "@/lib/portal/settings";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !hasPortalCapability(role, "pdf.print")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const settings = await getPortalSettings();
  const langParam = request.nextUrl.searchParams.get("lang");
  const language: PdfLanguage =
    langParam === "en" || langParam === "both" || langParam === "ar"
      ? langParam
      : (settings.defaultPrintLanguage as PdfLanguage);

  const result = await buildInstructionsPdf({
    procedureId: id,
    language,
    generatedByName: session.user?.name ?? "الفريق",
    // Staff with full-phone capability see the full number on the printout.
    maskPatientPhone: !hasPortalCapability(role, "patients.viewFullPhone"),
  });
  if (!result) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const procedure = await prisma.procedure.findUnique({
    where: { id },
    select: { patientId: true },
  });
  await writePortalAudit({
    actorType: PortalActorType.STAFF,
    actorId: session.user?.id,
    actorName: session.user?.name ?? undefined,
    action: "procedure.pdf_generated",
    entityType: "procedure",
    entityId: id,
    patientId: procedure?.patientId,
    changes: { language, channel: "staff" },
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
