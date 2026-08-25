/**
 * src/lib/snap-pixel.ts
 *
 * Client-side Snap Pixel helpers.
 *
 * Responsibilities:
 *  1. SHA-256 hash normalised PII (phone, email) using SubtleCrypto.
 *  2. Call snaptr("setUserData", ...) with the hashed values BEFORE firing any
 *     event so Snap can match the user server-side.
 *  3. Fire SIGN_UP with a client_dedup_id mirrored to the CAPI call
 *     so Snap can de-duplicate the browser pixel event and the server event.
 *
 * PAGE_VIEW is emitted by the existing <script> snippet in the admin
 * customHeadCode — this file must NOT re-fire it.
 */
"use client";

type SnaptrFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    snaptr?: SnaptrFn;
  }
}

/** Normalise and SHA-256 hash a string as required by Snap CAPI. */
async function sha256Hex(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Normalise a Saudi/international phone number to E.164-ish digits. */
function normalizePhoneForHashing(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Convert 05xxxxxxxx -> 9665xxxxxxxx (E.164 without +)
  if (digits.startsWith("05") && digits.length === 10) {
    return `966${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Fire snaptr("setUserData", ...) with hashed PII then fire SIGN_UP.
 *
 * @param phone     Raw phone string from the form
 * @param email     Raw email string from the form (optional)
 * @param dedupId   Shared event ID used for pixel/CAPI deduplication
 * @param attempt   Internal retry counter
 */
export function fireSnapSignUp(
  phone: string,
  email: string | undefined,
  dedupId: string,
  attempt = 0,
): void {
  if (typeof window === "undefined") return;

  if (typeof window.snaptr !== "function") {
    // snaptr is loaded by the admin-configured customHeadCode snippet.
    // Retry up to ~3 seconds.
    if (attempt < 12) {
      window.setTimeout(
        () => fireSnapSignUp(phone, email, dedupId, attempt + 1),
        250,
      );
    }
    return;
  }

  const snaptr = window.snaptr;

  const phoneNorm = normalizePhoneForHashing(phone);
  const emailNorm = email?.trim().toLowerCase() ?? "";

  void (async () => {
    const hashedPhone = await sha256Hex(phoneNorm);
    const userData: Record<string, string> = { ph: hashedPhone };
    if (emailNorm) {
      userData.em = await sha256Hex(emailNorm);
    }
    snaptr("setUserData", userData);
    snaptr("track", "SIGN_UP", { client_dedup_id: dedupId });
  })();
}
