"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import {
  MailError,
  isSmtpConfigured,
  sendTestEmail,
  verifyMailer,
} from "@/lib/portal/email";

export type SmtpTestState = {
  status: "idle" | "success" | "error" | "warning";
  message: string;
};

const testEmailSchema = z.object({
  to: z.string().trim().email("أدخل بريدًا إلكترونيًا صالحًا."),
});

async function requireAdminForSmtpTest() {
  const session = await auth();
  const role = session?.user?.role;
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
}

/** Live SMTP handshake — surfaces auth/timeouts *before* touching a patient. */
export async function verifySmtpAction(
  _prev: SmtpTestState,
  formData: FormData,
): Promise<SmtpTestState> {
  void _prev;
  void formData;
  const allowed = await requireAdminForSmtpTest();
  if (!allowed) {
    return { status: "error", message: "لا تملك صلاحية تنفيذ هذه العملية." };
  }
  if (!isSmtpConfigured()) {
    return {
      status: "warning",
      message:
        "إعدادات البريد غير مكتملة. أضف SMTP_HOST و SMTP_PORT و SMTP_USER و SMTP_PASS.",
    };
  }
  try {
    await verifyMailer();
    return {
      status: "success",
      message: "تم الاتصال بخادم البريد بنجاح. الإعدادات جاهزة.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof MailError
          ? error.message
          : "تعذّر التحقق من إعدادات البريد.",
    };
  }
}

/** Sends a diagnostic message to the given inbox to prove end-to-end delivery. */
export async function sendSmtpTestAction(
  _prev: SmtpTestState,
  formData: FormData,
): Promise<SmtpTestState> {
  void _prev;
  const allowed = await requireAdminForSmtpTest();
  if (!allowed) {
    return { status: "error", message: "لا تملك صلاحية تنفيذ هذه العملية." };
  }
  const parsed = testEmailSchema.safeParse({ to: formData.get("to") });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "بيانات غير صالحة.",
    };
  }
  try {
    await sendTestEmail(parsed.data.to);
    return {
      status: "success",
      message: `تم إرسال رسالة اختبار إلى ${parsed.data.to}. تحقّق من صندوق الوارد.`,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof MailError
          ? error.message
          : "تعذّر إرسال رسالة الاختبار.",
    };
  }
}
