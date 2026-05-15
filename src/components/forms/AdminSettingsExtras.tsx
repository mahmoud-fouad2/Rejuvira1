"use client";

import { useActionState, useState } from "react";

import {
  saveContactExtraAction,
  saveIntegrationsAction,
  saveOperationsAction,
  saveSeoPageAction,
  saveSocialChannelsAction,
  type ExtraSettingsState,
} from "@/app/admin/settings/extra-actions";
import type {
  RuntimeSettings,
  SeoSettings,
} from "@/lib/content-repository";

const initialState: ExtraSettingsState = { status: "idle", message: "" };

const SEO_PAGES: Array<{ key: keyof SeoSettings; label: string }> = [
  { key: "home", label: "الصفحة الرئيسية" },
  { key: "services", label: "الخدمات" },
  { key: "doctors", label: "الأطباء" },
  { key: "devices", label: "الأجهزة" },
  { key: "gallery", label: "المعرض" },
  { key: "journal", label: "المجلة" },
  { key: "about", label: "من نحن" },
  { key: "contact", label: "التواصل" },
];

const SOCIAL_CHANNELS: Array<{ key: string; label: string }> = [
  { key: "instagram", label: "Instagram" },
  { key: "x", label: "X (Twitter)" },
  { key: "twitter", label: "Twitter (alias)" },
  { key: "snapchat", label: "Snapchat" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "facebook", label: "Facebook" },
  { key: "whatsappBusiness", label: "WhatsApp Business" },
  { key: "threads", label: "Threads" },
];

export function AdminSettingsExtras({
  settings,
  recaptchaSiteKey,
}: {
  settings: RuntimeSettings;
  recaptchaSiteKey: string;
}) {
  return (
    <div className="grid gap-6">
      <OperationsCard settings={settings} recaptchaSiteKey={recaptchaSiteKey} />
      <IntegrationsCard settings={settings} />
      <ContactExtraCard settings={settings} />
      <SeoCard settings={settings} />
      <SocialChannelsCard settings={settings} />
    </div>
  );
}

function OperationsCard({
  settings,
  recaptchaSiteKey,
}: {
  settings: RuntimeSettings;
  recaptchaSiteKey: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveOperationsAction,
    initialState,
  );
  return (
    <article className="surface-panel rounded-[1.85rem] p-6">
      <p className="text-ink-faint text-[10px] font-semibold uppercase tracking-[0.22em]">
        تفضيلات العرض والحماية
      </p>
      <h2 className="text-ink-strong mt-2 text-xl font-semibold tracking-tight">
        وضع العرض ومكافحة السبام
      </h2>
      <p className="text-ink-soft mt-2 text-sm leading-7">
        ضبط الوضع الافتراضي للموقع، تفعيل/إيقاف زر التبديل بين الفاتح والداكن،
        وإدارة تفعيل التحقّق من reCAPTCHA على نماذج التواصل العامة.
      </p>
      <form action={formAction} className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm">
          <span className="text-ink-strong font-semibold">المظهر الافتراضي</span>
          <select
            name="defaultTheme"
            defaultValue={settings.ops.defaultTheme ?? "system"}
            className="border-line bg-surface text-ink rounded-[1.15rem] border px-4 py-3"
          >
            <option value="system">حسب نظام الزائر</option>
            <option value="light">فاتح دائمًا</option>
            <option value="dark">داكن دائمًا</option>
          </select>
        </label>
        <ToggleField
          name="themeToggleEnabled"
          label="إتاحة زر تبديل المظهر للزوار"
          defaultChecked={settings.ops.themeToggleEnabled !== false}
        />
        <ToggleField
          name="recaptchaEnabled"
          label="تفعيل التحقّق من reCAPTCHA على نماذج التواصل"
          defaultChecked={settings.ops.recaptchaEnabled !== false}
          helper={
            recaptchaSiteKey
              ? `مفتاح الموقع: ${recaptchaSiteKey.slice(0, 8)}…`
              : "لم يتم تكوين مفتاح الموقع بعد."
          }
        />
        <ToggleField
          name="maintenanceMode"
          label="تفعيل وضع الصيانة (يعطّل الواجهة العامة فقط)"
          defaultChecked={Boolean(settings.ops.maintenanceMode)}
        />
        <SubmitMessage pending={pending} state={state} />
      </form>
    </article>
  );
}

function IntegrationsCard({ settings }: { settings: RuntimeSettings }) {
  const [state, formAction, pending] = useActionState(
    saveIntegrationsAction,
    initialState,
  );
  return (
    <article className="surface-panel rounded-[1.85rem] p-6">
      <p className="text-ink-faint text-[10px] font-semibold uppercase tracking-[0.22em]">
        التكاملات والأكواد
      </p>
      <h2 className="text-ink-strong mt-2 text-xl font-semibold tracking-tight">
        Chatbase، أكواد مؤقتة، و Webhook النماذج
      </h2>
      <p className="text-ink-soft mt-2 text-sm leading-7">
        يمكنك إضافة Widget أو Google Tag أو أي كود مؤقت بدون تعديل ملفات المشروع.
        الأكواد هنا تُحقن في الواجهة العامة فقط، والـ Webhook يستقبل كل طلب
        حجز أو تواصل بعد تسجيله داخل CRM.
      </p>
      <form action={formAction} className="mt-5 grid gap-4 text-sm">
        <ToggleField
          name="chatbaseEnabled"
          label="تفعيل Chatbase widget"
          defaultChecked={settings.integrations.chatbaseEnabled}
          helper="يمكن تعطيله مؤقتاً بدون حذف رقم الودجت."
        />
        <label className="grid gap-2">
          <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
            Chatbase Widget ID
          </span>
          <input
            name="chatbaseWidgetId"
            defaultValue={settings.integrations.chatbaseWidgetId}
            dir="ltr"
            className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3"
            placeholder="x2waiyc2hrfs58qowbowajxy8sugf9kn"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
            كود مخصص داخل head
          </span>
          <textarea
            name="customHeadCode"
            rows={5}
            defaultValue={settings.integrations.customHeadCode}
            dir="ltr"
            className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 font-mono text-xs"
            placeholder="<script>...</script>"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
            كود مخصص قبل نهاية body
          </span>
          <textarea
            name="customBodyCode"
            rows={5}
            defaultValue={settings.integrations.customBodyCode}
            dir="ltr"
            className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 font-mono text-xs"
            placeholder="<script>...</script>"
          />
        </label>
        <ToggleField
          name="formWebhookEnabled"
          label="تفعيل Webhook لكل نماذج الموقع"
          defaultChecked={settings.integrations.formWebhookEnabled}
          helper="يُرسل نسخة JSON بعد حفظ الطلب داخل CRM."
        />
        <label className="grid gap-2">
          <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
            Form Webhook URL
          </span>
          <input
            name="formWebhookUrl"
            defaultValue={settings.integrations.formWebhookUrl}
            dir="ltr"
            className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3"
            placeholder="https://hooks.example.com/rejuvira"
          />
          <span className="text-ink-faint text-[11px] leading-6">
            Payload: event, source, submittedAt, submissionId, fullName, phone,
            serviceSlug, preferredLanguage.
          </span>
        </label>
        <label className="grid gap-2">
          <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
            Webhook Secret Header
          </span>
          <input
            name="formWebhookSecret"
            defaultValue={settings.integrations.formWebhookSecret}
            dir="ltr"
            className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3"
            placeholder="اختياري: يرسل في x-rejuvira-webhook-secret"
          />
        </label>
        <SubmitMessage pending={pending} state={state} label="حفظ التكاملات" />
      </form>
    </article>
  );
}

function ContactExtraCard({ settings }: { settings: RuntimeSettings }) {
  const [state, formAction, pending] = useActionState(
    saveContactExtraAction,
    initialState,
  );
  return (
    <article className="surface-panel rounded-[1.85rem] p-6">
      <p className="text-ink-faint text-[10px] font-semibold uppercase tracking-[0.22em]">
        صفحة التواصل والخرائط
      </p>
      <h2 className="text-ink-strong mt-2 text-xl font-semibold tracking-tight">
        خرائط Google والعنوان
      </h2>
      <form action={formAction} className="mt-5 grid gap-4 text-sm">
        <label className="grid gap-2">
          <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
            رابط Google Maps (Embed)
          </span>
          <input
            name="mapsEmbedUrl"
            defaultValue={settings.contact.mapsEmbedUrl}
            dir="ltr"
            placeholder="https://www.google.com/maps/embed?..."
            className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          />
          <span className="text-ink-faint text-[11px] leading-6">
            افتحي خرائط Google → مشاركة → Embed → انسخي قيمة src.
          </span>
        </label>
        <label className="grid gap-2">
          <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
            شكل الخريطة
          </span>
          <select
            name="mapsShape"
            defaultValue={settings.contact.mapsShape ?? "rounded"}
            className="border-line bg-surface text-ink rounded-[1.15rem] border px-4 py-3"
          >
            <option value="rounded">مستدير الزوايا</option>
            <option value="square">مربّع</option>
          </select>
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
              العنوان (عربي)
            </span>
            <input
              name="addressAr"
              defaultValue={settings.contact.addressAr}
              className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
              Address (English)
            </span>
            <input
              name="addressEn"
              defaultValue={settings.contact.addressEn}
              dir="ltr"
              className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3"
            />
          </label>
        </div>
        <SubmitMessage pending={pending} state={state} label="حفظ خريطة وعنوان التواصل" />
      </form>
    </article>
  );
}

function SeoCard({ settings }: { settings: RuntimeSettings }) {
  const [page, setPage] = useState<keyof SeoSettings>("home");
  const [state, formAction, pending] = useActionState(
    saveSeoPageAction,
    initialState,
  );
  const seo = settings.seo[page];
  return (
    <article className="surface-panel rounded-[1.85rem] p-6">
      <p className="text-ink-faint text-[10px] font-semibold uppercase tracking-[0.22em]">
        تحسين محركات البحث
      </p>
      <h2 className="text-ink-strong mt-2 text-xl font-semibold tracking-tight">
        SEO لكل صفحة (AR / EN)
      </h2>
      <p className="text-ink-soft mt-2 text-sm leading-7">
        تُحفظ العناوين والأوصاف لكل صفحة في إعدادات الموقع وتُظهر مباشرة على
        Meta tags و OpenGraph.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {SEO_PAGES.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPage(p.key)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              page === p.key
                ? "bg-ink text-canvas border-ink-strong"
                : "border-line bg-surface text-ink hover:border-accent/30"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <form
        key={page}
        action={formAction}
        className="mt-5 grid gap-4 text-sm"
      >
        <input type="hidden" name="page" value={page} />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
              العنوان (عربي)
            </span>
            <input
              name="titleAr"
              defaultValue={seo.titleAr}
              className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3"
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
              Title (English)
            </span>
            <input
              name="titleEn"
              defaultValue={seo.titleEn}
              dir="ltr"
              className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3"
              required
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
              الوصف (عربي)
            </span>
            <textarea
              name="descriptionAr"
              rows={3}
              defaultValue={seo.descriptionAr}
              className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3"
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
              Description (English)
            </span>
            <textarea
              name="descriptionEn"
              rows={3}
              defaultValue={seo.descriptionEn}
              dir="ltr"
              className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3"
              required
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
              الكلمات المفتاحية (عربي)
            </span>
            <input
              name="keywordsAr"
              defaultValue={seo.keywordsAr}
              className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase">
              Keywords (English)
            </span>
            <input
              name="keywordsEn"
              defaultValue={seo.keywordsEn}
              dir="ltr"
              className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3"
            />
          </label>
        </div>
        <SubmitMessage pending={pending} state={state} label="حفظ SEO لهذه الصفحة" />
      </form>
    </article>
  );
}

function SocialChannelsCard({ settings }: { settings: RuntimeSettings }) {
  const [state, formAction, pending] = useActionState(
    saveSocialChannelsAction,
    initialState,
  );
  return (
    <article className="surface-panel rounded-[1.85rem] p-6">
      <p className="text-ink-faint text-[10px] font-semibold uppercase tracking-[0.22em]">
        التواصل الاجتماعي
      </p>
      <h2 className="text-ink-strong mt-2 text-xl font-semibold tracking-tight">
        قنوات التواصل وإظهار الأيقونات
      </h2>
      <p className="text-ink-soft mt-2 text-sm leading-7">
        املأي الرابط الكامل لكل قناة. القنوات الفارغة لا تظهر للزوار. يمكن
        أيضًا إخفاء قناة موجود رابطها من المربع المقابل.
      </p>
      <form action={formAction} className="mt-5 grid gap-3 text-sm">
        {SOCIAL_CHANNELS.map((channel) => {
          const url = (settings.social as Record<string, string>)[channel.key] ?? "";
          const visible =
            settings.socialVisibility[channel.key] !== false;
          return (
            <div
              key={channel.key}
              className="border-line bg-surface grid items-center gap-3 rounded-[1.4rem] border p-3 md:grid-cols-[1fr_2fr_auto]"
            >
              <span className="text-ink-strong font-semibold">{channel.label}</span>
              <input
                name={`social_${channel.key}`}
                defaultValue={url}
                dir="ltr"
                placeholder="https://..."
                className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-3 py-2 text-xs outline-none"
              />
              <label className="flex items-center gap-2 text-xs text-ink-soft">
                <input
                  type="checkbox"
                  name={`visibility_${channel.key}`}
                  defaultChecked={visible}
                  className="size-4"
                />
                ظاهرة
              </label>
            </div>
          );
        })}
        <SubmitMessage pending={pending} state={state} label="حفظ قنوات التواصل" />
      </form>
    </article>
  );
}

function ToggleField({
  name,
  label,
  defaultChecked,
  helper,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
  helper?: string;
}) {
  return (
    <label className="border-line bg-surface flex items-center justify-between gap-3 rounded-[1.2rem] border p-3 text-sm">
      <div>
        <span className="text-ink-strong font-semibold">{label}</span>
        {helper ? (
          <span className="text-ink-faint mt-1 block text-[11px] leading-5">
            {helper}
          </span>
        ) : null}
      </div>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-5"
      />
    </label>
  );
}

function SubmitMessage({
  pending,
  state,
  label = "حفظ",
}: {
  pending: boolean;
  state: ExtraSettingsState;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="bg-ink text-canvas rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {pending ? "جاري الحفظ..." : label}
      </button>
      {state.message ? (
        <p
          className={`text-sm ${
            state.status === "success" ? "text-emerald" : "text-burgundy"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
