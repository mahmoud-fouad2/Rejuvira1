"use client";

import { useActionState } from "react";

import type { PortalActionState } from "@/app/admin/patients/actions";
import { replyMessageAction } from "@/app/admin/patients/actions";

const initialState: PortalActionState = { status: "idle", message: "" };

export function MessageReplyForm({
  messageId,
  patientId,
}: {
  messageId: string;
  patientId: string;
}) {
  const [state, formAction, isPending] = useActionState(
    replyMessageAction,
    initialState,
  );

  if (state.status === "success") {
    return (
      <p className="admin-status-badge is-success patient-message-status">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="patient-admin-reply-form">
      <input type="hidden" name="messageId" value={messageId} />
      <input type="hidden" name="patientId" value={patientId} />
      <textarea
        name="reply"
        rows={2}
        required
        minLength={2}
        maxLength={4000}
        className="admin-input"
        placeholder="اكتب رد الفريق للمريض..."
      />
      {state.status === "error" ? (
        <p className="admin-status-badge is-danger patient-message-status">
          {state.message}
        </p>
      ) : null}
      <div>
        <button type="submit" className="admin-btn-secondary" disabled={isPending}>
          {isPending ? "جاري الإرسال..." : "إرسال الرد"}
        </button>
      </div>
    </form>
  );
}
