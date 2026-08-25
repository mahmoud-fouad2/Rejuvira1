/**
 * src/lib/snap-capi.ts
 *
 * Server-side Snapchat Conversions API (CAPI) v2 helper.
 *
 * - Runs ONLY on the Node.js server (never bundled into the client).
 * - Uses the built-in `crypto` module for SHA-256 hashing (no extra deps).
 * - Mirrors the `client_dedup_id` from the browser Snap Pixel call so Snap
 *   de-duplicates both signals within the 48-hour dedup window.
 * - Silently no-ops when SNAP_PIXEL_ID or SNAP_CAPI_TOKEN are absent so the
 *   contact form continues to work without Snap credentials set up.
 *
 * Environment variables required (Render / .env):
 *   SNAP_PIXEL_ID       — Snap Pixel ID (e.g. abc123...)
 *   SNAP_CAPI_TOKEN     — Bearer token from Ads Manager → Conversions API Tokens
 *   SNAP_TEST_EVENT_CODE — Optional; only set during testing (omit in production)
 */

import { createHash } from "crypto";

const CAPI_ENDPOINT = "https://tr.snapchat.com/v2/conversion";

/** SHA-256 hex of a normalised string value. */
function sha256Hex(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/** Normalise a Saudi/international phone number to E.164 digits for hashing. */
function normalizePhoneForHashing(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("05") && digits.length === 10) {
    return `966${digits.slice(1)}`;
  }
  return digits;
}

export type SnapSignUpPayload = {
  /**
   * The shared deduplication ID.  Must be the same UUID that was passed to
   * snaptr("track", "SIGN_UP", { client_dedup_id }) in the browser.
   */
  dedupId: string;
  /** Raw phone number from the validated form (e.g. "0512345678"). */
  phone: string;
  /** Optional raw email address. */
  email?: string | undefined;
  /** Visitor IP (used for matching quality; never stored by Snap). */
  ip?: string | undefined;
  /** Visitor user-agent (used for matching quality). */
  userAgent?: string | undefined;
  /** Page URL where the form was submitted. */
  pageUrl?: string | undefined;
};

/**
 * Send a SIGN_UP event to the Snap Conversions API.
 *
 * Resolves to `true` on success, `false` on failure or when credentials
 * are missing (so the caller can log without crashing the request).
 */
export async function sendSnapSignUpCapi(
  payload: SnapSignUpPayload,
): Promise<boolean> {
  const pixelId = process.env.SNAP_PIXEL_ID?.trim();
  const token = process.env.SNAP_CAPI_TOKEN?.trim();

  if (!pixelId || !token) {
    // Credentials not configured — skip silently.
    return false;
  }

  const hashedPhone = sha256Hex(normalizePhoneForHashing(payload.phone));
  const hashedDataFields: Record<string, string> = {
    phone_number: hashedPhone,
  };
  if (payload.email?.trim()) {
    hashedDataFields.email = sha256Hex(payload.email);
  }

  const userData: Record<string, string> = {};
  if (payload.ip) userData.ip_address = payload.ip;
  if (payload.userAgent) userData.user_agent = payload.userAgent;

  const body: Record<string, unknown> = {
    pixel_id: pixelId,
    events: [
      {
        event_type: "SIGN_UP",
        event_conversion_type: "WEB",
        event_time: Math.floor(Date.now() / 1000),
        client_dedup_id: payload.dedupId,
        hashed_data_fields: hashedDataFields,
        ...(Object.keys(userData).length > 0 ? { user_data: userData } : {}),
        ...(payload.pageUrl ? { page_url: payload.pageUrl } : {}),
      },
    ],
  };

  // Only include test_event_code when explicitly set.
  const testCode = process.env.SNAP_TEST_EVENT_CODE?.trim();
  if (testCode) body.test_event_code = testCode;

  try {
    const res = await fetch(CAPI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      // 5-second timeout — must not block the form response.
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "(unreadable)");
      console.error(`[snap-capi] CAPI error ${res.status}: ${text}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[snap-capi] CAPI request failed:", err);
    return false;
  }
}
