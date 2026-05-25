import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { canManageCrm } from "@/lib/admin-permissions";
import { buildCsv } from "@/lib/backup";
import { getCrmSubmissions } from "@/lib/content-repository";

const STATUS_AR: Record<string, string> = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  FOLLOW_UP: "متابعة",
  BOOKED: "محجوز",
  CLOSED: "مغلق",
};

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
    email: submission.email ?? "",
    service: submission.serviceLabel ?? "",
    status: STATUS_AR[submission.status] ?? submission.status,
    source: submission.source,
    owner: submission.assignedToName ?? "",
    lastInteraction: submission.comments[0]?.createdAt ?? submission.createdAt,
    utmSource: submission.utmSource ?? "",
    utmMedium: submission.utmMedium ?? "",
    utmCampaign: submission.utmCampaign ?? "",
    utmContent: submission.utmContent ?? "",
    message: submission.message ?? "",
    notes: submission.notes ?? "",
    tags: submission.tags.join("، "),
    createdAt: submission.createdAt,
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

  if (format === "csv" || format === "xlsx") {
    const rows = buildRows(submissions);
    const csv = buildCsv(rows, [
      { key: "name", label: "الاسم" },
      { key: "phone", label: "الجوال" },
      { key: "email", label: "البريد الإلكتروني" },
      { key: "service", label: "الخدمة" },
      { key: "status", label: "الحالة" },
      { key: "source", label: "المصدر" },
      { key: "owner", label: "المسؤول" },
      { key: "lastInteraction", label: "آخر تفاعل" },
      { key: "utmSource", label: "utm_source" },
      { key: "utmMedium", label: "utm_medium" },
      { key: "utmCampaign", label: "utm_campaign" },
      { key: "utmContent", label: "utm_content" },
      { key: "message", label: "رسالة العميل" },
      { key: "notes", label: "ملاحظات داخلية" },
      { key: "tags", label: "الوسوم" },
      { key: "createdAt", label: "تاريخ الإنشاء" },
    ]);
    const buffer = Buffer.from(`\uFEFF${csv}`, "utf8");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="rejuvera-crm-export.csv"',
      },
    });
  }

  if (format === "pdf") {
    const buffer = await createPdfBuffer(submissions);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="rejuvera-crm-export.pdf"',
      },
    });
  }

  return NextResponse.json(
    { message: "Unsupported export format" },
    { status: 400 },
  );
}
