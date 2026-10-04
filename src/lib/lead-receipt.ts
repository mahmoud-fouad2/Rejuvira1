import { createHmac, timingSafeEqual } from "node:crypto";

export type LeadReceiptState = "success" | "duplicate";

type LeadReceiptPayload = {
  v: 1;
  requestId: string;
  state: LeadReceiptState;
  issuedAt: number;
  expiresAt: number;
};

const DEFAULT_TTL_SECONDS = 15 * 60;

function getReceiptSecret(explicitSecret?: string) {
  return (
    explicitSecret?.trim() ||
    process.env.LEAD_RECEIPT_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    ""
  );
}

function sign(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
}

export function createLeadReceipt(
  requestId: string,
  state: LeadReceiptState,
  options: { now?: number; ttlSeconds?: number; secret?: string } = {},
) {
  const secret = getReceiptSecret(options.secret);
  const cleanRequestId = requestId.trim();
  if (!secret || !cleanRequestId) return null;

  const issuedAt = Math.floor((options.now ?? Date.now()) / 1000);
  const payload: LeadReceiptPayload = {
    v: 1,
    requestId: cleanRequestId,
    state,
    issuedAt,
    expiresAt: issuedAt + (options.ttlSeconds ?? DEFAULT_TTL_SECONDS),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function verifyLeadReceipt(
  token: string | null | undefined,
  options: { now?: number; secret?: string } = {},
): LeadReceiptPayload | null {
  const secret = getReceiptSecret(options.secret);
  if (!secret || !token) return null;

  const [encodedPayload, receivedSignature, extra] = token.split(".");
  if (!encodedPayload || !receivedSignature || extra) return null;

  const expectedSignature = sign(encodedPayload, secret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(receivedSignature);
  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<LeadReceiptPayload>;
    const now = Math.floor((options.now ?? Date.now()) / 1000);
    if (
      payload.v !== 1 ||
      typeof payload.requestId !== "string" ||
      !payload.requestId.trim() ||
      (payload.state !== "success" && payload.state !== "duplicate") ||
      typeof payload.issuedAt !== "number" ||
      typeof payload.expiresAt !== "number" ||
      payload.issuedAt > now + 60 ||
      payload.expiresAt < now
    ) {
      return null;
    }
    return payload as LeadReceiptPayload;
  } catch {
    return null;
  }
}
