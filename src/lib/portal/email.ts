import nodemailer from "nodemailer";

type ActivationEmailInput = {
  to: string;
  patientName: string;
  activationUrl: string;
  otp: string;
  expiresAt: Date;
};

function smtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const port = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);
  if (!host || !user || !pass || !Number.isFinite(port)) {
    return null;
  }
  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    from: process.env.SMTP_FROM?.trim() || user,
  };
}

export function isSmtpConfigured() {
  return Boolean(smtpConfig());
}

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

export async function sendActivationEmail(input: ActivationEmailInput) {
  const config = smtpConfig();
  if (!config) {
    throw new Error("SMTP_NOT_CONFIGURED");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  const safeName = escapeHtml(input.patientName);
  const safeUrl = escapeHtml(input.activationUrl);
  const safeOtp = escapeHtml(input.otp);
  const expiry = escapeHtml(formatExpiry(input.expiresAt));

  await transporter.sendMail({
    from: `"Rejuvera Center" <${config.from}>`,
    to: input.to,
    subject: "تفعيل حساب بوابة مرضى Rejuvera",
    text: [
      `مرحبًا ${input.patientName}`,
      "لتفعيل حسابك في بوابة مرضى Rejuvera افتح الرابط التالي:",
      input.activationUrl,
      `رمز التحقق: ${input.otp}`,
      `تنتهي صلاحية الرابط في: ${formatExpiry(input.expiresAt)}`,
      "لا تشارك هذا الرابط أو رمز التحقق مع أي شخص.",
    ].join("\n\n"),
    html: `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;background:#f5f1eb;font-family:Tahoma,Arial,sans-serif;color:#25143f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f1eb;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e4d8ef;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:#2b1047;color:#fff;padding:24px 28px;text-align:right;">
                <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#d7bb7f;">REJUVERA CENTER</div>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.4;">تفعيل حساب بوابة المرضى</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 14px;font-size:16px;line-height:1.8;">مرحبًا ${safeName}،</p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.9;color:#5f536f;">تم تجهيز رابط تفعيل حسابك في بوابة مرضى Rejuvera. افتح الرابط واختر كلمة مرور خاصة بك.</p>
                <p style="margin:0 0 22px;text-align:center;">
                  <a href="${safeUrl}" style="display:inline-block;background:#6f3aa4;color:#fff;text-decoration:none;border-radius:999px;padding:13px 24px;font-weight:700;">تفعيل حسابي</a>
                </p>
                <div style="border:1px solid #eadff3;background:#faf7fc;border-radius:14px;padding:16px;margin:0 0 18px;">
                  <div style="font-size:12px;color:#7a6d89;margin-bottom:6px;">رمز التحقق</div>
                  <div dir="ltr" style="font-size:28px;letter-spacing:.28em;font-weight:800;color:#2b1047;text-align:center;">${safeOtp}</div>
                </div>
                <p style="margin:0 0 10px;font-size:13px;line-height:1.8;color:#7a6d89;">تنتهي صلاحية الرابط في ${expiry} بتوقيت الرياض.</p>
                <p style="margin:0;font-size:13px;line-height:1.8;color:#7a6d89;">لا تشارك الرابط أو رمز التحقق مع أي شخص. فريق Rejuvera لن يطلب منك كلمة المرور.</p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #eee5f5;padding:16px 28px;color:#8a7b99;font-size:12px;text-align:center;">
                Rejuvera Center · rejuvera.sa
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  });
}
