"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";

import { authenticate, type LoginActionState } from "@/app/login/actions";

const initialState: LoginActionState = {
  message: "",
};

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="m3 3 18 18" strokeLinecap="round" />
      <path d="M10.6 6.1A10.7 10.7 0 0 1 12 6c6.5 0 10 7 10 7a17.3 17.3 0 0 1-3.3 3.95M6.6 6.6C3.6 8.5 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.5 5.1-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2" strokeLinejoin="round" />
    </svg>
  );
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    authenticate,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="rv-login-form" noValidate>
      <Link href="/" className="rv-login-brand" aria-label="Rejuvira Center">
        <Image
          src="/media/brand/logo-light.png"
          alt="Rejuvira Center"
          width={220}
          height={140}
          className="rv-login-brand-light"
          priority
        />
        <Image
          src="/media/brand/logo-dark.png"
          alt="Rejuvira Center"
          width={220}
          height={140}
          className="rv-login-brand-dark"
          priority
        />
      </Link>

      <div className="rv-login-heading">
        <h1>تسجيل الدخول</h1>
        <p>أدخل بياناتك للوصول إلى لوحة الإدارة.</p>
      </div>

      <label className="rv-login-field">
        <span>البريد الإلكتروني</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="admin@rejuveracenter.sa"
          dir="ltr"
        />
      </label>

      <label className="rv-login-field">
        <span>كلمة المرور</span>
        <div className="rv-login-password">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
      </label>

      <div className="rv-login-row">
        <label className="rv-login-remember">
          <input type="checkbox" name="rememberMe" defaultChecked />
          <span>تذكرني</span>
        </label>
        <Link href="/" className="rv-login-hint">
          العودة للموقع
        </Link>
      </div>

      {state.message ? (
        <p className="rv-login-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <button type="submit" className="rv-login-submit" disabled={isPending}>
        {isPending ? "جارٍ التحقق…" : "دخول"}
      </button>
    </form>
  );
}
