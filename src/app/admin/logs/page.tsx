import Link from "next/link";
import type { Route } from "next";

import { toggleErrorLogResolutionAction } from "@/app/admin/logs/actions";
import { listAppLogs, type AppLogLevel } from "@/lib/app-log";
import { getErrorLogs } from "@/lib/content-repository";

type SearchParams = Promise<{
  level?: string;
  kind?: string;
  cursor?: string;
  size?: string;
}>;

const LEVEL_LABELS: Record<AppLogLevel | "all", string> = {
  all: "كل المستويات",
  info: "معلومات",
  warn: "تنبيه",
  error: "خطأ",
  debug: "تشخيص",
};

export default async function AdminLogsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const level = (searchParams.level as AppLogLevel | "all" | undefined) ?? "all";
  const kind = searchParams.kind ?? "all";
  const cursor = searchParams.cursor;
  const size = Math.min(Math.max(Number(searchParams.size ?? 50), 10), 200);

  const [errorLogs, appLogs] = await Promise.all([
    getErrorLogs(),
    listAppLogs({
      ...(level !== "all" ? { level: level as AppLogLevel } : {}),
      ...(kind !== "all" ? { kind } : {}),
      ...(cursor ? { cursor } : {}),
      limit: size,
    }),
  ]);

  const baseQuery = new URLSearchParams();
  if (level !== "all") baseQuery.set("level", level);
  if (kind !== "all") baseQuery.set("kind", kind);
  baseQuery.set("size", String(size));

  return (
    <>
      <section className="surface-panel rounded-[2rem] p-6 lg:p-8">
        <p className="eyebrow">السجلات والمراقبة</p>
        <h1 className="text-ink mt-4 font-serif text-5xl tracking-[-0.05em]">
          سجل الأحداث التشغيلي
        </h1>
        <p className="text-ink-soft mt-4 max-w-3xl text-base leading-8">
          تجمع هذه الصفحة بين سجل الأخطاء الكلاسيكي وسجل التطبيق الجديد الذي
          يلتقط لحظات النسخ الاحتياطي، تفعيل الصيانة، رفع الميديا، والتحقّق
          من reCAPTCHA.
        </p>
      </section>

      <section className="surface-panel rounded-[1.85rem] p-5">
        <p className="text-ink-faint text-[10px] font-semibold uppercase tracking-[0.22em]">
          فلترة سجل التطبيق
        </p>
        <form
          method="get"
          className="mt-4 flex flex-wrap items-center gap-3 text-sm"
        >
          <label className="grid gap-1">
            <span className="text-ink-soft text-xs">المستوى</span>
            <select
              name="level"
              defaultValue={level}
              className="border-line bg-surface text-ink rounded-full border px-3 py-1.5 text-xs"
            >
              {(Object.keys(LEVEL_LABELS) as Array<keyof typeof LEVEL_LABELS>).map(
                (k) => (
                  <option key={k} value={k}>
                    {LEVEL_LABELS[k]}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-ink-soft text-xs">النوع</span>
            <input
              name="kind"
              defaultValue={kind === "all" ? "" : kind}
              placeholder="all / backup / media / ops / recaptcha"
              className="border-line bg-surface text-ink rounded-full border px-3 py-1.5 text-xs"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-ink-soft text-xs">عدد الأسطر</span>
            <select
              name="size"
              defaultValue={String(size)}
              className="border-line bg-surface text-ink rounded-full border px-3 py-1.5 text-xs"
            >
              {["25", "50", "100", "200"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="bg-ink text-canvas mt-4 self-end rounded-full px-4 py-1.5 text-xs font-semibold"
          >
            تطبيق الفلتر
          </button>
        </form>
      </section>

      <section className="grid gap-4">
        {appLogs.items.length === 0 ? (
          <article className="surface-panel rounded-[1.85rem] p-5 text-sm text-ink-soft">
            لا توجد قيود تطابق الفلتر الحالي. ستبدأ العمليات الإدارية تسجيل
            أحداثها هنا تلقائيًا.
          </article>
        ) : (
          appLogs.items.map((log) => (
            <article
              key={log.id}
              className="surface-panel rounded-[1.5rem] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                      log.level === "error"
                        ? "bg-burgundy/10 text-burgundy"
                        : log.level === "warn"
                          ? "bg-amber-500/10 text-amber-700"
                          : log.level === "debug"
                            ? "bg-purple-mid/10 text-purple-mid"
                            : "bg-emerald/10 text-emerald"
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-ink text-sm font-semibold">{log.kind}</span>
                </div>
                <span className="text-ink-faint text-xs">{log.createdAt}</span>
              </div>
              <p className="text-ink-soft mt-3 text-sm leading-7">
                {log.message}
              </p>
              {log.meta ? (
                <pre className="text-ink-faint mt-3 max-h-32 overflow-auto rounded-xl bg-surface-strong px-3 py-2 text-[11px] leading-5">
                  {JSON.stringify(log.meta, null, 2)}
                </pre>
              ) : null}
            </article>
          ))
        )}
        {appLogs.nextCursor ? (
          <Link
            href={
              `/admin/logs?${(() => {
                const q = new URLSearchParams(baseQuery);
                q.set("cursor", appLogs.nextCursor!);
                return q.toString();
              })()}` as Route
            }
            className="border-line bg-surface text-ink mx-auto mt-2 inline-flex rounded-full border px-5 py-2 text-xs font-semibold"
          >
            عرض الصفحة التالية
          </Link>
        ) : null}
      </section>

      <section className="grid gap-4">
        <div className="surface-panel rounded-[1.85rem] p-5">
          <p className="text-ink-faint text-[10px] font-semibold uppercase tracking-[0.22em]">
            أخطاء النظام التقليدية
          </p>
          <h2 className="text-ink mt-2 text-xl font-semibold">
            سجل الأخطاء الكلاسيكي
          </h2>
          <p className="text-ink-soft mt-2 text-sm leading-7">
            تظهر هنا أخطاء الاتصال والمسارات الفنية المسجّلة في جدول
            <code className="text-ink mx-1 rounded-md bg-surface-strong px-1.5 py-0.5 text-xs">ErrorLog</code>.
          </p>
        </div>
        {errorLogs.map((log) => (
          <article key={log.id} className="surface-panel rounded-[1.85rem] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-ink text-lg font-semibold">{log.route}</p>
                <p className="text-ink-soft mt-1 text-sm">
                  HTTP {log.statusCode}
                </p>
              </div>
              <span className="border-line bg-surface text-ink-soft rounded-full border px-3 py-1 text-xs">
                {log.isResolved ? "معالج" : "مفتوح"}
              </span>
            </div>
            <p className="text-ink-soft mt-4 text-sm leading-7">
              {log.message}
            </p>
            <p className="text-ink-faint mt-2 text-xs">{log.createdAt}</p>
            <form action={toggleErrorLogResolutionAction} className="mt-4">
              <input type="hidden" name="logId" value={log.id} />
              <input
                type="hidden"
                name="nextValue"
                value={log.isResolved ? "false" : "true"}
              />
              <button
                type="submit"
                className="border-line bg-surface text-ink rounded-full border px-4 py-2 text-xs font-semibold"
              >
                {log.isResolved ? "إعادة فتح السجل" : "تعليم كمعالج"}
              </button>
            </form>
          </article>
        ))}
      </section>
    </>
  );
}
