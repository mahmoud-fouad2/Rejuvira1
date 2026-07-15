/**
 * PDF Arabic text helpers.
 *
 * pdf-lib uses fontkit for embedded custom fonts. With IBM Plex Sans Arabic,
 * raw logical Arabic text renders correctly; manual Presentation Forms
 * shaping/reversal makes the PDF look reversed and broken. Keep this helper
 * as a small compatibility layer for existing PDF code paths.
 */

const BIDI_CONTROL_CHARS = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
const ARABIC_SCRIPT = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/u;

export function shapeArabicLine(input: string): string {
  return input.replace(BIDI_CONTROL_CHARS, "");
}

/** True when the string contains any Arabic-script character. */
export function containsArabic(text: string): boolean {
  return ARABIC_SCRIPT.test(text);
}
