"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

import type { PortalActionState } from "@/app/admin/patients/actions";

const initialState: PortalActionState = { status: "idle", message: "" };

export type ProcedureFormOption = { id: string; label: string };

export type ProcedureFormValues = {
  procedureId?: string;
  patientId: string;
  procedureTemplateId?: string;
  customProcedureName?: string;
  category?: string;
  doctorId?: string;
  surgeonName?: string;
  procedureDate?: string;
  procedureTime?: string;
  arrivalTime?: string;
  location?: string;
  status?: string;
  patientVisibleNotes?: string;
  privateStaffNotes?: string;
  preOperationInstructions?: string;
  operationDayInstructions?: string;
  postOperationInstructions?: string;
  warningSigns?: string;
  followUpInstructions?: string;
};

const statusOptions = [
  { value: "DRAFT", label: "مسودة" },
  { value: "SCHEDULED", label: "مجدولة" },
  { value: "COMPLETED", label: "مكتملة" },
  { value: "POSTPONED", label: "مؤجلة" },
  { value: "CANCELLED", label: "ملغاة" },
  { value: "FOLLOW_UP", label: "متابعة" },
];

export function ProcedureForm({
  action,
  values,
  templates,
  doctors,
  submitLabel,
  showInstructionFields = false,
  canEditInstructions = false,
  canEditStaffNotes = true,
}: {
  action: (
    prev: PortalActionState,
    formData: FormData,
  ) => Promise<PortalActionState>;
  values: ProcedureFormValues;
  templates: ProcedureFormOption[];
  doctors: ProcedureFormOption[];
  submitLabel: string;
  showInstructionFields?: boolean;
  canEditInstructions?: boolean;
  canEditStaffNotes?: boolean;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success" && state.payload?.procedureId) {
      router.push(
        `/admin/patients/procedures/${state.payload.procedureId}` as Route,
      );
    }
  }, [state, router]);

  const isEdit = Boolean(values.procedureId);

  return (
    <form action={formAction} style={{ display: "grid", gap: "1rem" }}>
      <input type="hidden" name="patientId" value={values.patientId} />
      {values.procedureId ? (
        <input type="hidden" name="procedureId" value={values.procedureId} />
      ) : null}

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        {!isEdit ? (
          <label>
            <span className="admin-field-label">قالب العملية (معتمد طبيًا)</span>
            <select
              name="procedureTemplateId"
              defaultValue={values.procedureTemplateId ?? ""}
              className="admin-input"
            >
              <option value="">بدون قالب — عملية مخصصة</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          <span className="admin-field-label">
            اسم العملية {isEdit ? "" : "(إن لم يُستخدم قالب)"}
          </span>
          <input
            name="customProcedureName"
            defaultValue={values.customProcedureName ?? ""}
            maxLength={200}
            className="admin-input"
            placeholder="مثال: شد الوجه والرقبة"
          />
        </label>
        <label>
          <span className="admin-field-label">الطبيب</span>
          <select
            name="doctorId"
            defaultValue={values.doctorId ?? ""}
            className="admin-input"
          >
            <option value="">غير محدد</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="admin-field-label">اسم الجراح (إن لم يكن من القائمة)</span>
          <input
            name="surgeonName"
            defaultValue={values.surgeonName ?? ""}
            maxLength={160}
            className="admin-input"
          />
        </label>
        <label>
          <span className="admin-field-label">تاريخ العملية</span>
          <input
            name="procedureDate"
            type="date"
            defaultValue={values.procedureDate ?? ""}
            className="admin-input"
          />
        </label>
        <label>
          <span className="admin-field-label">وقت العملية</span>
          <input
            name="procedureTime"
            type="time"
            defaultValue={values.procedureTime ?? ""}
            className="admin-input"
          />
        </label>
        <label>
          <span className="admin-field-label">وقت الحضور</span>
          <input
            name="arrivalTime"
            type="time"
            defaultValue={values.arrivalTime ?? ""}
            className="admin-input"
          />
        </label>
        <label>
          <span className="admin-field-label">المكان / الفرع</span>
          <input
            name="location"
            defaultValue={values.location ?? ""}
            maxLength={200}
            className="admin-input"
          />
        </label>
        <label>
          <span className="admin-field-label">حالة العملية</span>
          <select
            name="status"
            defaultValue={values.status ?? "DRAFT"}
            className="admin-input"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span className="admin-field-label">ملاحظات تظهر للمريض</span>
        <textarea
          name="patientVisibleNotes"
          defaultValue={values.patientVisibleNotes ?? ""}
          rows={2}
          maxLength={4000}
          className="admin-input"
        />
      </label>
      {canEditStaffNotes ? (
        <label>
          <span className="admin-field-label">
            ملاحظات داخلية للفريق (لا تظهر للمريض)
          </span>
          <textarea
            name="privateStaffNotes"
            defaultValue={values.privateStaffNotes ?? ""}
            rows={2}
            maxLength={4000}
            className="admin-input"
          />
        </label>
      ) : null}

      {showInstructionFields && canEditInstructions ? (
        <details open className="admin-panel-soft" style={{ padding: "0.9rem" }}>
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>
            تعليمات هذا المريض (نسخة مخصصة — تعديلها لا يغير القالب الأصلي)
          </summary>
          <div style={{ display: "grid", gap: "0.9rem", marginTop: "0.9rem" }}>
            <label>
              <span className="admin-field-label">قبل العملية</span>
              <textarea
                name="preOperationInstructions"
                defaultValue={values.preOperationInstructions ?? ""}
                rows={7}
                maxLength={20000}
                className="admin-input"
              />
            </label>
            <label>
              <span className="admin-field-label">يوم العملية</span>
              <textarea
                name="operationDayInstructions"
                defaultValue={values.operationDayInstructions ?? ""}
                rows={5}
                maxLength={20000}
                className="admin-input"
              />
            </label>
            <label>
              <span className="admin-field-label">بعد العملية</span>
              <textarea
                name="postOperationInstructions"
                defaultValue={values.postOperationInstructions ?? ""}
                rows={7}
                maxLength={20000}
                className="admin-input"
              />
            </label>
            <label>
              <span className="admin-field-label">علامات تستدعي التواصل مع المركز</span>
              <textarea
                name="warningSigns"
                defaultValue={values.warningSigns ?? ""}
                rows={4}
                maxLength={20000}
                className="admin-input"
              />
            </label>
            <label>
              <span className="admin-field-label">تعليمات المتابعة</span>
              <textarea
                name="followUpInstructions"
                defaultValue={values.followUpInstructions ?? ""}
                rows={4}
                maxLength={20000}
                className="admin-input"
              />
            </label>
          </div>
        </details>
      ) : null}

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
