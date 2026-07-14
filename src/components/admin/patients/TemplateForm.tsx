"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

import type { PortalActionState } from "@/app/admin/patients/actions";

const initialState: PortalActionState = { status: "idle", message: "" };

export type TemplateFormValues = {
  templateId?: string;
  nameAr?: string;
  nameEn?: string;
  category?: string;
  preOperationContentAr?: string;
  preOperationContentEn?: string;
  operationDayContentAr?: string;
  operationDayContentEn?: string;
  postOperationContentAr?: string;
  postOperationContentEn?: string;
  warningSignsAr?: string;
  warningSignsEn?: string;
  followUpContentAr?: string;
  followUpContentEn?: string;
};

const categories = [
  { value: "face_neck", label: "عمليات الوجه والرقبة" },
  { value: "body", label: "عمليات الجسم" },
  { value: "breast", label: "عمليات الصدر" },
  { value: "feminine", label: "التجميل النسائي" },
  { value: "other", label: "قوالب إضافية" },
];

const sections: {
  arKey: keyof TemplateFormValues;
  enKey: keyof TemplateFormValues;
  label: string;
  rows: number;
}[] = [
  {
    arKey: "preOperationContentAr",
    enKey: "preOperationContentEn",
    label: "قبل العملية",
    rows: 10,
  },
  {
    arKey: "operationDayContentAr",
    enKey: "operationDayContentEn",
    label: "يوم العملية",
    rows: 7,
  },
  {
    arKey: "postOperationContentAr",
    enKey: "postOperationContentEn",
    label: "بعد العملية",
    rows: 10,
  },
  {
    arKey: "warningSignsAr",
    enKey: "warningSignsEn",
    label: "علامات تستدعي التواصل مع المركز",
    rows: 6,
  },
  {
    arKey: "followUpContentAr",
    enKey: "followUpContentEn",
    label: "المتابعة",
    rows: 5,
  },
];

const variableTokens = [
  { label: "اسم المريض", token: "{{patient_name}}" },
  { label: "رقم الملف", token: "{{file_number}}" },
  { label: "اسم العملية", token: "{{procedure_name}}" },
  { label: "تاريخ العملية", token: "{{procedure_date}}" },
  { label: "وقت العملية", token: "{{procedure_time}}" },
  { label: "الطبيب", token: "{{doctor_name}}" },
  { label: "وقت الحضور", token: "{{arrival_time}}" },
  { label: "المتابعة", token: "{{follow_up_date}}" },
  { label: "هاتف المركز", token: "{{clinic_phone}}" },
  { label: "ملاحظات", token: "{{additional_notes}}" },
];

export function TemplateForm({
  action,
  values = {},
  submitLabel,
  editingApproved = false,
}: {
  action: (
    prev: PortalActionState,
    formData: FormData,
  ) => Promise<PortalActionState>;
  values?: TemplateFormValues;
  submitLabel: string;
  editingApproved?: boolean;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [preview, setPreview] = useState<TemplateFormValues>({
    nameAr: values.nameAr ?? "",
    nameEn: values.nameEn ?? "",
    category: values.category ?? "other",
    preOperationContentAr: values.preOperationContentAr ?? "",
    preOperationContentEn: values.preOperationContentEn ?? "",
    operationDayContentAr: values.operationDayContentAr ?? "",
    operationDayContentEn: values.operationDayContentEn ?? "",
    postOperationContentAr: values.postOperationContentAr ?? "",
    postOperationContentEn: values.postOperationContentEn ?? "",
    warningSignsAr: values.warningSignsAr ?? "",
    warningSignsEn: values.warningSignsEn ?? "",
    followUpContentAr: values.followUpContentAr ?? "",
    followUpContentEn: values.followUpContentEn ?? "",
  });

  useEffect(() => {
    if (state.status === "success" && state.payload?.templateId) {
      router.push(
        `/admin/patients/templates/${state.payload.templateId}` as Route,
      );
    }
  }, [state, router]);

  function updatePreview(key: keyof TemplateFormValues, value: string) {
    setPreview((current) => ({ ...current, [key]: value }));
  }

  const previewBlocks = sections
    .map((section) => ({
      label: section.label,
      value: (preview[section.arKey] as string | undefined)?.trim(),
    }))
    .filter(
      (section): section is { label: string; value: string } =>
        Boolean(section.value),
    );

  const selectedCategory =
    categories.find((category) => category.value === preview.category)?.label ??
    "قوالب إضافية";

  return (
    <form action={formAction} className="patient-template-form">
      {values.templateId ? (
        <input type="hidden" name="templateId" value={values.templateId} />
      ) : null}

      {editingApproved ? (
        <p className="admin-status-badge is-warning patient-template-notice">
          هذا القالب معتمد طبيًا. حفظ التعديلات سينشئ إصدارًا جديدًا كمسودة
          تحتاج اعتمادًا، ولن يغيّر تعليمات المرضى الحاليين.
        </p>
      ) : null}

      <div className="patient-template-topline">
        <label>
          <span className="admin-field-label">اسم القالب (عربي) *</span>
          <input
            name="nameAr"
            defaultValue={values.nameAr ?? ""}
            onChange={(event) => updatePreview("nameAr", event.target.value)}
            required
            minLength={3}
            maxLength={200}
            className="admin-input"
          />
        </label>
        <label>
          <span className="admin-field-label">الاسم (إنجليزي)</span>
          <input
            name="nameEn"
            defaultValue={values.nameEn ?? ""}
            onChange={(event) => updatePreview("nameEn", event.target.value)}
            maxLength={200}
            className="admin-input"
            dir="ltr"
          />
        </label>
        <label>
          <span className="admin-field-label">التصنيف *</span>
          <select
            name="category"
            defaultValue={values.category ?? "other"}
            onChange={(event) => updatePreview("category", event.target.value)}
            required
            className="admin-input"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section
        className="patient-template-token-panel"
        aria-label="متغيرات القالب"
      >
        <div>
          <strong>متغيرات جاهزة للإدراج</strong>
          <p>
            استخدمها داخل النصوص وسيتم استبدالها ببيانات المريض والعملية عند
            الإرسال أو الطباعة.
          </p>
        </div>
        <div className="patient-template-token-list">
          {variableTokens.map((item) => (
            <button
              key={item.token}
              type="button"
              className="patient-template-token"
              title={item.token}
            >
              <span>{item.label}</span>
              <code>{item.token}</code>
            </button>
          ))}
        </div>
      </section>

      <div className="patient-template-workspace">
        <div className="patient-template-editor">
          {sections.map((section) => (
            <details
              key={section.arKey}
              open
              className="patient-template-section"
            >
              <summary>
                <span>{section.label}</span>
                <small>عربي + English</small>
              </summary>
              <div className="patient-template-section__body">
                <label>
                  <span className="admin-field-label">المحتوى العربي</span>
                  <textarea
                    name={section.arKey}
                    defaultValue={(values[section.arKey] as string) ?? ""}
                    onChange={(event) =>
                      updatePreview(section.arKey, event.target.value)
                    }
                    rows={section.rows}
                    maxLength={20000}
                    className="admin-input"
                  />
                </label>
                <label>
                  <span className="admin-field-label">المحتوى الإنجليزي</span>
                  <textarea
                    name={section.enKey}
                    defaultValue={(values[section.enKey] as string) ?? ""}
                    onChange={(event) =>
                      updatePreview(section.enKey, event.target.value)
                    }
                    rows={Math.max(3, section.rows - 3)}
                    maxLength={20000}
                    className="admin-input"
                    dir="ltr"
                  />
                </label>
              </div>
            </details>
          ))}
        </div>

        <aside className="patient-template-preview" aria-label="معاينة القالب">
          <div className="patient-template-preview__brand">
            <span>Rejuvera</span>
            <small>Patient Instructions</small>
          </div>
          <div className="patient-template-preview__hero">
            <small>معاينة فورية</small>
            <h3>{preview.nameAr || "اسم القالب"}</h3>
            <p>{selectedCategory}</p>
          </div>
          <div className="patient-template-preview__patient">
            <span>{"{{patient_name}}"}</span>
            <strong>{"{{procedure_name}}"}</strong>
            <small>
              {"{{procedure_date}}"} · {"{{doctor_name}}"}
            </small>
          </div>
          <div className="patient-template-preview__sections">
            {previewBlocks.length > 0 ? (
              previewBlocks.slice(0, 4).map((section) => (
                <article key={section.label}>
                  <strong>{section.label}</strong>
                  <p>{section.value}</p>
                </article>
              ))
            ) : (
              <article>
                <strong>ابدأ بكتابة التعليمات</strong>
                <p>
                  ستظهر هنا معاينة قريبة من شكل القالب داخل بوابة المريض
                  ومستندات PDF.
                </p>
              </article>
            )}
          </div>
        </aside>
      </div>

      {state.message ? (
        <p
          role="status"
          className={
            state.status === "success"
              ? "admin-status-badge is-success"
              : "admin-status-badge is-danger"
          }
          style={{ padding: "0.6rem 0.9rem", whiteSpace: "normal" }}
        >
          {state.message}
        </p>
      ) : null}

      <div className="patient-template-submitbar">
        <button type="submit" className="admin-btn-primary" disabled={isPending}>
          {isPending ? "جاري الحفظ..." : submitLabel}
        </button>
        <span>
          يتم حفظ التعديلات بنفس آلية الإنتاج الحالية بدون تغيير بيانات المرضى
          المنشورة.
        </span>
      </div>
    </form>
  );
}
