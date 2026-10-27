import {
  CLINIC_PHONE_TEL,
  CLINIC_WHATSAPP_URL,
  LANDING_PAGE_WHATSAPP_MESSAGE,
  withGoogleWhatsappReferral,
} from "./clinic-contact.ts";
import { LOAI_ALSALMI } from "./landing-doctors.ts";

/** Shared building blocks for the code-rendered focused landing pages. Presentation
 * only: the CMS lead form and its hidden attribution fields are never rebuilt. */
type Pair = readonly [string, string];

export const escapeAttr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

/** The page's single CMS lead form, verbatim; null for any other layout. */
export function extractLeadForm(html: string): string | null {
  if (!/\brvx-form\b/.test(html)) return null;
  const forms = html.match(/<form\b[\s\S]*?<\/form>/gi) ?? [];
  if (
    forms.length !== 1 ||
    !/\bname=["']fullName["']/.test(forms[0]!) ||
    !/\bname=["']phone["']/.test(forms[0]!)
  )
    return null;
  return forms[0]!;
}

/** Reuse only the page's existing before/after assets, never manufacture cases. */
export function extractGalleryImages(html: string): string[] {
  const gallery = html
    .match(/<section\b[^>]*>[\s\S]*?<\/section>/gi)
    ?.find((section) => section.includes("أمثلة توضيحية قبل وبعد"));
  return gallery?.match(/<img\b[^>]*>/gi)?.slice(0, 4) ?? [];
}

export function landingLinks() {
  const whatsapp = escapeAttr(
    withGoogleWhatsappReferral(
      `${CLINIC_WHATSAPP_URL}?text=${encodeURIComponent(LANDING_PAGE_WHATSAPP_MESSAGE)}`,
    ),
  );
  return {
    whatsapp,
    contacts: `<a class="fl-button fl-button--outline" href="${CLINIC_PHONE_TEL}">اتصال مباشر</a><a class="fl-button fl-button--whatsapp" href="${whatsapp}" target="_blank" rel="noopener noreferrer">واتساب للمواعيد</a>`,
    book: (label: string) =>
      `<a class="fl-button" href="#consultation-form">${label}</a>`,
  };
}

export const pageShell = (marker: string, body: string) =>
  `<div class="fl-page" dir="rtl" ${marker}>${body}</div>`;

export const topBar = (ariaLabel: string) =>
  `<nav class="fl-top fl-wrap" aria-label="${ariaLabel}"><a class="fl-brand" href="/" aria-label="ريجوفيرا — الرئيسية"><img src="/media/brand/facelift-logo-02.png" alt="مركز ريجوفيرا الطبي" width="562" height="563" loading="eager" decoding="async" fetchpriority="high"></a><span>الرياض · مركز ريجوفيرا الطبي</span><a href="#consultation-form">طلب استشارة ←</a></nav>`;

export const checkList = (items: readonly string[]) =>
  `<ul class="fl-checks">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;

/** Compact doctor identity above the fold; same photo file as the profile section. */
export const heroDoctor = () =>
  `<div class="fl-doctor"><img src="${LOAI_ALSALMI.photo}" alt="${LOAI_ALSALMI.name}" width="96" height="96" loading="eager" decoding="async" fetchpriority="high"><div><strong>${LOAI_ALSALMI.name}</strong><p>${LOAI_ALSALMI.title}</p><span>${LOAI_ALSALMI.experience} · ${LOAI_ALSALMI.languages}</span></div></div>`;

export const formCard = (
  eyebrow: string,
  heading: string,
  text: string,
  form: string,
) =>
  `<div class="fl-form-card" id="consultation-form"><p class="fl-eyebrow">${eyebrow}</p><h2>${heading}</h2><p>${text}</p>${form}</div>`;

export const trustStrip = (label: string, items: readonly Pair[]) =>
  `<div class="fl-trust" role="group" aria-label="${label}"><ul class="fl-wrap">${items
    .map(
      ([strong, text]) =>
        `<li><strong>${strong}</strong><span>${text}</span></li>`,
    )
    .join("")}</ul></div>`;

/** "Meet the doctor": large portrait, sourced credentials and how the doctor works. */
export function doctorProfile(options: {
  id: string;
  eyebrow: string;
  heading: string;
  paragraphs: readonly string[];
  principlesHeading: string;
  principles: readonly string[];
  cta: string;
  extra?: string;
}) {
  const doctor = LOAI_ALSALMI;
  return `<section class="fl-section fl-soft" id="${options.id}"><div class="fl-wrap fl-profile"><figure class="fl-portrait"><img src="${doctor.photo}" alt="${doctor.name}، ${doctor.title}" width="800" height="800" loading="lazy" decoding="async"><figcaption><strong>${doctor.name}</strong><span>${doctor.title}</span></figcaption></figure><div class="fl-profile-text"><p class="fl-eyebrow">${options.eyebrow}</p><h2>${options.heading}</h2>${options.paragraphs
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("")}<ul class="fl-creds">${doctor.credentials
    .map(
      (credential) =>
        `<li><strong>${credential.title}</strong><span>${credential.detail}</span></li>`,
    )
    .join(
      "",
    )}</ul><p class="fl-mini-title">${options.principlesHeading}</p><ul class="fl-chips">${options.principles
    .map((principle) => `<li>${principle}</li>`)
    .join(
      "",
    )}</ul><div class="fl-actions">${options.cta}<a class="fl-text-link" href="${doctor.profile}">اقرأ المزيد عن ${doctor.name} ←</a></div>${options.extra ?? ""}</div></div></section>`;
}

export function beforeAfterGallery(options: {
  id: string;
  eyebrow: string;
  heading: string;
  note: string;
  images: readonly string[];
  captions: readonly [string, string];
  fallback: string;
  cta: string;
}) {
  const { images } = options;
  const pairs =
    images.length === 4
      ? `<div class="fl-grid fl-gallery"><figure><div class="fl-pair"><div>${images[0]}<span>قبل</span></div><div>${images[1]}<span>بعد</span></div></div><figcaption>${options.captions[0]}</figcaption></figure><figure><div class="fl-pair"><div>${images[2]}<span>قبل</span></div><div>${images[3]}<span>بعد</span></div></div><figcaption>${options.captions[1]}</figcaption></figure></div>`
      : `<p>${options.fallback}</p>`;
  return `<section class="fl-section fl-soft" id="${options.id}"><div class="fl-wrap"><p class="fl-eyebrow">${options.eyebrow}</p><h2>${options.heading}</h2><p>${options.note}</p>${pairs}<div class="fl-actions fl-actions--center">${options.cta}</div></div></section>`;
}

export const journey = (id: string, heading: string, steps: readonly Pair[]) =>
  `<section class="fl-section fl-soft" id="${id}"><div class="fl-wrap"><h2>${heading}</h2><ol class="fl-grid fl-steps fl-steps--${steps.length}">${steps
    .map(([title, text]) => `<li><strong>${title}</strong><p>${text}</p></li>`)
    .join("")}</ol></div></section>`;

export const finalBand = (heading: string, text: string, actions: string) =>
  `<div class="fl-final"><h3>${heading}</h3><p>${text}</p><div class="fl-actions">${actions}</div></div>`;

export function faqSection(options: {
  id: string;
  eyebrow: string;
  heading: string;
  items: readonly Pair[];
  after: string;
}) {
  return `<section class="fl-section" id="${options.id}"><div class="fl-wrap fl-faq"><p class="fl-eyebrow">${options.eyebrow}</p><h2>${options.heading}</h2>${options.items
    .map(
      ([question, answer]) =>
        `<details><summary>${question}</summary><p>${answer}</p></details>`,
    )
    .join("")}${options.after}</div></section>`;
}

export const searchGuide = (id: string, content: string) =>
  `<div class="fl-wrap fl-bottom-guide"><div class="fl-search-content" id="${id}">${content}</div></div>`;

export const stickyBar = (whatsapp: string) =>
  `<nav class="fl-sticky" aria-label="التواصل السريع"><div><a href="#consultation-form">احجز تقييمك</a><a href="${CLINIC_PHONE_TEL}">اتصال مباشر</a><a href="${whatsapp}" target="_blank" rel="noopener noreferrer">واتساب</a></div></nav>`;
