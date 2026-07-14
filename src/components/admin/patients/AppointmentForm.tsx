"use client";

import { useActionState } from "react";

import type { PortalActionState } from "@/app/admin/patients/actions";
import { createAppointmentAction } from "@/app/admin/patients/actions";

const initialState: PortalActionState = { status: "idle", message: "" };

export function AppointmentForm({
  procedureId,
  patientId,
  doctors,
}: {
  procedureId: string;
  patientId: string;
  doctors: { id: string; label: string }[];
}) {
  const [state, formAction, isPending] = useActionState(
    createAppointmentAction,
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
      <label>
        <span className="admin-field-label">التاريخ *</span>
        <input name="appointmentDate" type="date" required className="admin-input" />
      </label>
      <label>
        <span className="admin-field-label">الوقت</span>
        <input name="appointmentTime" type="time" className="admin-input" />
      </label>
      <label>
        <span className="admin-field-label">النوع</span>
        <input
          name="appointmentType"
          maxLength={120}
          className="admin-input"
          placeholder="مثال: مراجعة أولى"
        />
      </label>
      <label>
        <span className="admin-field-label">الطبيب</span>
        <select name="doctorId" className="admin-input" defaultValue="">
          <option value="">غير محدد</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.label}
            </option>
          ))}
        </select>
      </label>
      <label style={{ gridColumn: "1 / -1" }}>
        <span className="admin-field-label">ملاحظة تظهر للمريض</span>
        <input
          name="patientVisibleNotes"
          maxLength={2000}
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
          style={{ gridColumn: "1 / -1", whiteSpace: "normal" }}
        >
          {state.message}
        </p>
      ) : null}
      <div>
        <button type="submit" className="admin-btn-secondary" disabled={isPending}>
          {isPending ? "جاري الإضافة..." : "إضافة متابعة"}
        </button>
      </div>
    </form>
  );
}
