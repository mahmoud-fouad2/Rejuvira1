"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";

import { authenticate, type LoginActionState } from "@/app/login/actions";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

const initialState: LoginActionState = {
  message: "",
};

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden
    >
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden
    >
      <path d="m3 3 18 18" strokeLinecap="round" />
      <path
        d="M10.6 6.1A10.7 10.7 0 0 1 12 6c6.5 0 10 7 10 7a17.3 17.3 0 0 1-3.3 3.95M6.6 6.6C3.6 8.5 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.5 5.1-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2"
        strokeLinejoin="round"
      />
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
      <div className="flex justify-end">
        <LanguageToggle />
      </div>
      <Link href="/" className="rv-login-brand" aria-label="Rejuvira Center">
        <Image
          src="/media/brand/logo-light.png"
          alt="Rejuvira Center"
          width={560}
          height={560}
          className="rv-login-brand-light"
          priority
          unoptimized
        />
      </Link>

      <div className="rv-login-heading">
        <h1>
          <span className="lang-ar">تسجيل الدخول</span>
          <span className="lang-en">Admin Login</span>
        </h1>
        <p>
          <span className="lang-ar">أدخل بياناتك للوصول إلى لوحة الإدارة.</span>
          <span className="lang-en">
            Enter your credentials to access the admin panel.
          </span>
        </p>
      </div>

      <label className="rv-login-field">
        <span>
          <span className="lang-ar">البريد الإلكتروني</span>
          <span className="lang-en">Email</span>
        </span>
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
        <span>
          <span className="lang-ar">كلمة المرور</span>
          <span className="lang-en">Password</span>
        </span>
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
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
      </label>

      <div className="rv-login-row">
        <label className="rv-login-remember">
          <input type="checkbox" name="rememberMe" defaultChecked />
          <span>
            <span className="lang-ar">تذكرني</span>
            <span className="lang-en">Remember me</span>
          </span>
        </label>
        <Link href="/" className="rv-login-hint">
          <span className="lang-ar">العودة للموقع</span>
          <span className="lang-en">Back to site</span>
        </Link>
      </div>

      {state.message ? (
        <p className="rv-login-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <button type="submit" className="rv-login-submit" disabled={isPending}>
        {isPending ? (
          <>
            <span className="lang-ar">جارٍ التحقق…</span>
            <span className="lang-en">Checking...</span>
          </>
        ) : (
          <>
            <span className="lang-ar">دخول</span>
            <span className="lang-en">Sign in</span>
          </>
        )}
      </button>
    </form>
  );
}
