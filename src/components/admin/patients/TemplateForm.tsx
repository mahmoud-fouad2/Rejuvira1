"use client";

import { useActionState, useEffect } from "react";
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

  useEffect(() => {
    if (state.status === "success" && state.payload?.templateId) {
      router.push(
        `/admin/patients/templates/${state.payload.templateId}` as Route,
      );
    }
  }, [state, router]);

  return (
    <form action={formAction} style={{ display: "grid", gap: "1rem" }}>
      {values.templateId ? (
        <input type="hidden" name="templateId" value={values.templateId} />
      ) : null}

      {editingApproved ? (
        <p className="admin-status-badge is-warning" style={{ whiteSpace: "normal" }}>
          هذا القالب معتمد طبيًا — حفظ التعديلات سينشئ إصدارًا جديدًا كمسودة
          تحتاج اعتمادًا، ولن يغيّر تعليمات المرضى الحاليين.
        </p>
      ) : null}

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <label>
          <span className="admin-field-label">اسم القالب (عربي) *</span>
          <input
            name="nameAr"
            defaultValue={values.nameAr ?? ""}
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

      <p className="admin-text-soft" style={{ margin: 0, fontSize: "0.85em" }}>
        الحقول المتغيرة المتاحة: {"{{patient_name}} {{file_number}} {{procedure_name}} {{procedure_date}} {{procedure_time}} {{doctor_name}} {{arrival_time}} {{follow_up_date}} {{clinic_phone}} {{additional_notes}}"}
      </p>

      {sections.map((section) => (
        <details key={section.arKey} open className="admin-panel-soft" style={{ padding: "0.9rem" }}>
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>
            {section.label}
          </summary>
          <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
            <label>
              <span className="admin-field-label">المحتوى العربي</span>
              <textarea
                name={section.arKey}
                defaultValue={(values[section.arKey] as string) ?? ""}
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
                rows={Math.max(3, section.rows - 3)}
                maxLength={20000}
                className="admin-input"
                dir="ltr"
              />
            </label>
          </div>
        </details>
      ))}

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

      <div>
        <button type="submit" className="admin-btn-primary" disabled={isPending}>
          {isPending ? "جاري الحفظ..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
