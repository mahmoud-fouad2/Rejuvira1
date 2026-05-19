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
  delta,
  color,
  icon,
}: {
  label: string;
  labelEn: string;
  value: number;
  sub?: string;
  delta?: { value: number; label: string };
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="admin-stat-card"
      style={{ "--stat-color": color } as React.CSSProperties}
    >
      <div className="admin-stat-card__icon">{icon}</div>
      <div className="admin-stat-card__body">
        <p className="admin-stat-card__value">{value.toLocaleString("ar-SA")}</p>
        <p className="admin-stat-card__label">
          <span className="lang-ar">{label}</span>
          <span className="lang-en">{labelEn}</span>
        </p>
        {delta ? (
          <p className="admin-stat-card__delta" style={{
            color: delta.value >= 0 ? "#059669" : "#dc2626",
            fontSize: "0.72rem",
            marginTop: "0.2rem",
            fontWeight: 600,
          }}>
            {delta.value >= 0 ? "▲" : "▼"} {Math.abs(delta.value)} {delta.label}
          </p>
        ) : sub ? (
          <p className="admin-stat-card__sub">{sub}</p>
        ) : null}
      </div>
    </div>
  );
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "3px",
        height: "40px",
        padding: "0 4px",
      }}
    >
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${Math.max(4, Math.round((v / max) * 40))}px`,
            background: i === data.length - 1 ? color : `${color}55`,
            borderRadius: "3px 3px 0 0",
            transition: "height 0.3s",
          }}
          title={`${v}`}
        />
      ))}
    </div>
  );
}

function ProgressRow({
  label,
  labelEn,
  count,
  total,
  color,
}: {
  label: string;
  labelEn: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="admin-data-row" style={{ gap: "0.75rem" }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p className="admin-data-row__title" style={{ fontSize: "0.82rem" }}>
          <span className="lang-ar">{label}</span>
          <span className="lang-en">{labelEn}</span>
        </p>
        <div
          style={{
            height: "6px",
            borderRadius: "999px",
            background: "var(--admin-border)",
            marginTop: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: color,
              borderRadius: "999px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
        <span
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count}
        </span>
        <span style={{ fontSize: "0.72rem", color: "var(--admin-muted)", opacity: 0.7 }}>
          ({pct}%)
        </span>
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

  const now = new Date();

  const publishedServices = services.filter(
    (s) => s.status === ContentStatus.PUBLISHED,
  ).length;
  const publishedDoctors = doctors.filter(
    (d) => d.status === ContentStatus.PUBLISHED,
  ).length;

  const todayStr = now.toDateString();
  const todayLeads = submissions.filter(
    (s) => new Date(s.createdAt).toDateString() === todayStr,
  ).length;

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthLeads = submissions.filter(
    (s) => new Date(s.createdAt) >= thisMonthStart,
  ).length;
  const lastMonthLeads = submissions.filter((s) => {
    const d = new Date(s.createdAt);
    return d >= lastMonthStart && d < thisMonthStart;
  }).length;
  const monthDelta = monthLeads - lastMonthLeads;

  const newLeads = submissions.filter(
    (s) => s.status === SubmissionStatus.NEW,
  ).length;

  // Build last-7-days daily submissions chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toDateString();
    return submissions.filter(
      (s) => new Date(s.createdAt).toDateString() === ds,
    ).length;
  });

  // Build last-6-months monthly chart
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const next = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    return submissions.filter((s) => {
      const cd = new Date(s.createdAt);
      return cd >= d && cd < next;
    }).length;
  });

  // Top services by leads
  const serviceLeadsMap = new Map<string, number>();
  for (const s of submissions) {
    if (s.serviceLabel) {
      serviceLeadsMap.set(
        s.serviceLabel,
        (serviceLeadsMap.get(s.serviceLabel) ?? 0) + 1,
      );
    }
  }
  const topServices = [...serviceLeadsMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxServiceLeads = topServices[0]?.[1] ?? 1;

  const statusRows = [
    { status: SubmissionStatus.NEW, ar: "جديد", en: "New", color: "#dc2626" },
    { status: SubmissionStatus.CONTACTED, ar: "تم التواصل", en: "Contacted", color: "#d97706" },
    { status: SubmissionStatus.FOLLOW_UP, ar: "متابعة", en: "Follow-up", color: "#7c3aed" },
    { status: SubmissionStatus.BOOKED, ar: "محجوز", en: "Booked", color: "#059669" },
    { status: SubmissionStatus.CLOSED, ar: "مغلق", en: "Closed", color: "#6b7280" },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">الإحصائيات</span>
            <span className="lang-en">Analytics</span>
          </h1>
          <p>
            <span className="lang-ar">آخر تحديث: {now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</span>
            <span className="lang-en">Last updated: {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
          </p>
        </div>
      </div>

      {/* KPI overview */}
      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">KPI Overview</div>
            <div className="admin-card__title">
              <span className="lang-ar">مؤشرات الأداء الرئيسية</span>
              <span className="lang-en">Key Performance Indicators</span>
            </div>
          </div>
        </div>
        <div className="admin-stats-grid">
          <StatCard label="إجمالي الطلبات" labelEn="Total Leads" value={submissions.length} color="#7c3aed"
            delta={{ value: monthDelta, label: "هذا الشهر" }}
            icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
          <StatCard label="طلبات جديدة (بانتظار)" labelEn="Pending New Leads" value={newLeads} color="#dc2626"
            sub={newLeads > 0 ? "تحتاج متابعة فورية" : "لا يوجد معلّق"}
            icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>}
          />
          <StatCard label="طلبات هذا الشهر" labelEn="This Month" value={monthLeads} color="#059669"
            sub={`الشهر الماضي: ${lastMonthLeads}`}
            icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
          />
          <StatCard label="طلبات اليوم" labelEn="Today" value={todayLeads} color="#0891b2"
            icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
          />
          <StatCard label="خدمة منشورة" labelEn="Published Services" value={publishedServices} sub={`من ${services.length} إجمالي`} color="#d97706"
            icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M12 3 3 8.5v7L12 21l9-5.5v-7L12 3Z" strokeLinejoin="round"/></svg>}
          />
          <StatCard label="طبيب منشور" labelEn="Published Doctors" value={publishedDoctors} sub={`من ${doctors.length} إجمالي`} color="#059669"
            icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
          />
        </div>
      </article>

      {/* Charts row */}
      <div className="admin-stats-charts-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Last 7 days */}
        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Trend</div>
              <div className="admin-card__title">
                <span className="lang-ar">الطلبات — آخر 7 أيام</span>
                <span className="lang-en">Leads — Last 7 Days</span>
              </div>
            </div>
            <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#7c3aed" }}>
              {last7.reduce((a, b) => a + b, 0)}
            </span>
          </div>
          <div style={{ padding: "0 1rem 1rem" }}>
            <MiniBarChart data={last7} color="#7c3aed" />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "0.68rem", color: "var(--admin-muted)", opacity: 0.6 }}>
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(now);
                d.setDate(d.getDate() - (6 - i));
                return <span key={i}>{d.toLocaleDateString("ar-SA", { weekday: "short" })}</span>;
              })}
            </div>
          </div>
        </article>

        {/* Last 6 months */}
        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Monthly</div>
              <div className="admin-card__title">
                <span className="lang-ar">الطلبات — آخر 6 أشهر</span>
                <span className="lang-en">Leads — Last 6 Months</span>
              </div>
            </div>
            <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#059669" }}>
              {last6Months.reduce((a, b) => a + b, 0)}
            </span>
          </div>
          <div style={{ padding: "0 1rem 1rem" }}>
            <MiniBarChart data={last6Months} color="#059669" />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "0.68rem", color: "var(--admin-muted)", opacity: 0.6 }}>
              {Array.from({ length: 6 }, (_, i) => {
                const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
                return <span key={i}>{d.toLocaleDateString("ar-SA", { month: "short" })}</span>;
              })}
            </div>
          </div>
        </article>
      </div>

      {/* Content + CRM in columns */}
      <div className="admin-stats-charts-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

        {/* Lead Status */}
        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Pipeline</div>
              <div className="admin-card__title">
                <span className="lang-ar">مسار الطلبات</span>
                <span className="lang-en">Lead Pipeline</span>
              </div>
            </div>
          </div>
          <div className="admin-data-list">
            {statusRows.map(({ status, ar, en, color }) => (
              <ProgressRow
                key={status}
                label={ar}
                labelEn={en}
                count={submissions.filter((s) => s.status === status).length}
                total={submissions.length}
                color={color}
              />
            ))}
          </div>
        </article>

        {/* Content inventory */}
        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Content</div>
              <div className="admin-card__title">
                <span className="lang-ar">مخزون المحتوى</span>
                <span className="lang-en">Content Inventory</span>
              </div>
            </div>
          </div>
          <div className="admin-data-list">
            <ProgressRow label="خدمات منشورة" labelEn="Published services" count={publishedServices} total={services.length} color="#d97706" />
            <ProgressRow label="أطباء منشورون" labelEn="Published doctors" count={publishedDoctors} total={doctors.length} color="#059669" />
            <ProgressRow label="صور المعرض" labelEn="Gallery items" count={gallery.filter(g => g.status === ContentStatus.PUBLISHED).length} total={gallery.length} color="#0891b2" />
            <ProgressRow label="مقالات المجلة" labelEn="Journal posts" count={journal.filter(j => j.status === ContentStatus.PUBLISHED).length} total={journal.length} color="#be185d" />
          </div>
          <div className="admin-data-list" style={{ borderTop: "1px solid var(--admin-border)", marginTop: "0" }}>
            {[
              { label: "الخدمات", labelEn: "Services", count: services.length, color: "#d97706" },
              { label: "الأطباء", labelEn: "Doctors", count: doctors.length, color: "#059669" },
              { label: "الأقسام", labelEn: "Categories", count: categories.length, color: "#7c3aed" },
              { label: "معرض الصور", labelEn: "Gallery", count: gallery.length, color: "#0891b2" },
              { label: "المقالات", labelEn: "Journal", count: journal.length, color: "#be185d" },
              { label: "المستخدمون", labelEn: "Users", count: users.length, color: "#4f46e5" },
            ].map(({ label, labelEn, count, color }) => (
              <div key={label} className="admin-data-row">
                <p className="admin-data-row__title">
                  <span className="lang-ar">{label}</span>
                  <span className="lang-en">{labelEn}</span>
                </p>
                <span className="admin-data-row__value" style={{ color, fontWeight: 700 }}>{count}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* Top services */}
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
        {topServices.length === 0 ? (
          <p style={{ padding: "1rem 1.2rem", fontSize: "0.85rem", color: "var(--admin-muted)" }}>
            <span className="lang-ar">لا توجد بيانات كافية بعد</span>
            <span className="lang-en">No data yet</span>
          </p>
        ) : (
          <div className="admin-data-list">
            {topServices.map(([label, count], i) => (
              <div key={label} className="admin-data-row">
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", minWidth: 0, flex: 1 }}>
                  <span style={{
                    width: "1.6rem",
                    height: "1.6rem",
                    borderRadius: "50%",
                    background: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c3a" : "var(--admin-border)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: i < 3 ? "#fff" : "var(--admin-muted)",
                    flexShrink: 0,
                  }}>{i + 1}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="admin-data-row__title" style={{ fontSize: "0.83rem" }}>{label}</p>
                    <div style={{ height: "5px", borderRadius: "999px", background: "var(--admin-border)", marginTop: "5px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.round((count / maxServiceLeads) * 100)}%`, background: "#7c3aed", borderRadius: "999px" }} />
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#7c3aed", flexShrink: 0 }}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </article>
    </>
  );
}
