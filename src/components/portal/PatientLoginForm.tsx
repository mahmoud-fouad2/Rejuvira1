"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";

import {
  patientLoginAction,
  type PatientAuthState,
} from "@/app/patient-login/actions";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

const initialState: PatientAuthState = { status: "idle", message: "" };

export function PatientLoginForm() {
  const [state, formAction, isPending] = useActionState(
    patientLoginAction,
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

      <div className="rv-login-heading">
        <h1>
          <span className="lang-ar">بوابة المرضى</span>
          <span className="lang-en">Patient Portal</span>
        </h1>
        <p>
          <span className="lang-ar">
            سجل الدخول لمتابعة تعليمات عمليتك ومواعيدك.
          </span>
          <span className="lang-en">
            Sign in to follow your procedure instructions and appointments.
          </span>
        </p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold">
          <span className="lang-ar">رقم الجوال</span>
          <span className="lang-en">Phone number</span>
        </span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          dir="ltr"
          placeholder="05xxxxxxxx"
          className="field-public"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold">
          <span className="lang-ar">كلمة المرور</span>
          <span className="lang-en">Password</span>
        </span>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
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
            <span className="lang-ar">جاري الدخول...</span>
            <span className="lang-en">Signing in...</span>
          </>
        ) : (
          <>
            <span className="lang-ar">تسجيل الدخول</span>
            <span className="lang-en">Sign in</span>
          </>
        )}
      </button>

      <div className="grid gap-2 text-center text-sm">
        <Link href="/patient-login/recover" className="underline opacity-80">
          <span className="lang-ar">نسيت كلمة المرور أو تحتاج مساعدة؟</span>
          <span className="lang-en">Forgot your password or need help?</span>
        </Link>
        <Link href="/patient-login/activate" className="underline opacity-80">
          <span className="lang-ar">لديك رابط تفعيل؟ فعّل حسابك من هنا</span>
          <span className="lang-en">Have an activation link? Activate here</span>
        </Link>
      </div>

      <p className="text-center text-xs leading-5 opacity-70">
        <span className="lang-ar">
          بياناتك الصحية سرية وتُعرض لك وحدك بعد تسجيل الدخول. راجع{" "}
        </span>
        <span className="lang-en">
          Your health information is confidential and visible only to you.{" "}
        </span>
        <Link href="/patient-login/privacy" className="underline">
          <span className="lang-ar">سياسة خصوصية البوابة</span>
          <span className="lang-en">Portal privacy policy</span>
        </Link>
      </p>
    </form>
  );
}
