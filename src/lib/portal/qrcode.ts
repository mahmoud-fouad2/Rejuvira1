/**
 * Minimal QR code encoder (byte mode, error-correction level M,
 * versions 1–9) producing a boolean module matrix for rendering into the
 * instructions PDF. Self-contained — no external dependency.
 *
 * Implements ISO/IEC 18004: Reed-Solomon EC over GF(256), function
 * patterns, format info (BCH 15,5), version info (BCH 18,6, v7+), data
 * placement and mask selection by penalty score.
 */

// ---- GF(256) arithmetic -------------------------------------------------

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255] as number;
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[((LOG[a] as number) + (LOG[b] as number)) % 255] as number;
}

function rsGeneratorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i += 1) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j += 1) {
      next[j] = (next[j] as number) ^ gfMul(poly[j] as number, EXP[i] as number);
      next[j + 1] = (next[j + 1] as number) ^ (poly[j] as number);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: number[], ecLength: number): number[] {
  const gen = rsGeneratorPoly(ecLength);
  const remainder = new Array<number>(ecLength).fill(0);
  for (const byte of data) {
    const factor = byte ^ (remainder.shift() as number);
    remainder.push(0);
    for (let i = 0; i < gen.length - 1; i += 1) {
      remainder[i] =
        (remainder[i] as number) ^ gfMul(gen[i + 1] as number, factor);
    }
  }
  return remainder;
}

// ---- Version tables (EC level M, versions 1..9) -------------------------

type BlockSpec = {
  totalCodewords: number;
  ecPerBlock: number;
  groups: [count: number, dataCodewords: number][];
};

const SPECS: Record<number, BlockSpec> = {
  1: { totalCodewords: 26, ecPerBlock: 10, groups: [[1, 16]] },
  2: { totalCodewords: 44, ecPerBlock: 16, groups: [[1, 28]] },
  3: { totalCodewords: 70, ecPerBlock: 26, groups: [[1, 44]] },
  4: { totalCodewords: 100, ecPerBlock: 18, groups: [[2, 32]] },
  5: { totalCodewords: 134, ecPerBlock: 24, groups: [[2, 43]] },
  6: { totalCodewords: 172, ecPerBlock: 16, groups: [[4, 27]] },
  7: { totalCodewords: 196, ecPerBlock: 18, groups: [[4, 31]] },
  8: {
    totalCodewords: 242,
    ecPerBlock: 22,
    groups: [
      [2, 38],
      [2, 39],
    ],
  },
  9: {
    totalCodewords: 292,
    ecPerBlock: 22,
    groups: [
      [3, 36],
      [2, 37],
    ],
  },
};

const ALIGNMENT: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
};

// ---- BCH codes ----------------------------------------------------------

function bch(value: number, poly: number, bits: number, total: number): number {
  let data = value << (total - bits);
  const topBit = 1 << (total - 1);
  const polyTop = 1 << (poly.toString(2).length - 1);
  let divisor = poly << (total - poly.toString(2).length);
  let mask = topBit;
  while (mask >= polyTop) {
    if (data & mask) data ^= divisor;
    divisor >>= 1;
    mask >>= 1;
  }
  return (value << (total - bits)) | data;
}

function formatBits(mask: number): number {
  // EC level M = 0b00.
  const value = (0b00 << 3) | mask;
  return bch(value, 0b10100110111, 5, 15) ^ 0b101010000010010;
}

function versionBits(version: number): number {
  return bch(version, 0b1111100100101, 6, 18);
}

// ---- Matrix building ----------------------------------------------------

export type QrMatrix = boolean[][];

function createMatrix(size: number): (boolean | null)[][] {
  return Array.from({ length: size }, () =>
    new Array<boolean | null>(size).fill(null),
  );
}

function placeFinder(matrix: (boolean | null)[][], row: number, col: number) {
  for (let r = -1; r <= 7; r += 1) {
    for (let c = -1; c <= 7; c += 1) {
      const rr = row + r;
      const cc = col + c;
      if (rr < 0 || cc < 0 || rr >= matrix.length || cc >= matrix.length) {
        continue;
      }
      const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6;
      const onRing =
        inOuter && (r === 0 || r === 6 || c === 0 || c === 6);
      const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      (matrix[rr] as (boolean | null)[])[cc] = onRing || inCore;
    }
  }
}

const MASKS: ((r: number, c: number) => boolean)[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function penalty(matrix: boolean[][]): number {
  const size = matrix.length;
  let score = 0;

  // Rule 1: runs of same color >= 5.
  for (let axis = 0; axis < 2; axis += 1) {
    for (let i = 0; i < size; i += 1) {
      let run = 1;
      for (let j = 1; j < size; j += 1) {
        const current = axis
          ? (matrix[j] as boolean[])[i]
          : (matrix[i] as boolean[])[j];
        const previous = axis
          ? (matrix[j - 1] as boolean[])[i]
          : (matrix[i] as boolean[])[j - 1];
        if (current === previous) {
          run += 1;
        } else {
          if (run >= 5) score += run - 2;
          run = 1;
        }
      }
      if (run >= 5) score += run - 2;
    }
  }

  // Rule 2: 2x2 blocks.
  for (let r = 0; r < size - 1; r += 1) {
    for (let c = 0; c < size - 1; c += 1) {
      const v = (matrix[r] as boolean[])[c];
      if (
        v === (matrix[r] as boolean[])[c + 1] &&
        v === (matrix[r + 1] as boolean[])[c] &&
        v === (matrix[r + 1] as boolean[])[c + 1]
      ) {
        score += 3;
      }
    }
  }

  // Rule 3: finder-like patterns.
  const pattern1 = [true, false, true, true, true, false, true, false, false, false, false];
  const pattern2 = [...pattern1].reverse();
  const matches = (line: boolean[], start: number, pattern: boolean[]) =>
    pattern.every((value, index) => line[start + index] === value);
  for (let i = 0; i < size; i += 1) {
    const row = matrix[i] as boolean[];
    const col = matrix.map((r) => (r as boolean[])[i] as boolean);
    for (let j = 0; j <= size - 11; j += 1) {
      if (matches(row, j, pattern1) || matches(row, j, pattern2)) score += 40;
      if (matches(col, j, pattern1) || matches(col, j, pattern2)) score += 40;
    }
  }

  // Rule 4: dark ratio.
  let dark = 0;
  for (const row of matrix) for (const cell of row) if (cell) dark += 1;
  const percent = (dark * 100) / (size * size);
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;

  return score;
}

/** Encode text (UTF-8 byte mode, EC level M). Returns the module matrix. */
export function encodeQr(text: string): QrMatrix {
  const bytes = Array.from(new TextEncoder().encode(text));

  // Pick the smallest version that fits.
  let version = 0;
  for (let v = 1; v <= 9; v += 1) {
    const spec = SPECS[v] as BlockSpec;
    const dataCodewords = spec.groups.reduce(
      (sum, [count, size]) => sum + count * size,
      0,
    );
    const capacityBits = dataCodewords * 8;
    const neededBits = 4 + 8 + bytes.length * 8;
    if (neededBits <= capacityBits) {
      version = v;
      break;
    }
  }
  if (!version) {
    throw new Error("QR payload too long");
  }
  const spec = SPECS[version] as BlockSpec;
  const totalDataCodewords = spec.groups.reduce(
    (sum, [count, size]) => sum + count * size,
    0,
  );

  // Bit stream: mode 0100, count (8 bits), data, terminator, pad.
  const bits: number[] = [];
  const pushBits = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i -= 1) bits.push((value >> i) & 1);
  };
  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (const byte of bytes) pushBits(byte, 8);
  const capacity = totalDataCodewords * 8;
  pushBits(0, Math.min(4, capacity - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);
  const padBytes = [0xec, 0x11];
  let padIndex = 0;
  while (bits.length < capacity) {
    pushBits(padBytes[padIndex % 2] as number, 8);
    padIndex += 1;
  }

  const dataCodewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | (bits[i + j] as number);
    dataCodewords.push(byte);
  }

  // Split into blocks, compute EC, interleave.
  const blocks: { data: number[]; ec: number[] }[] = [];
  let offset = 0;
  for (const [count, size] of spec.groups) {
    for (let b = 0; b < count; b += 1) {
      const data = dataCodewords.slice(offset, offset + size);
      offset += size;
      blocks.push({ data, ec: rsEncode(data, spec.ecPerBlock) });
    }
  }
  const interleaved: number[] = [];
  const maxData = Math.max(...blocks.map((block) => block.data.length));
  for (let i = 0; i < maxData; i += 1) {
    for (const block of blocks) {
      if (i < block.data.length) interleaved.push(block.data[i] as number);
    }
  }
  for (let i = 0; i < spec.ecPerBlock; i += 1) {
    for (const block of blocks) interleaved.push(block.ec[i] as number);
  }

  // Build matrix with function patterns.
  const size = 17 + version * 4;
  const matrix = createMatrix(size);
  placeFinder(matrix, 0, 0);
  placeFinder(matrix, 0, size - 7);
  placeFinder(matrix, size - 7, 0);

  // Alignment patterns.
  const centers = ALIGNMENT[version] as number[];
  for (const row of centers) {
    for (const col of centers) {
      if ((matrix[row] as (boolean | null)[])[col] !== null) continue;
      for (let r = -2; r <= 2; r += 1) {
        for (let c = -2; c <= 2; c += 1) {
          (matrix[row + r] as (boolean | null)[])[col + c] =
            Math.max(Math.abs(r), Math.abs(c)) !== 1;
        }
      }
    }
  }

  // Timing patterns.
  for (let i = 8; i < size - 8; i += 1) {
    if ((matrix[6] as (boolean | null)[])[i] === null) {
      (matrix[6] as (boolean | null)[])[i] = i % 2 === 0;
    }
    if ((matrix[i] as (boolean | null)[])[6] === null) {
      (matrix[i] as (boolean | null)[])[6] = i % 2 === 0;
    }
  }

  // Dark module + reserve format areas.
  (matrix[size - 8] as (boolean | null)[])[8] = true;
  const reserveFormat: [number, number][] = [];
  for (let i = 0; i <= 8; i += 1) {
    if (i !== 6) {
      reserveFormat.push([8, i], [i, 8]);
    }
  }
  for (let i = 0; i < 8; i += 1) {
    reserveFormat.push([8, size - 1 - i]);
    if (i < 7) reserveFormat.push([size - 1 - i, 8]);
  }
  for (const [r, c] of reserveFormat) {
    if ((matrix[r] as (boolean | null)[])[c] === null) {
      (matrix[r] as (boolean | null)[])[c] = false;
    }
  }

  // Version info (v7+).
  if (version >= 7) {
    const info = versionBits(version);
    for (let i = 0; i < 18; i += 1) {
      const bit = ((info >> i) & 1) === 1;
      const r = Math.floor(i / 3);
      const c = size - 11 + (i % 3);
      (matrix[r] as (boolean | null)[])[c] = bit;
      (matrix[c] as (boolean | null)[])[r] = bit;
    }
  }

  // Record which modules are data (still null).
  const isData = matrix.map((row) => row.map((cell) => cell === null));

  // Place data bits in the zigzag pattern.
  let bitIndex = 0;
  const totalBits = interleaved.length * 8;
  const getBit = () => {
    if (bitIndex >= totalBits) return false;
    const byte = interleaved[bitIndex >> 3] as number;
    const bit = ((byte >> (7 - (bitIndex & 7))) & 1) === 1;
    bitIndex += 1;
    return bit;
  };
  let upward = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1;
    for (let i = 0; i < size; i += 1) {
      const row = upward ? size - 1 - i : i;
      for (const c of [col, col - 1]) {
        if ((matrix[row] as (boolean | null)[])[c] === null) {
          (matrix[row] as (boolean | null)[])[c] = getBit();
        }
      }
    }
    upward = !upward;
  }

  // Try all masks, keep the best.
  let best: boolean[][] | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (let mask = 0; mask < 8; mask += 1) {
    const candidate = matrix.map((row, r) =>
      row.map((cell, c) => {
        const value = cell as boolean;
        return (isData[r] as boolean[])[c] && (MASKS[mask] as (r: number, c: number) => boolean)(r, c)
          ? !value
          : value;
      }),
    );
    // Write format info for this mask.
    const format = formatBits(mask);
    for (let i = 0; i < 15; i += 1) {
      const bit = ((format >> i) & 1) === 1;
      // Around top-left finder.
      if (i < 6) (candidate[8] as boolean[])[i] = bit;
      else if (i === 6) (candidate[8] as boolean[])[7] = bit;
      else if (i === 7) (candidate[8] as boolean[])[8] = bit;
      else if (i === 8) (candidate[7] as boolean[])[8] = bit;
      else (candidate[14 - i] as boolean[])[8] = bit;
      // Second copy.
      if (i < 8) (candidate[8] as boolean[])[size - 1 - i] = bit;
      else (candidate[size - 15 + i] as boolean[])[8] = bit;
    }
    const score = penalty(candidate);
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best as QrMatrix;
}
