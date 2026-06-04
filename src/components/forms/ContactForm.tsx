"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { ServiceRecord } from "@/lib/content-repository";
import {
  GENERAL_INQUIRY_SERVICE_AR,
  GENERAL_INQUIRY_SERVICE_EN,
  GENERAL_INQUIRY_SERVICE_VALUE,
} from "@/lib/general-inquiry";
import {
  LEAD_HONEYPOT_FIELD,
  LEAD_RENDERED_AT_FIELD,
} from "@/lib/lead-intake-guard";
import {
  leadPayloadFromForm,
  trackLeadConversion,
} from "@/lib/lead-conversion-tracking";
import {
  SAUDI_MOBILE_INPUT_PATTERN,
  SAUDI_MOBILE_INPUT_TITLE,
} from "@/lib/saudi-phone";

type ContactActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialState: ContactActionState = {
  status: "idle",
  message: "",
};

type GrecaptchaApi = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
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
      "script[data-rejuvera-recaptcha]",
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("script error")),
        { once: true },
      );
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.dataset.rejuveraRecaptcha = "1";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("script error")), {
      once: true,
    });
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
  const [state, setState] = useState<ContactActionState>(initialState);
  const [isPending, setIsPending] = useState(false);
  const [renderedAt, setRenderedAt] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);
  const tokenInputRef = useRef<HTMLInputElement | null>(null);
  const siteKey = recaptchaSiteKey ?? "";
  const hasGeneralInquiryOption = services.some(
    (service) => service.slug === GENERAL_INQUIRY_SERVICE_VALUE,
  );

  useEffect(() => {
    setRenderedAt(String(Date.now()));
  }, []);

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

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      if (isPending) return;
      event.preventDefault();
      const form = event.currentTarget;
      setIsPending(true);
      setState(initialState);
      try {
        if (siteKey && !window.grecaptcha) {
          await loadRecaptchaScript(siteKey);
        }
        const token = siteKey
          ? ((await window.grecaptcha?.execute(siteKey, {
              action: "contact",
            })) ?? "")
          : "";
        if (tokenInputRef.current) {
          tokenInputRef.current.value = token;
        }
      } catch {
        /* token stays empty — server falls back to error */
      }
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          accept: "application/json",
          "x-requested-with": "fetch",
          "x-rejuvera-current-url": window.location.href,
        },
        body: new FormData(form),
      }).catch(() => null);
      if (!response) {
        setState({
          status: "error",
          message:
            "تعذّر الاتصال بالخادم. الرجاء المحاولة مرة أخرى. / Could not reach the server. Please try again.",
        });
        setIsPending(false);
        return;
      }
      const data = (await response.json()) as ContactActionState;
      setState(data);
      if (response.ok && data.status === "success") {
        trackLeadConversion(leadPayloadFromForm(form, "contact_form"));
        form.reset();
        if (tokenInputRef.current) tokenInputRef.current.value = "";
      }
      setIsPending(false);
    },
    [isPending, siteKey],
  );

  return (
    <form
      ref={formRef}
      action="/api/contact"
      method="post"
      onSubmit={handleSubmit}
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
            type="tel"
            className="field-public"
            placeholder="05xxxxxxxx"
            inputMode="tel"
            autoComplete="tel"
            minLength={10}
            maxLength={13}
            pattern={SAUDI_MOBILE_INPUT_PATTERN}
            title={SAUDI_MOBILE_INPUT_TITLE}
            dir="ltr"
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
            {lang === "ar"
              ? "اختر الخدمة (اختياري)"
              : "Select a service (optional)"}
          </option>
          {hasGeneralInquiryOption ? null : (
            <option value={GENERAL_INQUIRY_SERVICE_VALUE}>
              {lang === "ar"
                ? GENERAL_INQUIRY_SERVICE_AR
                : GENERAL_INQUIRY_SERVICE_EN}
            </option>
          )}
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
      <input type="hidden" name="utm_source" defaultValue="" />
      <input type="hidden" name="utm_medium" defaultValue="" />
      <input type="hidden" name="utm_campaign" defaultValue="" />
      <input type="hidden" name="utm_content" defaultValue="" />
      <input type="hidden" name="utmSource" defaultValue="" />
      <input type="hidden" name="utmMedium" defaultValue="" />
      <input type="hidden" name="utmCampaign" defaultValue="" />
      <input type="hidden" name="utmContent" defaultValue="" />
      <input
        type="hidden"
        name={LEAD_RENDERED_AT_FIELD}
        value={renderedAt}
        readOnly
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px -translate-x-[9999px] overflow-hidden opacity-0"
      >
        <label>
          Company
          <input
            type="text"
            name={LEAD_HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>
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
              ? "border-emerald/25 bg-emerald/10 text-emerald border"
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
          <span className="lang-ar">محمي بواسطة reCAPTCHA. تطبق</span>
          <span className="lang-en">Protected by reCAPTCHA. The Google </span>
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
