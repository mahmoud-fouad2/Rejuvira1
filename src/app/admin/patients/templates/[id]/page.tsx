import { notFound, redirect } from "next/navigation";
import { TemplateStatus } from "@prisma/client";

import { auth } from "@/auth";
import { AdminConfirmSubmitButton } from "@/components/admin/AdminConfirmSubmitButton";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { TemplateForm } from "@/components/admin/patients/TemplateForm";
import {
  approveTemplateAction,
  archiveTemplateAction,
  updateTemplateAction,
} from "../../actions";
import {
  formatDateTime,
  templateCategoryLabel,
  templateStatusLabels,
} from "@/lib/portal/labels";
import { getTemplate } from "@/lib/portal/repository";
import { hasPortalCapability } from "@/lib/portal/permissions";

export const dynamic = "force-dynamic";

export default async function TemplateDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const [session, params] = await Promise.all([auth(), props.params]);
  const role = session?.user?.role;
  if (!hasPortalCapability(role, "templates.view")) {
    redirect("/forbidden");
  }
  const canEdit = hasPortalCapability(role, "templates.edit");
  const canApprove = hasPortalCapability(role, "templates.approve");

  const template = await getTemplate(params.id);
  if (!template) notFound();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>{template.nameAr}</h1>
          <p>
            {templateCategoryLabel(template.category)} · إصدار {template.version}{" "}
            ·{" "}
            <span
              className={`admin-status-badge ${
                template.status === TemplateStatus.MEDICALLY_APPROVED
                  ? "is-success"
                  : template.status === TemplateStatus.DRAFT
                    ? "is-warning"
                    : "is-muted"
              }`}
            >
              {templateStatusLabels[template.status]}
            </span>
            {template.approvedByName
              ? ` — اعتمده ${template.approvedByName} (${formatDateTime(template.approvedAt)})`
              : ""}
          </p>
        </div>
        <div className="admin-page-header__actions" style={{ flexWrap: "wrap" }}>
          {canApprove && template.status === TemplateStatus.DRAFT ? (
            <form action={approveTemplateAction}>
              <input type="hidden" name="templateId" value={template.id} />
              <AdminConfirmSubmitButton
                titleArabic="اعتماد القالب طبيًا"
                titleEnglish="Medically approve template"
                messageArabic="بالاعتماد تُصبح هذه التعليمات متاحة للاستخدام مع المرضى، وتُؤرشف النسخ المعتمدة السابقة من نفس القالب."
                messageEnglish="Approval makes these instructions available for patient use."
                className="admin-btn-primary"
                confirmArabic="اعتماد"
              >
                اعتماد طبي
              </AdminConfirmSubmitButton>
            </form>
          ) : null}
          {canApprove && template.status !== TemplateStatus.ARCHIVED ? (
            <form action={archiveTemplateAction}>
              <input type="hidden" name="templateId" value={template.id} />
              <AdminConfirmSubmitButton
                titleArabic="أرشفة القالب"
                titleEnglish="Archive template"
                messageArabic="لن يظهر القالب عند إضافة عمليات جديدة. تعليمات المرضى الحالية لا تتأثر."
                messageEnglish="The template will no longer be offered for new procedures."
                className="admin-btn-ghost"
              >
                أرشفة
              </AdminConfirmSubmitButton>
            </form>
          ) : null}
        </div>
      </div>
      <PatientsSubNav active="templates" role={role} />

      <section className="admin-panel" style={{ marginTop: "1rem", padding: "1.25rem" }}>
        {canEdit ? (
          <TemplateForm
            action={updateTemplateAction}
            submitLabel={
              template.status === TemplateStatus.MEDICALLY_APPROVED
                ? "حفظ كإصدار جديد (مسودة)"
                : "حفظ القالب"
            }
            editingApproved={template.status === TemplateStatus.MEDICALLY_APPROVED}
            values={{
              templateId: template.id,
              nameAr: template.nameAr,
              nameEn: template.nameEn ?? "",
              category: template.category,
              preOperationContentAr: template.preOperationContentAr ?? "",
              preOperationContentEn: template.preOperationContentEn ?? "",
              operationDayContentAr: template.operationDayContentAr ?? "",
              operationDayContentEn: template.operationDayContentEn ?? "",
              postOperationContentAr: template.postOperationContentAr ?? "",
              postOperationContentEn: template.postOperationContentEn ?? "",
              warningSignsAr: template.warningSignsAr ?? "",
              warningSignsEn: template.warningSignsEn ?? "",
              followUpContentAr: template.followUpContentAr ?? "",
              followUpContentEn: template.followUpContentEn ?? "",
            }}
          />
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {[
              { label: "قبل العملية", value: template.preOperationContentAr },
              { label: "يوم العملية", value: template.operationDayContentAr },
              { label: "بعد العملية", value: template.postOperationContentAr },
              { label: "علامات تستدعي التواصل", value: template.warningSignsAr },
              { label: "المتابعة", value: template.followUpContentAr },
            ].map((section) => (
              <div key={section.label}>
                <h3 style={{ margin: "0 0 0.4rem" }}>{section.label}</h3>
                <p className="admin-panel-soft" style={{ padding: "0.8rem", whiteSpace: "pre-wrap", margin: 0 }}>
                  {section.value || "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
