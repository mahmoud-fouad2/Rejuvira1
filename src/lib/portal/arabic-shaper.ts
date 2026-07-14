/**
 * Arabic text shaping for PDF generation.
 *
 * pdf-lib draws glyphs by codepoint without OpenType shaping, so Arabic
 * comes out as disconnected, left-to-right letters. This module converts
 * logical Arabic text into Presentation Forms-B codepoints (contextual
 * isolated/initial/medial/final forms + lam-alef ligatures) and reorders
 * bidirectional runs into visual order for right-to-left rendering.
 */

type Forms = {
  isolated: number;
  final: number;
  initial?: number;
  medial?: number;
};

// U+0621..U+064A presentation forms (Presentation Forms-B block).
const FORMS: Record<number, Forms> = {
  0x0621: { isolated: 0xfe80, final: 0xfe80 },
  0x0622: { isolated: 0xfe81, final: 0xfe82 },
  0x0623: { isolated: 0xfe83, final: 0xfe84 },
  0x0624: { isolated: 0xfe85, final: 0xfe86 },
  0x0625: { isolated: 0xfe87, final: 0xfe88 },
  0x0626: { isolated: 0xfe89, final: 0xfe8a, initial: 0xfe8b, medial: 0xfe8c },
  0x0627: { isolated: 0xfe8d, final: 0xfe8e },
  0x0628: { isolated: 0xfe8f, final: 0xfe90, initial: 0xfe91, medial: 0xfe92 },
  0x0629: { isolated: 0xfe93, final: 0xfe94 },
  0x062a: { isolated: 0xfe95, final: 0xfe96, initial: 0xfe97, medial: 0xfe98 },
  0x062b: { isolated: 0xfe99, final: 0xfe9a, initial: 0xfe9b, medial: 0xfe9c },
  0x062c: { isolated: 0xfe9d, final: 0xfe9e, initial: 0xfe9f, medial: 0xfea0 },
  0x062d: { isolated: 0xfea1, final: 0xfea2, initial: 0xfea3, medial: 0xfea4 },
  0x062e: { isolated: 0xfea5, final: 0xfea6, initial: 0xfea7, medial: 0xfea8 },
  0x062f: { isolated: 0xfea9, final: 0xfeaa },
  0x0630: { isolated: 0xfeab, final: 0xfeac },
  0x0631: { isolated: 0xfead, final: 0xfeae },
  0x0632: { isolated: 0xfeaf, final: 0xfeb0 },
  0x0633: { isolated: 0xfeb1, final: 0xfeb2, initial: 0xfeb3, medial: 0xfeb4 },
  0x0634: { isolated: 0xfeb5, final: 0xfeb6, initial: 0xfeb7, medial: 0xfeb8 },
  0x0635: { isolated: 0xfeb9, final: 0xfeba, initial: 0xfebb, medial: 0xfebc },
  0x0636: { isolated: 0xfebd, final: 0xfebe, initial: 0xfebf, medial: 0xfec0 },
  0x0637: { isolated: 0xfec1, final: 0xfec2, initial: 0xfec3, medial: 0xfec4 },
  0x0638: { isolated: 0xfec5, final: 0xfec6, initial: 0xfec7, medial: 0xfec8 },
  0x0639: { isolated: 0xfec9, final: 0xfeca, initial: 0xfecb, medial: 0xfecc },
  0x063a: { isolated: 0xfecd, final: 0xfece, initial: 0xfecf, medial: 0xfed0 },
  0x0641: { isolated: 0xfed1, final: 0xfed2, initial: 0xfed3, medial: 0xfed4 },
  0x0642: { isolated: 0xfed5, final: 0xfed6, initial: 0xfed7, medial: 0xfed8 },
  0x0643: { isolated: 0xfed9, final: 0xfeda, initial: 0xfedb, medial: 0xfedc },
  0x0644: { isolated: 0xfedd, final: 0xfede, initial: 0xfedf, medial: 0xfee0 },
  0x0645: { isolated: 0xfee1, final: 0xfee2, initial: 0xfee3, medial: 0xfee4 },
  0x0646: { isolated: 0xfee5, final: 0xfee6, initial: 0xfee7, medial: 0xfee8 },
  0x0647: { isolated: 0xfee9, final: 0xfeea, initial: 0xfeeb, medial: 0xfeec },
  0x0648: { isolated: 0xfeed, final: 0xfeee },
  0x0649: { isolated: 0xfeef, final: 0xfef0 },
  0x064a: { isolated: 0xfef1, final: 0xfef2, initial: 0xfef3, medial: 0xfef4 },
  // Extended letters common in names.
  0x0671: { isolated: 0xfb50, final: 0xfb51 },
  0x067e: { isolated: 0xfb56, final: 0xfb57, initial: 0xfb58, medial: 0xfb59 },
  0x0686: { isolated: 0xfb7a, final: 0xfb7b, initial: 0xfb7c, medial: 0xfb7d },
  0x06a4: { isolated: 0xfb6a, final: 0xfb6b, initial: 0xfb6c, medial: 0xfb6d },
  0x06af: { isolated: 0xfb92, final: 0xfb93, initial: 0xfb94, medial: 0xfb95 },
};

// Lam-alef mandatory ligatures: alef codepoint -> [isolated, final].
const LAM_ALEF: Record<number, [number, number]> = {
  0x0622: [0xfef5, 0xfef6],
  0x0623: [0xfef7, 0xfef8],
  0x0625: [0xfef9, 0xfefa],
  0x0627: [0xfefb, 0xfefc],
};

const LAM = 0x0644;

// Diacritics that attach to the previous letter and are transparent for
// joining purposes.
function isTransparent(code: number): boolean {
  return (
    (code >= 0x064b && code <= 0x065f) ||
    code === 0x0670 ||
    (code >= 0x06d6 && code <= 0x06dc) ||
    (code >= 0x06df && code <= 0x06e8) ||
    (code >= 0x06ea && code <= 0x06ed)
  );
}

function isArabicLetter(code: number): boolean {
  return code in FORMS;
}

/** Letter joins to the following letter (dual-joining). */
function joinsForward(code: number): boolean {
  const forms = FORMS[code];
  return Boolean(forms?.initial);
}

/**
 * Shape one logical-order Arabic segment into presentation forms
 * (still logical order).
 */
function shapeSegment(codes: number[]): number[] {
  const output: number[] = [];
  const letters = codes;

  const prevJoiner = (index: number): boolean => {
    for (let i = index - 1; i >= 0; i -= 1) {
      const code = letters[i] as number;
      if (isTransparent(code)) continue;
      return isArabicLetter(code) && joinsForward(code);
    }
    return false;
  };
  const nextLetter = (index: number): number | null => {
    for (let i = index + 1; i < letters.length; i += 1) {
      const code = letters[i] as number;
      if (isTransparent(code)) continue;
      return code;
    }
    return null;
  };

  for (let i = 0; i < letters.length; i += 1) {
    const code = letters[i] as number;

    if (!isArabicLetter(code)) {
      output.push(code);
      continue;
    }

    // Lam-alef ligature.
    if (code === LAM) {
      const next = nextLetter(i);
      if (next !== null && next in LAM_ALEF) {
        const pair = LAM_ALEF[next] as [number, number];
        const ligature = prevJoiner(i) ? pair[1] : pair[0];
        output.push(ligature);
        // Skip transparent marks between lam and alef, then the alef.
        let j = i + 1;
        while (j < letters.length && isTransparent(letters[j] as number)) {
          output.push(letters[j] as number);
          j += 1;
        }
        i = j; // consume the alef
        continue;
      }
    }

    const forms = FORMS[code] as Forms;
    const joinedFromPrev = prevJoiner(i);
    const next = nextLetter(i);
    const joinsToNext =
      Boolean(forms.initial) && next !== null && isArabicLetter(next);

    let shaped: number;
    if (joinedFromPrev && joinsToNext) {
      shaped = forms.medial ?? forms.final;
    } else if (joinedFromPrev) {
      shaped = forms.final;
    } else if (joinsToNext) {
      shaped = forms.initial ?? forms.isolated;
    } else {
      shaped = forms.isolated;
    }
    output.push(shaped);
  }

  return output;
}

function isRtlChar(code: number): boolean {
  return (
    (code >= 0x0590 && code <= 0x08ff) ||
    (code >= 0xfb50 && code <= 0xfdff) ||
    (code >= 0xfe70 && code <= 0xfeff)
  );
}

function isNeutral(char: string): boolean {
  return /[\s.,:;!؟?()\-–—/\\«»"'،؛]/u.test(char);
}

const MIRROR: Record<string, string> = {
  "(": ")",
  ")": "(",
  "[": "]",
  "]": "[",
  "{": "}",
  "}": "{",
  "<": ">",
  ">": "<",
};

/**
 * Convert a logical-order line (Arabic-dominant) into a visual-order,
 * presentation-form string ready for pdf-lib `drawText`.
 *
 * Strategy: split into directional runs; shape Arabic runs; then emit runs
 * in reversed order (RTL base direction), reversing the characters of RTL
 * runs and keeping LTR runs (Latin, digits) intact.
 */
export function shapeArabicLine(input: string): string {
  if (!input) return "";
  // Strip characters pdf-lib cannot render meaningfully.
  const text = input.replace(/[‎‏‪-‮]/g, "");

  type Run = { rtl: boolean; chars: string[] };
  const runs: Run[] = [];
  let current: Run | null = null;

  for (const char of text) {
    const code = char.codePointAt(0) as number;
    let rtl: boolean;
    if (isRtlChar(code)) rtl = true;
    else if (isNeutral(char)) rtl = current ? current.rtl : true;
    else rtl = false;

    if (!current || current.rtl !== rtl) {
      current = { rtl, chars: [] };
      runs.push(current);
    }
    current.chars.push(char);
  }

  // Trailing neutrals of an LTR run belong to the surrounding RTL context.
  // (Kept simple: good enough for instruction text and labels.)

  const visualParts: string[] = [];
  for (const run of [...runs].reverse()) {
    if (run.rtl) {
      const codes = run.chars.map((char) => char.codePointAt(0) as number);
      const shaped = shapeSegment(codes);
      const visual = shaped
        .reverse()
        .map((code) => String.fromCodePoint(code))
        .map((char) => MIRROR[char] ?? char)
        .join("");
      visualParts.push(visual);
    } else {
      visualParts.push(run.chars.join(""));
    }
  }

  return visualParts.join("");
}

/** True when the string contains any Arabic-script character. */
export function containsArabic(text: string): boolean {
  return /[؀-ۿݐ-ݿ]/u.test(text);
}
