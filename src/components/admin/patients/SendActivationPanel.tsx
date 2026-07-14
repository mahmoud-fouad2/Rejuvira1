"use client";

import { useActionState } from "react";

import type { PortalActionState } from "@/app/admin/patients/actions";
import { sendActivationAction } from "@/app/admin/patients/actions";

const initialState: PortalActionState = { status: "idle", message: "" };

/**
 * Issues a one-time activation link + OTP and shows them ONCE to the staff
 * member so they can be shared with the patient through the approved
 * channel. Nothing sensitive is stored raw or shown again later.
 */
export function SendActivationPanel({
  patientId,
  isActivated,
}: {
  patientId: string;
  isActivated: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    sendActivationAction,
    initialState,
  );

  const link =
    state.status === "success" && state.payload?.activationPath
      ? `${typeof window !== "undefined" ? window.location.origin : ""}${state.payload.activationPath}`
      : null;

  return (
    <div className="admin-card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <strong>تفعيل حساب البوابة</strong>
          <p className="admin-text-soft" style={{ margin: 0, fontSize: "0.85em" }}>
            {isActivated
              ? "الحساب مفعل. يمكنك إنشاء رابط استعادة إذا نسي المريض كلمة المرور."
              : "أنشئ رابط تفعيل ورمز تحقق وشاركهما مع المريض."}
          </p>
        </div>
        <form action={formAction}>
          <input type="hidden" name="patientId" value={patientId} />
          <button
            type="submit"
            className="admin-btn-secondary"
            disabled={isPending}
          >
            {isPending
              ? "جاري الإنشاء..."
              : isActivated
                ? "إنشاء رابط استعادة"
                : "إنشاء رابط تفعيل"}
          </button>
        </form>
      </div>

      {state.status === "error" ? (
        <p className="admin-status-badge is-danger" style={{ whiteSpace: "normal" }}>
          {state.message}
        </p>
      ) : null}

      {link && state.payload ? (
        <div
          className="admin-panel-soft"
          style={{ padding: "0.9rem", display: "grid", gap: "0.5rem" }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>
            شارك هذه البيانات مع المريض الآن — لن تظهر مرة أخرى:
          </p>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <label className="admin-field-label">رابط التفعيل</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                readOnly
                value={link}
                dir="ltr"
                className="admin-input"
                style={{ flex: 1, fontSize: "0.8em" }}
                onFocus={(event) => event.currentTarget.select()}
              />
              <button
                type="button"
                className="admin-btn-ghost"
                onClick={() => navigator.clipboard?.writeText(link)}
              >
                نسخ
              </button>
            </div>
            <label className="admin-field-label">رمز التحقق</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <output
                dir="ltr"
                style={{
                  fontSize: "1.3em",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                }}
              >
                {state.payload.otp}
              </output>
              <button
                type="button"
                className="admin-btn-ghost"
                onClick={() =>
                  navigator.clipboard?.writeText(state.payload?.otp ?? "")
                }
              >
                نسخ
              </button>
            </div>
            <p className="admin-text-faint" style={{ margin: 0, fontSize: "0.8em" }}>
              صالح حتى{" "}
              {state.payload.expiresAt
                ? new Date(state.payload.expiresAt).toLocaleString("ar-SA-u-ca-gregory-nu-latn", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : ""}
              . لا ترسل الرابط والرمز في رسالة واحدة تحتوي تفاصيل طبية.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
