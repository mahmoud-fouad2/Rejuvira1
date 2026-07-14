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
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm font-semibold">
            <span className="lang-ar">نوع الرسالة</span>
            <span className="lang-en">Message type</span>
          </span>
          <select name="category" className="field-public" defaultValue="general">
            {messageCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        {procedures.length > 0 ? (
          <label className="grid gap-1">
            <span className="text-sm font-semibold">
              <span className="lang-ar">مرتبطة بعملية (اختياري)</span>
              <span className="lang-en">Related procedure (optional)</span>
            </span>
            <select name="procedureId" className="field-public" defaultValue="">
              <option value="">عام — غير مرتبطة بعملية</option>
              {procedures.map((procedure) => (
                <option key={procedure.id} value={procedure.id}>
                  {procedure.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <label className="grid gap-1">
        <span className="text-sm font-semibold">
          <span className="lang-ar">رسالتك</span>
          <span className="lang-en">Your message</span>
        </span>
        <textarea
          name="message"
          rows={4}
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
              ? "border-emerald/25 bg-emerald/10 text-emerald rounded-2xl border px-4 py-3 text-sm"
              : "rounded-2xl border border-[rgba(92,45,62,0.22)] bg-[rgba(92,45,62,0.08)] px-4 py-3 text-sm text-[oklch(38%_0.08_15)]"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-ink text-canvas rounded-full px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {isPending ? (
            <>
              <span className="lang-ar">جاري الإرسال...</span>
              <span className="lang-en">Sending...</span>
            </>
          ) : (
            <>
              <span className="lang-ar">إرسال الرسالة</span>
              <span className="lang-en">Send message</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
