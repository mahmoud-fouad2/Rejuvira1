import nodemailer, { type Transporter } from "nodemailer";

/**
 * Portal transactional mailer.
 *
 * The old build tripped on Gmail's `535-5.7.8 Username and Password not
 * accepted` — that's Gmail rejecting a plain account password. Gmail requires
 * either an OAuth flow or (much simpler) a 16-character **App Password**.
 * This module now:
 *
 *  - names env vars clearly (`SMTP_HOST/PORT/SECURE/USER/PASS`, `MAIL_FROM_*`);
 *  - infers `secure=true` when port 465 (still overridable via `SMTP_SECURE`);
 *  - exposes `verifyMailer()` so the admin can test the connection *before*
 *    hitting a live patient;
 *  - never leaks the raw SMTP password into logs, audit rows, or UI messages;
 *  - throws typed `MailError`s so callers can distinguish "not configured"
 *    from "provider rejected credentials" and show the right message.
 */

const APP_NAME = "Rejuvera Center";

export type MailErrorCode =
  | "NOT_CONFIGURED"
  | "AUTH_REJECTED"
  | "CONNECTION_FAILED"
  | "SEND_FAILED";

export class MailError extends Error {
  code: MailErrorCode;
  constructor(code: MailErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: { name: string; email: string };
};

/** Reads SMTP settings from the environment. Returns null when incomplete. */
export function smtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const port = Number.parseInt(portRaw ?? "587", 10);
  if (!host || !user || !pass || !Number.isFinite(port)) return null;

  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure =
    secureEnv === "true" || secureEnv === "1"
      ? true
      : secureEnv === "false" || secureEnv === "0"
        ? false
        : port === 465;

  const fromEmail = (
    process.env.MAIL_FROM_EMAIL?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    user
  ).trim();
  const fromName = process.env.MAIL_FROM_NAME?.trim() || APP_NAME;

  return { host, port, secure, user, pass, from: { name: fromName, email: fromEmail } };
}

export function isSmtpConfigured(): boolean {
  return smtpConfig() !== null;
}

/**
 * Returns the config *without* the password — safe to hand to server
 * components rendering the admin's SMTP settings widget.
 */
export function smtpConfigPreview(): {
  configured: boolean;
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  from?: { name: string; email: string };
  missing?: string[];
} {
  const missing: string[] = [];
  if (!process.env.SMTP_HOST?.trim()) missing.push("SMTP_HOST");
  if (!process.env.SMTP_USER?.trim()) missing.push("SMTP_USER");
  if (!process.env.SMTP_PASS?.trim()) missing.push("SMTP_PASS");
  const config = smtpConfig();
  if (!config) return { configured: false, missing };
  return {
    configured: true,
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.user,
    from: config.from,
  };
}

function buildTransport(config: SmtpConfig): Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    // A short timeout keeps a misconfigured mailer from stalling the request
    // for a whole minute while the admin waits on "add patient".
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

function mapNodemailerError(error: unknown): MailError {
  if (typeof error === "object" && error !== null) {
    const err = error as { code?: string; responseCode?: number; message?: string };
    // Gmail's 535 lands as EAUTH; Zoho/Outlook use similar codes.
    if (err.code === "EAUTH" || err.responseCode === 535) {
      return new MailError(
        "AUTH_REJECTED",
        "رفض مزوّد البريد بيانات الدخول. تأكّد من استخدام كلمة مرور تطبيق (App Password) وليس كلمة مرور الحساب.",
      );
    }
    if (
      err.code === "ETIMEDOUT" ||
      err.code === "ECONNECTION" ||
      err.code === "ESOCKET" ||
      err.code === "EDNS"
    ) {
      return new MailError(
        "CONNECTION_FAILED",
        "تعذّر الاتصال بخادم البريد. تحقّق من الاسم/المنفذ ومن اتصال الخادم بالإنترنت.",
      );
    }
  }
  return new MailError("SEND_FAILED", "فشل إرسال البريد. حاول لاحقًا.");
}

/**
 * Opens a live connection to the SMTP host and authenticates. Used by the
 * admin's "test send" button so misconfiguration surfaces once — not on
 * every patient the staff tries to invite.
 */
export async function verifyMailer(): Promise<void> {
  const config = smtpConfig();
  if (!config) {
    throw new MailError(
      "NOT_CONFIGURED",
      "إعدادات البريد غير مكتملة. أضف SMTP_HOST و SMTP_PORT و SMTP_USER و SMTP_PASS.",
    );
  }
  const transport = buildTransport(config);
  try {
    await transport.verify();
  } catch (error) {
    throw mapNodemailerError(error);
  } finally {
    transport.close();
  }
}

/**
 * Sends a plain diagnostic message to the given address. Never fabricates
 * success — a rejected auth or timeout throws a typed MailError.
 */
export async function sendTestEmail(to: string): Promise<void> {
  const config = smtpConfig();
  if (!config) {
    throw new MailError(
      "NOT_CONFIGURED",
      "إعدادات البريد غير مكتملة.",
    );
  }
  const transport = buildTransport(config);
  try {
    await transport.sendMail({
      from: formatFrom(config),
      to,
      subject: "اختبار إعدادات البريد — Rejuvera",
      text: [
        "هذه رسالة اختبار من لوحة إدارة Rejuvera Center.",
        "وصولها يعني أن إعدادات SMTP سليمة وأن رسائل التفعيل ستُرسَل للمرضى.",
      ].join("\n\n"),
    });
  } catch (error) {
    throw mapNodemailerError(error);
  } finally {
    transport.close();
  }
}

type ActivationEmailInput = {
  to: string;
  patientName: string;
  activationUrl: string;
  otp: string;
  expiresAt: Date;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatExpiry(date: Date) {
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Riyadh",
  }).format(date);
}

function formatFrom(config: SmtpConfig): string {
  const name = config.from.name.replace(/["\\]/g, "");
  return `"${name}" <${config.from.email}>`;
}

export async function sendActivationEmail(input: ActivationEmailInput): Promise<void> {
  const config = smtpConfig();
  if (!config) {
    throw new MailError("NOT_CONFIGURED", "إعدادات البريد غير مكتملة.");
  }

  const safeName = escapeHtml(input.patientName);
  const safeUrl = escapeHtml(input.activationUrl);
  const safeOtp = escapeHtml(input.otp);
  const expiry = escapeHtml(formatExpiry(input.expiresAt));

  const transport = buildTransport(config);
  try {
    await transport.sendMail({
      from: formatFrom(config),
      to: input.to,
      subject: "تفعيل حساب بوابة مرضى Rejuvera",
      text: [
        `مرحبًا ${input.patientName}`,
        "تم تجهيز حسابك في بوابة مرضى Rejuvera. افتح الرابط التالي لاختيار كلمة مرور خاصة بك:",
        input.activationUrl,
        `رمز التحقق: ${input.otp}`,
        `تنتهي صلاحية الرابط في: ${formatExpiry(input.expiresAt)} بتوقيت الرياض.`,
        "لا تشارك الرابط أو رمز التحقق مع أي شخص. فريق Rejuvera لن يطلب منك كلمة المرور.",
      ].join("\n\n"),
      html: activationHtml({ safeName, safeUrl, safeOtp, expiry }),
    });
  } catch (error) {
    throw mapNodemailerError(error);
  } finally {
    transport.close();
  }
}

function activationHtml(v: {
  safeName: string;
  safeUrl: string;
  safeOtp: string;
  expiry: string;
}): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>تفعيل حساب بوابة مرضى Rejuvera</title>
  </head>
  <body style="margin:0;background:#f5f1eb;font-family:Tahoma,Arial,sans-serif;color:#25143f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f1eb;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e4d8ef;border-radius:20px;overflow:hidden;box-shadow:0 24px 60px -32px rgba(43,16,71,.35);">
            <tr>
              <td style="background:linear-gradient(135deg,#2b1047 0%,#4a1d96 100%);color:#fff;padding:28px 32px;text-align:right;">
                <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#d7bb7f;font-weight:700;">REJUVERA CENTER</div>
                <h1 style="margin:10px 0 0;font-size:24px;line-height:1.4;font-weight:800;">تفعيل حساب بوابة المرضى</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 14px;font-size:16px;line-height:1.9;">مرحبًا ${v.safeName}،</p>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.9;color:#5f536f;">تم تجهيز رابط تفعيل حسابك في بوابة مرضى Rejuvera. افتح الرابط واختر كلمة مرور خاصة بك للوصول إلى تعليماتك ومواعيدك ورسائل مركزك.</p>
                <p style="margin:0 0 24px;text-align:center;">
                  <a href="${v.safeUrl}" style="display:inline-block;background:#6f3aa4;color:#fff;text-decoration:none;border-radius:999px;padding:14px 32px;font-weight:700;font-size:15px;">تفعيل حسابي</a>
                </p>
                <div style="border:1px solid #eadff3;background:#faf7fc;border-radius:14px;padding:18px;margin:0 0 20px;">
                  <div style="font-size:12px;color:#7a6d89;margin-bottom:8px;text-align:center;">رمز التحقق</div>
                  <div dir="ltr" style="font-size:30px;letter-spacing:.32em;font-weight:800;color:#2b1047;text-align:center;">${v.safeOtp}</div>
                </div>
                <p style="margin:0 0 10px;font-size:13px;line-height:1.8;color:#7a6d89;">تنتهي صلاحية الرابط في ${v.expiry} بتوقيت الرياض.</p>
                <p style="margin:0;font-size:13px;line-height:1.8;color:#7a6d89;">لا تشارك الرابط أو رمز التحقق مع أي شخص. فريق Rejuvera لن يطلب منك كلمة المرور.</p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #eee5f5;padding:18px 32px;color:#8a7b99;font-size:12px;text-align:center;background:#fbf9fd;">
                Rejuvera Center · rejuvera.sa · إذا لم تطلب هذا التفعيل تجاهل الرسالة بأمان.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
