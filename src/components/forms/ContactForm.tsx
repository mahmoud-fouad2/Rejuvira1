"use client";

import { useActionState, useCallback, useEffect, useRef } from "react";

import {
  submitContactAction,
  type ContactActionState,
} from "@/app/contact/actions";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { ServiceRecord } from "@/lib/content-repository";

const initialState: ContactActionState = {
  status: "idle",
  message: "",
};

type GrecaptchaApi = {
  ready: (cb: () => void) => void;
  execute: (
    siteKey: string,
    options: { action: string },
  ) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: GrecaptchaApi;
  }
}

function loadRecaptchaScript(siteKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-rejuvira-recaptcha]",
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("script error")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.dataset.rejuviraRecaptcha = "1";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("script error")), { once: true });
    document.head.appendChild(script);
  });
}

export function ContactForm({
  services,
  formClassName,
  recaptchaSiteKey,
  source = "Website contact form",
  compact = false,
  submitLabelAr = "طلب استشارة",
  submitLabelEn = "Request a consultation",
}: {
  services: readonly ServiceRecord[];
  formClassName?: string;
  recaptchaSiteKey?: string | undefined;
  source?: string;
  compact?: boolean;
  submitLabelAr?: string;
  submitLabelEn?: string;
}) {
  const { lang } = useLanguage();
  const [state, formAction, isPending] = useActionState(
    submitContactAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const tokenInputRef = useRef<HTMLInputElement | null>(null);
  const tokenInjectedRef = useRef(false);
  const siteKey = recaptchaSiteKey ?? "";

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    void loadRecaptchaScript(siteKey)
      .then(() => {
        if (cancelled) return;
        window.grecaptcha?.ready(() => {
          /* warm up */
        });
      })
      .catch(() => {
        /* ignore script load failure */
      });
    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  useEffect(() => {
    if (!isPending) {
      tokenInjectedRef.current = false;
    }
  }, [isPending, state.status]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      if (!siteKey || tokenInjectedRef.current) return;
      event.preventDefault();
      try {
        if (!window.grecaptcha) {
          await loadRecaptchaScript(siteKey);
        }
        const token =
          (await window.grecaptcha?.execute(siteKey, { action: "contact" })) ??
          "";
        if (tokenInputRef.current) {
          tokenInputRef.current.value = token;
        }
      } catch {
        /* token stays empty — server falls back to error */
      }
      tokenInjectedRef.current = true;
      formRef.current?.requestSubmit();
    },
    [siteKey],
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={siteKey ? handleSubmit : undefined}
      className={["grid gap-5", formClassName].filter(Boolean).join(" ")}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-ink-strong text-sm font-semibold tracking-tight">
            <span className="lang-ar">الاسم الكامل</span>
            <span className="lang-en">Full name</span>
          </span>
          <input
            name="fullName"
            className="field-public"
            placeholder={lang === "ar" ? "الاسم الثلاثي" : "Your full name"}
            autoComplete="name"
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="text-ink-strong text-sm font-semibold tracking-tight">
            <span className="lang-ar">رقم الجوال</span>
            <span className="lang-en">Phone number</span>
          </span>
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
      <label className="grid gap-2">
        <span className="text-ink-strong text-sm font-semibold tracking-tight">
          <span className="lang-ar">الخدمة المطلوبة</span>
          <span className="lang-en">Requested service</span>
        </span>
        <select
          name="serviceSlug"
          className="field-public cursor-pointer"
          defaultValue=""
        >
          <option value="">
            {lang === "ar" ? "اختر الخدمة (اختياري)" : "Select a service (optional)"}
          </option>
          {services.map((service) => (
            <option key={service.id} value={service.slug}>
              {service.name}
            </option>
          ))}
        </select>
      </label>
      {compact ? null : (
        <label className="grid gap-2">
          <span className="text-ink-strong text-sm font-semibold tracking-tight">
            <span className="lang-ar">تفاصيل إضافية</span>
            <span className="lang-en">Additional details</span>
          </span>
          <textarea
            name="message"
            rows={5}
            className="field-public"
            placeholder={
              lang === "ar"
                ? "ما الذي تريد الاستفسار عنه أو حجزه؟"
                : "What would you like to ask about or book?"
            }
          />
        </label>
      )}
      <input type="hidden" name="preferredLanguage" value={lang} />
      <input type="hidden" name="source" value={source} />
      <input
        ref={tokenInputRef}
        type="hidden"
        name="recaptchaToken"
        defaultValue=""
      />
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
        data-submit-trigger
        disabled={isPending}
        className="bg-ink text-canvas rounded-[1.35rem] px-6 py-3.5 text-sm font-semibold shadow-[0_14px_40px_oklch(22%_0.06_285/0.22)] transition-[transform,opacity,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_oklch(22%_0.06_285/0.28)] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
      >
        {isPending ? (
          <>
            <span className="lang-ar">جاري الإرسال...</span>
            <span className="lang-en">Sending...</span>
          </>
        ) : (
          <>
            <span className="lang-ar">{submitLabelAr}</span>
            <span className="lang-en">{submitLabelEn}</span>
          </>
        )}
      </button>
      {siteKey ? (
        <p className="text-ink-faint text-[10px] leading-5">
          <span className="lang-ar">
            محمي بواسطة reCAPTCHA. تطبق
          </span>
          <span className="lang-en">
            Protected by reCAPTCHA. The Google{" "}
          </span>
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            <span className="lang-ar">سياسة الخصوصية</span>
            <span className="lang-en">Privacy Policy</span>
          </a>{" "}
          <span className="lang-ar">و</span>
          <span className="lang-en">and</span>{" "}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            <span className="lang-ar">شروط الخدمة</span>
            <span className="lang-en">Terms of Service</span>
          </a>{" "}
          <span className="lang-en">apply.</span>
        </p>
      ) : null}
    </form>
  );
}
