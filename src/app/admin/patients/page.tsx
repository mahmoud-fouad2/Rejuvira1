import Link from "next/link";
import type { Route } from "next";
import {
  PatientAccountStatus,
  ProcedureStatus,
} from "@prisma/client";

import { auth } from "@/auth";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { AdminConfirmSubmitButton } from "@/components/admin/AdminConfirmSubmitButton";
import { archivePatientAction, restorePatientAction } from "./actions";
import {
  formatDate,
  patientStatusLabels,
  patientStatusTone,
  procedureStatusLabels,
} from "@/lib/portal/labels";
import { listPatients } from "@/lib/portal/repository";
import { displayPhone, hasPortalCapability } from "@/lib/portal/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function param(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  return typeof value === "string" ? value : "";
}

function buildQuery(
  params: Record<string, string | string[] | undefined>,
  overrides: Record<string, string>,
) {
  const query = new URLSearchParams();
  for (const key of [
    "q",
    "accountStatus",
    "procedureStatus",
    "doctorId",
    "archived",
    "unread",
    "from",
    "to",
    "page",
  ]) {
    const value = param(params, key);
    if (value) query.set(key, value);
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value) query.set(key, value);
    else query.delete(key);
  }
  const qs = query.toString();
  return `/admin/patients${qs ? `?${qs}` : ""}`;
}

export default async function AdminPatientsPage(props: {
  searchParams: SearchParams;
}) {
  const [session, params] = await Promise.all([auth(), props.searchParams]);
  const role = session?.user?.role;
  const canCreate = hasPortalCapability(role, "patients.create");
  const canArchive = hasPortalCapability(role, "patients.archive");

  const page = Math.max(1, Number.parseInt(param(params, "page"), 10) || 1);
  const search = param(params, "q");
  const accountStatus = param(params, "accountStatus");
  const procedureStatus = param(params, "procedureStatus");
  const doctorId = param(params, "doctorId");
  const includeArchived = param(params, "archived") === "1";
  const unread = param(params, "unread") === "1";
  const from = param(params, "from");
  const to = param(params, "to");

  const [result, doctors] = await Promise.all([
    listPatients({
      page,
      search,
      accountStatus:
        accountStatus &&
        (Object.values(PatientAccountStatus) as string[]).includes(
          accountStatus,
        )
          ? (accountStatus as PatientAccountStatus)
          : "ALL",
      procedureStatus:
        procedureStatus &&
        (Object.values(ProcedureStatus) as string[]).includes(procedureStatus)
          ? (procedureStatus as ProcedureStatus)
          : "ALL",
      doctorId: doctorId || "ALL",
      includeArchived,
      hasUnreadMessages: unread,
      from: from || undefined,
      to: to || undefined,
    }),
    prisma.doctor.findMany({
      select: { id: true, nameAr: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>إدارة المرضى</h1>
          <p>
            {result.total} مريض مسجل — بوابة المرضى، العمليات، التعليمات
            والمتابعات.
          </p>
        </div>
        {canCreate ? (
          <div className="admin-page-header__actions">
            <Link
              href={"/admin/patients/new" as Route}
              className="admin-btn-primary"
            >
              إضافة مريض
            </Link>
          </div>
        ) : null}
      </div>

      <PatientsSubNav active="patients" role={role} />

      <section className="admin-panel" style={{ marginBlock: "1rem" }}>
        <form
          method="get"
          className="admin-crm-filter-grid"
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            alignItems: "end",
          }}
        >
          <label className="admin-crm-search-label">
            <span className="admin-field-label">بحث</span>
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="الاسم، رقم الملف أو الجوال"
              className="admin-input"
            />
          </label>
          <label>
            <span className="admin-field-label">حالة الحساب</span>
            <select
              name="accountStatus"
              defaultValue={accountStatus}
              className="admin-input"
            >
              <option value="">الكل</option>
              {Object.entries(patientStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="admin-field-label">حالة العملية</span>
            <select
              name="procedureStatus"
              defaultValue={procedureStatus}
              className="admin-input"
            >
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
          <label
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <input type="checkbox" name="unread" value="1" defaultChecked={unread} />
            <span>رسائل غير مقروءة</span>
          </label>
          <label
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <input
              type="checkbox"
              name="archived"
              value="1"
              defaultChecked={includeArchived}
            />
            <span>عرض المؤرشفين</span>
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="admin-btn-secondary">
              تصفية
            </button>
            <Link href={"/admin/patients" as Route} className="admin-btn-ghost">
              إعادة تعيين
            </Link>
          </div>
        </form>
      </section>

      {result.items.length === 0 ? (
        <div className="admin-empty-state">
          <p>لا يوجد مرضى مطابقون لخيارات البحث الحالية.</p>
          {canCreate ? (
            <Link
              href={"/admin/patients/new" as Route}
              className="admin-btn-primary"
            >
              إضافة أول مريض
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-users-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>المريض</th>
                <th>رقم الملف</th>
                <th>الجوال</th>
                <th>آخر عملية</th>
                <th>الطبيب</th>
                <th>حالة الحساب</th>
                <th>المتابعة القادمة</th>
                <th>آخر دخول</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((patient) => (
                <tr key={patient.id} className="admin-row-hover">
                  <td>
                    <Link
                      href={`/admin/patients/${patient.id}` as Route}
                      style={{ fontWeight: 600 }}
                    >
                      {patient.fullNameAr}
                    </Link>
                    {patient.unreadMessages > 0 ? (
                      <span
                        className="admin-status-badge is-warning"
                        style={{ marginInlineStart: "0.4rem" }}
                      >
                        {patient.unreadMessages} رسالة
                      </span>
                    ) : null}
                  </td>
                  <td dir="ltr">{patient.fileNumber}</td>
                  <td dir="ltr">{displayPhone(patient.phone, role)}</td>
                  <td>
                    {patient.latestProcedure ? (
                      <>
                        {patient.latestProcedure.name}
                        <div className="admin-text-faint" style={{ fontSize: "0.8em" }}>
                          {procedureStatusLabels[patient.latestProcedure.status]}
                          {" · "}
                          {formatDate(patient.latestProcedure.procedureDate)}
                        </div>
                      </>
                    ) : (
                      <span className="admin-text-faint">لا توجد عمليات</span>
                    )}
                  </td>
                  <td>{patient.latestProcedure?.doctorName ?? "—"}</td>
                  <td>
                    <span
                      className={`admin-status-badge ${patientStatusTone[patient.accountStatus]}`}
                    >
                      {patientStatusLabels[patient.accountStatus]}
                    </span>
                  </td>
                  <td>{formatDate(patient.nextAppointment)}</td>
                  <td>{formatDate(patient.lastLoginAt)}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.35rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <Link
                        href={`/admin/patients/${patient.id}` as Route}
                        className="admin-btn-ghost"
                      >
                        فتح الملف
                      </Link>
                      {canArchive ? (
                        patient.archivedAt ? (
                          <form action={restorePatientAction}>
                            <input
                              type="hidden"
                              name="patientId"
                              value={patient.id}
                            />
                            <button type="submit" className="admin-btn-ghost">
                              استعادة
                            </button>
                          </form>
                        ) : (
                          <form action={archivePatientAction}>
                            <input
                              type="hidden"
                              name="patientId"
                              value={patient.id}
                            />
                            <AdminConfirmSubmitButton
                              titleArabic="أرشفة المريض"
                              titleEnglish="Archive patient"
                              messageArabic={`سيتم إخفاء ملف ${patient.fullNameAr} وإيقاف دخوله للبوابة. يمكن استعادته لاحقًا.`}
                              messageEnglish="The patient file will be hidden and portal access disabled. It can be restored later."
                              className="admin-btn-ghost"
                            >
                              أرشفة
                            </AdminConfirmSubmitButton>
                          </form>
                        )
                      ) : null}
                    </div>
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
          aria-label="التنقل بين الصفحات"
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            marginBlock: "1rem",
          }}
        >
          {result.page > 1 ? (
            <Link
              href={buildQuery(params, { page: String(result.page - 1) }) as Route}
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
              href={buildQuery(params, { page: String(result.page + 1) }) as Route}
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
