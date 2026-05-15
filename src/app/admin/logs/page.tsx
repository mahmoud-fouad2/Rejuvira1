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

const LEVEL_LABELS: Record<AppLogLevel | "all", { ar: string; en: string }> = {
  all: { ar: "الكل", en: "All" },
  info: { ar: "معلومات", en: "Info" },
  warn: { ar: "تنبيه", en: "Warn" },
  error: { ar: "خطأ", en: "Error" },
  debug: { ar: "تشخيص", en: "Debug" },
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
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">السجلات</span>
            <span className="lang-en">Logs</span>
          </h1>
          <p>
            <span className="lang-ar">سجل التطبيق وأخطاء النظام.</span>
            <span className="lang-en">Application and error logs.</span>
          </p>
        </div>
      </div>

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">Filter</div>
            <div className="admin-card__title">
              <span className="lang-ar">فلترة السجل</span>
              <span className="lang-en">Filter logs</span>
            </div>
          </div>
        </div>
        <div className="admin-card__body">
          <form method="get" className="grid gap-3 sm:grid-cols-4">
            <label className="grid gap-1">
              <span className="admin-field-label">
                <span className="lang-ar">المستوى</span>
                <span className="lang-en">Level</span>
              </span>
              <select name="level" defaultValue={level} className="admin-input">
                {(Object.keys(LEVEL_LABELS) as Array<keyof typeof LEVEL_LABELS>).map((k) => (
                  <option key={k} value={k}>
                    {LEVEL_LABELS[k].ar} / {LEVEL_LABELS[k].en}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="admin-field-label">
                <span className="lang-ar">النوع</span>
                <span className="lang-en">Kind</span>
              </span>
              <input
                name="kind"
                defaultValue={kind === "all" ? "" : kind}
                placeholder="all / backup / media / ops / recaptcha"
                className="admin-input"
                dir="ltr"
              />
            </label>
            <label className="grid gap-1">
              <span className="admin-field-label">
                <span className="lang-ar">عدد الأسطر</span>
                <span className="lang-en">Page size</span>
              </span>
              <select name="size" defaultValue={String(size)} className="admin-input">
                {["25", "50", "100", "200"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button type="submit" className="admin-btn-primary w-full">
                <span className="lang-ar">تطبيق</span>
                <span className="lang-en">Apply</span>
              </button>
            </div>
          </form>
        </div>
      </article>

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">App log</div>
            <div className="admin-card__title">
              <span className="lang-ar">سجل التطبيق</span>
              <span className="lang-en">Application log</span>
            </div>
          </div>
          {appLogs.nextCursor ? (
            <Link
              href={
                `/admin/logs?${(() => {
                  const q = new URLSearchParams(baseQuery);
                  q.set("cursor", appLogs.nextCursor!);
                  return q.toString();
                })()}` as Route
              }
              className="admin-btn-secondary"
            >
              <span className="lang-ar">التالي</span>
              <span className="lang-en">Next</span>
            </Link>
          ) : null}
        </div>
        <div className="admin-data-list">
          {appLogs.items.length === 0 ? (
            <div className="admin-data-row">
              <span className="text-sm text-[color:var(--admin-text-faint)]">
                <span className="lang-ar">لا توجد قيود تطابق الفلتر.</span>
                <span className="lang-en">No entries match the filter.</span>
              </span>
            </div>
          ) : (
            appLogs.items.map((log) => (
              <div key={log.id} className="admin-data-row !block">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`admin-status-badge ${
                        log.level === "error"
                          ? "is-archived"
                          : log.level === "warn"
                            ? "is-draft"
                            : log.level === "debug"
                              ? "is-review"
                              : "is-published"
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="text-sm font-semibold text-[color:var(--admin-text)]">{log.kind}</span>
                  </div>
                  <span className="text-xs text-[color:var(--admin-text-faint)]">{log.createdAt}</span>
                </div>
                <p className="mt-2 text-sm text-[color:var(--admin-text-soft)]">{log.message}</p>
                {log.meta ? (
                  <pre className="mt-2 max-h-32 overflow-auto rounded-lg p-2 text-[11px] leading-5" style={{ background: "var(--admin-panel-soft)", color: "var(--admin-text-faint)" }}>
                    {JSON.stringify(log.meta, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))
          )}
        </div>
      </article>

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">Error log</div>
            <div className="admin-card__title">
              <span className="lang-ar">أخطاء النظام</span>
              <span className="lang-en">Error log</span>
            </div>
          </div>
        </div>
        <div className="admin-data-list">
          {errorLogs.length === 0 ? (
            <div className="admin-data-row">
              <span className="text-sm text-[color:var(--admin-text-faint)]">
                <span className="lang-ar">لا توجد أخطاء.</span>
                <span className="lang-en">No errors.</span>
              </span>
            </div>
          ) : (
            errorLogs.map((log) => (
              <div key={log.id} className="admin-data-row !block">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[color:var(--admin-text)]">
                    {log.route} <span className="text-[color:var(--admin-text-faint)]">HTTP {log.statusCode}</span>
                  </p>
                  <span className={`admin-status-badge ${log.isResolved ? "is-published" : "is-draft"}`}>
                    {log.isResolved ? (
                      <>
                        <span className="lang-ar">معالج</span>
                        <span className="lang-en">Resolved</span>
                      </>
                    ) : (
                      <>
                        <span className="lang-ar">مفتوح</span>
                        <span className="lang-en">Open</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[color:var(--admin-text-soft)]">{log.message}</p>
                <p className="mt-1 text-xs text-[color:var(--admin-text-faint)]">{log.createdAt}</p>
                <form action={toggleErrorLogResolutionAction} className="mt-2">
                  <input type="hidden" name="logId" value={log.id} />
                  <input type="hidden" name="nextValue" value={log.isResolved ? "false" : "true"} />
                  <button type="submit" className="admin-btn-secondary">
                    {log.isResolved ? (
                      <>
                        <span className="lang-ar">إعادة فتح</span>
                        <span className="lang-en">Reopen</span>
                      </>
                    ) : (
                      <>
                        <span className="lang-ar">تعليم كمعالج</span>
                        <span className="lang-en">Mark resolved</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </article>
    </>
  );
}
