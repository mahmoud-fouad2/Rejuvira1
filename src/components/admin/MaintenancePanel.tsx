"use client";

import { useState, useTransition } from "react";

import {
  checkConnectionsAction,
  exportCrmCsvAction,
  revalidatePublicAction,
  setMaintenanceModeAction,
  triggerBackupAction,
  type MaintenanceActionState,
} from "@/app/admin/maintenance/actions";

const IDLE: MaintenanceActionState = { status: "idle", message: "" };

type ConnectionResult = {
  database: { ok: boolean; detail?: string };
  r2: { ok: boolean; detail?: string };
  recaptcha: { ok: boolean; detail?: string };
};

export function MaintenancePanel({
  initialMaintenance,
}: {
  initialMaintenance: boolean;
}) {
  const [backupState, setBackupState] = useState<MaintenanceActionState>(IDLE);
  const [csvState, setCsvState] = useState<MaintenanceActionState>(IDLE);
  const [connState, setConnState] = useState<MaintenanceActionState>(IDLE);
  const [revalState, setRevalState] = useState<MaintenanceActionState>(IDLE);
  const [maintState, setMaintState] = useState<MaintenanceActionState>(IDLE);
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [pending, startTransition] = useTransition();

  const handleBackup = () =>
    startTransition(async () => {
      const result = await triggerBackupAction(IDLE, new FormData());
      setBackupState(result);
    });

  const handleCsv = () =>
    startTransition(async () => {
      const result = await exportCrmCsvAction();
      setCsvState(result);
      const meta = result.meta as { filename?: string; csv?: string } | undefined;
      if (result.status === "success" && meta?.csv) {
        const blob = new Blob([meta.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = meta.filename ?? "export.csv";
        link.click();
        URL.revokeObjectURL(url);
      }
    });

  const handleConnections = () =>
    startTransition(async () => {
      const result = await checkConnectionsAction();
      setConnState(result);
    });

  const handleReval = () =>
    startTransition(async () => {
      const result = await revalidatePublicAction();
      setRevalState(result);
    });

  const handleMaintenance = (next: boolean) =>
    startTransition(async () => {
      const formData = new FormData();
      if (next) formData.set("maintenanceMode", "on");
      const result = await setMaintenanceModeAction(IDLE, formData);
      setMaintState(result);
      if (result.status === "success") setMaintenance(next);
    });

  const conn = connState.meta as ConnectionResult | undefined;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <article className="surface-panel rounded-[1.85rem] p-6">
        <p className="text-ink-faint text-[10px] font-medium uppercase tracking-[0.22em]">
          النسخ الاحتياطي
        </p>
        <h2 className="text-ink-strong mt-2 text-xl font-semibold tracking-tight">
          نسخة احتياطية فورية
        </h2>
        <p className="text-ink-soft mt-2 text-sm leading-7">
          تصدير محتوى الجداول الأساسية (الإعدادات، الأطباء، الخدمات، الأجهزة،
          المعرض، المجلة) كملف JSON يُرفع إلى Cloudflare R2 ضمن مسار
          <code className="text-ink ms-1 rounded-md bg-surface-strong px-1.5 py-0.5 text-xs">backups/yyyy/mm/...</code>
          .
        </p>
        <button
          type="button"
          onClick={handleBackup}
          disabled={pending}
          className="bg-ink text-canvas mt-5 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {pending ? "جاري الإنشاء..." : "نسخة احتياطية الآن"}
        </button>
        {backupState.message ? (
          <p
            className={`mt-4 text-sm ${
              backupState.status === "success" ? "text-emerald" : "text-burgundy"
            }`}
          >
            {backupState.message}
          </p>
        ) : null}
      </article>

      <article className="surface-panel rounded-[1.85rem] p-6">
        <p className="text-ink-faint text-[10px] font-medium uppercase tracking-[0.22em]">
          التصدير
        </p>
        <h2 className="text-ink-strong mt-2 text-xl font-semibold tracking-tight">
          تصدير الطلبات إلى CSV
        </h2>
        <p className="text-ink-soft mt-2 text-sm leading-7">
          تنزيل جميع طلبات التواصل (CRM) ضمن ملف يمكن فتحه في Excel أو Sheets.
        </p>
        <button
          type="button"
          onClick={handleCsv}
          disabled={pending}
          className="border-line bg-surface text-ink mt-5 rounded-full border px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {pending ? "جاري التحضير..." : "تصدير CSV"}
        </button>
        {csvState.message ? (
          <p
            className={`mt-4 text-sm ${
              csvState.status === "success" ? "text-emerald" : "text-burgundy"
            }`}
          >
            {csvState.message}
          </p>
        ) : null}
      </article>

      <article className="surface-panel rounded-[1.85rem] p-6">
        <p className="text-ink-faint text-[10px] font-medium uppercase tracking-[0.22em]">
          فحص النظام
        </p>
        <h2 className="text-ink-strong mt-2 text-xl font-semibold tracking-tight">
          اختبار الاتصال (DB / R2 / reCAPTCHA)
        </h2>
        <p className="text-ink-soft mt-2 text-sm leading-7">
          تنفيذ فحص خفيف على الاتصال بقاعدة البيانات وتخزين R2 وتفعيل reCAPTCHA.
        </p>
        <button
          type="button"
          onClick={handleConnections}
          disabled={pending}
          className="border-line bg-surface text-ink mt-5 rounded-full border px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {pending ? "جاري الفحص..." : "اختبار الاتصال"}
        </button>
        {conn ? (
          <div className="mt-4 grid gap-2 text-xs">
            {(["database", "r2", "recaptcha"] as const).map((key) => {
              const value = conn[key];
              return (
                <div
                  key={key}
                  className="border-line flex items-center justify-between gap-3 rounded-xl border bg-surface px-3 py-2"
                >
                  <span className="text-ink-soft font-medium">{key}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-semibold ${
                      value.ok
                        ? "bg-emerald/10 text-emerald"
                        : "bg-burgundy/10 text-burgundy"
                    }`}
                  >
                    {value.ok ? "OK" : "ERR"}
                  </span>
                  <span className="text-ink-faint truncate text-[10px]">
                    {value.detail ?? ""}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </article>

      <article className="surface-panel rounded-[1.85rem] p-6">
        <p className="text-ink-faint text-[10px] font-medium uppercase tracking-[0.22em]">
          إدارة الواجهة العامة
        </p>
        <h2 className="text-ink-strong mt-2 text-xl font-semibold tracking-tight">
          تحديث وذاكرة المؤقت
        </h2>
        <p className="text-ink-soft mt-2 text-sm leading-7">
          إصدار أمر تحديث (revalidate) للصفحات الرئيسية. مفيد بعد رفع أصول جديدة
          أو تعديل الإعدادات.
        </p>
        <button
          type="button"
          onClick={handleReval}
          disabled={pending}
          className="border-line bg-surface text-ink mt-5 rounded-full border px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {pending ? "جاري التحديث..." : "تحديث الواجهات"}
        </button>
        {revalState.message ? (
          <p
            className={`mt-4 text-sm ${
              revalState.status === "success" ? "text-emerald" : "text-burgundy"
            }`}
          >
            {revalState.message}
          </p>
        ) : null}
      </article>

      <article className="surface-panel rounded-[1.85rem] p-6 xl:col-span-2">
        <p className="text-ink-faint text-[10px] font-medium uppercase tracking-[0.22em]">
          وضع الصيانة
        </p>
        <h2 className="text-ink-strong mt-2 text-xl font-semibold tracking-tight">
          {maintenance
            ? "وضع الصيانة مفعّل — الواجهة العامة معطّلة مؤقتًا"
            : "الموقع يعمل بصورة طبيعية"}
        </h2>
        <p className="text-ink-soft mt-2 text-sm leading-7">
          عند التفعيل، يظهر إشعار صيانة هادئ للزوار. لوحة الإدارة و
          <code className="text-ink mx-1 rounded-md bg-surface-strong px-1.5 py-0.5 text-xs">/api/health</code>
          تبقيان متاحتين.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleMaintenance(!maintenance)}
            disabled={pending}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
              maintenance
                ? "bg-burgundy text-canvas"
                : "bg-emerald text-canvas"
            }`}
          >
            {pending
              ? "جاري التحديث..."
              : maintenance
                ? "إيقاف وضع الصيانة"
                : "تفعيل وضع الصيانة"}
          </button>
        </div>
        {maintState.message ? (
          <p
            className={`mt-4 text-sm ${
              maintState.status === "success" ? "text-emerald" : "text-burgundy"
            }`}
          >
            {maintState.message}
          </p>
        ) : null}
      </article>
    </div>
  );
}
