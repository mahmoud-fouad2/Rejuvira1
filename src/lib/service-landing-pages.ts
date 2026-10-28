import { ContentStatus } from "@prisma/client";

import type {
  CreateCustomPageInput,
  DeviceRecord,
  DoctorRecord,
  ServiceRecord,
} from "@/lib/content-repository";
import {
  SAUDI_MOBILE_INPUT_PATTERN,
  SAUDI_MOBILE_INPUT_TITLE,
} from "@/lib/saudi-phone";

type LandingBlockKind =
  | "hero"
  | "text"
  | "stats"
  | "services"
  | "doctors"
  | "devices"
  | "beforeAfter"
  | "faq"
  | "steps"
  | "offer"
  | "leadForm"
  | "cta";

type LandingBlock = {
  id: string;
  kind: LandingBlockKind;
  title: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  buttonLabel?: string;
  buttonHref?: string;
  accent?: string;
  tone?: "light" | "soft" | "dark";
  align?: "right" | "center" | "left";
  serviceSlug?: string;
  serviceName?: string;
};

const accent = "#4a2476";

const phoneInputAttrs = `inputmode="tel" autocomplete="tel" minlength="10" maxlength="13" pattern="${SAUDI_MOBILE_INPUT_PATTERN}" title="${SAUDI_MOBILE_INPUT_TITLE}" dir="ltr"`;

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphHtml(value = "") {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function parsePairs(value = "") {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = "", body = ""] = line.split("|");
      return { title: title.trim(), body: body.trim() };
    })
    .filter((item) => item.title);
}

function parseBeforeAfter(value = "") {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = "", before = "", after = "", body = ""] = line.split("|");
      return {
        title: title.trim(),
        before: before.trim(),
        after: after.trim(),
        body: body.trim(),
      };
    })
    .filter((item) => item.title);
}

function mediaSlot(src: string, label: string) {
  const safeSrc = escapeHtml(src);
  const safeLabel = escapeHtml(label);
  if (
    safeSrc &&
    (/^(\/|https?:\/\/)/i.test(safeSrc) || safeSrc.startsWith("data:image/"))
  ) {
    return `<img src="${safeSrc}" alt="${safeLabel}" loading="lazy" decoding="async">`;
  }
  return `<span>${safeLabel}</span>`;
}

function classes(block: LandingBlock, base: string) {
  return `${base} is-${block.tone ?? "light"} align-${block.align ?? "right"}`;
}

function trackingHiddenInputs() {
  return [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "gbraid",
    "wbraid",
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "utmContent",
    "utmTerm",
  ]
    .map((name) => `<input type="hidden" name="${name}" value="">`)
    .join("");
}

function renderBlock(block: LandingBlock) {
  const blockAccent = escapeHtml(block.accent || accent);
  const title = escapeHtml(block.title);
  const subtitle = escapeHtml(block.subtitle || "");
  const body = block.body || "";
  const image = escapeHtml(
    block.imageUrl || "/media/curated/clinic-treatment-room.jpeg",
  );
  const buttonLabel = escapeHtml(block.buttonLabel || "احجزي موعدك");
  const buttonHref = escapeHtml(block.buttonHref || "#lead-form");
  const style = `style="--builder-accent:${blockAccent}"`;

  if (block.kind === "hero") {
    return `<section class="${classes(block, "rv-builder-section rv-builder-hero")}" ${style}><div><small>${subtitle}</small><h1>${title}</h1>${paragraphHtml(body)}<a href="${buttonHref}">${buttonLabel}</a></div><figure><img src="${image}" alt="${title}" loading="lazy" decoding="async"></figure></section>`;
  }

  if (block.kind === "text") {
    return `<section class="${classes(block, "rv-builder-section rv-builder-text")}" ${style}><h2>${title}</h2><div>${paragraphHtml(body)}</div></section>`;
  }

  if (block.kind === "stats") {
    const stats = parsePairs(body)
      .map(
        (item) =>
          `<article><strong>${escapeHtml(item.body)}</strong><span>${escapeHtml(item.title)}</span></article>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-stats")}" ${style}><h2>${title}</h2><div>${stats}</div></section>`;
  }

  if (
    block.kind === "services" ||
    block.kind === "doctors" ||
    block.kind === "devices"
  ) {
    const cards = parsePairs(body)
      .map(
        (item) =>
          `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`,
      )
      .join("");
    return `<section class="${classes(block, `rv-builder-section rv-builder-${block.kind}`)}" ${style}><h2>${title}</h2><div>${cards}</div></section>`;
  }

  if (block.kind === "steps") {
    const steps = parsePairs(body)
      .map(
        (item, index) =>
          `<article><span>${index + 1}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-steps")}" ${style}><h2>${title}</h2><div>${steps}</div></section>`;
  }

  if (block.kind === "offer") {
    const perks = parsePairs(body)
      .map(
        (item) =>
          `<li><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span></li>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-offer")}" ${style}><div><small>${subtitle}</small><h2>${title}</h2><ul>${perks}</ul></div><a href="${buttonHref}">${buttonLabel}</a></section>`;
  }

  if (block.kind === "beforeAfter") {
    const cases = parseBeforeAfter(body)
      .map(
        (item) =>
          `<article><div><figure><small>قبل</small>${mediaSlot(item.before, `${item.title} قبل`)}</figure><figure><small>بعد</small>${mediaSlot(item.after, `${item.title} بعد`)}</figure></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body || "تختلف النتائج حسب الحالة والتقييم الطبي والخطة المناسبة.")}</p></article>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-before-after")}" ${style}><h2>${title}</h2><div>${cases}</div></section>`;
  }

  if (block.kind === "faq") {
    const faqs = parsePairs(body)
      .map(
        (item) =>
          `<details><summary>${escapeHtml(item.title)}</summary><p>${escapeHtml(item.body)}</p></details>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-faq")}" ${style}><h2>${title}</h2><div>${faqs}</div></section>`;
  }

  if (block.kind === "leadForm") {
    const serviceName = escapeHtml(block.serviceName || "");
    const serviceSlug = escapeHtml(block.serviceSlug || "");
    const hiddenService =
      serviceName || serviceSlug
        ? `<input type="hidden" name="serviceSlug" value="${serviceSlug}"><input type="hidden" name="service" value="${serviceName}"><input type="hidden" name="serviceName" value="${serviceName}"><input type="hidden" name="serviceLabel" value="${serviceName}"><input type="hidden" name="serviceType" value="${serviceName}"><input type="hidden" name="serviceTypeAr" value="${serviceName}">`
        : "";
    return `<section id="lead-form" class="${classes(block, "rv-builder-section rv-builder-lead-form")}" ${style}><div><small>${subtitle}</small><h2>${title}</h2>${paragraphHtml(body)}</div><form class="rv-builder-lead-form-fields" action="/api/leads" method="post"><input type="hidden" name="source" value="${serviceName || title} - صفحة هبوط"><input type="hidden" name="preferredLanguage" value="ar">${trackingHiddenInputs()}${hiddenService}<label><span>الاسم الكامل</span><input name="fullName" autocomplete="name" required placeholder="الاسم الثلاثي"></label><label><span>رقم الجوال</span><input name="phone" type="tel" ${phoneInputAttrs} required placeholder="05xxxxxxxx"></label><button type="submit">${buttonLabel}</button></form></section>`;
  }

  return `<section class="${classes(block, "rv-builder-section rv-builder-cta")}" ${style}><h2>${title}</h2>${paragraphHtml(body)}<a href="${buttonHref}">${buttonLabel}</a></section>`;
}

function renderPage(blocks: LandingBlock[]) {
  const encodedBlocks = encodeURIComponent(JSON.stringify(blocks));
  return `<div class="rv-builder-page" data-blocks="${encodedBlocks}">${blocks.map((block) => renderBlock(block)).join("")}</div>`;
}

function pairLines(items: ReadonlyArray<{ title: string; body: string }>) {
  return items.map((item) => `${item.title}|${item.body}`).join("\n");
}

function relatedDoctors(
  service: ServiceRecord,
  doctors: readonly DoctorRecord[],
) {
  const related = doctors.filter((doctor) =>
    service.doctorSlugs.includes(doctor.slug),
  );
  return related.length
    ? related
    : doctors.filter((doctor) => doctor.featured).slice(0, 3);
}

function relatedDevices(
  service: ServiceRecord,
  devices: readonly DeviceRecord[],
) {
  return devices.filter(
    (device) =>
      device.status === ContentStatus.PUBLISHED &&
      service.deviceSlugs.includes(device.slug),
  );
}

export function buildServiceLandingPageInput(
  service: ServiceRecord,
  doctors: readonly DoctorRecord[],
  devices: readonly DeviceRecord[],
): CreateCustomPageInput {
  const serviceDoctors = relatedDoctors(service, doctors);
  const serviceDevices = relatedDevices(service, devices);
  const slug = `lp-${service.slug}`;
  const supportLines = [
    "نصمّمها لتناسب ملامحك وتطلعاتك.",
    "بإشراف استشاري متخصص في كل مرحلة.",
    "برعاية ومتابعة بخصوصية تامة.",
  ];

  const blocks: LandingBlock[] = [
    {
      id: `${slug}-hero`,
      kind: "hero",
      title: service.name,
      subtitle: service.category,
      body: `${service.excerpt}\nاستشارة خاصة تبدأ بالإنصات لتطلعاتك، وسيرافقك فريق ريجوفيرا حتى تصلي إلى الخيار الأنسب لك بكل راحة وخصوصية.`,
      imageUrl: service.coverImageUrl,
      buttonLabel: "احجزي استشارتك الخاصة",
      buttonHref: "#lead-form",
      accent,
      tone: "soft",
      align: "right",
    },
    {
      id: `${slug}-stats`,
      kind: "stats",
      title: "تجربة تليق بك",
      body: pairLines([
        { title: "القسم", body: service.category },
        { title: "استشارة خاصة", body: "مع استشاريين متخصصين" },
        { title: "خطة علاجية", body: "مخصصة لك" },
        { title: "رعاية ومتابعة", body: "بخصوصية تامة" },
      ]),
      accent,
      tone: "light",
      align: "center",
    },
    {
      id: `${slug}-text`,
      kind: "text",
      title: `متى تكون ${service.name} مناسبة؟`,
      body: service.description,
      accent,
      tone: "light",
      align: "right",
    },
    {
      id: `${slug}-steps`,
      kind: "steps",
      title: "رحلة الحجز والمتابعة",
      body: pairLines([
        {
          title: "جلسة تعارف وتقييم",
          body: "ننصت لتطلعاتك الطبية والجمالية ونتعرف على الخيار الأنسب لك.",
        },
        {
          title: "خطة واضحة",
          body: "نشرح لك الإجراء المناسب والتحضير والتعليمات الأساسية قبل موعدك.",
        },
        {
          title: "رعاية بعد الزيارة",
          body: "يرافقك فريق ريجوفيرا بعد زيارتك ويتابع معك الخطوة المناسبة لك.",
        },
      ]),
      accent,
      tone: "light",
      align: "right",
    },
    {
      id: `${slug}-doctors`,
      kind: "doctors",
      title: "استشاريونا لهذه الخدمة",
      body: pairLines(
        serviceDoctors.map((doctor) => ({
          title: doctor.name,
          body: doctor.specialty || doctor.title,
        })),
      ),
      accent,
      tone: "soft",
      align: "right",
    },
    ...(serviceDevices.length
      ? [
          {
            id: `${slug}-devices`,
            kind: "devices" as const,
            title: "الأجهزة المستخدمة",
            body: pairLines(
              serviceDevices.map((device) => ({
                title: device.name,
                body: device.excerpt || device.description.slice(0, 140),
              })),
            ),
            accent,
            tone: "light" as const,
            align: "right" as const,
          },
        ]
      : []),
    {
      id: `${slug}-benefits`,
      kind: "services",
      title: `ماذا تقدم لك ${service.name}؟`,
      body: pairLines(
        (service.benefits.length
          ? service.benefits
          : [
              service.excerpt,
              "أمان طبي وإشراف استشاري متخصص في كل خطوة.",
              "نتائج طبيعية متناغمة تُصمَّم لملامحك.",
            ]
        ).map((benefit, index) => ({
          title: benefit,
          body: supportLines[index % supportLines.length]!,
        })),
      ),
      accent,
      tone: "soft",
      align: "right",
    },
    {
      id: `${slug}-offer`,
      kind: "offer",
      title: "لماذا تختارين ريجوفيرا؟",
      subtitle: "تجربة راقية بخصوصية تامة",
      body: pairLines([
        {
          title: "استشارة تبدأ بالإنصات",
          body: "نصغي لحالتك وتطلعاتك قبل اقتراح أي إجراء.",
        },
        {
          title: "خطة تناسبك",
          body: "نوجّهك إلى الخدمة والاستشاري الأنسب لهدفك وحالتك.",
        },
        {
          title: "تنسيق مريح",
          body: "ينسّق لك فريقنا الموعد الذي يناسبك بكل ترحاب.",
        },
      ]),
      buttonLabel: "احجزي استشارتك الخاصة",
      buttonHref: "#lead-form",
      accent,
      tone: "soft",
      align: "right",
    },
    {
      id: `${slug}-faq`,
      kind: "faq",
      title: "أسئلة مهمة قبل الحجز",
      body: pairLines([
        {
          title: "هل أحتاج إلى استشارة قبل الخدمة؟",
          body: "الاستشارة هي أجمل بداية: ننصت فيها لتطلعاتك ونوضح لك الخيارات الأنسب وما يمكن توقعه.",
        },
        {
          title: "هل النتائج متشابهة لكل الحالات؟",
          body: "لكل شخص ملامحه وجسمه، ولذلك نصمّم الخطة لتناسبك أنت، وتختلف النتيجة من شخص لآخر.",
        },
        {
          title: "ماذا يحدث بعد أن أشارككم بياناتي؟",
          body: "يتواصل معك فريق ريجوفيرا ليرتّب لك الموعد الأنسب بكل خصوصية وراحة.",
        },
      ]),
      accent,
      tone: "light",
      align: "right",
    },
    {
      id: `${slug}-lead-form`,
      kind: "leadForm",
      title: `احجزي استشارة ${service.name}`,
      subtitle: "جلسة استشارية خاصة",
      body: "سجلي بياناتك وسيتواصل معك مستشارك التجميلي لترتيب موعد استشارتك الخاصة والإجابة عن استفساراتك بكل خصوصية وراحة.",
      buttonLabel: "احجزي استشارتك الخاصة الآن",
      buttonHref: "/api/leads",
      accent,
      tone: "soft",
      align: "right",
      serviceSlug: service.slug,
      serviceName: service.name,
    },
    {
      id: `${slug}-cta`,
      kind: "cta",
      title: "ابدئي رحلتك بجلسة تليق بك",
      body: "شاركينا بياناتك، وينسّق لك فريق ريجوفيرا جلسة استشارية خاصة مع الاستشاري الأنسب.",
      buttonLabel: "احجزي استشارتك الخاصة",
      buttonHref: "#lead-form",
      accent,
      tone: "dark",
      align: "center",
    },
  ];

  return {
    slug,
    titleAr: `${service.name} في ريجوفيرا`,
    titleEn: service.nameEn ? `${service.nameEn} at Rejuvera` : undefined,
    htmlContent: renderPage(blocks),
    seoTitle: `${service.name} في ريجوفيرا`,
    seoDescription: `${service.excerpt} احجزي جلستك الاستشارية الخاصة في ريجوفيرا لتعرفي الخيار الأنسب لك.`,
    metaTitle: `${service.name} في ريجوفيرا`,
    metaDescription: `${service.excerpt} سجلي بياناتك وسيتواصل معك مستشارك لترتيب استشارتك الخاصة.`,
    keywords: [service.name, service.category, "ريجوفيرا", "الرياض"],
    ogTitle: `${service.name} | Rejuvera`,
    ogDescription: service.excerpt,
    ogImage: service.coverImageUrl,
    seoSlug: slug,
    hashtags: ["#ريجوفيرا", `#${service.name.replace(/\s+/g, "_")}`],
    formConfig: {
      fields: [
        { name: "fullName", type: "text", required: true },
        { name: "phone", type: "phone", required: true },
      ],
    },
    status: ContentStatus.PUBLISHED,
    noindex: false,
  };
}
