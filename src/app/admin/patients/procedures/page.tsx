import Link from "next/link";
import type { Route } from "next";
import { ProcedureStatus } from "@prisma/client";

import { auth } from "@/auth";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import {
  formatDate,
  procedureStatusLabels,
  procedureStatusTone,
} from "@/lib/portal/labels";
import { listProcedures } from "@/lib/portal/repository";
import { displayPhone } from "@/lib/portal/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProceduresListPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([auth(), props.searchParams]);
  const role = session?.user?.role;

  const page = Math.max(
    1,
    Number.parseInt(typeof params.page === "string" ? params.page : "", 10) || 1,
  );
  const status = typeof params.status === "string" ? params.status : "";
  const doctorId = typeof params.doctorId === "string" ? params.doctorId : "";
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";

  const [result, doctors] = await Promise.all([
    listProcedures({
      page,
      status:
        status && (Object.values(ProcedureStatus) as string[]).includes(status)
          ? (status as ProcedureStatus)
          : "ALL",
      doctorId: doctorId || "ALL",
      from: from || undefined,
      to: to || undefined,
    }),
    prisma.doctor.findMany({
      select: { id: true, nameAr: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const query = (overrides: Record<string, string>) => {
    const search = new URLSearchParams();
    if (status) search.set("status", status);
    if (doctorId) search.set("doctorId", doctorId);
    if (from) search.set("from", from);
    if (to) search.set("to", to);
    for (const [key, value] of Object.entries(overrides)) {
      if (value) search.set(key, value);
    }
    const qs = search.toString();
    return `/admin/patients/procedures${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>العمليات</h1>
          <p>{result.total} عملية مسجلة عبر جميع المرضى.</p>
        </div>
      </div>
      <PatientsSubNav active="procedures" role={role} />

      <section className="admin-panel" style={{ marginBlock: "1rem" }}>
        <form
          method="get"
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            alignItems: "end",
            padding: "0.9rem",
          }}
        >
          <label>
            <span className="admin-field-label">الحالة</span>
            <select name="status" defaultValue={status} className="admin-input">
              <option value="">الكل</option>
              {Object.entries(procedureStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="admin-field-label">الطبيب</span>
            <select name="doctorId" defaultValue={doctorId} className="admin-input">
              <option value="">الكل</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.nameAr}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="admin-field-label">من تاريخ</span>
            <input type="date" name="from" defaultValue={from} className="admin-input" />
          </label>
          <label>
            <span className="admin-field-label">إلى تاريخ</span>
            <input type="date" name="to" defaultValue={to} className="admin-input" />
          </label>
          <div>
            <button type="submit" className="admin-btn-secondary">
              تصفية
            </button>
          </div>
        </form>
      </section>

      {result.items.length === 0 ? (
        <div className="admin-empty-state">
          <p>لا توجد عمليات مطابقة. تُضاف العمليات من ملف المريض.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-users-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>العملية</th>
                <th>المريض</th>
                <th>الجوال</th>
                <th>الطبيب</th>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((procedure) => (
                <tr key={procedure.id} className="admin-row-hover">
                  <td>
                    {procedure.customProcedureName ||
                      procedure.template?.nameAr ||
                      "إجراء غير مسمى"}
                  </td>
                  <td>
                    <Link href={`/admin/patients/${procedure.patient.id}` as Route}>
                      {procedure.patient.fullNameAr}
                    </Link>
                    <div className="admin-text-faint" style={{ fontSize: "0.8em" }} dir="ltr">
                      {procedure.patient.fileNumber}
                    </div>
                  </td>
                  <td dir="ltr">{displayPhone(procedure.patient.phone, role)}</td>
                  <td>{procedure.doctor?.nameAr || procedure.surgeonName || "—"}</td>
                  <td>{formatDate(procedure.procedureDate)}</td>
                  <td>
                    <span
                      className={`admin-status-badge ${procedureStatusTone[procedure.status]}`}
                    >
                      {procedureStatusLabels[procedure.status]}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/admin/patients/procedures/${procedure.id}` as Route}
                      className="admin-btn-ghost"
                    >
                      إدارة
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.pageCount > 1 ? (
        <nav
          className="admin-pagination"
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            marginBlock: "1rem",
          }}
        >
          {result.page > 1 ? (
            <Link
              href={query({ page: String(result.page - 1) }) as Route}
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
              href={query({ page: String(result.page + 1) }) as Route}
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
