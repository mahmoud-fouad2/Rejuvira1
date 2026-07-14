"use client";

import { useActionState } from "react";

import type { PortalActionState } from "@/app/admin/patients/actions";
import { addChecklistItemAction } from "@/app/admin/patients/actions";

const initialState: PortalActionState = { status: "idle", message: "" };

export function ChecklistItemForm({
  procedureId,
  patientId,
}: {
  procedureId: string;
  patientId: string;
}) {
  const [state, formAction, isPending] = useActionState(
    addChecklistItemAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      style={{
        display: "grid",
        gap: "0.75rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        alignItems: "end",
      }}
    >
      <input type="hidden" name="procedureId" value={procedureId} />
      <input type="hidden" name="patientId" value={patientId} />
      <label style={{ gridColumn: "span 2" }}>
        <span className="admin-field-label">المهمة *</span>
        <input
          name="title"
          required
          minLength={2}
          maxLength={300}
          className="admin-input"
          placeholder="مثال: إحضار نتائج التحاليل"
        />
      </label>
      <label>
        <span className="admin-field-label">المرحلة *</span>
        <select name="phase" required className="admin-input" defaultValue="BEFORE_OPERATION">
          <option value="BEFORE_OPERATION">قبل العملية</option>
          <option value="OPERATION_DAY">يوم العملية</option>
          <option value="AFTER_OPERATION">بعد العملية</option>
          <option value="FOLLOW_UP">المتابعة</option>
        </select>
      </label>
      <label>
        <span className="admin-field-label">تاريخ الاستحقاق</span>
        <input name="dueDate" type="date" className="admin-input" />
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <input type="checkbox" name="isRequired" value="1" />
        <span>إلزامية</span>
      </label>
      {state.message ? (
        <p
          role="status"
          className={
            state.status === "success"
              ? "admin-status-badge is-success"
              : "admin-status-badge is-danger"
          }
          style={{ gridColumn: "1 / -1", whiteSpace: "normal" }}
        >
          {state.message}
        </p>
      ) : null}
      <div>
        <button type="submit" className="admin-btn-secondary" disabled={isPending}>
          {isPending ? "جاري الإضافة..." : "إضافة مهمة"}
        </button>
      </div>
    </form>
  );
}
