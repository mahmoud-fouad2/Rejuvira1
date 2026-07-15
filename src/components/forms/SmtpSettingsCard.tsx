"use client";

import { useActionState, useState } from "react";

import {
  sendSmtpTestAction,
  verifySmtpAction,
  type SmtpTestState,
} from "@/app/admin/settings/smtp-actions";

type Preview = {
  configured: boolean;
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  from?: { name: string; email: string };
  missing?: string[];
};

const INITIAL: SmtpTestState = { status: "idle", message: "" };

/**
 * Admin-side SMTP health panel. Shows what the runtime currently sees
 * (never the password), lets the admin `verify()` the connection, and
 * lets them send a real diagnostic email — so a misconfigured mailer is
 * caught here instead of quietly at "invite patient" time.
 */
export function SmtpSettingsCard({ preview }: { preview: Preview }) {
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifySmtpAction,
    INITIAL,
  );
  const [testState, testAction, testPending] = useActionState(
    sendSmtpTestAction,
    INITIAL,
  );
  const [to, setTo] = useState(preview.user ?? "");

  const status = preview.configured ? "success" : "warning";

  return (
    <article className="admin-card">
      <div className="admin-card__header">
        <div>
          <div className="admin-card__subtitle">Email delivery</div>
          <div className="admin-card__title">
            <span className="lang-ar">إعدادات البريد (SMTP)</span>
            <span className="lang-en">SMTP settings</span>
          </div>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="admin-card__body space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="lang-ar">
            هذه القيم تُقرأ من متغيّرات البيئة (لن تظهر كلمة المرور أبدًا).
            استخدم Gmail App Password أو خدمة SMTP مخصّصة — كلمة مرور الحساب
            العادية مرفوضة من Gmail.
          </span>
          <span className="lang-en">
            Values are read from environment variables (the password is never
            shown). Use a Gmail App Password or a dedicated SMTP provider — Gmail
            rejects regular account passwords.
          </span>
        </p>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Field label="SMTP_HOST" value={preview.host} />
          <Field label="SMTP_PORT" value={preview.port?.toString()} />
          <Field
            label="SMTP_SECURE"
            value={preview.secure == null ? undefined : preview.secure ? "true" : "false"}
          />
          <Field label="SMTP_USER" value={preview.user} />
          <Field
            label="MAIL_FROM"
            value={
              preview.from
                ? `${preview.from.name} <${preview.from.email}>`
                : undefined
            }
          />
        </dl>

        {!preview.configured && preview.missing?.length ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <span className="lang-ar">
              متغيّرات ناقصة: {preview.missing.join("، ")}. أضفها في ملف .env
              وأعد تشغيل الخادم.
            </span>
            <span className="lang-en">
              Missing variables: {preview.missing.join(", ")}. Add them to .env
              and restart the server.
            </span>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">
              <span className="lang-ar">أرسل رسالة اختبار إلى</span>
              <span className="lang-en">Send test email to</span>
            </span>
            <form action={testAction} className="flex gap-2">
              <input
                type="email"
                name="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                dir="ltr"
                required
                placeholder="you@example.com"
                className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
              />
              <button
                type="submit"
                disabled={testPending || !preview.configured}
                className="admin-btn-secondary whitespace-nowrap"
              >
                {testPending ? (
                  <span className="lang-ar">جارٍ الإرسال…</span>
                ) : (
                  <>
                    <span className="lang-ar">اختبار الإرسال</span>
                    <span className="lang-en">Send test</span>
                  </>
                )}
              </button>
            </form>
          </label>
          <form action={verifyAction} className="flex items-end">
            <button
              type="submit"
              disabled={verifyPending}
              className="admin-btn-primary whitespace-nowrap"
            >
              {verifyPending ? (
                <span className="lang-ar">جارٍ التحقّق…</span>
              ) : (
                <>
                  <span className="lang-ar">التحقّق من الاتصال</span>
                  <span className="lang-en">Verify connection</span>
                </>
              )}
            </button>
          </form>
        </div>

        <FeedbackBanner state={verifyState} />
        <FeedbackBanner state={testState} />
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value?: string | undefined }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        dir="ltr"
        className={`mt-1 truncate text-sm ${
          value ? "text-foreground" : "text-muted-foreground/60 italic"
        }`}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

function StatusPill({ status }: { status: "success" | "warning" }) {
  const isOk = status === "success";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        isOk
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-900"
      }`}
    >
      <span
        className={`size-2 rounded-full ${isOk ? "bg-emerald-500" : "bg-amber-500"}`}
      />
      {isOk ? (
        <>
          <span className="lang-ar">مهيّأ</span>
          <span className="lang-en">Configured</span>
        </>
      ) : (
        <>
          <span className="lang-ar">غير مكتمل</span>
          <span className="lang-en">Incomplete</span>
        </>
      )}
    </span>
  );
}

function FeedbackBanner({ state }: { state: SmtpTestState }) {
  if (state.status === "idle") return null;
  const tone =
    state.status === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : state.status === "warning"
        ? "border-amber-300 bg-amber-50 text-amber-900"
        : "border-red-300 bg-red-50 text-red-900";
  return (
    <div className={`rounded-lg border p-3 text-sm ${tone}`}>{state.message}</div>
  );
}
