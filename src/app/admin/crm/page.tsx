import { CrmSubmissionEditor } from "@/components/forms/CrmSubmissionEditor";
import { getCrmSubmissions } from "@/lib/content-repository";

const statusLabelsAr = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  FOLLOW_UP: "متابعة",
  BOOKED: "محجوز",
  CLOSED: "مغلق",
} as const;
const statusLabelsEn = {
  NEW: "New",
  CONTACTED: "Contacted",
  FOLLOW_UP: "Follow-up",
  BOOKED: "Booked",
  CLOSED: "Closed",
} as const;

export default async function AdminCrmPage() {
  const submissions = await getCrmSubmissions();

  const newCount = submissions.filter((i) => i.status === "NEW").length;
  const contactedCount = submissions.filter((i) => i.status === "CONTACTED").length;
  const bookedCount = submissions.filter((i) => i.status === "BOOKED").length;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">طلبات التواصل</span>
            <span className="lang-en">Contact submissions</span>
          </h1>
          <p>
            <span className="lang-ar">{submissions.length} طلب</span>
            <span className="lang-en">{submissions.length} leads</span>
          </p>
        </div>
        <div className="admin-page-header__actions">
          <a href="/api/admin/crm/export?format=xlsx" className="admin-btn-primary">
            <span className="lang-ar">تصدير Excel</span>
            <span className="lang-en">Export Excel</span>
          </a>
          <a href="/api/admin/crm/export?format=pdf" className="admin-btn-secondary">
            <span className="lang-ar">تصدير PDF</span>
            <span className="lang-en">Export PDF</span>
          </a>
        </div>
      </div>

      <section className="admin-grid-3">
        <div className="admin-kpi">
          <span className="admin-kpi__icon">●</span>
          <span>
            <span className="admin-kpi__value">{newCount}</span>
            <span className="admin-kpi__label">
              <span className="lang-ar">طلبات جديدة</span>
              <span className="lang-en">New</span>
            </span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-gold">●</span>
          <span>
            <span className="admin-kpi__value">{contactedCount}</span>
            <span className="admin-kpi__label">
              <span className="lang-ar">تم التواصل</span>
              <span className="lang-en">Contacted</span>
            </span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-success">●</span>
          <span>
            <span className="admin-kpi__value">{bookedCount}</span>
            <span className="admin-kpi__label">
              <span className="lang-ar">محجوز</span>
              <span className="lang-en">Booked</span>
            </span>
          </span>
        </div>
      </section>

      <section className="grid gap-3">
        {submissions.map((submission) => (
          <article key={submission.id} className="admin-card">
            <div className="admin-card__body">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[color:var(--admin-text)]">
                    {submission.fullName}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--admin-text-soft)]">
                    {submission.phone}
                    {submission.email ? ` • ${submission.email}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="admin-chip">
                    <span className="lang-ar">{statusLabelsAr[submission.status]}</span>
                    <span className="lang-en">{statusLabelsEn[submission.status]}</span>
                  </span>
                  <span className="admin-chip">{submission.source}</span>
                </div>
              </div>
              {submission.serviceLabel ? (
                <p className="mt-3 text-sm text-[color:var(--admin-text-soft)]">
                  <span className="lang-ar">الخدمة: </span>
                  <span className="lang-en">Service: </span>
                  {submission.serviceLabel}
                </p>
              ) : null}
              {submission.notes ? (
                <p className="mt-2 text-sm text-[color:var(--admin-text-faint)]">
                  {submission.notes}
                </p>
              ) : null}
              <div className="mt-4">
                <CrmSubmissionEditor submission={submission} />
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
