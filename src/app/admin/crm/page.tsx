import { CrmFilterBar } from "@/components/admin/CrmFilterBar";
import { LineChart, ChartCard } from "@/components/admin/AdminCharts";
import {
  getAdminUsers,
  getCrmSubmissions,
  getServices,
} from "@/lib/content-repository";

export default async function AdminCrmPage() {
  const [submissions, servicesRaw, staffRaw] = await Promise.all([
    getCrmSubmissions(),
    getServices(),
    getAdminUsers(),
  ]);

  const services = servicesRaw.map((service) => ({
    slug: service.slug,
    name: service.name,
  }));
  const staff = staffRaw.map((user) => ({ id: user.id, name: user.name }));

  const newCount = submissions.filter((i) => i.status === "NEW").length;
  const contactedCount = submissions.filter(
    (i) => i.status === "CONTACTED",
  ).length;
  const bookedCount = submissions.filter((i) => i.status === "BOOKED").length;
  const closedCount = submissions.filter((i) => i.status === "CLOSED").length;
  const appointmentCount = submissions.filter(
    (i) => i.preferredAppointmentAt,
  ).length;

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
          <a
            href="/api/admin/crm/export?format=csv"
            className="admin-btn-primary"
          >
            <span className="lang-ar">تصدير CSV</span>
            <span className="lang-en">Export CSV</span>
          </a>
          <a
            href="/api/admin/crm/export?format=pdf"
            className="admin-btn-secondary"
          >
            <span className="lang-ar">تصدير PDF</span>
            <span className="lang-en">Export PDF</span>
          </a>
        </div>
      </div>

      <section className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_2fr]">
        <div className="admin-kpi">
          <span className="admin-kpi__icon">●</span>
          <span>
            <span className="admin-kpi__value">{newCount}</span>
            <span className="admin-kpi__label">
              <span className="lang-ar">جديد</span>
              <span className="lang-en">New</span>
            </span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-gold">●</span>
          <span>
            <span className="admin-kpi__value">{appointmentCount}</span>
            <span className="admin-kpi__label">
              <span className="lang-ar">بموعد</span>
              <span className="lang-en">Scheduled</span>
            </span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-gold">●</span>
          <span>
            <span className="admin-kpi__value">{contactedCount}</span>
            <span className="admin-kpi__label">
              <span className="lang-ar">تواصل</span>
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
        <div className="admin-kpi">
          <span className="admin-kpi__icon">●</span>
          <span>
            <span className="admin-kpi__value">{closedCount}</span>
            <span className="admin-kpi__label">
              <span className="lang-ar">مغلق</span>
              <span className="lang-en">Closed</span>
            </span>
          </span>
        </div>
        <ChartCard title="آخر 14 يوم" subtitle="Lead volume">
          <div style={{ height: 90 }}>
            <LineChart
              isoDates={submissions.map((s) => s.createdAt)}
              windowDays={14}
              height={90}
              ariaLabel="Daily lead volume"
            />
          </div>
        </ChartCard>
      </section>

      <CrmFilterBar
        submissions={submissions}
        services={services}
        staff={staff}
      />
    </>
  );
}
