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
  const page = pdfDoc.addPage([842, 595]);
  const width = page.getWidth();
  let y = 535;
  page.drawRectangle({
    x: 32,
    y: 500,
    width: width - 64,
    height: 58,
    color: rgb(0.965, 0.94, 0.91),
    borderColor: rgb(0.55, 0.35, 0.72),
    borderWidth: 0.8,
  });
  page.drawText("Rejuvera Center - Patient Register", {
    x: 52,
    y: 528,
    size: 16,
    font,
    color: rgb(0.16, 0.06, 0.28),
  });
  page.drawText(`Generated: ${new Date().toISOString().slice(0, 10)} | Rows: ${rows.length}`, {
    x: 52,
    y: 508,
    size: 9,
    font,
    color: rgb(0.38, 0.33, 0.45),
  });
  y = 470;
  const headers = ["Patient", "File", "Phone", "Account", "Procedure", "Doctor", "Unread"];
  const xs = [52, 188, 280, 382, 482, 620, 760];
  headers.forEach((header, index) => {
    page.drawText(header, {
      x: xs[index] ?? 52,
      y,
      size: 8,
      font,
      color: rgb(0.33, 0.2, 0.45),
    });
  });
  y -= 16;
  for (const row of rows.slice(0, 28)) {
    page.drawLine({
      start: { x: 52, y: y + 10 },
      end: { x: 790, y: y + 10 },
      thickness: 0.35,
      color: rgb(0.88, 0.84, 0.9),
    });
    [
      row.name,
      row.fileNumber,
      row.phone,
      row.accountStatus,
      row.latestProcedure,
      row.doctor,
      String(row.unreadMessages),
    ].forEach((text, index) => {
      page.drawText(pdfText(String(text).slice(0, index === 4 ? 24 : 18)), {
        x: xs[index] ?? 52,
        y,
        size: 7.5,
        font,
        color: rgb(0.13, 0.1, 0.18),
      });
    });
    y -= 15;
  }
  page.drawText("For internal Rejuvera staff use only.", {
    x: 52,
    y: 28,
    size: 8,
    font,
    color: rgb(0.45, 0.4, 0.5),
  });
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
