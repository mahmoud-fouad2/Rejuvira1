"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";

import {
  activateAccountAction,
  type PatientAuthState,
} from "@/app/patient-login/actions";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

const initialState: PatientAuthState = { status: "idle", message: "" };

export function ActivateAccountForm({
  token,
  passwordMinLength,
}: {
  token: string;
  passwordMinLength: number;
}) {
  const [state, formAction, isPending] = useActionState(
    activateAccountAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="rv-login-form" noValidate>
      <div className="flex justify-end">
        <LanguageToggle />
      </div>
      <Link href="/" className="rv-login-brand" aria-label="Rejuvera Center">
        <Image
          src="/media/brand/logo-light.png"
          alt="Rejuvera Center"
          width={560}
          height={560}
          className="rv-login-brand-light"
          priority
          unoptimized
        />
      </Link>

      <input type="hidden" name="token" value={token} />

      <div className="rv-login-heading">
        <h1>
          <span className="lang-ar">تفعيل حسابك</span>
          <span className="lang-en">Activate your account</span>
        </h1>
        <p>
          <span className="lang-ar">
            أدخل رمز التحقق الذي زوّدك به المركز، ثم اختر كلمة مرور خاصة بك.
          </span>
          <span className="lang-en">
            Enter the verification code from the clinic, then choose your
            password.
          </span>
        </p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold">
          <span className="lang-ar">رمز التحقق (6 أرقام)</span>
          <span className="lang-en">Verification code (6 digits)</span>
        </span>
        <input
          name="otp"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          dir="ltr"
          className="field-public text-center tracking-[0.4em]"
          placeholder="••••••"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold">
          <span className="lang-ar">كلمة المرور الجديدة</span>
          <span className="lang-en">New password</span>
        </span>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={passwordMinLength}
            required
            dir="ltr"
            className="field-public w-full"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-sm opacity-70"
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPassword ? "إخفاء" : "إظهار"}
          </button>
        </div>
        <span className="text-xs opacity-70">
          <span className="lang-ar">
            {passwordMinLength} أحرف على الأقل.
          </span>
          <span className="lang-en">At least {passwordMinLength} characters.</span>
        </span>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold">
          <span className="lang-ar">تأكيد كلمة المرور</span>
          <span className="lang-en">Confirm password</span>
        </span>
        <input
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          minLength={passwordMinLength}
          required
          dir="ltr"
          className="field-public"
        />
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="acceptTerms" value="1" required className="mt-1" />
        <span>
          <span className="lang-ar">
            أوافق على شروط استخدام البوابة و
          </span>
          <span className="lang-en">
            I agree to the portal terms of use and the{" "}
          </span>
          <Link href="/patient-login/privacy" className="underline" target="_blank">
            <span className="lang-ar">سياسة الخصوصية</span>
            <span className="lang-en">privacy policy</span>
          </Link>
          .
        </span>
      </label>

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-[1.1rem] border border-[rgba(92,45,62,0.22)] bg-[rgba(92,45,62,0.08)] px-4 py-3 text-sm text-[oklch(38%_0.08_15)]"
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-canvas rounded-[1.35rem] px-6 py-3.5 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-65"
      >
        {isPending ? (
          <>
            <span className="lang-ar">جاري التفعيل...</span>
            <span className="lang-en">Activating...</span>
          </>
        ) : (
          <>
            <span className="lang-ar">تفعيل الحساب والدخول</span>
            <span className="lang-en">Activate and sign in</span>
          </>
        )}
      </button>

      <div className="text-center text-sm">
        <Link href="/patient-login" className="underline opacity-80">
          <span className="lang-ar">العودة لتسجيل الدخول</span>
          <span className="lang-en">Back to sign in</span>
        </Link>
      </div>
    </form>
  );
}
