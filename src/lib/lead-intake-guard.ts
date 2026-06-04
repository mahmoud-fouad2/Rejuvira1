export const LEAD_HONEYPOT_FIELD = "rv_hp_field";
export const LEAD_RENDERED_AT_FIELD = "formRenderedAt";

export const LEAD_DUPLICATE_MESSAGE =
  "تم استلام طلب بهذا الرقم بالفعل مؤخرًا، وسيتواصل معك الفريق قريبًا. / A request with this phone number was already received recently.";

export const LEAD_SPAM_GUARD_MESSAGE =
  "تعذر إرسال الطلب الآن. الرجاء المحاولة مرة أخرى. / Could not submit your request. Please try again.";

const MIN_SUBMIT_DELAY_MS = 2500;
const MAX_CLOCK_SKEW_MS = 60 * 1000;

function readString(source: FormData | Record<string, unknown>, key: string) {
  if (source instanceof FormData) {
    const value = source.get(key);
    return typeof value === "string" ? value.trim() : "";
  }
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

export function evaluateLeadIntakeGuard(
  source: FormData | Record<string, unknown>,
  now = Date.now(),
) {
  const honeypot = readString(source, LEAD_HONEYPOT_FIELD);
  if (honeypot) {
    return { ok: false as const, reason: "honeypot" as const };
  }

  const renderedAtRaw = readString(source, LEAD_RENDERED_AT_FIELD);
  if (!renderedAtRaw) {
    return { ok: true as const };
  }

  const renderedAt = Number(renderedAtRaw);
  if (!Number.isFinite(renderedAt)) {
    return { ok: false as const, reason: "invalid_timestamp" as const };
  }

  const elapsed = now - renderedAt;
  if (elapsed < -MAX_CLOCK_SKEW_MS) {
    return { ok: false as const, reason: "future_timestamp" as const };
  }

  if (elapsed >= 0 && elapsed < MIN_SUBMIT_DELAY_MS) {
    return { ok: false as const, reason: "too_fast" as const };
  }

  return { ok: true as const };
}
