import Link from "next/link";
import type { Route } from "next";
import { SubmissionStatus } from "@prisma/client";

import { auth } from "@/auth";
import { CrmFilterBar } from "@/components/admin/CrmFilterBar";
import { LineChart, ChartCard } from "@/components/admin/AdminCharts";
import { canManageCrm } from "@/lib/admin-permissions";
import {
  getAdminUsers,
  getCrmSubmissions,
  getServices,
} from "@/lib/content-repository";
import { importCrmCsvAction } from "@/app/admin/crm/actions";

export default async function AdminCrmPage() {
  const [session, submissions, servicesRaw, staffRaw] = await Promise.all([
    auth(),
    getCrmSubmissions(),
    getServices(),
    getAdminUsers(),
  ]);
  const canManage = canManageCrm(session?.user?.role);

  const services = servicesRaw.map((service) => ({
    slug: service.slug,
    name: service.name,
  }));
  const staff = staffRaw.map((user) => ({ id: user.id, name: user.name }));

  const newCount = submissions.filter((i) => i.status === "NEW").length;
  const contactedCount = submissions.filter(
    (i) => i.status === "CONTACTED",
  ).length;
  const followUpCount = submissions.filter(
    (i) => i.status === "FOLLOW_UP",
  ).length;
  const bookedCount = submissions.filter((i) => i.status === "BOOKED").length;
  const closedCount = submissions.filter((i) => i.status === "CLOSED").length;
  const assignedCount = submissions.filter((i) => i.assignedToId).length;
  const today = new Date();
  const todayAppointmentCount = submissions.filter((item) => {
    if (!item.preferredAppointmentAt) return false;
    const date = new Date(item.preferredAppointmentAt);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }).length;
  const openPipelineCount = submissions.filter(
    (item) =>
      item.status !== SubmissionStatus.BOOKED &&
      item.status !== SubmissionStatus.CLOSED,
  ).length;
  const conversionRate = submissions.length
    ? Math.round((bookedCount / submissions.length) * 100)
    : 0;
  const sourceCount = new Set(submissions.map((item) => item.source)).size;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>قاعدة بيانات الليدز</h1>
          <p>
            {submissions.length} ليد محفوظة مع متابعة الحالات، المصادر، الحملات،
            والمواعيد.
          </p>
        </div>
        {canManage ? (
          <div className="admin-page-header__actions">
            <Link
              href={"/admin/webhooks" as Route}
              className="admin-btn-secondary"
            >
              مصادر التكامل
            </Link>
            <form action={importCrmCsvAction} className="admin-crm-import-form">
              <label>
                <span>استيراد CSV</span>
                <input name="file" type="file" accept=".csv,text/csv" />
              </label>
              <button type="submit" className="admin-btn-primary">
                رفع الليدز
              </button>
            </form>
          </div>
        ) : null}
      </div>

      <section className="admin-crm-command-grid">
        <div className="admin-kpi">
          <span className="admin-kpi__icon">●</span>
          <span>
            <span className="admin-kpi__value">{newCount}</span>
            <span className="admin-kpi__label">جديد</span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-gold">●</span>
          <span>
            <span className="admin-kpi__value">{followUpCount}</span>
            <span className="admin-kpi__label">متابعة</span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-gold">●</span>
          <span>
            <span className="admin-kpi__value">{contactedCount}</span>
            <span className="admin-kpi__label">تم التواصل</span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-success">●</span>
          <span>
            <span className="admin-kpi__value">{bookedCount}</span>
            <span className="admin-kpi__label">محجوز</span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-danger">●</span>
          <span>
            <span className="admin-kpi__value">{closedCount}</span>
            <span className="admin-kpi__label">مغلق</span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-success">●</span>
          <span>
            <span className="admin-kpi__value">{conversionRate}%</span>
            <span className="admin-kpi__label">معدل التحويل للحجز</span>
          </span>
        </div>
        <ChartCard title="آخر 14 يوم" subtitle="حجم الليدز اليومي">
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

      <section className="admin-crm-ops-strip">
        <div>
          <span className="admin-field-label">
            <span className="lang-ar">اليوم</span>
          </span>
          <strong>{todayAppointmentCount}</strong>
          <p>مواعيد تحتاج تأكيد أو متابعة.</p>
        </div>
        <div>
          <span className="admin-field-label">خط العمل المفتوح</span>
          <strong>{openPipelineCount}</strong>
          <p>طلبات لم تتحول بعد إلى حجز أو إغلاق.</p>
        </div>
        <div>
          <span className="admin-field-label">توزيع المسؤولين</span>
          <strong>
            {assignedCount}/{submissions.length}
          </strong>
          <p>طلبات عليها مسؤول واضح داخل الفريق.</p>
        </div>
        <div>
          <span className="admin-field-label">المصادر</span>
          <strong>{sourceCount}</strong>
          <p>مصادر تدخل CRM من الموقع أو الإعلانات أو الويب هوكس.</p>
        </div>
      </section>

      <CrmFilterBar
        submissions={submissions}
        services={services}
        staff={staff}
        canDelete={canManage}
        canDeleteComments={canManage}
      />
    </>
  );
}
