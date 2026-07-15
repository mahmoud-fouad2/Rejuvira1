import Link from "next/link";
import type { Route } from "next";
import { ProcedureStatus } from "@prisma/client";

import { auth } from "@/auth";
import {
  DataTable,
  EmptyState,
  FilterBar,
  PageHeader,
} from "@/components/admin/patients/PatientDesignSystem";
import { IconCalendar } from "@/components/admin/patients/PatientModuleIcons";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import {
  formatDate,
  procedureStatusLabels,
  procedureStatusTone,
} from "@/lib/portal/labels";
import { displayPhone } from "@/lib/portal/permissions";
import { listProcedures } from "@/lib/portal/repository";
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
      else search.delete(key);
    }
    const qs = search.toString();
    return `/admin/patients/procedures${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="patient-module-page patient-module-page--refined">
      <PageHeader
        eyebrow="Patient Operations"
        title="العمليات"
        description={`${result.total} عملية مسجلة عبر جميع المرضى. راجع الحالة، الطبيب، والتاريخ من جدول واحد واضح.`}
      />
      <PatientsSubNav active="procedures" role={role} />

      <FilterBar
        title="تصفية العمليات"
        description="استخدم الفلاتر للوصول للعملية المطلوبة بدون تمدد أو فراغات غير مفيدة."
      >
        <form method="get" className="patient-filter-grid patient-filter-grid--compact">
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
          <div className="patient-filter-actions">
            <button type="submit" className="admin-btn-secondary">
              تصفية
            </button>
            <Link href={"/admin/patients/procedures" as Route} className="admin-btn-ghost">
              إعادة تعيين
            </Link>
          </div>
        </form>
      </FilterBar>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<IconCalendar />}
          title="لا توجد عمليات مطابقة"
          description="تُضاف العمليات من ملف المريض، وبعد الإضافة ستظهر هنا بتفاصيل الطبيب والحالة والتاريخ."
          action={
            <Link href={"/admin/patients" as Route} className="admin-btn-primary">
              فتح سجل المرضى
            </Link>
          }
        />
      ) : (
        <DataTable
          title="سجل العمليات"
          description="جدول تشغيلي مرتب للعمليات المنشورة أو المجدولة أو قيد الإعداد."
          footer={<ResultsFooter page={result.page} pageCount={result.pageCount} total={result.total} query={query} />}
        >
          <table className="admin-users-table patient-table" style={{ width: "100%" }}>
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
                    <strong>
                      {procedure.customProcedureName ||
                        procedure.template?.nameAr ||
                        "إجراء غير مسمى"}
                    </strong>
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
                    <span className={`admin-status-badge ${procedureStatusTone[procedure.status]}`}>
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
    <nav className="patient-results-footer" aria-label="التنقل بين صفحات العمليات">
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
