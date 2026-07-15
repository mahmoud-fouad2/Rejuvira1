import { NextRequest, NextResponse } from "next/server";
import { PortalActorType } from "@prisma/client";

import { auth } from "@/auth";
import { buildPatientProfilePdf } from "@/lib/portal/patient-profile-pdf";
import { writePortalAudit } from "@/lib/portal/audit";
import { hasPortalCapability } from "@/lib/portal/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const role = session?.user?.role;
  if (
    !role ||
    !hasPortalCapability(role, "patients.view") ||
    !hasPortalCapability(role, "pdf.print")
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const result = await buildPatientProfilePdf({
    patientId: id,
    role,
    generatedByName: session.user?.name ?? "فريق Rejuvera",
  });

  if (!result) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await writePortalAudit({
    actorType: PortalActorType.STAFF,
    actorId: session.user?.id,
    actorName: session.user?.name ?? undefined,
    action: "patient.profile_pdf_generated",
    entityType: "patient",
    entityId: id,
    patientId: id,
    changes: { channel: "staff", scope: "full_patient_file" },
  });

  const download = request.nextUrl.searchParams.get("download") === "1";
  return new NextResponse(new Uint8Array(result.buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${result.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
