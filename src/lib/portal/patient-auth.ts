import { createHash, randomBytes, randomInt } from "node:crypto";

import { cookies, headers } from "next/headers";
import { compare, hash } from "bcryptjs";
import {
  PatientAccountStatus,
  PortalActorType,
  PortalTokenPurpose,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { extractClientIp, rateLimit } from "@/lib/rate-limit";
import { normalizeSaudiMobileNumber } from "@/lib/saudi-phone";
import { writePortalAudit } from "@/lib/portal/audit";
import { getPortalSettings } from "@/lib/portal/settings";

/**
 * Patient authentication — fully separate from the staff NextAuth setup.
 * Sessions are opaque random tokens stored hashed in `PatientSession` and
 * carried in an httpOnly cookie. Activation/recovery links are one-time
 * hashed tokens with a short OTP for phone verification.
 *
 * Security notes:
 * - Raw tokens/OTPs are never persisted; only SHA-256 (token) and bcrypt
 *   (OTP/password) digests.
 * - Login and recovery return one generic Arabic error to prevent phone
 *   number enumeration.
 */

export const PATIENT_SESSION_COOKIE = "rejuvera_patient_session";

/** Generic error shown for any credential failure (no enumeration). */
export const GENERIC_LOGIN_ERROR =
  "بيانات الدخول غير صحيحة. تأكد من رقم الجوال وكلمة المرور.";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function clientContext() {
  try {
    const headerStore = await headers();
    return {
      ip: extractClientIp(headerStore),
      userAgent: headerStore.get("user-agent")?.slice(0, 512) ?? null,
    };
  } catch {
    return { ip: "unknown", userAgent: null };
  }
}

// ------------------------------------------------------------------
// Activation / recovery tokens
// ------------------------------------------------------------------

export type IssuedActivation = {
  token: string;
  otp: string;
  expiresAt: Date;
  activationPath: string;
};

export async function issueActivationToken(
  patientId: string,
  purpose: PortalTokenPurpose,
  by: { id?: string; name?: string; actorType?: PortalActorType },
): Promise<IssuedActivation> {
  const settings = await getPortalSettings();
  const token = randomBytes(32).toString("base64url");
  const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const expiresAt = new Date(
    Date.now() + settings.activationLinkHours * 60 * 60 * 1000,
  );

  await prisma.$transaction(async (tx) => {
    // Invalidate previous unused tokens of the same purpose.
    await tx.patientActivationToken.updateMany({
      where: { patientId, purpose, usedAt: null },
      data: { usedAt: new Date() },
    });
    await tx.patientActivationToken.create({
      data: {
        patientId,
        tokenHash: sha256(token),
        otpHash: await hash(otp, 10),
        purpose,
        expiresAt,
        createdById: by.id ?? null,
        createdByName: by.name ?? null,
      },
    });
  });

  await writePortalAudit({
    actorType: by.actorType ?? PortalActorType.STAFF,
    actorId: by.id,
    actorName: by.name,
    action:
      purpose === PortalTokenPurpose.ACTIVATION
        ? "patient.activation_issued"
        : "patient.recovery_issued",
    entityType: "patient",
    entityId: patientId,
    patientId,
  });

  return {
    token,
    otp,
    expiresAt,
    activationPath: `/patient-login/activate?token=${token}`,
  };
}

export type ActivationLookup =
  | { ok: true; tokenId: string; patientId: string; purpose: PortalTokenPurpose }
  | { ok: false; reason: "invalid" | "expired" | "used" | "locked" };

export async function lookupActivationToken(
  rawToken: string,
): Promise<ActivationLookup> {
  if (!rawToken || rawToken.length < 20 || rawToken.length > 128) {
    return { ok: false, reason: "invalid" };
  }
  const record = await prisma.patientActivationToken.findUnique({
    where: { tokenHash: sha256(rawToken) },
  });
  if (!record) return { ok: false, reason: "invalid" };
  if (record.usedAt) return { ok: false, reason: "used" };
  if (record.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (record.attempts >= 8) return { ok: false, reason: "locked" };
  return {
    ok: true,
    tokenId: record.id,
    patientId: record.patientId,
    purpose: record.purpose,
  };
}

export type CompleteActivationResult =
  | { ok: true; patientId: string }
  | { ok: false; error: string };

export async function completeActivation(input: {
  rawToken: string;
  otp: string;
  password: string;
  acceptedTerms: boolean;
}): Promise<CompleteActivationResult> {
  const settings = await getPortalSettings();
  const { ip } = await clientContext();
  const limit = rateLimit({
    key: `portal:activate:${ip}`,
    limit: 10,
    windowSeconds: 600,
  });
  if (!limit.ok) {
    return {
      ok: false,
      error: "تم تجاوز عدد المحاولات. حاول مرة أخرى بعد قليل.",
    };
  }

  if (!input.acceptedTerms) {
    return {
      ok: false,
      error: "يجب الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة.",
    };
  }
  if (input.password.length < settings.passwordMinLength) {
    return {
      ok: false,
      error: `كلمة المرور يجب ألا تقل عن ${settings.passwordMinLength} أحرف.`,
    };
  }

  const lookup = await lookupActivationToken(input.rawToken);
  if (!lookup.ok) {
    const messages: Record<typeof lookup.reason, string> = {
      invalid: "رابط التفعيل غير صالح. اطلب رابطًا جديدًا من المركز.",
      expired: "انتهت صلاحية رابط التفعيل. اطلب رابطًا جديدًا من المركز.",
      used: "تم استخدام هذا الرابط من قبل. يمكنك تسجيل الدخول مباشرة.",
      locked: "تم إيقاف هذا الرابط بعد محاولات متكررة. اطلب رابطًا جديدًا.",
    };
    return { ok: false, error: messages[lookup.reason] };
  }

  const record = await prisma.patientActivationToken.findUniqueOrThrow({
    where: { id: lookup.tokenId },
  });
  const otpValid =
    record.otpHash && /^\d{6}$/.test(input.otp)
      ? await compare(input.otp, record.otpHash)
      : false;
  if (!otpValid) {
    await prisma.patientActivationToken.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "رمز التحقق غير صحيح." };
  }

  const hashedPassword = await hash(input.password, 12);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.patientActivationToken.update({
      where: { id: record.id },
      data: { usedAt: now },
    });
    await tx.patientAccount.update({
      where: { patientId: record.patientId },
      data: {
        hashedPassword,
        mustChangePassword: false,
        phoneVerifiedAt: now,
        activatedAt: now,
        lastPasswordChangeAt: now,
        failedLoginAttempts: 0,
        lockedUntil: null,
        termsAcceptedAt: now,
        privacyPolicyVersion: settings.privacyPolicyVersion,
      },
    });
    await tx.patient.update({
      where: { id: record.patientId },
      data: { accountStatus: PatientAccountStatus.ACTIVE },
    });
  });

  await writePortalAudit({
    actorType: PortalActorType.PATIENT,
    actorId: record.patientId,
    action:
      record.purpose === PortalTokenPurpose.ACTIVATION
        ? "patient.account_activated"
        : "patient.password_reset",
    entityType: "patient",
    entityId: record.patientId,
    patientId: record.patientId,
    changes: { privacyPolicyVersion: settings.privacyPolicyVersion },
  });

  return { ok: true, patientId: record.patientId };
}

// ------------------------------------------------------------------
// Login / sessions
// ------------------------------------------------------------------

export type PatientLoginResult =
  | { ok: true; patientId: string; mustChangePassword: boolean }
  | { ok: false; error: string };

export async function loginPatient(
  phoneInput: string,
  password: string,
): Promise<PatientLoginResult> {
  const settings = await getPortalSettings();
  const { ip } = await clientContext();

  const ipLimit = rateLimit({
    key: `portal:login:ip:${ip}`,
    limit: 12,
    windowSeconds: 300,
  });
  if (!ipLimit.ok) {
    return {
      ok: false,
      error: "تم تجاوز عدد المحاولات. حاول مرة أخرى بعد دقائق.",
    };
  }

  const identifier = normalizeSaudiMobileNumber(phoneInput);
  const idLimit = rateLimit({
    key: `portal:login:id:${identifier}`,
    limit: 10,
    windowSeconds: 300,
  });
  if (!idLimit.ok) {
    return {
      ok: false,
      error: "تم تجاوز عدد المحاولات. حاول مرة أخرى بعد دقائق.",
    };
  }

  const account = await prisma.patientAccount.findUnique({
    where: { loginIdentifier: identifier },
    include: { patient: { select: { accountStatus: true, archivedAt: true } } },
  });

  const failLogin = async () => {
    if (account) {
      const attempts = account.failedLoginAttempts + 1;
      await prisma.patientAccount.update({
        where: { id: account.id },
        data: {
          failedLoginAttempts: attempts,
          ...(attempts >= settings.maxFailedLogins
            ? {
                lockedUntil: new Date(
                  Date.now() + settings.lockMinutes * 60 * 1000,
                ),
                failedLoginAttempts: 0,
              }
            : {}),
        },
      });
      await writePortalAudit({
        actorType: PortalActorType.PATIENT,
        actorId: account.patientId,
        action: "patient.login_failed",
        entityType: "patient",
        entityId: account.patientId,
        patientId: account.patientId,
      });
    }
    return { ok: false as const, error: GENERIC_LOGIN_ERROR };
  };

  if (!account || !account.hashedPassword || !account.activatedAt) {
    // Burn comparable time so missing accounts are indistinguishable.
    await hash(password || "x", 6).catch(() => null);
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }
  if (account.lockedUntil && account.lockedUntil.getTime() > Date.now()) {
    return {
      ok: false,
      error: "تم إيقاف الدخول مؤقتًا بعد محاولات متكررة. حاول لاحقًا.",
    };
  }
  if (
    account.patient.archivedAt ||
    account.patient.accountStatus === PatientAccountStatus.SUSPENDED ||
    account.patient.accountStatus === PatientAccountStatus.ARCHIVED
  ) {
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  const valid = await compare(password, account.hashedPassword);
  if (!valid) return failLogin();

  await prisma.patientAccount.update({
    where: { id: account.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
  await prisma.patient.update({
    where: { id: account.patientId },
    data: { lastLoginAt: new Date() },
  });
  await writePortalAudit({
    actorType: PortalActorType.PATIENT,
    actorId: account.patientId,
    action: "patient.login",
    entityType: "patient",
    entityId: account.patientId,
    patientId: account.patientId,
  });

  return {
    ok: true,
    patientId: account.patientId,
    mustChangePassword: account.mustChangePassword,
  };
}

export async function createPatientSession(patientId: string) {
  const settings = await getPortalSettings();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + settings.sessionHours * 3600 * 1000);
  const { ip, userAgent } = await clientContext();

  await prisma.patientSession.create({
    data: {
      patientId,
      tokenHash: sha256(token),
      expiresAt,
      ipAddress: ip === "unknown" ? null : ip,
      userAgent,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(PATIENT_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export type PatientSessionInfo = {
  patientId: string;
  sessionId: string;
  mustChangePassword: boolean;
  fullNameAr: string;
  preferredLanguage: string;
};

export async function getPatientSession(): Promise<PatientSessionInfo | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(PATIENT_SESSION_COOKIE)?.value;
    if (!token) return null;
    const session = await prisma.patientSession.findUnique({
      where: { tokenHash: sha256(token) },
      include: {
        patient: {
          select: {
            id: true,
            fullNameAr: true,
            preferredLanguage: true,
            accountStatus: true,
            archivedAt: true,
            account: { select: { mustChangePassword: true } },
          },
        },
      },
    });
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() < Date.now() ||
      session.patient.archivedAt ||
      session.patient.accountStatus !== PatientAccountStatus.ACTIVE
    ) {
      return null;
    }
    // Touch lastSeenAt at most once per minute to avoid write amplification.
    if (Date.now() - session.lastSeenAt.getTime() > 60_000) {
      await prisma.patientSession
        .update({
          where: { id: session.id },
          data: { lastSeenAt: new Date() },
        })
        .catch(() => null);
    }
    return {
      patientId: session.patient.id,
      sessionId: session.id,
      mustChangePassword: session.patient.account?.mustChangePassword ?? false,
      fullNameAr: session.patient.fullNameAr,
      preferredLanguage: session.patient.preferredLanguage,
    };
  } catch {
    return null;
  }
}

export async function logoutPatient() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PATIENT_SESSION_COOKIE)?.value;
  if (token) {
    await prisma.patientSession
      .updateMany({
        where: { tokenHash: sha256(token) },
        data: { revokedAt: new Date() },
      })
      .catch(() => null);
  }
  cookieStore.delete(PATIENT_SESSION_COOKIE);
}

export async function revokeAllPatientSessions(patientId: string) {
  await prisma.patientSession.updateMany({
    where: { patientId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function changePatientPassword(input: {
  patientId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: boolean; error?: string }> {
  const settings = await getPortalSettings();
  if (input.newPassword.length < settings.passwordMinLength) {
    return {
      ok: false,
      error: `كلمة المرور يجب ألا تقل عن ${settings.passwordMinLength} أحرف.`,
    };
  }
  const account = await prisma.patientAccount.findUnique({
    where: { patientId: input.patientId },
  });
  if (!account?.hashedPassword) {
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }
  const valid = await compare(input.currentPassword, account.hashedPassword);
  if (!valid) {
    return { ok: false, error: "كلمة المرور الحالية غير صحيحة." };
  }
  await prisma.patientAccount.update({
    where: { id: account.id },
    data: {
      hashedPassword: await hash(input.newPassword, 12),
      mustChangePassword: false,
      lastPasswordChangeAt: new Date(),
    },
  });
  await writePortalAudit({
    actorType: PortalActorType.PATIENT,
    actorId: input.patientId,
    action: "patient.password_changed",
    entityType: "patient",
    entityId: input.patientId,
    patientId: input.patientId,
  });
  return { ok: true };
}
