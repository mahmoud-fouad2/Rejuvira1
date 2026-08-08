/**
 * PDF Arabic text helpers.
 *
 * pdf-lib uses fontkit for embedded custom fonts. With IBM Plex Sans Arabic,
 * raw logical Arabic text renders correctly for a SINGLE-SCRIPT line \u2014 but
 * fontkit's layout() reverses the entire string it is given (not real bidi),
 * so a single drawText() call on a line that MIXES Arabic with Latin/digits
 * (a date, an English name, a phone number) comes out with the Latin/digit
 * substring reversed too. The fix is to split the line into per-script runs
 * and draw each run with its own drawText() call, positioned manually in
 * visual (RTL) order \u2014 see `drawBidiSafeText` below.
 */

import type { PDFFont, PDFPage, RGB } from "pdf-lib";

const BIDI_CONTROL_CHARS = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
const ARABIC_SCRIPT = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/u;

export function shapeArabicLine(input: string): string {
  return input.replace(BIDI_CONTROL_CHARS, "");
}

/** True when the string contains any Arabic-script character. */
export function containsArabic(text: string): boolean {
  return ARABIC_SCRIPT.test(text);
}

type BidiTextRun = { text: string; direction: "rtl" | "ltr" | "neutral" };

function isArabicChar(char: string) {
  return ARABIC_SCRIPT.test(char);
}

function isLtrTokenStart(char: string) {
  return /[A-Za-z0-9]/u.test(char);
}

function isLtrTokenPart(char: string) {
  return /[A-Za-z0-9@._:+/#%-]/u.test(char);
}

function pushRun(runs: BidiTextRun[], direction: BidiTextRun["direction"], text: string) {
  if (!text) return;
  const last = runs.at(-1);
  if (last?.direction === direction) {
    last.text += text;
  } else {
    runs.push({ direction, text });
  }
}

/**
 * Split a line into script runs (rtl / ltr / neutral) so each run can be
 * drawn separately instead of handing a mixed-script string to a single
 * drawText() call (see module docblock for why that reverses LTR content).
 */
export function splitBidiRuns(text: string): BidiTextRun[] {
  const runs: BidiTextRun[] = [];
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i] as string;

    if (isLtrTokenStart(char)) {
      let token = char;
      while (i + 1 < chars.length) {
        const next = chars[i + 1] as string;
        if (isLtrTokenPart(next)) {
          i += 1;
          token += chars[i] as string;
          continue;
        }

        let lookahead = i + 1;
        let spaces = "";
        while (lookahead < chars.length && /\s/u.test(chars[lookahead] as string)) {
          spaces += chars[lookahead] as string;
          lookahead += 1;
        }
        if (spaces && lookahead < chars.length && isLtrTokenStart(chars[lookahead] as string)) {
          token += spaces;
          i = lookahead;
          token += chars[i] as string;
          continue;
        }

        break;
      }
      pushRun(runs, "ltr", token);
      continue;
    }

    if (isArabicChar(char)) {
      pushRun(runs, "rtl", char);
    } else {
      pushRun(runs, "neutral", char);
    }
  }
  return runs;
}

export function bidiRunWidth(font: PDFFont, text: string, size: number): number {
  try {
    return font.widthOfTextAtSize(text, size);
  } catch {
    return 0;
  }
}

/**
 * Width of a line as it will actually be drawn by `drawBidiSafeText`: sum of
 * each run's width for mixed-script lines, or a single measurement otherwise.
 */
export function bidiSafeTextWidth(font: PDFFont, text: string, size: number): number {
  try {
    if (containsArabic(text)) {
      return splitBidiRuns(text).reduce(
        (width, run) => width + bidiRunWidth(font, run.text, size),
        0,
      );
    }
    return font.widthOfTextAtSize(shapeArabicLine(text), size);
  } catch {
    return 0;
  }
}

/**
 * Draw a line of text that may mix Arabic with Latin/digits without
 * reversing the Latin/digit portion. For pure single-script lines this is
 * equivalent to a plain drawText() call.
 */
export function drawBidiSafeText(
  page: PDFPage,
  text: string,
  options: {
    x: number;
    y: number;
    size: number;
    font: PDFFont;
    color: RGB;
    align?: "left" | "right" | "center";
  },
): void {
  const { x, y, size, font, color } = options;
  const shaped = shapeArabicLine(text);

  if (!containsArabic(shaped)) {
    const width = bidiRunWidth(font, shaped, size);
    let drawX = x;
    if (options.align === "right") drawX = x - width;
    if (options.align === "center") drawX = x - width / 2;
    try {
      page.drawText(shaped, { x: drawX, y, size, font, color });
    } catch {
      /* Skip unrenderable text rather than fail the whole document. */
    }
    return;
  }

  const runs = splitBidiRuns(shaped).map((run) => ({
    ...run,
    width: bidiRunWidth(font, run.text, size),
  }));
  const totalWidth = runs.reduce((sum, run) => sum + run.width, 0);
  let rightEdge = x;
  if (options.align === "left") rightEdge = x + totalWidth;
  if (options.align === "center") rightEdge = x + totalWidth / 2;

  for (const run of runs) {
    const drawX = rightEdge - run.width;
    try {
      page.drawText(run.text, { x: drawX, y, size, font, color });
    } catch {
      /* Skip only the fragment that the PDF font cannot render. */
    }
    rightEdge = drawX;
  }
}
