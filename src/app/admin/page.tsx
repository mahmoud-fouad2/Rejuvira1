import Link from "next/link";
import type { Route } from "next";

import { auth } from "@/auth";
import { runConnectionChecks } from "@/lib/backup";
import { getDashboardSnapshot } from "@/lib/content-repository";
import { adminModules, heroMetrics } from "@/lib/site-content";

const readinessCards = [
  { label: "ملفات الأطباء", value: "جاهزة للمراجعة والتحديث داخل اللوحة" },
  { label: "مكتبة الخدمات", value: "مرتّبة لتسريع التحرير والمراجعة" },
  { label: "الأصول والميديا", value: "مدعومة محليًا لهوية بصرية متسقة" },
] as const;

const pipelineStages = ["جديد", "تم التواصل", "متابعة", "محجوز", "مغلق"] as const;

export default async function AdminPage() {
  const session = await auth();
  const [snapshot, checks] = await Promise.all([
    getDashboardSnapshot(),
    runConnectionChecks(),
  ]);
  const healthPills = [
    { key: "DB", state: checks.database.ok, detail: checks.database.detail },
    { key: "R2", state: checks.r2.ok, detail: checks.r2.detail },
    { key: "reCAPTCHA", state: checks.recaptcha.ok, detail: checks.recaptcha.detail },
  ];

  return (
    <>
      <section className="surface-panel relative overflow-hidden rounded-[1.75rem] p-8 shadow-sm lg:p-11">
        <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-accent/12 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-purple-mid/10 blur-3xl" />

        <div className="relative flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-strong px-4 py-1.5 text-[11px] font-medium text-ink-soft shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_oklch(52%_0.11_195/0.55)]" />
              اتصال مشفّر · جلسة إدارية آمنة
            </div>
            <p className="text-ink-faint mt-6 text-[10px] font-medium uppercase tracking-[0.26em]">لوحة التحكم</p>
            <h1 className="text-ink-strong mt-3 text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl">
              مركز تحكّم واحد للمحتوى الطبي والتجربة الرقمية.
            </h1>
            <p className="text-ink-soft mt-5 max-w-2xl text-base leading-8 sm:text-lg">
              رؤية موحّدة للأطباء والخدمات والطلبات، بهوية بصرية هادئة تعكس جودة الرعاية وتسهّل القرار اليومي.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="border-line bg-surface text-ink-soft inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium shadow-sm">
                <span className="text-ink-strong">{session?.user?.name ?? session?.user?.email ?? "جلسة نشطة"}</span>
              </span>
              {healthPills.map((pill) => (
                <span
                  key={pill.key}
                  title={pill.detail ?? ""}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                    pill.state
                      ? "bg-emerald/10 text-emerald border border-emerald/25"
                      : "bg-burgundy/10 text-burgundy border border-burgundy/25"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      pill.state ? "bg-emerald" : "bg-burgundy"
                    }`}
                  />
                  {pill.key} {pill.state ? "OK" : "ERR"}
                </span>
              ))}
            </div>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-3 xl:max-w-md">
            {heroMetrics.map((metric) => (
              <div
                key={metric.label}
                className="border-line relative overflow-hidden rounded-2xl border bg-surface/90 px-5 py-5 shadow-sm"
              >
                <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-l from-accent via-purple-mid/60 to-transparent opacity-80" />
                <p className="text-ink-strong text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">{metric.value}</p>
                <p className="text-ink-soft mt-3 text-[10px] font-medium uppercase tracking-[0.14em]">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              { label: "الأطباء", value: snapshot.doctorCount, hint: "ملفات عامة" },
              { label: "الخدمات", value: snapshot.serviceCount, hint: "بطاقات الخدمة" },
              { label: "الطلبات", value: snapshot.leadCount, hint: "CRM" },
              { label: "الأجهزة", value: snapshot.deviceCount, hint: "المعدات" },
            ] as const
          ).map((row) => (
            <div
              key={row.label}
              className="border-line group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-surface to-surface-strong p-6 shadow-sm transition hover:border-accent/25"
            >
              <span className="absolute end-3 top-3 h-8 w-8 rounded-full bg-accent-soft/50 opacity-0 transition group-hover:opacity-100" />
              <p className="text-ink-soft text-sm font-medium">{row.label}</p>
              <p className="text-ink-strong mt-2 text-4xl font-semibold tabular-nums">{row.value}</p>
              <p className="text-ink-faint mt-2 text-xs">{row.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="surface-panel relative rounded-[1.75rem] p-8 shadow-sm lg:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-ink-faint text-[10px] font-medium uppercase tracking-[0.24em]">حركة الطلبات</p>
              <h2 className="text-ink-strong mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">مسار المريض الإداري</h2>
            </div>
            <span className="rounded-full border border-accent/30 bg-accent-soft/40 px-4 py-1.5 text-[11px] font-semibold text-ink">
              متابعة مرحلية
            </span>
          </div>

          <div className="relative mt-10">
            <div
              className="pointer-events-none absolute start-8 end-8 top-7 hidden h-px bg-gradient-to-l from-transparent via-line to-transparent md:block"
              aria-hidden
            />
            <div className="grid gap-4 md:grid-cols-5">
              {pipelineStages.map((stage, index) => (
                <div
                  key={stage}
                  className="border-line relative rounded-2xl border bg-surface/95 p-5 text-center shadow-sm md:text-start"
                >
                  <p className="text-ink-faint font-mono text-[10px] tracking-[0.18em]">0{index + 1}</p>
                  <p className="text-ink-strong mt-3 text-sm font-semibold">{stage}</p>
                  <span className="mx-auto mt-4 flex h-2.5 w-2.5 rounded-full border-2 border-line bg-surface md:mx-0" />
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="surface-panel rounded-[1.75rem] p-8 shadow-sm lg:p-10">
          <p className="text-ink-faint text-[10px] font-medium uppercase tracking-[0.24em]">جاهزية المحتوى</p>
          <h2 className="text-ink-strong mt-2 text-xl font-semibold tracking-tight">ملخص سريع</h2>
          <div className="mt-8 grid gap-3">
            {readinessCards.map((card) => (
              <div key={card.label} className="border-line rounded-2xl border bg-surface/90 px-4 py-4 shadow-sm">
                <p className="text-ink-soft text-xs font-semibold">{card.label}</p>
                <p className="text-ink-strong mt-2 text-sm font-medium leading-relaxed">{card.value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-ink-faint text-[10px] font-medium uppercase tracking-[0.24em]">الوحدات</p>
            <h2 className="text-ink-strong text-2xl font-semibold tracking-tight">انتقل مباشرة إلى العمل</h2>
          </div>
          <p className="max-w-sm text-sm text-ink-soft">كل بطاقة تفتح القسم المرتبط في لوحة التحكم.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {adminModules.map((module) => (
            <Link
              key={module.title}
              href={module.href as Route}
              className="surface-panel group relative block rounded-[1.75rem] p-8 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
            >
              <span className="absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-accent/50 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-start justify-between gap-3">
                <p className="text-ink-strong text-lg font-semibold tracking-tight">{module.title}</p>
                <span className="shrink-0 rounded-full border border-line bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  {module.metric}
                </span>
              </div>
              <p className="text-ink-soft mt-4 text-sm leading-7">{module.description}</p>
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
