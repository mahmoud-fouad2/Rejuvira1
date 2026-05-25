import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { canManageCrm } from "@/lib/admin-permissions";
import { buildCsv } from "@/lib/backup";
import { getCrmSubmissions } from "@/lib/content-repository";
import {
  buildStyledXlsx,
  xlsxContentType,
  type XlsxColumn,
} from "@/lib/xlsx-export";

const STATUS_AR: Record<string, string> = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  FOLLOW_UP: "متابعة",
  BOOKED: "محجوز",
  CLOSED: "مغلق",
};

const CRM_EXPORT_COLUMNS: readonly XlsxColumn[] = [
  { key: "name", label: "الاسم", width: 24 },
  { key: "phone", label: "الجوال", width: 18 },
  { key: "service", label: "الخدمة", width: 28 },
  { key: "status", label: "الحالة", width: 16 },
  { key: "source", label: "المصدر", width: 28 },
  { key: "owner", label: "المسؤول", width: 20 },
  { key: "createdAt", label: "تاريخ الدخول", width: 22 },
  { key: "lastInteraction", label: "آخر تفاعل", width: 22 },
  { key: "email", label: "البريد الإلكتروني", width: 28 },
  { key: "message", label: "رسالة العميل", width: 36 },
  { key: "notes", label: "ملاحظات داخلية", width: 36 },
  { key: "tags", label: "الوسوم", width: 22 },
  { key: "utmSource", label: "utm_source", width: 18 },
  { key: "utmMedium", label: "utm_medium", width: 18 },
  { key: "utmCampaign", label: "utm_campaign", width: 22 },
  { key: "utmContent", label: "utm_content", width: 22 },
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("966")) return digits.slice(3);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

function filterSubmissions(
  submissions: Awaited<ReturnType<typeof getCrmSubmissions>>,
  request: NextRequest,
) {
  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const source = params.get("source");
  const service = params.get("service");
  const owner = params.get("owner");
  const ids = (params.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const from = params.get("from");
  const to = params.get("to");
  const search = normalizeText(params.get("search") ?? "");
  const searchPhone = normalizePhone(params.get("search") ?? "");
  const fromTime = from ? new Date(`${from}T00:00:00+03:00`).getTime() : null;
  const toTime = to ? new Date(`${to}T23:59:59+03:00`).getTime() : null;

  return submissions.filter((submission) => {
    if (ids.length && !ids.includes(submission.id)) return false;
    if (status && status !== "ALL" && submission.status !== status) {
      return false;
    }
    if (source && source !== "ALL" && submission.source !== source) {
      return false;
    }
    if (service && service !== "ALL" && submission.serviceSlug !== service) {
      return false;
    }
    if (owner && owner !== "ALL") {
      if (owner === "_unassigned" && submission.assignedToId) return false;
      if (owner !== "_unassigned" && submission.assignedToId !== owner) {
        return false;
      }
    }
    const created = new Date(submission.createdAt).getTime();
    if (fromTime && created < fromTime) return false;
    if (toTime && created > toTime) return false;
    if (search) {
      const haystack = [
        submission.fullName,
        submission.phone,
        submission.email ?? "",
        submission.serviceLabel ?? "",
        submission.source,
        submission.webhookName ?? "",
        submission.assignedToName ?? "",
        STATUS_AR[submission.status] ?? submission.status,
        submission.utmSource ?? "",
        submission.utmMedium ?? "",
        submission.utmCampaign ?? "",
        submission.utmContent ?? "",
        submission.message ?? "",
        submission.notes ?? "",
      ]
        .join(" ")
        .toLowerCase();
      const phoneMatch =
        searchPhone.length > 0 &&
        normalizePhone(submission.phone).includes(searchPhone);
      if (!normalizeText(haystack).includes(search) && !phoneMatch) {
        return false;
      }
    }
    return true;
  });
}

function buildRows(submissions: Awaited<ReturnType<typeof getCrmSubmissions>>) {
  return submissions.map((submission) => ({
    name: submission.fullName,
    phone: submission.phone,
    service: submission.serviceLabel ?? "",
    status: STATUS_AR[submission.status] ?? submission.status,
    source: submission.source,
    owner: submission.assignedToName ?? "",
    createdAt: new Date(submission.createdAt),
    lastInteraction: new Date(
      submission.comments[0]?.createdAt ?? submission.createdAt,
    ),
    email: submission.email ?? "",
    message: submission.message ?? "",
    notes: submission.notes ?? "",
    tags: submission.tags.join("، "),
    utmSource: submission.utmSource ?? "",
    utmMedium: submission.utmMedium ?? "",
    utmCampaign: submission.utmCampaign ?? "",
    utmContent: submission.utmContent ?? "",
  }));
}

function buildFilterSubtitle(request: NextRequest, rowCount: number) {
  const params = request.nextUrl.searchParams;
  const filters = [
    params.get("status") && params.get("status") !== "ALL"
      ? `الحالة: ${STATUS_AR[params.get("status") ?? ""] ?? params.get("status")}`
      : "",
    params.get("source") && params.get("source") !== "ALL"
      ? `المصدر: ${params.get("source")}`
      : "",
    params.get("service") && params.get("service") !== "ALL"
      ? `الخدمة: ${params.get("service")}`
      : "",
    params.get("owner") && params.get("owner") !== "ALL"
      ? `المسؤول: ${params.get("owner") === "_unassigned" ? "بدون مسؤول" : params.get("owner")}`
      : "",
    params.get("from") ? `من: ${params.get("from")}` : "",
    params.get("to") ? `إلى: ${params.get("to")}` : "",
    params.get("search") ? `بحث: ${params.get("search")}` : "",
    params.get("ids") ? "تصدير عناصر محددة" : "",
  ].filter(Boolean);

  return `${rowCount} طلب مطابق${filters.length ? ` | ${filters.join(" | ")}` : ""}`;
}

function exportFilename(extension: "csv" | "pdf" | "xlsx") {
  const date = new Date().toISOString().slice(0, 10);
  return `rejuvera-crm-leads-${date}.${extension}`;
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
    page.drawText(
      `الجوال: ${submission.phone} | الحالة: ${STATUS_AR[submission.status] ?? submission.status}`,
      {
        x: 40,
        y: cursorY,
        size: 10,
        font: customFont,
        color: rgb(0.35, 0.33, 0.31),
      },
    );
    cursorY -= 14;
    page.drawText(
      `الخدمة: ${submission.serviceLabel ?? "غير محددة"} | المصدر: ${submission.source}`,
      {
        x: 40,
        y: cursorY,
        size: 10,
        font: customFont,
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

  if (!canManageCrm(session.user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const format = request.nextUrl.searchParams.get("format") ?? "csv";
  const submissions = filterSubmissions(await getCrmSubmissions(), request);

  if (format === "xlsx") {
    const rows = buildRows(submissions);
    const buffer = buildStyledXlsx({
      title: "تقرير طلبات Rejuvera CRM",
      subtitle: buildFilterSubtitle(request, rows.length),
      sheetName: "طلبات CRM",
      columns: CRM_EXPORT_COLUMNS,
      rows,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": xlsxContentType(),
        "Content-Disposition": `attachment; filename="${exportFilename("xlsx")}"; filename*=UTF-8''${encodeURIComponent(exportFilename("xlsx"))}`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (format === "csv") {
    const rows = buildRows(submissions);
    const csv = buildCsv(rows, [...CRM_EXPORT_COLUMNS]);
    const buffer = Buffer.from(`\uFEFF${csv}`, "utf8");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${exportFilename("csv")}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (format === "pdf") {
    const buffer = await createPdfBuffer(submissions);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${exportFilename("pdf")}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json(
    { message: "Unsupported export format" },
    { status: 400 },
  );
}
