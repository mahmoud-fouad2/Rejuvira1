"use client";

import { useActionState } from "react";

import { authenticate, type LoginActionState } from "@/app/login/actions";

const initialState: LoginActionState = {
  message: "",
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    authenticate,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-ink text-sm font-semibold">
          البريد الإلكتروني
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.2rem] border px-4 py-3 text-sm transition-colors outline-none"
          placeholder="admin@rejuveracenter.sa"
          required
        />
      </label>
      <label className="grid gap-2">
        <span className="text-ink text-sm font-semibold">كلمة المرور</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.2rem] border px-4 py-3 text-sm transition-colors outline-none"
          placeholder="••••••••••"
          required
        />
      </label>
      {state.message ? (
        <p className="text-burgundy rounded-[1rem] border border-[rgba(92,45,62,0.18)] bg-[rgba(92,45,62,0.08)] px-4 py-3 text-sm">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        className="bg-ink text-canvas rounded-[1.2rem] px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
      >
        {isPending ? "جاري التحقق..." : "تسجيل الدخول"}
      </button>
    </form>
  );
}
