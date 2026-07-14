import Link from "next/link";
import type { Route } from "next";
import { AppointmentStatus } from "@prisma/client";

import { auth } from "@/auth";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { updateAppointmentStatusAction } from "../actions";
import {
  appointmentStatusLabels,
  formatDate,
} from "@/lib/portal/labels";
import { listAppointments } from "@/lib/portal/repository";
import { displayPhone, hasPortalCapability } from "@/lib/portal/permissions";

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

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>المتابعات</h1>
          <p>{result.total} موعد متابعة.</p>
        </div>
      </div>
      <PatientsSubNav active="follow-ups" role={role} />

      <section className="admin-panel" style={{ marginBlock: "1rem" }}>
        <form
          method="get"
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            alignItems: "end",
            padding: "0.9rem",
          }}
        >
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
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <input type="checkbox" name="overdue" value="1" defaultChecked={overdue} />
            <span>المتأخرة فقط</span>
          </label>
          <button type="submit" className="admin-btn-secondary">
            تصفية
          </button>
        </form>
      </section>

      {result.items.length === 0 ? (
        <div className="admin-empty-state">
          <p>لا توجد مواعيد متابعة مطابقة.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-users-table" style={{ width: "100%" }}>
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
                      {appointment.appointmentTime
                        ? ` · ${appointment.appointmentTime}`
                        : ""}
                      {isOverdue ? (
                        <span
                          className="admin-status-badge is-danger"
                          style={{ marginInlineStart: "0.4rem" }}
                        >
                          متأخر
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <Link href={`/admin/patients/${appointment.patient.id}` as Route}>
                        {appointment.patient.fullNameAr}
                      </Link>
                    </td>
                    <td dir="ltr">
                      {displayPhone(appointment.patient.phone, role)}
                    </td>
                    <td>
                      <Link
                        href={
                          `/admin/patients/procedures/${appointment.procedure.id}` as Route
                        }
                      >
                        {appointment.procedure.customProcedureName ||
                          appointment.procedure.template?.nameAr ||
                          "إجراء"}
                      </Link>
                    </td>
                    <td>{appointment.doctor?.nameAr ?? "—"}</td>
                    <td>{appointmentStatusLabels[appointment.status]}</td>
                    {canManage ? (
                      <td>
                        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                          {(
                            ["CONFIRMED", "COMPLETED", "MISSED", "CANCELLED"] as const
                          )
                            .filter((value) => value !== appointment.status)
                            .map((value) => (
                              <form key={value} action={updateAppointmentStatusAction}>
                                <input
                                  type="hidden"
                                  name="appointmentId"
                                  value={appointment.id}
                                />
                                <input
                                  type="hidden"
                                  name="patientId"
                                  value={appointment.patient.id}
                                />
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
        </div>
      )}

      {result.pageCount > 1 ? (
        <nav
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            marginBlock: "1rem",
          }}
        >
          {result.page > 1 ? (
            <Link
              href={`/admin/patients/follow-ups?page=${result.page - 1}${status ? `&status=${status}` : ""}${overdue ? "&overdue=1" : ""}` as Route}
              className="admin-btn-secondary"
            >
              السابق
            </Link>
          ) : null}
          <span style={{ alignSelf: "center" }}>
            صفحة {result.page} من {result.pageCount}
          </span>
          {result.page < result.pageCount ? (
            <Link
              href={`/admin/patients/follow-ups?page=${result.page + 1}${status ? `&status=${status}` : ""}${overdue ? "&overdue=1" : ""}` as Route}
              className="admin-btn-secondary"
            >
              التالي
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
