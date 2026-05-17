import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import { getCrmSubmissions } from "@/lib/content-repository";

function buildRows(submissions: Awaited<ReturnType<typeof getCrmSubmissions>>) {
  return submissions.map((submission) => ({
    Name: submission.fullName,
    Phone: submission.phone,
    Email: submission.email ?? "",
    Service: submission.serviceLabel ?? "",
    Status: submission.status,
    Source: submission.source,
    PreferredAppointment: submission.preferredAppointmentAt ?? "",
    AppointmentNotes: submission.appointmentNotes ?? "",
    Notes: submission.notes ?? "",
    CreatedAt: submission.createdAt,
  }));
}

async function createPdfBuffer(
  submissions: Awaited<ReturnType<typeof getCrmSubmissions>>,
) {
  const [{ PDFDocument, StandardFonts, rgb }, fontkitMod] = await Promise.all([
    import("pdf-lib"),
    import("@pdf-lib/fontkit"),
  ]);

  const fontkit = fontkitMod.default;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fontPath = path.join(
    process.cwd(),
    "public",
    "assets",
    "fonts",
    "IBMPlexSansArabic-Regular.ttf",
  );
  const customFontBytes = await readFile(fontPath);
  const customFont = await pdfDoc.embedFont(customFontBytes);
  const fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let page = pdfDoc.addPage([595, 842]);
  let cursorY = 790;

  page.drawText("Rejuvera CRM Export", {
    x: 40,
    y: cursorY,
    size: 18,
    font: fallbackFont,
    color: rgb(0.06, 0.08, 0.1),
  });

  cursorY -= 32;
  page.drawText("تقرير طلبات التواصل", {
    x: 40,
    y: cursorY,
    size: 16,
    font: customFont,
    color: rgb(0.06, 0.08, 0.1),
  });

  cursorY -= 30;

  submissions.forEach((submission, index) => {
    if (cursorY < 110) {
      page = pdfDoc.addPage([595, 842]);
      cursorY = 790;
    }

    page.drawText(`${index + 1}. ${submission.fullName}`, {
      x: 40,
      y: cursorY,
      size: 11,
      font: customFont,
      color: rgb(0.06, 0.08, 0.1),
    });
    cursorY -= 16;
    page.drawText(`Phone: ${submission.phone} | Status: ${submission.status}`, {
      x: 40,
      y: cursorY,
      size: 10,
      font: fallbackFont,
      color: rgb(0.35, 0.33, 0.31),
    });
    cursorY -= 14;
    page.drawText(
      `Appointment: ${submission.preferredAppointmentAt ?? "N/A"}`,
      {
        x: 40,
        y: cursorY,
        size: 10,
        font: fallbackFont,
        color: rgb(0.35, 0.33, 0.31),
      },
    );
    cursorY -= 14;
    page.drawText(
      `Service: ${submission.serviceLabel ?? "N/A"} | Source: ${submission.source}`,
      {
        x: 40,
        y: cursorY,
        size: 10,
        font: fallbackFont,
        color: rgb(0.35, 0.33, 0.31),
      },
    );
    cursorY -= 14;
    page.drawText(submission.notes ?? "No internal notes", {
      x: 40,
      y: cursorY,
      size: 10,
      font: customFont,
      color: rgb(0.35, 0.33, 0.31),
      maxWidth: 510,
    });
    cursorY -= 26;
  });

  return Buffer.from(await pdfDoc.save());
}

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.role) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!canAccessAdminRoute("/admin/crm", session.user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const format = request.nextUrl.searchParams.get("format") ?? "xlsx";
  const submissions = await getCrmSubmissions();

  if (format === "xlsx") {
    const XLSX = await import("xlsx");
    const rows = buildRows(submissions);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    XLSX.utils.book_append_sheet(workbook, worksheet, "CRM");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="rejuvira-crm-export.xlsx"',
      },
    });
  }

  if (format === "pdf") {
    const buffer = await createPdfBuffer(submissions);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="rejuvira-crm-export.pdf"',
      },
    });
  }

  return NextResponse.json(
    { message: "Unsupported export format" },
    { status: 400 },
  );
}
