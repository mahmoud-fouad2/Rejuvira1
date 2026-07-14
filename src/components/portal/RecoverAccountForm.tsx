"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";

import {
  recoverRequestAction,
  type PatientAuthState,
} from "@/app/patient-login/actions";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

const initialState: PatientAuthState = { status: "idle", message: "" };

export function RecoverAccountForm({ clinicPhone }: { clinicPhone: string }) {
  const [state, formAction, isPending] = useActionState(
    recoverRequestAction,
    initialState,
  );

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
          <span className="lang-ar">استعادة الحساب</span>
          <span className="lang-en">Account recovery</span>
        </h1>
        <p>
          <span className="lang-ar">
            أدخل رقم جوالك المسجل وسيتواصل معك فريق المركز لإعادة تفعيل حسابك
            بأمان.
          </span>
          <span className="lang-en">
            Enter your registered phone number and the clinic team will contact
            you to securely restore access.
          </span>
        </p>
      </div>

      {state.status === "success" ? (
        <p className="border-emerald/25 bg-emerald/10 text-emerald rounded-[1.1rem] border px-4 py-3 text-sm">
          {state.message}
        </p>
      ) : (
        <>
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
                <span className="lang-ar">جاري الإرسال...</span>
                <span className="lang-en">Sending...</span>
              </>
            ) : (
              <>
                <span className="lang-ar">طلب استعادة الحساب</span>
                <span className="lang-en">Request recovery</span>
              </>
            )}
          </button>
        </>
      )}

      {clinicPhone ? (
        <p className="text-center text-sm opacity-80">
          <span className="lang-ar">أو اتصل بالمركز مباشرة: </span>
          <span className="lang-en">Or call the clinic directly: </span>
          <a href={`tel:${clinicPhone}`} dir="ltr" className="font-semibold underline">
            {clinicPhone}
          </a>
        </p>
      ) : null}

      <div className="text-center text-sm">
        <Link href="/patient-login" className="underline opacity-80">
          <span className="lang-ar">العودة لتسجيل الدخول</span>
          <span className="lang-en">Back to sign in</span>
        </Link>
      </div>
    </form>
  );
}
