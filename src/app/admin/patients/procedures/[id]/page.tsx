import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { AppointmentForm } from "@/components/admin/patients/AppointmentForm";
import { ChecklistItemForm } from "@/components/admin/patients/ChecklistItemForm";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { ProcedureForm } from "@/components/admin/patients/ProcedureForm";
import {
  deleteChecklistItemAction,
  publishInstructionsAction,
  updateAppointmentStatusAction,
  updateProcedureAction,
  verifyChecklistItemAction,
} from "../../actions";
import {
  appointmentStatusLabels,
  checklistPhaseLabels,
  formatDate,
  formatDateTime,
  procedureStatusLabels,
  procedureStatusTone,
} from "@/lib/portal/labels";
import { getProcedureWithPatient } from "@/lib/portal/repository";
import { hasPortalCapability } from "@/lib/portal/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProcedureManagePage(props: {
  params: Promise<{ id: string }>;
}) {
  const [session, params] = await Promise.all([auth(), props.params]);
  const role = session?.user?.role;

  const procedure = await getProcedureWithPatient(params.id);
  if (!procedure || procedure.archivedAt) notFound();

  const canEdit = hasPortalCapability(role, "procedures.edit");
  const canEditInstructions = hasPortalCapability(
    role,
    "procedures.editInstructions",
  );
  const canPublish = hasPortalCapability(role, "procedures.publishInstructions");
  const canManageFollowUps = hasPortalCapability(role, "followUps.manage");
  const canSeeStaffNotes = hasPortalCapability(role, "procedures.viewStaffNotes");
  const canPrint = hasPortalCapability(role, "pdf.print");

  const doctors = await prisma.doctor.findMany({
    select: { id: true, nameAr: true },
    orderBy: { sortOrder: "asc" },
  });

  const name =
    procedure.customProcedureName ||
    procedure.template?.nameAr ||
    "إجراء غير مسمى";

  const hasInstructions = Boolean(
    procedure.preOperationInstructions ||
      procedure.operationDayInstructions ||
      procedure.postOperationInstructions ||
      procedure.warningSigns ||
      procedure.followUpInstructions,
  );
  const needsRepublish =
    procedure.instructionsPublishedAt &&
    procedure.instructionsAcknowledgedAt &&
    (procedure.acknowledgedVersion ?? 0) < procedure.instructionsVersion;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>{name}</h1>
          <p>
            المريض{" "}
            <Link href={`/admin/patients/${procedure.patient.id}` as Route}>
              {procedure.patient.fullNameAr}
            </Link>{" "}
            — ملف {procedure.patient.fileNumber} ·{" "}
            <span
              className={`admin-status-badge ${procedureStatusTone[procedure.status]}`}
            >
              {procedureStatusLabels[procedure.status]}
            </span>
          </p>
        </div>
        <div className="admin-page-header__actions" style={{ flexWrap: "wrap" }}>
          {canPrint ? (
            <a
              href={`/api/admin/patients/procedures/${procedure.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="admin-btn-secondary"
            >
              طباعة تعليمات المريض
            </a>
          ) : null}
          {canPublish && hasInstructions ? (
            <form action={publishInstructionsAction}>
              <input type="hidden" name="procedureId" value={procedure.id} />
              <input
                type="hidden"
                name="patientId"
                value={procedure.patient.id}
              />
              <button type="submit" className="admin-btn-primary">
                {procedure.instructionsPublishedAt
                  ? "إعادة نشر التعليمات"
                  : "نشر التعليمات للمريض"}
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <PatientsSubNav active="procedures" role={role} />

      <section
        className="admin-panel-soft"
        style={{
          marginBlock: "1rem",
          padding: "0.9rem",
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          fontSize: "0.9em",
        }}
      >
        <span>
          التعليمات:{" "}
          {procedure.instructionsPublishedAt ? (
            <strong className="admin-success">
              منشورة — إصدار {procedure.instructionsVersion} (
              {formatDateTime(procedure.instructionsPublishedAt)})
            </strong>
          ) : (
            <strong className="admin-warning">غير منشورة — لا يراها المريض بعد</strong>
          )}
        </span>
        <span>
          تأكيد قراءة المريض:{" "}
          {procedure.instructionsAcknowledgedAt ? (
            <strong>
              {formatDateTime(procedure.instructionsAcknowledgedAt)} — إصدار{" "}
              {procedure.acknowledgedVersion ?? "—"}
            </strong>
          ) : (
            <strong className="admin-warning">لم يؤكد بعد</strong>
          )}
        </span>
        {procedure.template ? (
          <span>
            القالب المصدر: {procedure.template.nameAr} (إصدار{" "}
            {procedure.templateVersion ?? procedure.template.version})
          </span>
        ) : null}
        {needsRepublish ? (
          <span className="admin-status-badge is-warning">
            التعليمات عُدّلت بعد آخر تأكيد — سيُطلب من المريض إعادة الاطلاع
          </span>
        ) : null}
      </section>

      {canEdit ? (
        <section className="admin-panel" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
          <h2 style={{ marginTop: 0 }}>بيانات العملية والتعليمات</h2>
          <ProcedureForm
            action={updateProcedureAction}
            submitLabel="حفظ التعديلات"
            showInstructionFields
            canEditInstructions={canEditInstructions}
            canEditStaffNotes={canSeeStaffNotes}
            values={{
              procedureId: procedure.id,
              patientId: procedure.patient.id,
              customProcedureName: procedure.customProcedureName ?? "",
              category: procedure.category ?? "",
              doctorId: procedure.doctor?.id ?? "",
              surgeonName: procedure.surgeonName ?? "",
              procedureDate: procedure.procedureDate
                ? procedure.procedureDate.toISOString().slice(0, 10)
                : "",
              procedureTime: procedure.procedureTime ?? "",
              arrivalTime: procedure.arrivalTime ?? "",
              location: procedure.location ?? "",
              status: procedure.status,
              patientVisibleNotes: procedure.patientVisibleNotes ?? "",
              privateStaffNotes: canSeeStaffNotes
                ? (procedure.privateStaffNotes ?? "")
                : "",
              preOperationInstructions:
                procedure.preOperationInstructions ?? "",
              operationDayInstructions:
                procedure.operationDayInstructions ?? "",
              postOperationInstructions:
                procedure.postOperationInstructions ?? "",
              warningSigns: procedure.warningSigns ?? "",
              followUpInstructions: procedure.followUpInstructions ?? "",
            }}
            templates={[]}
            doctors={doctors.map((doctor) => ({
              id: doctor.id,
              label: doctor.nameAr,
            }))}
          />
        </section>
      ) : null}

      <section className="admin-panel" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>قائمة مهام المريض</h2>
        {procedure.checklistItems.length === 0 ? (
          <p className="admin-text-soft">لا توجد مهام بعد.</p>
        ) : (
          <div className="admin-table-wrap" style={{ marginBottom: "1rem" }}>
            <table className="admin-users-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>المهمة</th>
                  <th>المرحلة</th>
                  <th>الاستحقاق</th>
                  <th>إلزامية</th>
                  <th>أكملها المريض</th>
                  <th>تحقق الفريق</th>
                  {canManageFollowUps ? <th>إجراءات</th> : null}
                </tr>
              </thead>
              <tbody>
                {procedure.checklistItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{checklistPhaseLabels[item.phase]}</td>
                    <td>{formatDate(item.dueDate)}</td>
                    <td>{item.isRequired ? "نعم" : "لا"}</td>
                    <td>
                      {item.patientCompletedAt
                        ? formatDateTime(item.patientCompletedAt)
                        : "—"}
                    </td>
                    <td>
                      {item.staffVerifiedAt
                        ? formatDateTime(item.staffVerifiedAt)
                        : "—"}
                    </td>
                    {canManageFollowUps ? (
                      <td>
                        <div style={{ display: "flex", gap: "0.35rem" }}>
                          <form action={verifyChecklistItemAction}>
                            <input type="hidden" name="itemId" value={item.id} />
                            <input
                              type="hidden"
                              name="procedureId"
                              value={procedure.id}
                            />
                            <input
                              type="hidden"
                              name="verified"
                              value={item.staffVerifiedAt ? "0" : "1"}
                            />
                            <button type="submit" className="admin-btn-ghost">
                              {item.staffVerifiedAt ? "إلغاء التحقق" : "تحقق"}
                            </button>
                          </form>
                          <form action={deleteChecklistItemAction}>
                            <input type="hidden" name="itemId" value={item.id} />
                            <input
                              type="hidden"
                              name="procedureId"
                              value={procedure.id}
                            />
                            <button type="submit" className="admin-btn-ghost">
                              حذف
                            </button>
                          </form>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {canManageFollowUps ? (
          <ChecklistItemForm
            procedureId={procedure.id}
            patientId={procedure.patient.id}
          />
        ) : null}
      </section>

      <section className="admin-panel" style={{ padding: "1.25rem" }}>
        <h2 style={{ marginTop: 0 }}>مواعيد المتابعة</h2>
        {procedure.appointments.length === 0 ? (
          <p className="admin-text-soft">لا توجد مواعيد متابعة بعد.</p>
        ) : (
          <div className="admin-table-wrap" style={{ marginBottom: "1rem" }}>
            <table className="admin-users-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوقت</th>
                  <th>النوع</th>
                  <th>الحالة</th>
                  {canManageFollowUps ? <th>تغيير الحالة</th> : null}
                </tr>
              </thead>
              <tbody>
                {procedure.appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{formatDate(appointment.appointmentDate)}</td>
                    <td>{appointment.appointmentTime ?? "—"}</td>
                    <td>{appointment.appointmentType ?? "متابعة"}</td>
                    <td>{appointmentStatusLabels[appointment.status]}</td>
                    {canManageFollowUps ? (
                      <td>
                        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                          {(
                            ["CONFIRMED", "COMPLETED", "MISSED", "CANCELLED"] as const
                          )
                            .filter((status) => status !== appointment.status)
                            .map((status) => (
                              <form
                                key={status}
                                action={updateAppointmentStatusAction}
                              >
                                <input
                                  type="hidden"
                                  name="appointmentId"
                                  value={appointment.id}
                                />
                                <input
                                  type="hidden"
                                  name="patientId"
                                  value={procedure.patient.id}
                                />
                                <input type="hidden" name="status" value={status} />
                                <button type="submit" className="admin-btn-ghost">
                                  {appointmentStatusLabels[status]}
                                </button>
                              </form>
                            ))}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {canManageFollowUps ? (
          <AppointmentForm
            procedureId={procedure.id}
            patientId={procedure.patient.id}
            doctors={doctors.map((doctor) => ({
              id: doctor.id,
              label: doctor.nameAr,
            }))}
          />
        ) : null}
      </section>
    </>
  );
}
