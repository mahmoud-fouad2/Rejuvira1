import { readFile } from "node:fs/promises";
import path from "node:path";

import type { PDFFont, PDFImage, PDFPage, RGB } from "pdf-lib";
import type { UserRole } from "@prisma/client";

import {
  appointmentStatusLabels,
  feedbackStatusLabels,
  formatDate,
  formatDateTime,
  messageCategoryLabel,
  messageStatusLabels,
  patientStatusLabels,
  procedureStatusLabels,
} from "@/lib/portal/labels";
import {
  containsArabic,
  shapeArabicLine,
} from "@/lib/portal/arabic-shaper";
import {
  displayPhone,
  hasPortalCapability,
} from "@/lib/portal/permissions";
import { getRuntimeSettings } from "@/lib/content-repository";
import { prisma } from "@/lib/prisma";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const INK = { r: 0.13, g: 0.09, b: 0.24 };
const MUTED = { r: 0.42, g: 0.39, b: 0.48 };
const ACCENT = { r: 0.2, g: 0.06, b: 0.32 };
const PURPLE = { r: 0.54, g: 0.31, b: 0.76 };
const GOLD = { r: 0.68, g: 0.49, b: 0.3 };
const LINE = { r: 0.87, g: 0.84, b: 0.9 };
const SOFT_BG = { r: 0.975, g: 0.97, b: 0.985 };

type Ctx = {
  page: PDFPage;
  pageNumber: number;
  cursorY: number;
  font: PDFFont;
  boldFont: PDFFont;
  logo: PDFImage | null;
  addPage: () => void;
};

type Rgb = (r: number, g: number, b: number) => RGB;
let rgbFn: Rgb | null = null;

function rgbOf(color: { r: number; g: number; b: number }) {
  if (!rgbFn) throw new Error("PDF color function is not initialized.");
  return rgbFn(color.r, color.g, color.b);
}

function cleanPdfText(value: unknown) {
  return String(value ?? "—")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shapeSafe(font: PDFFont, text: string) {
  const clean = cleanPdfText(text);
  if (!containsArabic(clean)) return clean;
  const shaped = shapeArabicLine(clean);
  try {
    font.widthOfTextAtSize(shaped, 10);
    return shaped;
  } catch {
    return clean;
  }
}

function textWidth(font: PDFFont, text: string, size: number) {
  try {
    return font.widthOfTextAtSize(shapeSafe(font, text), size);
  } catch {
    return 0;
  }
}

function drawText(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  options: {
    size?: number;
    bold?: boolean;
    color?: { r: number; g: number; b: number };
    align?: "left" | "right" | "center";
  } = {},
) {
  const size = options.size ?? 10;
  const font = options.bold ? ctx.boldFont : ctx.font;
  const clean = cleanPdfText(text || "—");
  const shaped = shapeSafe(font, clean);
  const width = textWidth(font, clean, size);
  const align = options.align ?? (containsArabic(clean) ? "right" : "left");
  let drawX = x;
  if (align === "right") drawX = x - width;
  if (align === "center") drawX = x - width / 2;

  try {
    ctx.page.drawText(shaped, {
      x: drawX,
      y,
      size,
      font,
      color: rgbOf(options.color ?? INK),
    });
  } catch {
    /* Ignore unrenderable fragments; the rest of the report remains useful. */
  }
}

function wrap(font: PDFFont, text: string, size: number, maxWidth: number) {
  const words = cleanPdfText(text || "—").replace(/\r\n/g, "\n").split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (textWidth(font, candidate, size) <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function ensureSpace(ctx: Ctx, height: number) {
  if (ctx.cursorY - height < MARGIN + 34) ctx.addPage();
}

function drawHeader(ctx: Ctx, title: string, subtitle: string) {
  ctx.page.drawRectangle({
    x: MARGIN,
    y: PAGE_HEIGHT - 118,
    width: CONTENT_WIDTH,
    height: 76,
    color: rgbOf(SOFT_BG),
    borderColor: rgbOf(LINE),
    borderWidth: 0.7,
  });
  ctx.page.drawRectangle({
    x: PAGE_WIDTH - MARGIN - 7,
    y: PAGE_HEIGHT - 118,
    width: 7,
    height: 76,
    color: rgbOf(PURPLE),
  });
  if (ctx.logo) {
    const logoW = 62;
    const logoH = (ctx.logo.height / ctx.logo.width) * logoW;
    ctx.page.drawImage(ctx.logo, {
      x: MARGIN + 18,
      y: PAGE_HEIGHT - 99,
      width: logoW,
      height: logoH,
    });
  }
  drawText(ctx, title, PAGE_WIDTH - MARGIN - 24, PAGE_HEIGHT - 78, {
    size: 18,
    bold: true,
    color: ACCENT,
    align: "right",
  });
  drawText(ctx, subtitle, PAGE_WIDTH - MARGIN - 24, PAGE_HEIGHT - 98, {
    size: 9.5,
    color: MUTED,
    align: "right",
  });
  ctx.cursorY = PAGE_HEIGHT - 146;
}

function drawFooter(ctx: Ctx, footer: string) {
  ctx.page.drawLine({
    start: { x: MARGIN, y: 34 },
    end: { x: PAGE_WIDTH - MARGIN, y: 34 },
    thickness: 0.45,
    color: rgbOf(LINE),
  });
  drawText(ctx, footer, MARGIN, 18, {
    size: 7.5,
    color: MUTED,
    align: "left",
  });
  drawText(ctx, `صفحة ${ctx.pageNumber}`, PAGE_WIDTH - MARGIN, 18, {
    size: 7.5,
    color: MUTED,
    align: "right",
  });
}

function sectionTitle(ctx: Ctx, title: string) {
  ensureSpace(ctx, 44);
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.cursorY - 26,
    width: CONTENT_WIDTH,
    height: 28,
    color: rgbOf({ r: 0.985, g: 0.975, b: 0.995 }),
  });
  ctx.page.drawRectangle({
    x: PAGE_WIDTH - MARGIN - 4,
    y: ctx.cursorY - 26,
    width: 4,
    height: 28,
    color: rgbOf(GOLD),
  });
  drawText(ctx, title, PAGE_WIDTH - MARGIN - 14, ctx.cursorY - 17, {
    size: 12,
    bold: true,
    color: ACCENT,
    align: "right",
  });
  ctx.cursorY -= 42;
}

function fieldGrid(
  ctx: Ctx,
  fields: { label: string; value: string | number | null | undefined }[],
) {
  const columnGap = 12;
  const colW = (CONTENT_WIDTH - columnGap) / 2;
  const rowH = 45;
  for (let i = 0; i < fields.length; i += 2) {
    ensureSpace(ctx, rowH + 8);
    const row = fields.slice(i, i + 2);
    row.forEach((field, offset) => {
      const x = MARGIN + offset * (colW + columnGap);
      ctx.page.drawRectangle({
        x,
        y: ctx.cursorY - rowH,
        width: colW,
        height: rowH,
        color: rgbOf({ r: 1, g: 1, b: 1 }),
        borderColor: rgbOf(LINE),
        borderWidth: 0.55,
      });
      drawText(ctx, field.label, x + colW - 12, ctx.cursorY - 16, {
        size: 7.5,
        color: MUTED,
        align: "right",
      });
      drawText(ctx, cleanPdfText(field.value || "—").slice(0, 58), x + colW - 12, ctx.cursorY - 34, {
        size: 10,
        bold: true,
        color: INK,
        align: "right",
      });
    });
    ctx.cursorY -= rowH + 8;
  }
}

function table(
  ctx: Ctx,
  headers: string[],
  rows: string[][],
  widths: number[],
  emptyText: string,
) {
  if (!rows.length) {
    ensureSpace(ctx, 36);
    drawText(ctx, emptyText, PAGE_WIDTH - MARGIN, ctx.cursorY - 12, {
      size: 9,
      color: MUTED,
      align: "right",
    });
    ctx.cursorY -= 30;
    return;
  }

  const startX = MARGIN;
  const rowH = 30;
  ensureSpace(ctx, rowH * 2);
  ctx.page.drawRectangle({
    x: startX,
    y: ctx.cursorY - rowH,
    width: CONTENT_WIDTH,
    height: rowH,
    color: rgbOf({ r: 0.96, g: 0.94, b: 0.98 }),
  });
  let x = startX;
  headers.forEach((header, index) => {
    const w = widths[index] ?? 80;
    drawText(ctx, header, x + w - 8, ctx.cursorY - 19, {
      size: 7.5,
      bold: true,
      color: ACCENT,
      align: "right",
    });
    x += w;
  });
  ctx.cursorY -= rowH;

  for (const row of rows) {
    ensureSpace(ctx, rowH + 8);
    ctx.page.drawLine({
      start: { x: startX, y: ctx.cursorY },
      end: { x: startX + CONTENT_WIDTH, y: ctx.cursorY },
      thickness: 0.35,
      color: rgbOf(LINE),
    });
    x = startX;
    row.forEach((cell, index) => {
      const w = widths[index] ?? 80;
      drawText(ctx, cleanPdfText(cell || "—").slice(0, 32), x + w - 8, ctx.cursorY - 19, {
        size: 7.5,
        color: INK,
        align: "right",
      });
      x += w;
    });
    ctx.cursorY -= rowH;
  }
  ctx.cursorY -= 8;
}

function notesBlock(ctx: Ctx, title: string, text: string | null | undefined) {
  if (!text) return;
  sectionTitle(ctx, title);
  const lines = wrap(ctx.font, text, 9.5, CONTENT_WIDTH - 22);
  const height = Math.max(58, lines.length * 16 + 24);
  ensureSpace(ctx, height);
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.cursorY - height,
    width: CONTENT_WIDTH,
    height,
    color: rgbOf({ r: 1, g: 1, b: 1 }),
    borderColor: rgbOf(LINE),
    borderWidth: 0.55,
  });
  let y = ctx.cursorY - 22;
  for (const line of lines.slice(0, 16)) {
    drawText(ctx, line, PAGE_WIDTH - MARGIN - 12, y, {
      size: 9.5,
      color: INK,
      align: "right",
    });
    y -= 16;
  }
  ctx.cursorY -= height + 12;
}

function genderLabel(gender: string | null) {
  if (gender === "MALE") return "ذكر";
  if (gender === "FEMALE") return "أنثى";
  return "غير محدد";
}

export async function buildPatientProfilePdf(options: {
  patientId: string;
  role: UserRole;
  generatedByName?: string | null;
}): Promise<{ buffer: Buffer; fileName: string } | null> {
  const patient = await prisma.patient.findUnique({
    where: { id: options.patientId },
    include: {
      account: true,
      procedures: {
        where: { archivedAt: null },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          template: { select: { nameAr: true, version: true } },
          doctor: { select: { nameAr: true } },
          appointments: { orderBy: { appointmentDate: "asc" }, take: 8 },
          checklistItems: { orderBy: [{ phase: "asc" }, { sortOrder: "asc" }], take: 20 },
        },
      },
      appointments: {
        orderBy: { appointmentDate: "desc" },
        take: 40,
        include: { doctor: { select: { nameAr: true } }, procedure: { select: { customProcedureName: true, template: { select: { nameAr: true } } } } },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 25 },
      documents: {
        where: { archivedAt: null },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      feedback: {
        orderBy: { submittedAt: "desc" },
        take: 20,
        include: { procedure: { select: { customProcedureName: true, template: { select: { nameAr: true } } } } },
      },
    },
  });
  if (!patient) return null;

  const [{ PDFDocument, rgb }, fontkitModule, runtime] =
    await Promise.all([
      import("pdf-lib"),
      import("@pdf-lib/fontkit"),
      getRuntimeSettings(),
    ]);
  rgbFn = rgb;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkitModule.default);
  const fontDir = path.join(process.cwd(), "public", "assets", "fonts");
  const [regularBytes] = await Promise.all([
    readFile(path.join(fontDir, "IBMPlexSansArabic-Regular.ttf")),
  ]);
  const font = await pdfDoc.embedFont(regularBytes, { subset: false });
  const boldFont: PDFFont = font;

  let logo: PDFImage | null = null;
  try {
    const logoBytes = await readFile(
      path.join(process.cwd(), "public", "media", "brand", "logo-dark.png"),
    );
    logo = await pdfDoc.embedPng(logoBytes);
  } catch {
    logo = null;
  }

  const footer = [
    runtime.contact.phone,
    runtime.contact.email,
    runtime.contact.domain || "rejuvera.sa",
  ]
    .filter(Boolean)
    .join("  |  ");

  const ctx: Ctx = {
    page: null as unknown as PDFPage,
    pageNumber: 0,
    cursorY: 0,
    font,
    boldFont,
    logo,
    addPage: () => undefined,
  };

  ctx.addPage = () => {
    if (ctx.page) drawFooter(ctx, footer);
    ctx.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    ctx.pageNumber += 1;
    drawHeader(
      ctx,
      "ملف المريض",
      `${patient.fullNameAr} - ${patient.fileNumber} - طبع بواسطة ${options.generatedByName || "Rejuvera"}`,
    );
  };
  ctx.addPage();

  sectionTitle(ctx, "البيانات الأساسية");
  fieldGrid(ctx, [
    { label: "الاسم العربي", value: patient.fullNameAr },
    { label: "الاسم الإنجليزي", value: patient.fullNameEn },
    { label: "رقم الملف", value: patient.fileNumber },
    { label: "حالة الحساب", value: patientStatusLabels[patient.accountStatus] },
    { label: "الجوال", value: displayPhone(patient.phone, options.role) },
    { label: "البريد الإلكتروني", value: patient.email },
    { label: "تاريخ الميلاد", value: formatDate(patient.dateOfBirth) },
    { label: "الجنس", value: genderLabel(patient.gender) },
    { label: "لغة المريض", value: patient.preferredLanguage === "en" ? "English" : "العربية" },
    { label: "آخر دخول", value: formatDateTime(patient.lastLoginAt) },
    { label: "تاريخ الإنشاء", value: formatDateTime(patient.createdAt) },
    { label: "أنشئ بواسطة", value: patient.createdByName },
  ]);

  sectionTitle(ctx, "جهة الاتصال للطوارئ");
  fieldGrid(ctx, [
    { label: "الاسم", value: patient.emergencyContactName },
    { label: "الجوال", value: patient.emergencyContactPhone },
  ]);

  if (hasPortalCapability(options.role, "patients.viewInternalNotes")) {
    notesBlock(ctx, "ملاحظات داخلية", patient.internalNotes);
  }

  sectionTitle(ctx, "العمليات");
  table(
    ctx,
    ["العملية", "الحالة", "التاريخ", "الطبيب", "المهام"],
    patient.procedures.map((procedure) => [
      procedure.customProcedureName || procedure.template?.nameAr || "إجراء طبي",
      procedureStatusLabels[procedure.status],
      formatDate(procedure.procedureDate),
      procedure.doctor?.nameAr || procedure.surgeonName || "—",
      `${procedure.checklistItems.filter((item) => item.patientCompletedAt).length}/${procedure.checklistItems.length}`,
    ]),
    [150, 86, 88, 118, 68],
    "لا توجد عمليات مسجلة.",
  );

  sectionTitle(ctx, "المتابعات");
  table(
    ctx,
    ["التاريخ", "الوقت", "النوع", "الحالة", "الطبيب"],
    patient.appointments.map((appointment) => [
      formatDate(appointment.appointmentDate),
      appointment.appointmentTime || "—",
      appointment.appointmentType || "متابعة",
      appointmentStatusLabels[appointment.status],
      appointment.doctor?.nameAr || "—",
    ]),
    [95, 72, 112, 105, 126],
    "لا توجد مواعيد متابعة.",
  );

  if (hasPortalCapability(options.role, "messages.view")) {
    sectionTitle(ctx, "آخر الرسائل");
    table(
      ctx,
      ["التاريخ", "النوع", "الحالة", "المرسل", "الرسالة"],
      patient.messages.map((message) => [
        formatDateTime(message.createdAt),
        messageCategoryLabel(message.category),
        messageStatusLabels[message.status],
        message.senderType === "PATIENT" ? "المريض" : "الفريق",
        message.message,
      ]),
      [92, 80, 76, 64, 198],
      "لا توجد رسائل.",
    );
  }

  if (hasPortalCapability(options.role, "documents.view")) {
    sectionTitle(ctx, "المستندات");
    table(
      ctx,
      ["العنوان", "النوع", "الظهور", "المصدر", "التاريخ"],
      patient.documents.map((document) => [
        document.title,
        document.documentType,
        document.visibility === "PATIENT_VISIBLE" ? "ظاهر للمريض" : "داخلي",
        document.uploadedByName || "—",
        formatDate(document.createdAt),
      ]),
      [150, 92, 90, 88, 90],
      "لا توجد مستندات.",
    );
  }

  if (hasPortalCapability(options.role, "feedback.view")) {
    sectionTitle(ctx, "التقييمات");
    table(
      ctx,
      ["التاريخ", "التقييم", "الحالة", "العملية", "ملاحظة"],
      patient.feedback.map((feedback) => [
        formatDate(feedback.submittedAt),
        `${feedback.overallRating}/5`,
        feedbackStatusLabels[feedback.status],
        feedback.procedure.customProcedureName || feedback.procedure.template?.nameAr || "عملية",
        feedback.comment || "—",
      ]),
      [86, 66, 86, 120, 152],
      "لا توجد تقييمات.",
    );
  }

  drawFooter(ctx, footer);
  const buffer = Buffer.from(await pdfDoc.save());
  const safeFileNumber = patient.fileNumber.replace(/[^\w-]+/g, "-");
  return {
    buffer,
    fileName: `rejuvera-patient-${safeFileNumber}-${new Date().toISOString().slice(0, 10)}.pdf`,
  };
}
