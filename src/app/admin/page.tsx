import Link from "next/link";
import type { Route } from "next";

import { auth } from "@/auth";
import { listAppLogs } from "@/lib/app-log";
import { runConnectionChecks } from "@/lib/backup";
import { getDashboardSnapshot } from "@/lib/content-repository";
import { adminModules, heroMetrics } from "@/lib/site-content";

const readinessCards = [
  { label: "المحتوى", value: "الأطباء، الخدمات، الأجهزة، المجلة" },
  { label: "الصور", value: "الميديا والمعرض وصور الصفحات" },
  { label: "التشغيل", value: "CRM، السجلات، الصيانة، المستخدمون" },
] as const;

const pipelineStages = ["جديد", "تم التواصل", "متابعة", "محجوز", "مغلق"] as const;

export default async function AdminPage() {
  const session = await auth();
  const [snapshot, checks] = await Promise.all([
    getDashboardSnapshot(),
    runConnectionChecks(),
  ]);
  const analytics = await listAppLogs({ kind: "analytics.pageview", limit: 200 });
  const pageCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  analytics.items.forEach((item) => {
    const path = typeof item.meta?.path === "string" ? item.meta.path : "/";
    const referrer = typeof item.meta?.referrer === "string" && item.meta.referrer
      ? item.meta.referrer
      : "Direct";
    pageCounts.set(path, (pageCounts.get(path) ?? 0) + 1);
    referrerCounts.set(referrer, (referrerCounts.get(referrer) ?? 0) + 1);
  });
  const topPages = Array.from(pageCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topReferrers = Array.from(referrerCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const healthPills = [
    { key: "DB", state: checks.database.ok, detail: checks.database.detail },
    { key: "R2", state: checks.r2.ok, detail: checks.r2.detail },
    { key: "reCAPTCHA", state: checks.recaptcha.ok, detail: checks.recaptcha.detail },
  ];

  return (
    <>
      <section className="admin-dashboard-hero surface-panel relative overflow-hidden rounded-[1.5rem] p-5 shadow-sm lg:p-7">
        <div className="pointer-events-none absolute -start-32 top-0 h-72 w-72 rounded-full bg-accent/12 blur-3xl" />
        <div className="pointer-events-none absolute -end-24 bottom-0 h-64 w-64 rounded-full bg-purple-mid/10 blur-3xl" />

        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="admin-status-pill">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                جلسة نشطة
              </span>
              <span className="admin-status-pill">
                {session?.user?.name ?? session?.user?.email ?? "Super Admin"}
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.12] tracking-tight text-ink-strong sm:text-4xl lg:text-5xl">
              لوحة تشغيل واضحة للمحتوى والطلبات والصور
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
              ابدأ من الطلبات، أو حدّث محتوى الموقع، أو ارفع الصور من الميديا بدون البحث داخل صفحات طويلة.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {healthPills.map((pill) => (
                <span
                  key={pill.key}
                  title={pill.detail ?? ""}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                    pill.state
                      ? "border-emerald/25 bg-emerald/10 text-emerald"
                      : "border-burgundy/25 bg-burgundy/10 text-burgundy"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${pill.state ? "bg-emerald" : "bg-burgundy"}`} />
                  {pill.key}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="admin-mini-module">
                <span className="text-lg font-semibold text-ink-strong">{metric.value}</span>
                <span className="text-xs text-ink-soft">{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            { label: "الأطباء", value: snapshot.doctorCount, href: "/admin/doctors" },
            { label: "الخدمات", value: snapshot.serviceCount, href: "/admin/services" },
            { label: "الطلبات", value: snapshot.leadCount, href: "/admin/crm" },
            { label: "الأجهزة", value: snapshot.deviceCount, href: "/admin/devices" },
          ] as const
        ).map((row) => (
          <Link key={row.label} href={row.href as Route} className="admin-stat-card">
            <span className="text-sm font-medium text-ink-soft">{row.label}</span>
            <strong className="mt-2 block text-4xl font-semibold tabular-nums text-ink-strong">
              {row.value}
            </strong>
            <span className="mt-3 inline-flex text-xs font-semibold text-accent">
              إدارة القسم ←
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <article className="surface-panel rounded-[1.5rem] p-5 shadow-sm lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">CRM Pipeline</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink-strong">
                مسار الطلبات
              </h2>
            </div>
            <Link href={"/admin/crm" as Route} className="admin-link-pill">
              فتح CRM
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {pipelineStages.map((stage, index) => (
              <div key={stage} className="admin-pipeline-step">
                <span className="text-[10px] font-semibold text-ink-faint">0{index + 1}</span>
                <span className="mt-2 block text-sm font-semibold text-ink-strong">{stage}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-panel rounded-[1.5rem] p-5 shadow-sm lg:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">
            Work Areas
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink-strong">
            مناطق العمل
          </h2>
          <div className="mt-5 grid gap-3">
            {readinessCards.map((card) => (
              <div key={card.label} className="admin-compact-row">
                <span className="text-sm font-semibold text-ink-strong">{card.label}</span>
                <span className="text-xs text-ink-soft">{card.value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="surface-panel rounded-[1.5rem] p-5 shadow-sm lg:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">Analytics</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink-strong">الصفحات الأكثر زيارة</h2>
          <div className="mt-5 grid gap-3">
            {(topPages.length > 0 ? topPages : [["لا توجد بيانات بعد", 0] as const]).map(([path, count]) => (
              <div key={path} className="admin-compact-row">
                <span className="truncate text-sm font-semibold text-ink-strong" dir="ltr">{path}</span>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-ink">{count}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="surface-panel rounded-[1.5rem] p-5 shadow-sm lg:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">Sources</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink-strong">مصادر الزيارات</h2>
          <div className="mt-5 grid gap-3">
            {(topReferrers.length > 0 ? topReferrers : [["Direct", 0] as const]).map(([source, count]) => (
              <div key={source} className="admin-compact-row">
                <span className="truncate text-sm font-semibold text-ink-strong" dir="ltr">{source}</span>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-ink">{count}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">Modules</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink-strong">اختصارات الإدارة</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {adminModules.map((module) => (
            <Link
              key={module.title}
              href={module.href as Route}
              className="admin-module-card surface-panel group relative block rounded-[1.5rem] p-5 shadow-sm transition duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-lg font-semibold tracking-tight text-ink-strong">{module.title}</p>
                <span className="shrink-0 rounded-full border border-line bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  {module.metric}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{module.description}</p>
              <span className="text-accent mt-6 inline-flex items-center gap-1 text-xs font-semibold opacity-90 transition group-hover:gap-2 group-hover:opacity-100">
                فتح القسم
                <span aria-hidden>←</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
