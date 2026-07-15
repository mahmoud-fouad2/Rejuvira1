import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";
import { PatientAccountStatus, ProcedureStatus, type UserRole } from "@prisma/client";

import { auth } from "@/auth";
import { formatDate } from "@/lib/portal/labels";
import { containsArabic, shapeArabicLine } from "@/lib/portal/arabic-shaper";
import { displayPhone, hasPortalCapability } from "@/lib/portal/permissions";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function buildCsv(rows: PatientExportRow[]) {
  const headers = [
    "المريض",
    "رقم الملف",
    "الجوال",
    "حالة الحساب",
    "آخر عملية",
    "الطبيب",
    "المتابعة القادمة",
    "آخر دخول",
    "رسائل غير مقروءة",
  ];
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) =>
      [
        row.name,
        row.fileNumber,
        row.phone,
        row.accountStatus,
        row.latestProcedure,
        row.doctor,
        row.nextAppointment,
        row.lastLogin,
        row.unreadMessages,
      ]
        .map(csvCell)
        .join(","),
    ),
  ].join("\r\n");
}

type PatientExportRow = {
  name: string;
  fileNumber: string;
  phone: string;
  accountStatus: string;
  latestProcedure: string;
  doctor: string;
  nextAppointment: string;
  lastLogin: string;
  unreadMessages: number;
};

async function rowsForRequest(request: NextRequest, role: UserRole) {
  const search = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const accountStatus = request.nextUrl.searchParams.get("accountStatus") ?? "";
  const procedureStatus = request.nextUrl.searchParams.get("procedureStatus") ?? "";
  const doctorId = request.nextUrl.searchParams.get("doctorId") ?? "";
  const unread = request.nextUrl.searchParams.get("unread") === "1";
  const includeArchived = request.nextUrl.searchParams.get("archived") === "1";
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  const where = {
    ...(includeArchived ? {} : { archivedAt: null }),
    ...(accountStatus &&
    (Object.values(PatientAccountStatus) as string[]).includes(accountStatus)
      ? { accountStatus: accountStatus as PatientAccountStatus }
      : {}),
    ...(from ? { createdAt: { gte: new Date(from) } } : {}),
    ...(to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            lte: new Date(`${to}T23:59:59+03:00`),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { fullNameAr: { contains: search, mode: "insensitive" as const } },
            { fullNameEn: { contains: search, mode: "insensitive" as const } },
            { fileNumber: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search.replace(/\D/g, "") } },
          ],
        }
      : {}),
    ...(unread
      ? {
          messages: {
            some: { senderType: "PATIENT" as const, status: "UNREAD" as const },
          },
        }
      : {}),
    ...((procedureStatus &&
      (Object.values(ProcedureStatus) as string[]).includes(procedureStatus)) ||
    doctorId
      ? {
          procedures: {
            some: {
              archivedAt: null,
              ...(procedureStatus
                ? { status: procedureStatus as ProcedureStatus }
                : {}),
              ...(doctorId ? { doctorId } : {}),
            },
          },
        }
      : {}),
  };

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      fullNameAr: true,
      fileNumber: true,
      phone: true,
      accountStatus: true,
      lastLoginAt: true,
      procedures: {
        where: { archivedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          customProcedureName: true,
          procedureDate: true,
          doctor: { select: { nameAr: true } },
          surgeonName: true,
          template: { select: { nameAr: true } },
        },
      },
      appointments: {
        where: {
          status: { in: ["SCHEDULED", "CONFIRMED"] },
          appointmentDate: { gte: new Date() },
        },
        orderBy: { appointmentDate: "asc" },
        take: 1,
        select: { appointmentDate: true },
      },
      _count: {
        select: {
          messages: {
            where: { senderType: "PATIENT", status: "UNREAD" },
          },
        },
      },
    },
  });

  return patients.map((patient) => {
    const procedure = patient.procedures[0];
    return {
      name: patient.fullNameAr,
      fileNumber: patient.fileNumber,
      phone: displayPhone(patient.phone, role),
      accountStatus: patient.accountStatus,
      latestProcedure: procedure
        ? procedure.customProcedureName || procedure.template?.nameAr || "إجراء"
        : "لا توجد عمليات",
      doctor: procedure?.doctor?.nameAr || procedure?.surgeonName || "—",
      nextAppointment: formatDate(patient.appointments[0]?.appointmentDate),
      lastLogin: formatDate(patient.lastLoginAt),
      unreadMessages: patient._count.messages,
    };
  });
}

function pdfText(text: string) {
  return containsArabic(text) ? shapeArabicLine(text) : text;
}

async function buildPdf(rows: PatientExportRow[]) {
  const [{ PDFDocument, rgb }, fontkitModule] = await Promise.all([
    import("pdf-lib"),
    import("@pdf-lib/fontkit"),
  ]);
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkitModule.default);
  const regularBytes = await readFile(
    path.join(process.cwd(), "public", "assets", "fonts", "IBMPlexSansArabic-Regular.ttf"),
  );
  const font = await pdfDoc.embedFont(regularBytes, { subset: true });
  let logoBytes: Buffer | null = null;
  try {
    logoBytes = await readFile(
      path.join(process.cwd(), "public", "media", "brand", "logo-dark.png"),
    );
  } catch {
    logoBytes = null;
  }
  const logo = logoBytes ? await pdfDoc.embedPng(logoBytes) : null;

  const pageSize: [number, number] = [842, 595];
  const margin = 34;
  const tableWidth = pageSize[0] - margin * 2;
  const rowHeight = 24;
  const headerHeight = 86;
  const footerY = 24;
  const columns = [
    { header: "المريض", width: 142, key: "name" as const },
    { header: "رقم الملف", width: 94, key: "fileNumber" as const },
    { header: "الجوال", width: 90, key: "phone" as const },
    { header: "الحساب", width: 82, key: "accountStatus" as const },
    { header: "آخر عملية", width: 132, key: "latestProcedure" as const },
    { header: "الطبيب", width: 100, key: "doctor" as const },
    { header: "المتابعة", width: 92, key: "nextAppointment" as const },
    { header: "رسائل", width: tableWidth - 732, key: "unreadMessages" as const },
  ];

  function safe(value: unknown, max = 24) {
    return String(value || "—").slice(0, max);
  }

  function drawRight(page: ReturnType<typeof pdfDoc.addPage>, text: string, x: number, y: number, size: number, color = rgb(0.13, 0.09, 0.24)) {
    const shaped = pdfText(text);
    const width = font.widthOfTextAtSize(shaped, size);
    page.drawText(shaped, { x: x - width, y, size, font, color });
  }

  function drawHeader(page: ReturnType<typeof pdfDoc.addPage>, pageNo: number) {
    page.drawRectangle({
      x: margin,
      y: pageSize[1] - headerHeight,
      width: tableWidth,
      height: 58,
      color: rgb(0.985, 0.975, 0.995),
      borderColor: rgb(0.86, 0.82, 0.9),
      borderWidth: 0.7,
    });
    page.drawRectangle({
      x: pageSize[0] - margin - 7,
      y: pageSize[1] - headerHeight,
      width: 7,
      height: 58,
      color: rgb(0.54, 0.31, 0.76),
    });
    if (logo) {
      const logoWidth = 62;
      page.drawImage(logo, {
        x: margin + 16,
        y: pageSize[1] - 74,
        width: logoWidth,
        height: (logo.height / logo.width) * logoWidth,
      });
    }
    drawRight(page, "تقرير سجل المرضى", pageSize[0] - margin - 22, pageSize[1] - 55, 17, rgb(0.2, 0.06, 0.32));
    drawRight(
      page,
      `تاريخ التصدير ${new Date().toISOString().slice(0, 10)} · عدد النتائج ${rows.length}`,
      pageSize[0] - margin - 22,
      pageSize[1] - 76,
      9,
      rgb(0.42, 0.39, 0.48),
    );
    page.drawText(`Page ${pageNo}`, {
      x: margin,
      y: footerY,
      size: 8,
      font,
      color: rgb(0.42, 0.39, 0.48),
    });
    page.drawText("Rejuvera Center - internal use", {
      x: margin,
      y: footerY + 12,
      size: 8,
      font,
      color: rgb(0.42, 0.39, 0.48),
    });
  }

  function drawTableHeader(page: ReturnType<typeof pdfDoc.addPage>, y: number) {
    page.drawRectangle({
      x: margin,
      y: y - rowHeight + 3,
      width: tableWidth,
      height: rowHeight,
      color: rgb(0.955, 0.94, 0.98),
    });
    let x = margin + tableWidth;
    for (const column of columns) {
      drawRight(page, column.header, x - 8, y - 13, 7.8, rgb(0.2, 0.06, 0.32));
      x -= column.width;
    }
  }

  let pageNumber = 0;
  let page = pdfDoc.addPage(pageSize);
  pageNumber += 1;
  drawHeader(page, pageNumber);
  let y = pageSize[1] - 112;
  drawTableHeader(page, y);
  y -= rowHeight;

  for (const row of rows) {
    if (y < 56) {
      page = pdfDoc.addPage(pageSize);
      pageNumber += 1;
      drawHeader(page, pageNumber);
      y = pageSize[1] - 112;
      drawTableHeader(page, y);
      y -= rowHeight;
    }
    page.drawLine({
      start: { x: margin, y: y + rowHeight - 2 },
      end: { x: margin + tableWidth, y: y + rowHeight - 2 },
      thickness: 0.3,
      color: rgb(0.88, 0.85, 0.91),
    });
    let x = margin + tableWidth;
    for (const column of columns) {
      const value =
        column.key === "unreadMessages"
          ? String(row.unreadMessages)
          : safe(row[column.key], column.key === "latestProcedure" ? 28 : 22);
      drawRight(page, value, x - 8, y + 6, 7.4);
      x -= column.width;
    }
    y -= rowHeight;
  }

  if (!rows.length) {
    drawRight(page, "لا توجد نتائج مطابقة للفلاتر الحالية.", pageSize[0] - margin, y - 10, 10, rgb(0.42, 0.39, 0.48));
  }
  return Buffer.from(await pdfDoc.save());
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !hasPortalCapability(role, "stats.export")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const format = request.nextUrl.searchParams.get("format") ?? "csv";
  const rows = await rowsForRequest(request, role);
  const date = new Date().toISOString().slice(0, 10);

  if (format === "pdf") {
    const pdf = await buildPdf(rows);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rejuvera-patients-${date}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return new NextResponse(`\uFEFF${buildCsv(rows)}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rejuvera-patients-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
