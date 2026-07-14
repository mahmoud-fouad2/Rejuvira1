"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

import type { PortalActionState } from "@/app/admin/patients/actions";

const initialState: PortalActionState = { status: "idle", message: "" };

export type PatientFormValues = {
  patientId?: string;
  fileNumber?: string;
  fullNameAr?: string;
  fullNameEn?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredLanguage?: string;
  internalNotes?: string;
  accountStatus?: string;
};

export function PatientForm({
  action,
  values = {},
  submitLabel,
  showAccountStatus = false,
}: {
  action: (
    prev: PortalActionState,
    formData: FormData,
  ) => Promise<PortalActionState>;
  values?: PatientFormValues;
  submitLabel: string;
  showAccountStatus?: boolean;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isDuplicateWarning = state.payload?.duplicatePhone === "1";

  useEffect(() => {
    if (state.status === "success" && state.payload?.patientId) {
      router.push(`/admin/patients/${state.payload.patientId}` as Route);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="admin-editor-form" style={{ display: "grid", gap: "1rem" }}>
      {values.patientId ? (
        <input type="hidden" name="patientId" value={values.patientId} />
      ) : null}
      {isDuplicateWarning ? (
        <input type="hidden" name="confirmDuplicate" value="1" />
      ) : null}

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <label>
          <span className="admin-field-label">الاسم الكامل (عربي) *</span>
          <input
            name="fullNameAr"
            defaultValue={values.fullNameAr ?? ""}
            required
            minLength={3}
            maxLength={160}
            className="admin-input"
            placeholder="اسم المريض الثلاثي"
          />
        </label>
        <label>
          <span className="admin-field-label">الاسم (إنجليزي)</span>
          <input
            name="fullNameEn"
            defaultValue={values.fullNameEn ?? ""}
            maxLength={160}
            className="admin-input"
            dir="ltr"
          />
        </label>
        <label>
          <span className="admin-field-label">رقم الجوال *</span>
          <input
            name="phone"
            type="tel"
            defaultValue={values.phone ?? ""}
            required
            className="admin-input"
            dir="ltr"
            placeholder="05xxxxxxxx"
          />
        </label>
        <label>
          <span className="admin-field-label">البريد الإلكتروني</span>
          <input
            name="email"
            type="email"
            defaultValue={values.email ?? ""}
            maxLength={160}
            className="admin-input"
            dir="ltr"
          />
        </label>
        <label>
          <span className="admin-field-label">رقم الملف</span>
          <input
            name="fileNumber"
            defaultValue={values.fileNumber ?? ""}
            maxLength={40}
            className="admin-input"
            dir="ltr"
            placeholder="يُولَّد تلقائيًا إن تُرك فارغًا"
            readOnly={Boolean(values.patientId)}
          />
        </label>
        <label>
          <span className="admin-field-label">تاريخ الميلاد</span>
          <input
            name="dateOfBirth"
            type="date"
            defaultValue={values.dateOfBirth ?? ""}
            className="admin-input"
          />
        </label>
        <label>
          <span className="admin-field-label">الجنس</span>
          <select name="gender" defaultValue={values.gender ?? ""} className="admin-input">
            <option value="">غير محدد</option>
            <option value="MALE">ذكر</option>
            <option value="FEMALE">أنثى</option>
          </select>
        </label>
        <label>
          <span className="admin-field-label">لغة المريض</span>
          <select
            name="preferredLanguage"
            defaultValue={values.preferredLanguage ?? "ar"}
            className="admin-input"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </label>
        <label>
          <span className="admin-field-label">اسم مرافق للطوارئ</span>
          <input
            name="emergencyContactName"
            defaultValue={values.emergencyContactName ?? ""}
            maxLength={160}
            className="admin-input"
          />
        </label>
        <label>
          <span className="admin-field-label">جوال مرافق الطوارئ</span>
          <input
            name="emergencyContactPhone"
            type="tel"
            defaultValue={values.emergencyContactPhone ?? ""}
            maxLength={20}
            className="admin-input"
            dir="ltr"
          />
        </label>
        {showAccountStatus ? (
          <label>
            <span className="admin-field-label">حالة الحساب</span>
            <select
              name="accountStatus"
              defaultValue={values.accountStatus ?? "PENDING"}
              className="admin-input"
            >
              <option value="PENDING">بانتظار التفعيل</option>
              <option value="ACTIVE">مفعل</option>
              <option value="SUSPENDED">موقوف</option>
            </select>
          </label>
        ) : null}
      </div>

      <label>
        <span className="admin-field-label">
          ملاحظات داخلية (لا تظهر للمريض)
        </span>
        <textarea
          name="internalNotes"
          defaultValue={values.internalNotes ?? ""}
          rows={3}
          maxLength={4000}
          className="admin-input"
        />
      </label>

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
          {isDuplicateWarning
            ? " — اضغط الحفظ مرة أخرى للتأكيد."
            : null}
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
