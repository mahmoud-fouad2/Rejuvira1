"use client";

import { useActionState } from "react";

import {
  submitContactAction,
  type ContactActionState,
} from "@/app/contact/actions";
import type { ServiceRecord } from "@/lib/content-repository";

const initialState: ContactActionState = {
  status: "idle",
  message: "",
};

export function ContactForm({
  services,
}: {
  services: readonly ServiceRecord[];
}) {
  const [state, formAction, isPending] = useActionState(
    submitContactAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-ink-strong text-sm font-semibold tracking-tight">الاسم الكامل</span>
          <input
            name="fullName"
            className="field-public"
            placeholder="الاسم الثلاثي"
            autoComplete="name"
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="text-ink-strong text-sm font-semibold tracking-tight">رقم الجوال</span>
          <input
            name="phone"
            className="field-public"
            placeholder="05xxxxxxxx"
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-ink-strong text-sm font-semibold tracking-tight">
            البريد الإلكتروني
          </span>
          <input
            name="email"
            type="email"
            className="field-public"
            placeholder="name@example.com"
            autoComplete="email"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-ink-strong text-sm font-semibold tracking-tight">
            الخدمة المطلوبة
          </span>
          <select
            name="serviceSlug"
            className="field-public cursor-pointer"
            defaultValue=""
          >
            <option value="">اختر الخدمة</option>
            {services.map((service) => (
              <option key={service.id} value={service.slug}>
                {service.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-2">
        <span className="text-ink-strong text-sm font-semibold tracking-tight">تفاصيل إضافية</span>
        <textarea
          name="message"
          rows={5}
          className="field-public"
          placeholder="ما الذي تريد الاستفسار عنه أو حجزه؟"
        />
      </label>
      {state.message ? (
        <p
          className={`rounded-[1.1rem] px-4 py-3 text-sm ${
            state.status === "success"
              ? "border border-emerald/25 bg-emerald/10 text-emerald"
              : "border border-[rgba(92,45,62,0.22)] bg-[rgba(92,45,62,0.08)] text-[oklch(38%_0.08_15)]"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-canvas rounded-[1.35rem] px-6 py-3.5 text-sm font-semibold shadow-[0_14px_40px_oklch(22%_0.06_285/0.22)] transition-[transform,opacity,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_oklch(22%_0.06_285/0.28)] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
      >
        {isPending ? "جاري الإرسال..." : "طلب استشارة"}
      </button>
    </form>
  );
}
