/**
 * reCAPTCHA v3 server-side verification helper.
 *
 * Usage:
 *   const result = await verifyRecaptchaToken(token, "contact");
 *   if (!result.success || result.score < 0.4) { ... }
 *
 * If `RECAPTCHA_SECRET_KEY` is not configured we return `{ success: true,
 * score: 1, action }` so that local development / preview environments
 * are not blocked.
 */

export type RecaptchaVerifyResult = {
  success: boolean;
  score: number;
  action: string;
  hostname?: string | undefined;
  errors: string[];
};

const VERIFY_ENDPOINT = "https://www.google.com/recaptcha/api/siteverify";

export function isRecaptchaConfigured(): boolean {
  return Boolean(process.env.RECAPTCHA_SECRET_KEY);
}

export function getPublicSiteKey(): string {
  return (
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ??
    process.env.RECAPTCHA_SITE_KEY ??
    ""
  );
}

export async function verifyRecaptchaToken(
  token: string | null | undefined,
  expectedAction: string,
  options: { remoteIp?: string | undefined } = {},
): Promise<RecaptchaVerifyResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return {
      success: true,
      score: 1,
      action: expectedAction,
      errors: ["recaptcha-not-configured"],
    };
  }

  if (!token) {
    return {
      success: false,
      score: 0,
      action: expectedAction,
      errors: ["missing-token"],
    };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (options.remoteIp) {
    body.set("remoteip", options.remoteIp);
  }

  try {
    const response = await fetch(VERIFY_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await response.json()) as {
      success?: boolean;
      score?: number;
      action?: string;
      hostname?: string;
      "error-codes"?: string[];
    };

    return {
      success: Boolean(data.success),
      score: typeof data.score === "number" ? data.score : 0,
      action: typeof data.action === "string" ? data.action : expectedAction,
      hostname: data.hostname,
      errors: Array.isArray(data["error-codes"]) ? data["error-codes"] : [],
    };
  } catch (error) {
    return {
      success: false,
      score: 0,
      action: expectedAction,
      errors: [
        error instanceof Error ? error.message : "recaptcha-fetch-failed",
      ],
    };
  }
}
