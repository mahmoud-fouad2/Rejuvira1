import Link from "next/link";
import type { Route } from "next";
import {
  AppointmentStatus,
  FeedbackStatus,
  MessageSenderType,
  MessageStatus,
  PatientAccountStatus,
  ProcedureStatus,
} from "@prisma/client";

import { auth } from "@/auth";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { PatientForm } from "@/components/admin/patients/PatientForm";
import {
  IconUsers,
  IconUserAlert,
  IconCalendar,
  IconMessage,
  IconStar,
  IconClockAlert,
  IconInbox,
  IconKey,
  IconDownload,
} from "@/components/admin/patients/PatientModuleIcons";
import { AdminConfirmSubmitButton } from "@/components/admin/AdminConfirmSubmitButton";
import {
  archivePatientAction,
  createPatientAction,
  restorePatientAction,
} from "./actions";
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

function buildExportHref(
  params: Record<string, string | string[] | undefined>,
  format: "csv" | "pdf",
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
  ]) {
    const value = param(params, key);
    if (value) query.set(key, value);
  }
  query.set("format", format);
  return `/api/admin/patients/export?${query.toString()}`;
}

export default async function AdminPatientsPage(props: {
  searchParams: SearchParams;
}) {
  const [session, params] = await Promise.all([auth(), props.searchParams]);
  const role = session?.user?.role;
  const canCreate = hasPortalCapability(role, "patients.create");
  const canArchive = hasPortalCapability(role, "patients.archive");
  const canActivate = hasPortalCapability(role, "patients.sendActivation");
  const canAddProcedure = hasPortalCapability(role, "procedures.create");
  const canExport = hasPortalCapability(role, "stats.export");
  const canPrintPatient = hasPortalCapability(role, "pdf.print");

  const page = Math.max(1, Number.parseInt(param(params, "page"), 10) || 1);
  const search = param(params, "q");
  const accountStatus = param(params, "accountStatus");
  const procedureStatus = param(params, "procedureStatus");
  const doctorId = param(params, "doctorId");
  const includeArchived = param(params, "archived") === "1";
  const unread = param(params, "unread") === "1";
  const showAddModal = param(params, "add") === "1";
  const from = param(params, "from");
  const to = param(params, "to");

  const [result, doctors, stats] = await Promise.all([
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
    prisma.$transaction(async (tx) => {
      const now = new Date();
      const [
        totalPatients,
        inactivePatients,
        upcomingProcedures,
        unreadMessages,
        newFeedback,
        overdueFollowUps,
      ] = await Promise.all([
        tx.patient.count({ where: { archivedAt: null } }),
        tx.patient.count({
          where: {
            archivedAt: null,
            accountStatus: { not: PatientAccountStatus.ACTIVE },
          },
        }),
        tx.procedure.count({
          where: {
            archivedAt: null,
            status: { in: [ProcedureStatus.SCHEDULED, ProcedureStatus.DRAFT] },
            procedureDate: { gte: now },
          },
        }),
        tx.patientMessage.count({
          where: {
            senderType: MessageSenderType.PATIENT,
            status: MessageStatus.UNREAD,
          },
        }),
        tx.patientFeedback.count({
          where: { status: FeedbackStatus.NEW },
        }),
        tx.followUpAppointment.count({
          where: {
            status: {
              in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
            },
            appointmentDate: { lt: now },
          },
        }),
      ]);
      return {
        totalPatients,
        inactivePatients,
        upcomingProcedures,
        unreadMessages,
        newFeedback,
        overdueFollowUps,
      };
    }),
  ]);

  return (
    <div className="patient-module-page">
      <div className="admin-page-header">
        <div>
          <h1>إدارة المرضى</h1>
          <p>
            {result.total} مريض مسجل — بوابة المرضى، العمليات، التعليمات
            والمتابعات.
          </p>
        </div>
        {canCreate || canExport ? (
          <div className="admin-page-header__actions">
            {canCreate ? (
              <Link
                href={buildQuery(params, { add: "1" }) as Route}
                className="admin-btn-primary"
              >
                إضافة مريض جديد
              </Link>
            ) : null}
            {canExport ? (
              <>
                <a
                  href={buildExportHref(params, "csv")}
                  className="admin-btn-secondary"
                >
                  تصدير Excel
                </a>
                <a
                  href={buildExportHref(params, "pdf")}
                  className="admin-btn-secondary"
                >
                  طباعة PDF
                </a>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <PatientsSubNav active="patients" role={role} />

      <section className="patient-kpi-grid" aria-label="مؤشرات إدارة المرضى">
        <article className="patient-kpi-card">
          <span className="patient-kpi-card__icon" aria-hidden="true"><IconUsers /></span>
          <span>إجمالي المرضى</span>
          <strong>{stats.totalPatients}</strong>
          <small>ملفات نشطة وغير مؤرشفة</small>
        </article>
        <article className="patient-kpi-card">
          <span className="patient-kpi-card__icon" aria-hidden="true"><IconUserAlert /></span>
          <span>مرضى غير مفعلين</span>
          <strong>{stats.inactivePatients}</strong>
          <small>تحتاج متابعة تفعيل</small>
        </article>
        <article className="patient-kpi-card">
          <span className="patient-kpi-card__icon" aria-hidden="true"><IconCalendar /></span>
          <span>عمليات قادمة</span>
          <strong>{stats.upcomingProcedures}</strong>
          <small>مجدولة أو مسودة بتاريخ قادم</small>
        </article>
        <article className="patient-kpi-card">
          <span className="patient-kpi-card__icon" aria-hidden="true"><IconMessage /></span>
          <span>رسائل غير مقروءة</span>
          <strong>{stats.unreadMessages}</strong>
          <small>من المرضى للإدارة</small>
        </article>
        <article className="patient-kpi-card">
          <span className="patient-kpi-card__icon" aria-hidden="true"><IconStar /></span>
          <span>تقييمات جديدة</span>
          <strong>{stats.newFeedback}</strong>
          <small>بانتظار المراجعة</small>
        </article>
        <article className="patient-kpi-card">
          <span className="patient-kpi-card__icon" aria-hidden="true"><IconClockAlert /></span>
          <span>متابعات متأخرة</span>
          <strong>{stats.overdueFollowUps}</strong>
          <small>مواعيد لم تغلق بعد</small>
        </article>
      </section>

      <section className="patient-ops-board" aria-label="مركز تشغيل إدارة المرضى">
        <article className="patient-ops-card patient-ops-card--primary">
          <span className="patient-ops-card__icon" aria-hidden="true"><IconInbox /></span>
          <div>
            <strong>ابدأ من الملفات المهمة</strong>
            <p>
              راجع الرسائل الجديدة والحسابات التي تحتاج تفعيل والمتابعات المتأخرة أولًا.
            </p>
          </div>
          <Link href={buildQuery(params, { unread: "1", page: "" }) as Route}>
            عرض الرسائل
          </Link>
        </article>
        <article className="patient-ops-card">
          <span className="patient-ops-card__icon" aria-hidden="true"><IconKey /></span>
          <div>
            <strong>تفعيل حسابات المرضى</strong>
            <p>تابع الحسابات غير المفعلة وأرسل رابط دخول آمن من ملف المريض.</p>
          </div>
          <Link
            href={
              buildQuery(params, {
                accountStatus: PatientAccountStatus.PENDING,
                page: "",
              }) as Route
            }
          >
            مراجعة التفعيل
          </Link>
        </article>
        <article className="patient-ops-card">
          <span className="patient-ops-card__icon" aria-hidden="true"><IconDownload /></span>
          <div>
            <strong>تصدير التقارير</strong>
            <p>نزّل النتائج الحالية Excel أو PDF بترويسة Rejuvera.</p>
          </div>
          {canExport ? <a href={buildExportHref(params, "pdf")}>طباعة PDF</a> : null}
        </article>
      </section>

      <section className="admin-card patient-filter-card">
        <div className="admin-card__header">
          <div>
            <strong className="admin-card__title">بحث سريع في المرضى</strong>
            <p className="admin-text-soft" style={{ margin: "0.15rem 0 0" }}>
              ابحث بالاسم أو رقم الملف، ثم أضف الفلاتر عند الحاجة.
            </p>
          </div>
        </div>
        <form
          method="get"
          className="patient-filter-grid"
          style={{ padding: "0.78rem" }}
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
          <div className="patient-filter-actions">
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
        <div className="admin-card patient-table-card">
          <div className="admin-card__header">
            <div>
              <strong className="admin-card__title">سجل المرضى</strong>
              <p className="admin-text-soft" style={{ margin: "0.15rem 0 0" }}>
                كل ملف مع حالته وأزراره الأساسية في صف واحد.
              </p>
            </div>
          </div>
          <div className="admin-table-wrap patient-table-wrap">
          <table className="admin-users-table patient-table" style={{ width: "100%" }}>
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
                          <div className="patient-row-actions" aria-label="إجراءات المريض">
                            <Link href={`/admin/patients/${patient.id}` as Route}>
                              فتح الملف
                            </Link>
                            {canPrintPatient ? (
                              <a
                                href={`/api/admin/patients/${patient.id}/pdf`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                ملف المريض PDF
                              </a>
                            ) : null}
                            {canAddProcedure ? (
                              <Link
                                href={
                                  `/admin/patients/${patient.id}/add-procedure` as Route
                                }
                              >
                                إضافة عملية
                              </Link>
                            ) : null}
                            {canActivate ? (
                              <Link href={`/admin/patients/${patient.id}` as Route}>
                                إرسال رابط التفعيل
                              </Link>
                            ) : null}
                            {patient.latestProcedure ? (
                              <a
                                href={`/api/admin/patients/procedures/${patient.latestProcedure.id}/pdf`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                طباعة تعليمات PDF
                              </a>
                            ) : null}
                            {canArchive ? (
                              patient.archivedAt ? (
                                <form action={restorePatientAction}>
                                  <input
                                    type="hidden"
                                    name="patientId"
                                    value={patient.id}
                                  />
                                  <button type="submit">استعادة</button>
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
      {showAddModal && canCreate ? (
        <div className="admin-modal-backdrop patient-modal-backdrop" role="dialog" aria-modal="true">
          <section className="admin-card patient-modal">
            <div className="admin-card__header">
              <div>
                <strong className="admin-card__title">إضافة مريض جديد</strong>
                <p className="admin-text-soft" style={{ margin: "0.15rem 0 0" }}>
                  أدخل بيانات المريض الأساسية، وسيتم توليد رقم الملف تلقائيًا عند تركه فارغًا.
                </p>
              </div>
              <Link href={"/admin/patients" as Route} className="admin-btn-ghost">
                إغلاق
              </Link>
            </div>
            <div className="admin-card__body">
              <PatientForm
                action={createPatientAction}
                submitLabel="حفظ المريض وفتح الملف"
              />
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
