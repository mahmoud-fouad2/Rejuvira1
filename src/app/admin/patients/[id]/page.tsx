import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { PortalActorType } from "@prisma/client";

import { auth } from "@/auth";
import { AdminConfirmSubmitButton } from "@/components/admin/AdminConfirmSubmitButton";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { SendActivationPanel } from "@/components/admin/patients/SendActivationPanel";
import {
  archivePatientAction,
  restorePatientAction,
  setMessageStatusAction,
} from "../actions";
import {
  appointmentStatusLabels,
  feedbackStatusLabels,
  formatDate,
  formatDateTime,
  messageCategoryLabel,
  messageStatusLabels,
  patientStatusLabels,
  patientStatusTone,
  procedureStatusLabels,
  procedureStatusTone,
} from "@/lib/portal/labels";
import { getPatientFile } from "@/lib/portal/repository";
import { writePortalAudit } from "@/lib/portal/audit";
import {
  displayPhone,
  hasPortalCapability,
} from "@/lib/portal/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "procedures", label: "العمليات" },
  { key: "follow-ups", label: "المتابعات" },
  { key: "messages", label: "الرسائل" },
  { key: "documents", label: "المستندات" },
  { key: "feedback", label: "التقييمات" },
  { key: "activity", label: "النشاط" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default async function PatientFilePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params, searchParams] = await Promise.all([
    auth(),
    props.params,
    props.searchParams,
  ]);
  const role = session?.user?.role;

  const patient = await getPatientFile(params.id);
  if (!patient) notFound();

  const canViewNotes = hasPortalCapability(role, "patients.viewInternalNotes");
  const canEdit = hasPortalCapability(role, "patients.edit");
  const canArchive = hasPortalCapability(role, "patients.archive");
  const canActivate = hasPortalCapability(role, "patients.sendActivation");
  const canAddProcedure = hasPortalCapability(role, "procedures.create");
  const canSeeFeedback = hasPortalCapability(role, "feedback.view");
  const canSeeAudit = hasPortalCapability(role, "audit.view");
  const canSeeMessages = hasPortalCapability(role, "messages.view");
  const canSeeDocuments = hasPortalCapability(role, "documents.view");
  const canPrint = hasPortalCapability(role, "pdf.print");

  // Viewing a patient file is a sensitive operation — always audited.
  await writePortalAudit({
    actorType: PortalActorType.STAFF,
    actorId: session?.user?.id,
    actorName: session?.user?.name ?? undefined,
    action: "patient.viewed",
    entityType: "patient",
    entityId: patient.id,
    patientId: patient.id,
  });

  const tabParam = typeof searchParams.tab === "string" ? searchParams.tab : "";
  const activeTab: TabKey = (TABS.some((tab) => tab.key === tabParam)
    ? tabParam
    : "procedures") as TabKey;

  const auditRows = canSeeAudit
    ? await prisma.portalAuditLog.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  const latestProcedure = patient.procedures[0] ?? null;

  return (
    <div className="patient-module-page">
      <div className="admin-page-header">
        <div>
          <h1>{patient.fullNameAr}</h1>
          <p>
            ملف {patient.fileNumber} · {displayPhone(patient.phone, role)} ·{" "}
            <span
              className={`admin-status-badge ${patientStatusTone[patient.accountStatus]}`}
            >
              {patientStatusLabels[patient.accountStatus]}
            </span>
          </p>
        </div>
        <div className="admin-page-header__actions" style={{ flexWrap: "wrap" }}>
          {canAddProcedure ? (
            <Link
              href={`/admin/patients/${patient.id}/add-procedure` as Route}
              className="admin-btn-primary"
            >
              إضافة عملية
            </Link>
          ) : null}
          {canEdit ? (
            <Link
              href={`/admin/patients/${patient.id}/edit` as Route}
              className="admin-btn-secondary"
            >
              تعديل البيانات
            </Link>
          ) : null}
          {canPrint && latestProcedure ? (
            <a
              href={`/api/admin/patients/procedures/${latestProcedure.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="admin-btn-secondary"
            >
              طباعة آخر تعليمات
            </a>
          ) : null}
          {canPrint ? (
            <a
              href={`/api/admin/patients/${patient.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="admin-btn-secondary"
            >
              طباعة ملف المريض
            </a>
          ) : null}
          {canArchive ? (
            patient.archivedAt ? (
              <form action={restorePatientAction}>
                <input type="hidden" name="patientId" value={patient.id} />
                <button type="submit" className="admin-btn-ghost">
                  استعادة من الأرشيف
                </button>
              </form>
            ) : (
              <form action={archivePatientAction}>
                <input type="hidden" name="patientId" value={patient.id} />
                <AdminConfirmSubmitButton
                  titleArabic="أرشفة المريض"
                  titleEnglish="Archive patient"
                  messageArabic="سيتم إخفاء الملف وإيقاف دخول المريض للبوابة. يمكن الاستعادة لاحقًا."
                  messageEnglish="The file will be hidden and portal access disabled."
                  className="admin-btn-ghost"
                >
                  أرشفة
                </AdminConfirmSubmitButton>
              </form>
            )
          ) : null}
        </div>
      </div>

      <PatientsSubNav active="patients" role={role} />

      <section className="patient-profile-hero">
        <div className="admin-card patient-profile-card">
          <strong>البيانات الأساسية</strong>
          <dl className="patient-profile-meta">
            <div>
              <dt>الاسم الإنجليزي</dt>
              <dd>{patient.fullNameEn ?? "—"}</dd>
            </div>
            <div>
              <dt>البريد</dt>
              <dd dir="ltr">{patient.email ?? "—"}</dd>
            </div>
            <div>
              <dt>تاريخ الميلاد</dt>
              <dd>{formatDate(patient.dateOfBirth)}</dd>
            </div>
            <div>
              <dt>الجنس</dt>
              <dd>
                {patient.gender === "MALE"
                  ? "ذكر"
                  : patient.gender === "FEMALE"
                    ? "أنثى"
                    : "—"}
              </dd>
            </div>
            <div>
              <dt>مرافق الطوارئ</dt>
              <dd>
                {patient.emergencyContactName ?? "—"}
                {patient.emergencyContactPhone ? (
                  <span dir="ltr"> · {patient.emergencyContactPhone}</span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt>تاريخ الإنشاء</dt>
              <dd>
                {formatDateTime(patient.createdAt)}
                {patient.createdByName ? ` — ${patient.createdByName}` : ""}
              </dd>
            </div>
            <div>
              <dt>آخر دخول</dt>
              <dd>{formatDateTime(patient.lastLoginAt)}</dd>
            </div>
          </dl>
          {canViewNotes && patient.internalNotes ? (
            <div className="admin-panel-soft" style={{ marginTop: "0.75rem", padding: "0.7rem" }}>
              <span className="admin-field-label">ملاحظات داخلية</span>
              <p style={{ margin: "0.3rem 0 0", whiteSpace: "pre-wrap" }}>
                {patient.internalNotes}
              </p>
            </div>
          ) : null}
        </div>
        {canActivate ? (
          <SendActivationPanel
            patientId={patient.id}
            isActivated={Boolean(patient.account?.activatedAt)}
          />
        ) : null}
      </section>

      <nav className="patient-tabs" aria-label="تبويبات ملف المريض">
        {TABS.filter((tab) => {
          if (tab.key === "feedback" && !canSeeFeedback) return false;
          if (tab.key === "activity" && !canSeeAudit) return false;
          if (tab.key === "messages" && !canSeeMessages) return false;
          if (tab.key === "documents" && !canSeeDocuments) return false;
          return true;
        }).map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/patients/${patient.id}?tab=${tab.key}` as Route}
            className={`patient-tab${tab.key === activeTab ? " is-active" : ""}`}
            aria-current={tab.key === activeTab ? "page" : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {activeTab === "procedures" ? (
        patient.procedures.length === 0 ? (
          <div className="admin-empty-state">
            <p>لا توجد عمليات مسجلة لهذا المريض بعد.</p>
            {canAddProcedure ? (
              <Link
                href={`/admin/patients/${patient.id}/add-procedure` as Route}
                className="admin-btn-primary"
              >
                إضافة أول عملية
              </Link>
            ) : null}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.9rem" }}>
            {patient.procedures.map((procedure) => {
              const name =
                procedure.customProcedureName ||
                procedure.template?.nameAr ||
                "إجراء غير مسمى";
              const checklistDone = procedure.checklistItems.filter(
                (item) => item.patientCompletedAt,
              ).length;
              return (
                <article key={procedure.id} className="admin-card" style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ fontSize: "1.05em" }}>{name}</strong>
                      <p className="admin-text-soft" style={{ margin: "0.25rem 0 0" }}>
                        {procedure.doctor?.nameAr || procedure.surgeonName || "طبيب غير محدد"}
                        {" · "}
                        {formatDate(procedure.procedureDate)}
                        {procedure.procedureTime ? ` · ${procedure.procedureTime}` : ""}
                        {procedure.location ? ` · ${procedure.location}` : ""}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                      <span className={`admin-status-badge ${procedureStatusTone[procedure.status]}`}>
                        {procedureStatusLabels[procedure.status]}
                      </span>
                      <Link
                        href={`/admin/patients/procedures/${procedure.id}` as Route}
                        className="admin-btn-secondary"
                      >
                        إدارة العملية
                      </Link>
                      {canPrint ? (
                        <a
                          href={`/api/admin/patients/procedures/${procedure.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-btn-ghost"
                        >
                          طباعة PDF
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1.25rem",
                      flexWrap: "wrap",
                      marginTop: "0.75rem",
                      fontSize: "0.85em",
                    }}
                    className="admin-text-soft"
                  >
                    <span>
                      التعليمات:{" "}
                      {procedure.instructionsPublishedAt
                        ? `منشورة (إصدار ${procedure.instructionsVersion})`
                        : "غير منشورة"}
                    </span>
                    <span>
                      تأكيد القراءة:{" "}
                      {procedure.instructionsAcknowledgedAt
                        ? `${formatDateTime(procedure.instructionsAcknowledgedAt)} (إصدار ${procedure.acknowledgedVersion ?? "—"})`
                        : "لم يؤكد بعد"}
                    </span>
                    <span>
                      قائمة المهام: {checklistDone}/{procedure.checklistItems.length}
                    </span>
                    <span>المتابعات: {procedure.appointments.length}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : null}

      {activeTab === "follow-ups" ? (
        patient.appointments.length === 0 ? (
          <div className="admin-empty-state">
            <p>لا توجد مواعيد متابعة. تُضاف المتابعات من صفحة إدارة العملية.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-users-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوقت</th>
                  <th>النوع</th>
                  <th>الطبيب</th>
                  <th>الحالة</th>
                  <th>ملاحظات للمريض</th>
                </tr>
              </thead>
              <tbody>
                {patient.appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{formatDate(appointment.appointmentDate)}</td>
                    <td>{appointment.appointmentTime ?? "—"}</td>
                    <td>{appointment.appointmentType ?? "متابعة"}</td>
                    <td>{appointment.doctor?.nameAr ?? "—"}</td>
                    <td>{appointmentStatusLabels[appointment.status]}</td>
                    <td>{appointment.patientVisibleNotes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}

      {activeTab === "messages" && canSeeMessages ? (
        patient.messages.length === 0 ? (
          <div className="admin-empty-state">
            <p>لا توجد رسائل من هذا المريض.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {patient.messages.map((message) => (
              <article
                key={message.id}
                className="admin-card"
                style={{ padding: "0.9rem" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                  <div>
                    <strong>
                      {message.senderType === "PATIENT"
                        ? "المريض"
                        : message.senderUserName || "الفريق"}
                    </strong>{" "}
                    <span className="admin-text-faint">
                      · {messageCategoryLabel(message.category)} ·{" "}
                      {formatDateTime(message.createdAt)}
                    </span>
                    {message.isUrgent ? (
                      <span className="admin-status-badge is-danger" style={{ marginInlineStart: "0.4rem" }}>
                        عاجلة
                      </span>
                    ) : null}
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    <span className="admin-status-badge">
                      {messageStatusLabels[message.status]}
                    </span>
                    {message.senderType === "PATIENT" &&
                    message.status !== "CLOSED" ? (
                      <form action={setMessageStatusAction}>
                        <input type="hidden" name="messageId" value={message.id} />
                        <input type="hidden" name="status" value="CLOSED" />
                        <button type="submit" className="admin-btn-ghost">
                          إغلاق
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
                <p style={{ margin: "0.5rem 0 0", whiteSpace: "pre-wrap" }}>
                  {message.message}
                </p>
                {message.senderType === "PATIENT" ? (
                  <p className="admin-text-faint" style={{ margin: "0.4rem 0 0", fontSize: "0.8em" }}>
                    الرد يتم من صفحة «الرسائل» في إدارة المرضى.
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )
      ) : null}

      {activeTab === "documents" && canSeeDocuments ? (
        patient.documents.length === 0 ? (
          <div className="admin-empty-state">
            <p>لا توجد مستندات مرفوعة لهذا المريض.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-users-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>النوع</th>
                  <th>الظهور للمريض</th>
                  <th>رفع بواسطة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {patient.documents.map((document) => (
                  <tr key={document.id}>
                    <td>{document.title}</td>
                    <td>{document.documentType}</td>
                    <td>
                      {document.visibility === "PATIENT_VISIBLE"
                        ? "يظهر للمريض"
                        : "للفريق فقط"}
                    </td>
                    <td>{document.uploadedByName ?? "—"}</td>
                    <td>{formatDate(document.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}

      {activeTab === "feedback" && canSeeFeedback ? (
        patient.feedback.length === 0 ? (
          <div className="admin-empty-state">
            <p>لم يرسل المريض أي تقييم بعد.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {patient.feedback.map((feedback) => (
              <article key={feedback.id} className="admin-card" style={{ padding: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <strong>التقييم العام: {feedback.overallRating}/5</strong>
                  <span className="admin-status-badge">
                    {feedbackStatusLabels[feedback.status]}
                  </span>
                </div>
                {feedback.comment ? (
                  <p style={{ margin: "0.5rem 0 0", whiteSpace: "pre-wrap" }}>
                    {feedback.comment}
                  </p>
                ) : null}
                <p className="admin-text-faint" style={{ margin: "0.4rem 0 0", fontSize: "0.8em" }}>
                  {formatDateTime(feedback.submittedAt)} · موافقة على التواصل:{" "}
                  {feedback.permissionToContact ? "نعم" : "لا"} · موافقة على
                  النشر بعد إخفاء الهوية:{" "}
                  {feedback.permissionToPublish ? "نعم" : "لا"}
                </p>
              </article>
            ))}
          </div>
        )
      ) : null}

      {activeTab === "activity" && canSeeAudit ? (
        auditRows.length === 0 ? (
          <div className="admin-empty-state">
            <p>لا يوجد نشاط مسجل.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-users-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>الوقت</th>
                  <th>المنفذ</th>
                  <th>الحدث</th>
                </tr>
              </thead>
              <tbody>
                {auditRows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDateTime(row.createdAt)}</td>
                    <td>
                      {row.actorType === "PATIENT"
                        ? "المريض"
                        : row.actorName || "النظام"}
                    </td>
                    <td dir="ltr" style={{ textAlign: "start" }}>
                      {row.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
}
