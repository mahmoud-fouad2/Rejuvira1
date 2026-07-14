import { headers } from "next/headers";

import { PortalActorType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { extractClientIp } from "@/lib/rate-limit";

/**
 * Patient-portal audit trail. Separate from the admin `AuditLog` because
 * portal events can be triggered by patients and by the system, not only
 * by staff `User` records. Never store passwords, tokens, or OTP values
 * inside `changes`.
 */

export type PortalAuditInput = {
  actorType: PortalActorType;
  actorId?: string | null | undefined;
  actorName?: string | null | undefined;
  action: string;
  entityType: string;
  entityId?: string | null | undefined;
  patientId?: string | null | undefined;
  changes?: Record<string, unknown> | undefined;
};

const SENSITIVE_KEYS = new Set([
  "password",
  "hashedPassword",
  "newPassword",
  "currentPassword",
  "token",
  "tokenHash",
  "otp",
  "otpHash",
  "secret",
]);

function stripSensitive(
  changes: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!changes) return undefined;
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(changes)) {
    if (SENSITIVE_KEYS.has(key)) continue;
    safe[key] = value;
  }
  return safe;
}

async function requestContext() {
  try {
    const headerStore = await headers();
    const ipAddress = extractClientIp(headerStore);
    const userAgent = headerStore.get("user-agent")?.slice(0, 512) ?? null;
    return {
      ipAddress: ipAddress === "unknown" ? null : ipAddress,
      userAgent,
    };
  } catch {
    return { ipAddress: null, userAgent: null };
  }
}

export async function writePortalAudit(input: PortalAuditInput) {
  if (!process.env.DATABASE_URL) return;
  try {
    const { ipAddress, userAgent } = await requestContext();
    const changes = stripSensitive(input.changes);
    await prisma.portalAuditLog.create({
      data: {
        actorType: input.actorType,
        actorId: input.actorId ?? null,
        actorName: input.actorName ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        patientId: input.patientId ?? null,
        ipAddress,
        userAgent,
        ...(changes && Object.keys(changes).length
          ? { changes: changes as never }
          : {}),
      },
    });
  } catch (error) {
    // Auditing must never break the main operation.
    console.warn(
      "[portal-audit] write failed",
      error instanceof Error ? error.message : error,
    );
  }
}
