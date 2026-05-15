import Link from "next/link";
import type { Route } from "next";
import { ContentStatus, SubmissionStatus } from "@prisma/client";

import { listAppLogs } from "@/lib/app-log";
import { runConnectionChecks } from "@/lib/backup";
import {
  getCrmSubmissions,
  getDevices,
  getDoctors,
  getGalleryItems,
  getJournalPosts,
  getServices,
  getAdminUsers,
} from "@/lib/content-repository";

const pipelineOrder: SubmissionStatus[] = [
  SubmissionStatus.NEW,
  SubmissionStatus.CONTACTED,
  SubmissionStatus.FOLLOW_UP,
  SubmissionStatus.BOOKED,
  SubmissionStatus.CLOSED,
];

const pipelineLabelsAr: Record<SubmissionStatus, string> = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  FOLLOW_UP: "متابعة",
  BOOKED: "محجوز",
  CLOSED: "مغلق",
};
const pipelineLabelsEn: Record<SubmissionStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  FOLLOW_UP: "Follow-up",
  BOOKED: "Booked",
  CLOSED: "Closed",
};

function statusBadge(status: ContentStatus) {
  switch (status) {
    case ContentStatus.PUBLISHED:
      return { className: "is-published", labelAr: "منشور", labelEn: "Published" };
    case ContentStatus.REVIEW:
      return { className: "is-review", labelAr: "مراجعة", labelEn: "Review" };
    case ContentStatus.ARCHIVED:
      return { className: "is-archived", labelAr: "مؤرشف", labelEn: "Archived" };
    default:
      return { className: "is-draft", labelAr: "مسودة", labelEn: "Draft" };
  }
}

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default async function AdminPage() {
  const [doctors, services, devices, gallery, journal, submissions, users, checks] =
    await Promise.all([
      getDoctors(),
      getServices(),
      getDevices(),
      getGalleryItems(),
      getJournalPosts(),
      getCrmSubmissions(),
      getAdminUsers(),
      runConnectionChecks(),
    ]);

  const analytics = await listAppLogs({ kind: "analytics.pageview", limit: 200 });
  const pageCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  analytics.items.forEach((item) => {
    const path = typeof item.meta?.path === "string" ? item.meta.path : "/";
    const referrer =
      typeof item.meta?.referrer === "string" && item.meta.referrer
        ? item.meta.referrer
        : "Direct";
    pageCounts.set(path, (pageCounts.get(path) ?? 0) + 1);
    referrerCounts.set(referrer, (referrerCounts.get(referrer) ?? 0) + 1);
  });
  const topPages = Array.from(pageCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topReferrers = Array.from(referrerCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const pipelineCounts = pipelineOrder.map((status) => ({
    status,
    count: submissions.filter((s) => s.status === status).length,
  }));

  const recentLeads = submissions.slice(0, 6);

  const healthPills = [
    { key: "Database", state: checks.database.ok },
    { key: "Storage (R2)", state: checks.r2.ok },
    { key: "reCAPTCHA", state: checks.recaptcha.ok },
  ];

  const kpis = [
    {
      label: { ar: "الأطباء", en: "Doctors" },
      value: doctors.length,
      href: "/admin/doctors",
      icon: <Icon d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8" />,
    },
    {
      label: { ar: "الخدمات", en: "Services" },
      value: services.length,
      href: "/admin/services",
      icon: <Icon d="M12 3 3 8.5v7L12 21l9-5.5v-7L12 3Z M12 12 3 8.5 M12 12v9 M12 12l9-3.5" />,
      iconCls: "is-gold",
    },
    {
      label: { ar: "الأجهزة", en: "Devices" },
      value: devices.length,
      href: "/admin/devices",
      icon: <Icon d="M2 7h20v14H2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />,
    },
    {
      label: { ar: "الطلبات", en: "Leads" },
      value: submissions.length,
      href: "/admin/crm",
      icon: <Icon d="M21 11.5a8.4 8.4 0 0 1-2 5.4l-3 3-3-3a8.4 8.4 0 1 1 8-5.4Z M12 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />,
      iconCls: "is-success",
    },
    {
      label: { ar: "المعرض", en: "Gallery" },
      value: gallery.length,
      href: "/admin/gallery",
      icon: <Icon d="M3 3h18v18H3z M3 16l5-5 4 4 4-4 5 5" />,
      iconCls: "is-gold",
    },
    {
      label: { ar: "المجلة", en: "Journal" },
      value: journal.length,
      href: "/admin/journal",
      icon: <Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />,
    },
    {
      label: { ar: "المستخدمون", en: "Users" },
      value: users.length,
      href: "/admin/users",
      icon: <Icon d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M22 11V9a2 2 0 0 0-2-2h-2" />,
    },
    {
      label: { ar: "محجوزة", en: "Booked" },
      value: submissions.filter((s) => s.status === SubmissionStatus.BOOKED).length,
      href: "/admin/crm",
      icon: <Icon d="M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2 M9 14l2 2 4-4" />,
      iconCls: "is-success",
    },
  ] as const;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">نظرة عامة</span>
            <span className="lang-en">Overview</span>
          </h1>
          <p>
            <span className="lang-ar">جميع الأرقام محدّثة من قاعدة البيانات.</span>
            <span className="lang-en">All metrics reflect the live database.</span>
          </p>
        </div>
        <div className="admin-page-header__actions">
          {healthPills.map((pill) => (
            <span
              key={pill.key}
              className={`admin-shell__pill ${pill.state ? "is-success" : "is-danger"}`}
            >
              {pill.key}
            </span>
          ))}
        </div>
      </div>

      <section className="admin-grid-4">
        {kpis.map((kpi) => (
          <Link key={kpi.label.ar} href={kpi.href as Route} className="admin-kpi">
            <span className={`admin-kpi__icon ${("iconCls" in kpi && kpi.iconCls) || ""}`}>{kpi.icon}</span>
            <span className="min-w-0">
              <span className="admin-kpi__value">{kpi.value}</span>
              <span className="admin-kpi__label">
                <span className="lang-ar">{kpi.label.ar}</span>
                <span className="lang-en">{kpi.label.en}</span>
              </span>
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">CRM</div>
              <div className="admin-card__title">
                <span className="lang-ar">مسار الطلبات</span>
                <span className="lang-en">Lead pipeline</span>
              </div>
            </div>
            <Link href={"/admin/crm" as Route} className="admin-btn-secondary">
              <span className="lang-ar">فتح</span>
              <span className="lang-en">Open</span>
            </Link>
          </div>
          <div className="admin-card__body">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {pipelineCounts.map(({ status, count }) => (
                <div
                  key={status}
                  className="rounded-xl border p-3"
                  style={{
                    borderColor: "var(--admin-border)",
                    background: "var(--admin-panel-soft)",
                  }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-faint)]">
                    {status}
                  </p>
                  <p className="mt-1 text-[0.8rem] font-semibold text-[color:var(--admin-text-soft)]">
                    <span className="lang-ar">{pipelineLabelsAr[status]}</span>
                    <span className="lang-en">{pipelineLabelsEn[status]}</span>
                  </p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-[color:var(--admin-text)]">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Leads</div>
              <div className="admin-card__title">
                <span className="lang-ar">آخر الطلبات</span>
                <span className="lang-en">Latest leads</span>
              </div>
            </div>
            <Link href={"/admin/crm" as Route} className="admin-btn-ghost">
              <span className="lang-ar">عرض الكل</span>
              <span className="lang-en">View all</span>
            </Link>
          </div>
          <div className="admin-data-list">
            {recentLeads.length === 0 ? (
              <div className="admin-data-row">
                <span className="admin-data-row__title text-[color:var(--admin-text-faint)]">
                  <span className="lang-ar">لا توجد طلبات بعد</span>
                  <span className="lang-en">No leads yet</span>
                </span>
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="admin-data-row">
                  <div className="min-w-0">
                    <p className="admin-data-row__title truncate">{lead.fullName}</p>
                    <p className="admin-data-row__meta truncate" dir="ltr">{lead.phone}</p>
                  </div>
                  <span className="admin-status-badge is-review">
                    <span className="lang-ar">{pipelineLabelsAr[lead.status]}</span>
                    <span className="lang-en">{pipelineLabelsEn[lead.status]}</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Analytics</div>
              <div className="admin-card__title">
                <span className="lang-ar">الصفحات الأكثر زيارة</span>
                <span className="lang-en">Top pages</span>
              </div>
            </div>
            <Link href={"/admin/logs" as Route} className="admin-btn-ghost">
              <span className="lang-ar">السجل</span>
              <span className="lang-en">Logs</span>
            </Link>
          </div>
          <div className="admin-data-list">
            {(topPages.length > 0
              ? topPages
              : ([["/", 0]] as Array<[string, number]>)
            ).map(([path, count]) => (
              <div key={path} className="admin-data-row">
                <span className="admin-data-row__title truncate" dir="ltr">{path}</span>
                <span className="admin-data-row__value">{count}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Sources</div>
              <div className="admin-card__title">
                <span className="lang-ar">مصادر الزيارات</span>
                <span className="lang-en">Traffic sources</span>
              </div>
            </div>
          </div>
          <div className="admin-data-list">
            {(topReferrers.length > 0
              ? topReferrers
              : ([["Direct", 0]] as Array<[string, number]>)
            ).map(([source, count]) => (
              <div key={source} className="admin-data-row">
                <span className="admin-data-row__title truncate" dir="ltr">{source}</span>
                <span className="admin-data-row__value">{count}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-grid-3">
        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Content</div>
              <div className="admin-card__title">
                <span className="lang-ar">حالة الأطباء</span>
                <span className="lang-en">Doctors status</span>
              </div>
            </div>
          </div>
          <div className="admin-data-list">
            {[
              ContentStatus.PUBLISHED,
              ContentStatus.DRAFT,
              ContentStatus.REVIEW,
              ContentStatus.ARCHIVED,
            ].map((status) => {
              const meta = statusBadge(status);
              const count = doctors.filter((d) => d.status === status).length;
              return (
                <div key={status} className="admin-data-row">
                  <span className={`admin-status-badge ${meta.className}`}>
                    <span className="lang-ar">{meta.labelAr}</span>
                    <span className="lang-en">{meta.labelEn}</span>
                  </span>
                  <span className="admin-data-row__value">{count}</span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Content</div>
              <div className="admin-card__title">
                <span className="lang-ar">حالة الخدمات</span>
                <span className="lang-en">Services status</span>
              </div>
            </div>
          </div>
          <div className="admin-data-list">
            {[
              ContentStatus.PUBLISHED,
              ContentStatus.DRAFT,
              ContentStatus.REVIEW,
              ContentStatus.ARCHIVED,
            ].map((status) => {
              const meta = statusBadge(status);
              const count = services.filter((s) => s.status === status).length;
              return (
                <div key={status} className="admin-data-row">
                  <span className={`admin-status-badge ${meta.className}`}>
                    <span className="lang-ar">{meta.labelAr}</span>
                    <span className="lang-en">{meta.labelEn}</span>
                  </span>
                  <span className="admin-data-row__value">{count}</span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Content</div>
              <div className="admin-card__title">
                <span className="lang-ar">حالة الأجهزة</span>
                <span className="lang-en">Devices status</span>
              </div>
            </div>
          </div>
          <div className="admin-data-list">
            {[
              ContentStatus.PUBLISHED,
              ContentStatus.DRAFT,
              ContentStatus.REVIEW,
              ContentStatus.ARCHIVED,
            ].map((status) => {
              const meta = statusBadge(status);
              const count = devices.filter((d) => d.status === status).length;
              return (
                <div key={status} className="admin-data-row">
                  <span className={`admin-status-badge ${meta.className}`}>
                    <span className="lang-ar">{meta.labelAr}</span>
                    <span className="lang-en">{meta.labelEn}</span>
                  </span>
                  <span className="admin-data-row__value">{count}</span>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </>
  );
}
