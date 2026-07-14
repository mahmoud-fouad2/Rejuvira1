"use client";

import { useActionState } from "react";

import {
  changePasswordAction,
  type PortalPatientActionState,
} from "@/app/portal/actions";

const initialState: PortalPatientActionState = { status: "idle", message: "" };

export function ChangePasswordForm({
  passwordMinLength,
  mustChange,
}: {
  passwordMinLength: number;
  mustChange: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid max-w-md gap-4">
      {mustChange && state.status !== "success" ? (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="lang-ar">
            كلمة مرورك مؤقتة — يجب تغييرها الآن لحماية حسابك.
          </span>
          <span className="lang-en">
            Your password is temporary — please change it now.
          </span>
        </p>
      ) : null}

      <label className="grid gap-1">
        <span className="text-sm font-semibold">
          <span className="lang-ar">كلمة المرور الحالية</span>
          <span className="lang-en">Current password</span>
        </span>
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          className="field-public"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-semibold">
          <span className="lang-ar">كلمة المرور الجديدة</span>
          <span className="lang-en">New password</span>
        </span>
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={passwordMinLength}
          required
          dir="ltr"
          className="field-public"
        />
        <span className="text-xs opacity-70">
          <span className="lang-ar">{passwordMinLength} أحرف على الأقل.</span>
          <span className="lang-en">At least {passwordMinLength} characters.</span>
        </span>
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-semibold">
          <span className="lang-ar">تأكيد كلمة المرور الجديدة</span>
          <span className="lang-en">Confirm new password</span>
        </span>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={passwordMinLength}
          required
          dir="ltr"
          className="field-public"
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
              <span className="lang-ar">جاري الحفظ...</span>
              <span className="lang-en">Saving...</span>
            </>
          ) : (
            <>
              <span className="lang-ar">تغيير كلمة المرور</span>
              <span className="lang-en">Change password</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
