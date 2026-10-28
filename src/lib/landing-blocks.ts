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

/** The page's single CMS lead form from any form family, verbatim; null otherwise. */
export function extractAnyLeadForm(html: string): string | null {
  const forms = html.match(/<form\b[\s\S]*?<\/form>/gi) ?? [];
  const form = forms[0];
  if (
    forms.length !== 1 ||
    !form ||
    !/\bname=["']fullName["']/.test(form) ||
    !/\bname=["']phone["']/.test(form) ||
    !/\baction=["']\/api\/leads["']/.test(form)
  )
    return null;
  return form;
}

/** Reassurance lines that read as paperwork; replaced only as whole sentences. */
const FORM_NOTICE_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  [
    "إرسال الطلب لا يثبت الموعد تلقائيًا؛ يتواصل فريق ريجوفيرا لتأكيد الموعد وفق التوفر.",
    "سيتواصل معك فريق ريجوفيرا لتنسيق الموعد الأنسب لك.",
  ],
];

/**
 * Polishes only the visible words of the CMS lead form: the submit label and the
 * paperwork-style notice. Every attribute, field, hidden input and the privacy consent
 * line stay byte-identical, so the POST, validation and attribution are untouched.
 */
export function polishForm(form: string, submitLabel: string): string {
  const labelled = form.replace(
    /(<button\b[^>]*\btype=["']submit["'][^>]*>)([\s\S]*?)(<\/button>)/i,
    (_match, open: string, _text: string, close: string) =>
      `${open}${submitLabel}${close}`,
  );
  return FORM_NOTICE_REPLACEMENTS.reduce(
    (html, [from, to]) => html.replaceAll(from, to),
    labelled,
  );
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
    contacts: `<a class="fl-button fl-button--outline" href="${CLINIC_PHONE_TEL}">اتصال مباشر</a><a class="fl-button fl-button--whatsapp" href="${whatsapp}" target="_blank" rel="noopener noreferrer">تحدّث معنا عبر واتساب</a>`,
    book: (label: string) =>
      `<a class="fl-button" href="#consultation-form">${label}</a>`,
  };
}

export const pageShell = (marker: string, body: string) =>
  `<div class="fl-page" dir="rtl" ${marker}>${body}</div>`;

export const topBar = (ariaLabel: string) =>
  `<nav class="fl-top fl-wrap" aria-label="${ariaLabel}"><a class="fl-brand" href="/" aria-label="ريجوفيرا — الرئيسية"><img src="/media/brand/facelift-logo-02.png" alt="مركز ريجوفيرا الطبي" width="562" height="563" loading="eager" decoding="async" fetchpriority="high"></a><span>الرياض · مركز ريجوفيرا الطبي</span><a href="#consultation-form">احجز استشارتك الخاصة ←</a></nav>`;

export const checkList = (items: readonly string[]) =>
  `<ul class="fl-checks">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;

/** Compact doctor identity above the fold; same photo file as the profile section. */
export const heroDoctor = () =>
  `<div class="fl-doctor"><img src="${LOAI_ALSALMI.photo}" alt="${LOAI_ALSALMI.name}" width="96" height="96" loading="eager" decoding="async" fetchpriority="high"><div><strong>${LOAI_ALSALMI.name}</strong><p>${LOAI_ALSALMI.title}</p><span>${LOAI_ALSALMI.experience} · ${LOAI_ALSALMI.languages}</span></div></div>`;

export type HeroPerson = {
  name: string;
  title: string;
  photo: string;
  experience: string;
};

/** Compact identity cards for the surgeons who may see the patient. */
export const heroDoctors = (people: readonly HeroPerson[]) =>
  `<div class="fl-doctors">${people
    .map(
      (person, index) =>
        `<div class="fl-doctor"><img src="${person.photo}" alt="${person.name}" width="96" height="96" loading="eager" decoding="async"${index === 0 ? ' fetchpriority="high"' : ""}><div><strong>${person.name}</strong><p>${person.title}</p><span>${person.experience}</span></div></div>`,
    )
    .join("")}</div>`;

export type Colleague = HeroPerson & { summary: string; profile: string };

export const colleagueCard = (person: Colleague) =>
  `<div class="fl-team-card"><img src="${person.photo}" alt="${person.name}" width="800" height="800" loading="lazy" decoding="async"><div><strong>${person.name}</strong><span>${person.title} · ${person.experience}</span><p>${person.summary}</p><a class="fl-text-link" href="${person.profile}">اقرأ المزيد عن ${person.name} ←</a></div></div>`;

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
  const pair = (before: string, after: string, caption: string) =>
    `<figure><div class="fl-pair"><div>${before}<span>قبل</span></div><div>${after}<span>بعد</span></div></div><figcaption>${caption}</figcaption></figure>`;
  // Two pairs when the CMS gallery has four images, one pair for two or three.
  const pairs =
    images.length >= 4
      ? `<div class="fl-grid fl-gallery">${pair(images[0]!, images[1]!, options.captions[0])}${pair(images[2]!, images[3]!, options.captions[1])}</div>`
      : images.length >= 2
        ? `<div class="fl-grid fl-gallery fl-gallery--single">${pair(images[0]!, images[1]!, options.captions[0])}</div>`
        : `<p>${options.fallback}</p>`;
  return `<section class="fl-section fl-soft" id="${options.id}"><div class="fl-wrap"><p class="fl-eyebrow">${options.eyebrow}</p><h2>${options.heading}</h2><p>${options.note}</p>${pairs}<div class="fl-actions fl-actions--center">${options.cta}</div></div></section>`;
}

export type ServiceLink = { title: string; text: string; href: string };

/** Cards that lead to a dedicated page; keeps visitors one click from their topic. */
export const serviceLinks = (items: readonly ServiceLink[]) =>
  `<div class="fl-grid fl-options">${items
    .map(
      (item) =>
        `<a class="fl-card fl-card--link" href="${item.href}"><h3>${item.title}</h3><p>${item.text}</p><span class="fl-more">اعرف أكثر ←</span></a>`,
    )
    .join("")}</div>`;

export type TeamMember = {
  name: string;
  title: string;
  photo: string;
  blurb: string;
  href: string;
};

export const teamTiles = (members: readonly TeamMember[]) =>
  `<div class="fl-team-grid">${members
    .map(
      (member) =>
        `<a class="fl-team-tile" href="${member.href}"><img src="${member.photo}" alt="${member.name}" width="800" height="800" loading="lazy" decoding="async"><strong>${member.name}</strong><span>${member.title}</span><p>${member.blurb}</p></a>`,
    )
    .join("")}</div>`;

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
  `<nav class="fl-sticky" aria-label="التواصل السريع"><div><a href="#consultation-form">احجز استشارتك</a><a href="${CLINIC_PHONE_TEL}">اتصال مباشر</a><a href="${whatsapp}" target="_blank" rel="noopener noreferrer">واتساب</a></div></nav>`;
