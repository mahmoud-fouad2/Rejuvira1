import { ContentStatus, SubmissionStatus } from "@prisma/client";

import {
  getDoctors,
  getGalleryItems,
  getJournalPosts,
  getServiceCategories,
  getServices,
  getCrmSubmissions,
  getAdminUsers,
} from "@/lib/content-repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function StatCard({
  label,
  labelEn,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  labelEn: string;
  value: number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="admin-stat-card" style={{ "--stat-color": color } as React.CSSProperties}>
      <div className="admin-stat-card__icon">{icon}</div>
      <div className="admin-stat-card__body">
        <p className="admin-stat-card__value">{value.toLocaleString("ar-SA")}</p>
        <p className="admin-stat-card__label">
          <span className="lang-ar">{label}</span>
          <span className="lang-en">{labelEn}</span>
        </p>
        {sub ? <p className="admin-stat-card__sub">{sub}</p> : null}
      </div>
    </div>
  );
}

export default async function AdminStatsPage() {
  const [services, doctors, gallery, journal, categories, submissions, users] =
    await Promise.all([
      getServices(),
      getDoctors(),
      getGalleryItems(),
      getJournalPosts(),
      getServiceCategories(),
      getCrmSubmissions(),
      getAdminUsers(),
    ]);

  const publishedServices = services.filter(
    (s) => s.status === ContentStatus.PUBLISHED,
  ).length;
  const publishedDoctors = doctors.filter(
    (d) => d.status === ContentStatus.PUBLISHED,
  ).length;

  const todayStr = new Date().toDateString();
  const todayLeads = submissions.filter(
    (s) => new Date(s.createdAt).toDateString() === todayStr,
  ).length;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  const monthLeads = submissions.filter(
    (s) => new Date(s.createdAt) >= thisMonth,
  ).length;

  const newLeads = submissions.filter((s) => s.status === SubmissionStatus.NEW).length;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">الإحصائيات</span>
            <span className="lang-en">Analytics</span>
          </h1>
          <p>
            <span className="lang-ar">نظرة شاملة على أداء الموقع</span>
            <span className="lang-en">Full site performance overview</span>
          </p>
        </div>
      </div>

      {/* Content Stats */}
      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">Content</div>
            <div className="admin-card__title">
              <span className="lang-ar">المحتوى المنشور</span>
              <span className="lang-en">Published Content</span>
            </div>
          </div>
        </div>
        <div className="admin-stats-grid">
          <StatCard
            label="خدمة"
            labelEn="Services"
            value={services.length}
            sub={`${publishedServices} منشور`}
            color="#7c3aed"
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M12 3 3 8.5v7L12 21l9-5.5v-7L12 3Z" strokeLinejoin="round" />
              </svg>
            }
          />
          <StatCard
            label="طبيب"
            labelEn="Doctors"
            value={doctors.length}
            sub={`${publishedDoctors} منشور`}
            color="#059669"
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <StatCard
            label="قسم خدمة"
            labelEn="Categories"
            value={categories.length}
            color="#d97706"
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            }
          />
          <StatCard
            label="صورة في المعرض"
            labelEn="Gallery Items"
            value={gallery.length}
            color="#0891b2"
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            }
          />
          <StatCard
            label="مقالة"
            labelEn="Journal Posts"
            value={journal.length}
            color="#be185d"
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
              </svg>
            }
          />
          <StatCard
            label="مستخدم"
            labelEn="Admin Users"
            value={users.length}
            color="#4f46e5"
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 11V9a2 2 0 0 0-2-2h-2M16 11h6" />
              </svg>
            }
          />
        </div>
      </article>

      {/* Leads/CRM Stats */}
      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">CRM</div>
            <div className="admin-card__title">
              <span className="lang-ar">الطلبات والعملاء المحتملون</span>
              <span className="lang-en">Leads &amp; Inquiries</span>
            </div>
          </div>
        </div>
        <div className="admin-stats-grid">
          <StatCard
            label="إجمالي الطلبات"
            labelEn="Total Leads"
            value={submissions.length}
            color="#7c3aed"
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <StatCard
            label="طلبات جديدة"
            labelEn="New Leads"
            value={newLeads}
            color="#dc2626"
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            }
          />
          <StatCard
            label="طلبات اليوم"
            labelEn="Today's Leads"
            value={todayLeads}
            color="#059669"
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
                <path d="M12 14v4M10 16h4" />
              </svg>
            }
          />
          <StatCard
            label="طلبات هذا الشهر"
            labelEn="This Month"
            value={monthLeads}
            color="#0891b2"
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M3 3v18h18" strokeLinecap="round" />
                <path d="M7 16l4-6 4 4 4-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>
      </article>

      {/* Lead Status Breakdown */}
      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">Breakdown</div>
            <div className="admin-card__title">
              <span className="lang-ar">توزيع حالات الطلبات</span>
              <span className="lang-en">Lead Status Distribution</span>
            </div>
          </div>
        </div>
        <div className="admin-data-list">
          {(
            [
              SubmissionStatus.NEW,
              SubmissionStatus.CONTACTED,
              SubmissionStatus.FOLLOW_UP,
              SubmissionStatus.BOOKED,
              SubmissionStatus.CLOSED,
            ] as const
          ).map((status) => {
              const count = submissions.filter((s) => s.status === status).length;
              const pct =
                submissions.length > 0
                  ? Math.round((count / submissions.length) * 100)
                  : 0;
              const labels: Record<string, { ar: string; color: string }> = {
                [SubmissionStatus.NEW]: { ar: "جديد", color: "#dc2626" },
                [SubmissionStatus.CONTACTED]: { ar: "تم التواصل", color: "#d97706" },
                [SubmissionStatus.FOLLOW_UP]: { ar: "متابعة", color: "#7c3aed" },
                [SubmissionStatus.BOOKED]: { ar: "محجوز", color: "#059669" },
                [SubmissionStatus.CLOSED]: { ar: "مغلق", color: "#6b7280" },
              };
              const meta = labels[status];
              return (
                <div key={status} className="admin-data-row">
                  <div>
                    <p className="admin-data-row__title">
                      <span className="lang-ar">{meta?.ar ?? status}</span>
                      <span className="lang-en">{status}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="admin-stat-bar-wrap">
                      <div
                        className="admin-stat-bar-fill"
                        style={{
                          width: `${pct}%`,
                          background: meta?.color ?? "#7c3aed",
                        }}
                      />
                    </div>
                    <span
                      className="admin-data-row__value"
                      style={{ color: meta?.color ?? "inherit" }}
                    >
                      {count}
                      <span className="admin-stat-pct"> ({pct}%)</span>
                    </span>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </article>

      {/* Top services by leads */}
      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">Top services</div>
            <div className="admin-card__title">
              <span className="lang-ar">الخدمات الأكثر طلباً</span>
              <span className="lang-en">Most Requested Services</span>
            </div>
          </div>
        </div>
        <div className="admin-data-list">
          {(() => {
            const byService = new Map<string, number>();
            for (const s of submissions) {
              if (s.serviceLabel) {
                byService.set(s.serviceLabel, (byService.get(s.serviceLabel) ?? 0) + 1);
              }
            }
            const sorted = [...byService.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
            if (sorted.length === 0) {
              return (
                <p className="px-5 py-4 text-sm text-[color:var(--admin-muted)]">
                  <span className="lang-ar">لا توجد بيانات كافية</span>
                  <span className="lang-en">No data yet</span>
                </p>
              );
            }
            const max = sorted[0]?.[1] ?? 1;
            return sorted.map(([label, count]) => (
              <div key={label} className="admin-data-row">
                <p className="admin-data-row__title truncate">{label}</p>
                <div className="flex items-center gap-3">
                  <div className="admin-stat-bar-wrap">
                    <div
                      className="admin-stat-bar-fill"
                      style={{ width: `${Math.round((count / max) * 100)}%`, background: "#7c3aed" }}
                    />
                  </div>
                  <span className="admin-data-row__value">{count}</span>
                </div>
              </div>
            ));
          })()}
        </div>
      </article>
    </>
  );
}
