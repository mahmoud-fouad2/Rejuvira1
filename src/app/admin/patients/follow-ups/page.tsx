import Link from "next/link";
import type { Route } from "next";
import { AppointmentStatus } from "@prisma/client";

import { auth } from "@/auth";
import {
  DataTable,
  EmptyState,
  FilterBar,
  PageHeader,
} from "@/components/admin/patients/PatientDesignSystem";
import { IconClockAlert } from "@/components/admin/patients/PatientModuleIcons";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { updateAppointmentStatusAction } from "../actions";
import { appointmentStatusLabels, formatDate } from "@/lib/portal/labels";
import { displayPhone, hasPortalCapability } from "@/lib/portal/permissions";
import { listAppointments } from "@/lib/portal/repository";

export const dynamic = "force-dynamic";

export default async function FollowUpsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([auth(), props.searchParams]);
  const role = session?.user?.role;
  const canManage = hasPortalCapability(role, "followUps.manage");

  const page = Math.max(
    1,
    Number.parseInt(typeof params.page === "string" ? params.page : "", 10) || 1,
  );
  const status = typeof params.status === "string" ? params.status : "";
  const overdue = params.overdue === "1";

  const result = await listAppointments({
    page,
    status:
      status && (Object.values(AppointmentStatus) as string[]).includes(status)
        ? (status as AppointmentStatus)
        : "ALL",
    overdueOnly: overdue,
  });
  const now = new Date().getTime();

  const query = (overrides: Record<string, string>) => {
    const search = new URLSearchParams();
    if (status) search.set("status", status);
    if (overdue) search.set("overdue", "1");
    for (const [key, value] of Object.entries(overrides)) {
      if (value) search.set(key, value);
      else search.delete(key);
    }
    const qs = search.toString();
    return `/admin/patients/follow-ups${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="patient-module-page patient-module-page--refined">
      <PageHeader
        eyebrow="Follow-ups"
        title="المتابعات"
        description={`${result.total} موعد متابعة. راقب المتأخر، المؤكد، والمكتمل من مساحة واحدة.`}
      />
      <PatientsSubNav active="follow-ups" role={role} />

      <FilterBar title="تصفية المتابعات" description="فلترة مختصرة تساعد الموظف على البدء بما يحتاج متابعة فعلية.">
        <form method="get" className="patient-filter-grid patient-filter-grid--compact">
          <label>
            <span className="admin-field-label">الحالة</span>
            <select name="status" defaultValue={status} className="admin-input">
              <option value="">الكل</option>
              {Object.entries(appointmentStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="patient-check-control">
            <input type="checkbox" name="overdue" value="1" defaultChecked={overdue} />
            <span>المتأخرة فقط</span>
          </label>
          <div className="patient-filter-actions">
            <button type="submit" className="admin-btn-secondary">
              تصفية
            </button>
            <Link href={"/admin/patients/follow-ups" as Route} className="admin-btn-ghost">
              إعادة تعيين
            </Link>
          </div>
        </form>
      </FilterBar>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<IconClockAlert />}
          title="لا توجد مواعيد متابعة مطابقة"
          description="عند جدولة متابعة من ملف العملية ستظهر هنا مع الحالة وأزرار التحديث المناسبة."
          action={
            <Link href={"/admin/patients" as Route} className="admin-btn-primary">
              فتح سجل المرضى
            </Link>
          }
        />
      ) : (
        <DataTable
          title="سجل المتابعات"
          description="مواعيد المتابعة مع المريض والطبيب والحالة الحالية."
          footer={<ResultsFooter page={result.page} pageCount={result.pageCount} total={result.total} query={query} />}
        >
          <table className="admin-users-table patient-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>المريض</th>
                <th>الجوال</th>
                <th>العملية</th>
                <th>الطبيب</th>
                <th>الحالة</th>
                {canManage ? <th>تحديث</th> : null}
              </tr>
            </thead>
            <tbody>
              {result.items.map((appointment) => {
                const isOverdue =
                  (appointment.status === "SCHEDULED" ||
                    appointment.status === "CONFIRMED") &&
                  appointment.appointmentDate.getTime() < now;
                return (
                  <tr key={appointment.id} className="admin-row-hover">
                    <td>
                      {formatDate(appointment.appointmentDate)}
                      {appointment.appointmentTime ? ` · ${appointment.appointmentTime}` : ""}
                      {isOverdue ? (
                        <span className="admin-status-badge is-danger" style={{ marginInlineStart: "0.4rem" }}>
                          متأخر
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <Link href={`/admin/patients/${appointment.patient.id}` as Route}>
                        {appointment.patient.fullNameAr}
                      </Link>
                    </td>
                    <td dir="ltr">{displayPhone(appointment.patient.phone, role)}</td>
                    <td>
                      <Link href={`/admin/patients/procedures/${appointment.procedure.id}` as Route}>
                        {appointment.procedure.customProcedureName ||
                          appointment.procedure.template?.nameAr ||
                          "إجراء طبي"}
                      </Link>
                    </td>
                    <td>{appointment.doctor?.nameAr ?? "—"}</td>
                    <td>
                      <span className="admin-status-badge">
                        {appointmentStatusLabels[appointment.status]}
                      </span>
                    </td>
                    {canManage ? (
                      <td>
                        <div className="patient-inline-actions">
                          {(["CONFIRMED", "COMPLETED", "MISSED", "CANCELLED"] as const)
                            .filter((value) => value !== appointment.status)
                            .map((value) => (
                              <form key={value} action={updateAppointmentStatusAction}>
                                <input type="hidden" name="appointmentId" value={appointment.id} />
                                <input type="hidden" name="patientId" value={appointment.patient.id} />
                                <input type="hidden" name="status" value={value} />
                                <button type="submit" className="admin-btn-ghost">
                                  {appointmentStatusLabels[value]}
                                </button>
                              </form>
                            ))}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTable>
      )}
    </div>
  );
}

function ResultsFooter({
  page,
  pageCount,
  total,
  query,
}: {
  page: number;
  pageCount: number;
  total: number;
  query: (overrides: Record<string, string>) => string;
}) {
  return (
    <nav className="patient-results-footer" aria-label="التنقل بين صفحات المتابعات">
      <span>{total} نتيجة</span>
      <div>
        {page > 1 ? (
          <Link href={query({ page: String(page - 1) }) as Route} className="admin-btn-secondary">
            السابق
          </Link>
        ) : null}
        <span>
          صفحة {page} من {Math.max(pageCount, 1)}
        </span>
        {page < pageCount ? (
          <Link href={query({ page: String(page + 1) }) as Route} className="admin-btn-secondary">
            التالي
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
