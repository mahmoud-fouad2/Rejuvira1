"use server";

import { redirect } from "next/navigation";
import { PortalActorType } from "@prisma/client";
import { z } from "zod";

import {
  completeActivation,
  createPatientSession,
  loginPatient,
} from "@/lib/portal/patient-auth";
import { writePortalAudit } from "@/lib/portal/audit";
import { extractClientIp, rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import {
  isValidSaudiMobileNumber,
  normalizeSaudiMobileNumber,
} from "@/lib/saudi-phone";

export type PatientAuthState = {
  status: "idle" | "success" | "error";
  message: string;
};

const idle: PatientAuthState = { status: "idle", message: "" };
void idle;

export async function patientLoginAction(
  _prev: PatientAuthState,
  formData: FormData,
): Promise<PatientAuthState> {
  const phone = String(formData.get("phone") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!phone || !password) {
    return {
      status: "error",
      message: "أدخل رقم الجوال وكلمة المرور.",
    };
  }

  const result = await loginPatient(phone, password);
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  await createPatientSession(result.patientId);
  redirect(result.mustChangePassword ? "/portal/account" : "/portal");
}

const activateSchema = z.object({
  token: z.string().min(20).max(128),
  otp: z.string().regex(/^\d{6}$/, "رمز التحقق مكون من 6 أرقام."),
  password: z.string().min(1, "اختر كلمة مرور."),
  confirmPassword: z.string(),
  acceptTerms: z.string().optional(),
});

export async function activateAccountAction(
  _prev: PatientAuthState,
  formData: FormData,
): Promise<PatientAuthState> {
  const parsed = activateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "راجع البيانات المدخلة.",
    };
  }
  const data = parsed.data;
  if (data.password !== data.confirmPassword) {
    return { status: "error", message: "كلمتا المرور غير متطابقتين." };
  }

  const result = await completeActivation({
    rawToken: data.token,
    otp: data.otp,
    password: data.password,
    acceptedTerms: data.acceptTerms === "1",
  });
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  await createPatientSession(result.patientId);
  redirect("/portal");
}

/**
 * Account recovery request. Always returns the same message regardless of
 * whether the phone exists (no enumeration). When the phone matches a
 * patient, staff see an internal recovery request to act on.
 */
export async function recoverRequestAction(
  _prev: PatientAuthState,
  formData: FormData,
): Promise<PatientAuthState> {
  const phoneInput = String(formData.get("phone") ?? "");

  try {
    const headerStore = await headers();
    const ip = extractClientIp(headerStore);
    const limit = rateLimit({
      key: `portal:recover:${ip}`,
      limit: 5,
      windowSeconds: 600,
    });
    if (!limit.ok) {
      return {
        status: "error",
        message: "تم تجاوز عدد المحاولات. حاول مرة أخرى لاحقًا.",
      };
    }
  } catch {
    /* headers unavailable — continue */
  }

  const genericSuccess: PatientAuthState = {
    status: "success",
    message:
      "إذا كان الرقم مسجلًا لدينا فسيتواصل معك فريق المركز لإعادة تفعيل حسابك خلال أوقات العمل.",
  };

  if (!isValidSaudiMobileNumber(phoneInput)) {
    // Same message — do not reveal validity.
    return genericSuccess;
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const normalized = normalizeSaudiMobileNumber(phoneInput);
    const patient = await prisma.patient.findFirst({
      where: { phone: normalized, archivedAt: null },
      select: { id: true },
    });
    if (patient) {
      await writePortalAudit({
        actorType: PortalActorType.PATIENT,
        actorId: patient.id,
        action: "patient.recovery_requested",
        entityType: "patient",
        entityId: patient.id,
        patientId: patient.id,
      });
    }
  } catch {
    /* never leak errors here */
  }

  return genericSuccess;
}
