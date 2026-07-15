"use client";

import { useActionState } from "react";

import {
  sendPatientMessageAction,
  type PortalPatientActionState,
} from "@/app/portal/actions";
import { messageCategories } from "@/lib/portal/labels";

const initialState: PortalPatientActionState = { status: "idle", message: "" };

export function PatientMessageForm({
  procedures,
}: {
  procedures: { id: string; label: string }[];
}) {
  const [state, formAction, isPending] = useActionState(
    sendPatientMessageAction,
    initialState,
  );

  return (
    <form action={formAction} className="portal-message-form">
      <div className="portal-message-form__meta">
        <label>
          <span>نوع الرسالة</span>
          <select name="category" className="field-public" defaultValue="general">
            {messageCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        {procedures.length > 0 ? (
          <label>
            <span>مرتبطة بعملية</span>
            <select name="procedureId" className="field-public" defaultValue="">
              <option value="">عام - غير مرتبطة بعملية</option>
              {procedures.map((procedure) => (
                <option key={procedure.id} value={procedure.id}>
                  {procedure.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <label className="portal-message-form__textarea">
        <span>رسالتك</span>
        <textarea
          name="message"
          rows={3}
          required
          minLength={5}
          maxLength={4000}
          className="field-public"
          placeholder="اكتب سؤالك أو ملاحظتك بوضوح..."
        />
      </label>

      {state.message ? (
        <p
          role="status"
          className={
            state.status === "success"
              ? "portal-form-status portal-form-status--success"
              : "portal-form-status portal-form-status--error"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="portal-message-form__actions">
        <span>الرسائل ليست مخصصة للطوارئ الطبية.</span>
        <button type="submit" disabled={isPending} className="portal-btn portal-btn--primary">
          {isPending ? "جاري الإرسال..." : "إرسال الرسالة"}
        </button>
      </div>
    </form>
  );
}
