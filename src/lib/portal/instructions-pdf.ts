import { readFile } from "node:fs/promises";
import path from "node:path";

import type { PDFFont, PDFImage, PDFPage } from "pdf-lib";

import { getRuntimeSettings } from "@/lib/content-repository";
import { formatDate, formatDateTime } from "@/lib/portal/labels";
import { maskPhone } from "@/lib/portal/permissions";
import { renderPlaceholders } from "@/lib/portal/placeholders";
import { getPortalSettings } from "@/lib/portal/settings";
import { encodeQr } from "@/lib/portal/qrcode";
import { containsArabic, shapeArabicLine } from "@/lib/portal/arabic-shaper";
import { prisma } from "@/lib/prisma";

/**
 * Real A4 patient-instructions PDF with correct Arabic shaping and RTL
 * layout (see arabic-shaper.ts), Rejuvera header, masked patient info,
 * per-section content, managed footer and a QR that opens the patient
 * login page only — never a token or direct data link.
 */

const PAGE_WIDTH = 595.28; // A4 portrait, points
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const INK = { r: 0.13, g: 0.12, b: 0.16 };
const SOFT = { r: 0.38, g: 0.36, b: 0.4 };
const ACCENT = { r: 0.45, g: 0.35, b: 0.22 };
const WARN_BG = { r: 0.98, g: 0.94, b: 0.9 };

export type PdfLanguage = "ar" | "en" | "both";

type Ctx = {
  page: PDFPage;
  cursorY: number;
  pageNumber: number;
  font: PDFFont;
  boldFont: PDFFont;
  addPage: () => void;
  drawFooter: (page: PDFPage, pageNumber: number) => void;
};

function shapeSafe(font: PDFFont, text: string): string {
  if (!containsArabic(text)) return text;
  const shaped = shapeArabicLine(text);
  try {
    font.widthOfTextAtSize(shaped, 10);
    return shaped;
  } catch {
    // Font lacks some presentation forms — fall back to the raw string so
    // the PDF still renders instead of crashing.
    return text;
  }
}

function wrapText(
  font: PDFFont,
  text: string,
  size: number,
  maxWidth: number,
): string[] {
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trimEnd();
    if (!trimmed) {
      lines.push("");
      continue;
    }
    const words = trimmed.split(/\s+/);
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      const width = font.widthOfTextAtSize(shapeSafe(font, candidate), size);
      if (width <= maxWidth || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function drawLine(
  ctx: Ctx,
  text: string,
  options: {
    size?: number;
    bold?: boolean;
    color?: { r: number; g: number; b: number };
    align?: "right" | "left" | "center";
    lineHeight?: number;
  } = {},
) {
  const size = options.size ?? 10.5;
  const lineHeight = options.lineHeight ?? size * 1.65;
  const font = options.bold ? ctx.boldFont : ctx.font;
  const color = options.color ?? INK;
  const rtl = containsArabic(text);
  const align = options.align ?? (rtl ? "right" : "left");

  if (ctx.cursorY - lineHeight < MARGIN + 70) {
    ctx.addPage();
  }

  const shaped = shapeSafe(font, text);
  let width = 0;
  try {
    width = font.widthOfTextAtSize(shaped, size);
  } catch {
    width = 0;
  }
  let x = MARGIN;
  if (align === "right") x = PAGE_WIDTH - MARGIN - width;
  if (align === "center") x = (PAGE_WIDTH - width) / 2;

  try {
    ctx.page.drawText(shaped, {
      x,
      y: ctx.cursorY - size,
      size,
      font,
      color: rgbOf(color),
    });
  } catch {
    /* skip unrenderable line rather than fail the whole document */
  }
  ctx.cursorY -= lineHeight;
}

function drawWrapped(
  ctx: Ctx,
  text: string,
  options: { size?: number; bold?: boolean; color?: { r: number; g: number; b: number } } = {},
) {
  const size = options.size ?? 10.5;
  const font = options.bold ? ctx.boldFont : ctx.font;
  const lines = wrapText(font, text, size, CONTENT_WIDTH - 16);
  for (const line of lines) {
    if (!line) {
      ctx.cursorY -= size * 0.8;
      continue;
    }
    const bullet = /^[-*•]\s*/.test(line.trim());
    const clean = bullet ? line.trim().replace(/^[-*•]\s*/, "• ") : line;
    drawLine(ctx, clean, { size, color: options.color ?? INK, ...(options.bold ? { bold: true } : {}) });
  }
}

// pdf-lib color helper without importing rgb at module top (dynamic import below)
let rgbFn: ((r: number, g: number, b: number) => ReturnType<typeof Object>) | null =
  null;
function rgbOf(color: { r: number; g: number; b: number }) {
  return (rgbFn as (r: number, g: number, b: number) => never)(
    color.r,
    color.g,
    color.b,
  );
}

export async function buildInstructionsPdf(options: {
  procedureId: string;
  language: PdfLanguage;
  generatedByName: string;
  maskPatientPhone?: boolean;
}): Promise<{ buffer: Buffer; fileName: string } | null> {
  const procedure = await prisma.procedure.findUnique({
    where: { id: options.procedureId },
    include: {
      patient: { select: { fullNameAr: true, fullNameEn: true, phone: true, fileNumber: true } },
      doctor: { select: { nameAr: true, nameEn: true } },
      template: true,
      appointments: {
        where: { status: { in: ["SCHEDULED", "CONFIRMED"] } },
        orderBy: { appointmentDate: "asc" },
        take: 1,
      },
    },
  });
  if (!procedure || procedure.archivedAt) return null;

  const [{ PDFDocument, StandardFonts, rgb }, fontkitModule, runtime, portal] =
    await Promise.all([
      import("pdf-lib"),
      import("@pdf-lib/fontkit"),
      getRuntimeSettings(),
      getPortalSettings(),
    ]);
  rgbFn = rgb as never;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkitModule.default);

  const fontDir = path.join(process.cwd(), "public", "assets", "fonts");
  const [regularBytes] = await Promise.all([
    readFile(path.join(fontDir, "IBMPlexSansArabic-Regular.ttf")),
  ]);
  const font = await pdfDoc.embedFont(regularBytes, { subset: true });
  let boldFont: PDFFont;
  try {
    const boldBytes = await readFile(
      path.join(fontDir, "IBMPlexSansArabic-Bold.woff2"),
    );
    boldFont = await pdfDoc.embedFont(boldBytes, { subset: true });
  } catch {
    boldFont = font;
  }
  const latinFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  void latinFont;

  // Brand logo (optional — skip silently when unavailable).
  let logo: PDFImage | null = null;
  try {
    const logoBytes = await readFile(
      path.join(process.cwd(), "public", "media", "brand", "logo-light.png"),
    );
    logo = await pdfDoc.embedPng(logoBytes);
  } catch {
    logo = null;
  }

  const procedureName =
    procedure.customProcedureName || procedure.template?.nameAr || "إجراء طبي";
  const doctorName =
    procedure.doctor?.nameAr || procedure.surgeonName || "—";
  const nextFollowUp = procedure.appointments[0] ?? null;
  const placeholderContext = {
    patientName: procedure.patient.fullNameAr,
    fileNumber: procedure.patient.fileNumber,
    procedureName,
    procedureDate: procedure.procedureDate
      ? formatDate(procedure.procedureDate)
      : null,
    procedureTime: procedure.procedureTime,
    doctorName,
    arrivalTime: procedure.arrivalTime,
    followUpDate: nextFollowUp
      ? formatDate(nextFollowUp.appointmentDate)
      : null,
    clinicPhone: runtime.contact.phone,
    additionalNotes: procedure.patientVisibleNotes,
  };

  const now = new Date();
  const footerLine1 = [
    runtime.contact.phone,
    runtime.contact.phoneSecondary,
    runtime.contact.domain || "rejuvera.sa",
  ]
    .filter(Boolean)
    .join("  ·  ");

  const ctx: Ctx = {
    page: null as unknown as PDFPage,
    cursorY: 0,
    pageNumber: 0,
    font,
    boldFont,
    addPage: () => {
      ctx.pageNumber += 1;
      ctx.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      ctx.cursorY = PAGE_HEIGHT - MARGIN;
    },
    drawFooter: (page, pageNumber) => {
      const size = 7.5;
      const y = MARGIN - 14;
      const parts = [
        footerLine1,
        `${shapeSafe(font, "طُبع في")} ${formatDateTime(now)} — ${shapeSafe(font, options.generatedByName)}`,
        shapeSafe(font, portal.pdfFooterText).slice(0, 160),
      ].filter(Boolean);
      let lineY = y + parts.length * 10;
      for (const part of parts) {
        let width = 0;
        try {
          width = font.widthOfTextAtSize(part, size);
        } catch {
          width = 0;
        }
        try {
          page.drawText(part, {
            x: (PAGE_WIDTH - width) / 2,
            y: lineY,
            size,
            font,
            color: rgb(SOFT.r, SOFT.g, SOFT.b),
          });
        } catch {
          /* ignore */
        }
        lineY -= 10;
      }
      const pageLabel = `${pageNumber}`;
      page.drawText(pageLabel, {
        x: PAGE_WIDTH - MARGIN,
        y: y - 4,
        size: 8,
        font,
        color: rgb(SOFT.r, SOFT.g, SOFT.b),
      });
    },
  };
  ctx.addPage();

  // ---------- Header ----------
  if (logo) {
    const logoWidth = 64;
    const logoHeight = (logo.height / logo.width) * logoWidth;
    ctx.page.drawImage(logo, {
      x: PAGE_WIDTH - MARGIN - logoWidth,
      y: ctx.cursorY - logoHeight + 8,
      width: logoWidth,
      height: logoHeight,
    });
  }
  drawLine(ctx, "مركز ريجوفيرا الطبي — Rejuvera Center", {
    size: 15,
    bold: true,
    align: "right",
  });
  drawLine(ctx, "تعليمات المريض — Patient Instructions", {
    size: 11,
    color: ACCENT,
    align: "right",
  });
  drawLine(
    ctx,
    `إصدار المستند ${procedure.instructionsVersion} · ${formatDateTime(now)}`,
    { size: 8.5, color: SOFT, align: "right" },
  );
  ctx.cursorY -= 6;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.cursorY },
    end: { x: PAGE_WIDTH - MARGIN, y: ctx.cursorY },
    thickness: 1,
    color: rgb(ACCENT.r, ACCENT.g, ACCENT.b),
    opacity: 0.5,
  });
  ctx.cursorY -= 16;

  // ---------- Patient info ----------
  const phone =
    options.maskPatientPhone === false
      ? procedure.patient.phone
      : maskPhone(procedure.patient.phone);
  const infoRows: [string, string][] = [
    ["اسم المريض", procedure.patient.fullNameAr],
    ["رقم الملف", procedure.patient.fileNumber],
    ["الجوال", phone],
    ["العملية", procedureName],
    ["الطبيب", doctorName],
    [
      "تاريخ العملية",
      procedure.procedureDate
        ? `${formatDate(procedure.procedureDate)}${procedure.procedureTime ? ` · ${procedure.procedureTime}` : ""}`
        : "—",
    ],
    ["وقت الحضور", procedure.arrivalTime ?? "—"],
    [
      "موعد المتابعة",
      nextFollowUp ? formatDate(nextFollowUp.appointmentDate) : "—",
    ],
  ];
  const infoBoxHeight = Math.ceil(infoRows.length / 2) * 22 + 18;
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.cursorY - infoBoxHeight,
    width: CONTENT_WIDTH,
    height: infoBoxHeight,
    color: rgb(0.97, 0.965, 0.955),
    borderColor: rgb(ACCENT.r, ACCENT.g, ACCENT.b),
    borderWidth: 0.7,
    opacity: 1,
    borderOpacity: 0.35,
  });
  const colWidth = CONTENT_WIDTH / 2;
  let infoY = ctx.cursorY - 20;
  for (let i = 0; i < infoRows.length; i += 2) {
    for (let col = 0; col < 2; col += 1) {
      const row = infoRows[i + col];
      if (!row) continue;
      const [label, value] = row;
      const labelShaped = shapeSafe(font, label);
      const valueShaped = shapeSafe(boldFont, value);
      // Right column (first item) sits on the right half in RTL order.
      const cellRight =
        col === 0 ? PAGE_WIDTH - MARGIN - 10 : PAGE_WIDTH - MARGIN - colWidth;
      try {
        const labelWidth = font.widthOfTextAtSize(labelShaped, 8.5);
        ctx.page.drawText(labelShaped, {
          x: cellRight - labelWidth,
          y: infoY,
          size: 8.5,
          font,
          color: rgb(SOFT.r, SOFT.g, SOFT.b),
        });
        const valueWidth = boldFont.widthOfTextAtSize(valueShaped, 10);
        ctx.page.drawText(valueShaped, {
          x: cellRight - valueWidth,
          y: infoY - 11,
          size: 10,
          font: boldFont,
          color: rgb(INK.r, INK.g, INK.b),
        });
      } catch {
        /* ignore cell on encoding issues */
      }
    }
    infoY -= 22;
  }
  ctx.cursorY -= infoBoxHeight + 18;

  // ---------- Sections ----------
  type Section = { title: string; body: string | null; warn?: boolean };
  const arSections: Section[] = [
    { title: "تعليمات ما قبل العملية", body: procedure.preOperationInstructions },
    { title: "تعليمات يوم العملية", body: procedure.operationDayInstructions },
    { title: "تعليمات ما بعد العملية", body: procedure.postOperationInstructions },
    { title: "علامات تستدعي التواصل مع المركز", body: procedure.warningSigns, warn: true },
    { title: "المتابعة", body: procedure.followUpInstructions },
    { title: "ملاحظات مخصصة", body: procedure.patientVisibleNotes },
  ];
  const enSections: Section[] = procedure.template
    ? [
        { title: "Before your procedure", body: procedure.template.preOperationContentEn },
        { title: "On the day", body: procedure.template.operationDayContentEn },
        { title: "After your procedure", body: procedure.template.postOperationContentEn },
        { title: "When to contact the clinic", body: procedure.template.warningSignsEn, warn: true },
        { title: "Follow-up", body: procedure.template.followUpContentEn },
      ]
    : [];

  const selected: Section[] =
    options.language === "en"
      ? enSections.length
        ? enSections
        : arSections
      : options.language === "both"
        ? [...arSections, ...enSections]
        : arSections;

  for (const section of selected) {
    const body = section.body?.trim();
    if (!body) continue;
    const rendered = renderPlaceholders(body, placeholderContext);

    if (ctx.cursorY < MARGIN + 140) ctx.addPage();

    if (section.warn) {
      // Estimate the block height for the warning background.
      const lines = wrapText(font, rendered, 10.5, CONTENT_WIDTH - 16);
      const blockHeight = lines.length * 17 + 34;
      if (ctx.cursorY - blockHeight < MARGIN + 70) ctx.addPage();
      ctx.page.drawRectangle({
        x: MARGIN,
        y: ctx.cursorY - blockHeight,
        width: CONTENT_WIDTH,
        height: blockHeight,
        color: rgb(WARN_BG.r, WARN_BG.g, WARN_BG.b),
        borderColor: rgb(0.75, 0.45, 0.3),
        borderWidth: 0.7,
        borderOpacity: 0.5,
      });
    }

    drawLine(ctx, section.title, { size: 12.5, bold: true, color: ACCENT });
    drawWrapped(ctx, rendered, { size: 10.5 });
    ctx.cursorY -= 10;
  }

  // Emergency note.
  drawLine(
    ctx,
    "تنبيه: هذه التعليمات إرشادية ولا تغني عن استشارة طبيبك. في الحالات الطارئة اتصل بخدمات الطوارئ فورًا.",
    { size: 9, color: SOFT },
  );

  // ---------- QR ----------
  const siteUrl = (process.env.SITE_URL || "https://rejuvera.sa").replace(/\/$/, "");
  const qrTarget = `${siteUrl}/patient-login`;
  try {
    const matrix = encodeQr(qrTarget);
    const qrSize = 78;
    const moduleSize = qrSize / matrix.length;
    if (ctx.cursorY - qrSize - 30 < MARGIN + 60) ctx.addPage();
    const qrX = MARGIN;
    const qrY = ctx.cursorY - qrSize;
    ctx.page.drawRectangle({
      x: qrX - 4,
      y: qrY - 4,
      width: qrSize + 8,
      height: qrSize + 8,
      color: rgb(1, 1, 1),
      borderColor: rgb(SOFT.r, SOFT.g, SOFT.b),
      borderWidth: 0.5,
      borderOpacity: 0.4,
    });
    for (let r = 0; r < matrix.length; r += 1) {
      for (let c = 0; c < matrix.length; c += 1) {
        if ((matrix[r] as boolean[])[c]) {
          ctx.page.drawRectangle({
            x: qrX + c * moduleSize,
            y: qrY + qrSize - (r + 1) * moduleSize,
            width: moduleSize,
            height: moduleSize,
            color: rgb(INK.r, INK.g, INK.b),
          });
        }
      }
    }
    const qrLabel = shapeSafe(font, "امسح الرمز لدخول بوابة المرضى");
    try {
      ctx.page.drawText(qrLabel, {
        x: qrX + qrSize + 12,
        y: qrY + qrSize / 2,
        size: 9,
        font,
        color: rgb(SOFT.r, SOFT.g, SOFT.b),
      });
    } catch {
      /* ignore */
    }
    ctx.cursorY = qrY - 16;
  } catch {
    /* QR generation failure must not break the document */
  }

  // Footers on every page.
  const pages = pdfDoc.getPages();
  pages.forEach((page, index) => ctx.drawFooter(page, index + 1));

  const buffer = Buffer.from(await pdfDoc.save());
  const fileName = `rejuvera-instructions-${procedure.patient.fileNumber}-v${procedure.instructionsVersion}.pdf`;
  return { buffer, fileName };
}
