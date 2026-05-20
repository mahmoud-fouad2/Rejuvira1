import { ContentStatus } from "@prisma/client";

import type {
  CreateCustomPageInput,
  DeviceRecord,
  DoctorRecord,
  ServiceRecord,
} from "@/lib/content-repository";

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
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "utmContent",
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
          `<article><div><figure><small>قبل</small>${mediaSlot(item.before, `${item.title} قبل`)}</figure><figure><small>بعد</small>${mediaSlot(item.after, `${item.title} بعد`)}</figure></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body || "أضيفي وصف الحالة الحقيقي قبل إطلاق الحملة.")}</p></article>`,
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
    return `<section id="lead-form" class="${classes(block, "rv-builder-section rv-builder-lead-form")}" ${style}><div><small>${subtitle}</small><h2>${title}</h2>${paragraphHtml(body)}</div><form class="rv-builder-lead-form-fields" action="/api/leads" method="post"><input type="hidden" name="source" value="${title} landing page"><input type="hidden" name="preferredLanguage" value="ar">${trackingHiddenInputs()}${hiddenService}<label><span>الاسم الكامل</span><input name="fullName" autocomplete="name" required placeholder="الاسم الثلاثي"></label><label><span>رقم الجوال</span><input name="phone" inputmode="tel" autocomplete="tel" required placeholder="05xxxxxxxx"></label><label><span>البريد الإلكتروني</span><input name="email" type="email" autocomplete="email" placeholder="name@example.com"></label><label><span>تفاصيل الطلب</span><textarea name="message" rows="4" placeholder="اكتبي سؤالك أو الموعد المناسب"></textarea></label><input type="hidden" name="appointmentNotes" value="Service landing page request"><button type="submit">${buttonLabel}</button></form></section>`;
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
  return devices.filter((device) => service.deviceSlugs.includes(device.slug));
}

export function buildServiceLandingPageInput(
  service: ServiceRecord,
  doctors: readonly DoctorRecord[],
  devices: readonly DeviceRecord[],
): CreateCustomPageInput {
  const serviceDoctors = relatedDoctors(service, doctors);
  const serviceDevices = relatedDevices(service, devices);
  const slug = `lp-${service.slug}`;
  const doctorCount = serviceDoctors.length
    ? `${serviceDoctors.length}`
    : "حسب الحالة";
  const deviceCount = serviceDevices.length
    ? `${serviceDevices.length}`
    : "حسب الخطة";

  const blocks: LandingBlock[] = [
    {
      id: `${slug}-hero`,
      kind: "hero",
      title: service.name,
      subtitle: service.category,
      body: `${service.excerpt}\nصفحة مخصصة للحملات يمكن تعديل كل أقسامها من لوحة التحكم قبل إطلاق الإعلان.`,
      imageUrl: service.coverImageUrl,
      buttonLabel: "احجزي استشارة",
      buttonHref: "#lead-form",
      accent,
      tone: "soft",
      align: "right",
    },
    {
      id: `${slug}-stats`,
      kind: "stats",
      title: "لمحة سريعة",
      body: pairLines([
        { title: "القسم", body: service.category },
        { title: "أطباء مناسبون", body: doctorCount },
        { title: "أجهزة مرتبطة", body: deviceCount },
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
          title: "تقييم أولي",
          body: "يتم فهم الهدف الطبي والتجميلي وتحديد الخيار الأنسب للحالة.",
        },
        {
          title: "خطة واضحة",
          body: "توضيح الإجراء المناسب، التحضير، والتعليمات الأساسية قبل الموعد.",
        },
        {
          title: "متابعة بعد الزيارة",
          body: "تسجيل الطلب داخل CRM لمتابعة التواصل والحجز بصورة منظمة.",
        },
      ]),
      accent,
      tone: "light",
      align: "right",
    },
    {
      id: `${slug}-doctors`,
      kind: "doctors",
      title: "الأطباء المرتبطون بالخدمة",
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
      id: `${slug}-before-after`,
      kind: "beforeAfter",
      title: "قبل وبعد",
      body: `حالة ${service.name}|||أضيفي صور قبل وبعد الحقيقية من محرر الصفحة قبل إطلاق الإعلان، وسيظل الفورم مربوطًا بنفس الخدمة.`,
      accent,
      tone: "soft",
      align: "right",
    },
    {
      id: `${slug}-offer`,
      kind: "offer",
      title: "جاهزة لحملة إعلانية",
      subtitle: "Landing Page",
      body: pairLines([
        {
          title: "رسالة واضحة",
          body: "العنوان والوصف مرتبطان بالخدمة نفسها وليس نصًا عامًا.",
        },
        {
          title: "تتبع الطلب",
          body: "الفورم يرسل اسم الخدمة بالعربي إلى CRM والويب هوك.",
        },
        {
          title: "قابلة للتعديل",
          body: "يمكن تغيير الصور، النصوص، الأسئلة، والأطباء من محرر الصفحة.",
        },
      ]),
      buttonLabel: "ابدئي الحجز",
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
          body: "نعم، التقييم يساعد على اختيار الخطة المناسبة وتوضيح التوقعات الواقعية.",
        },
        {
          title: "هل النتائج متشابهة لكل الحالات؟",
          body: "النتيجة تختلف حسب الحالة والخطة الطبية، لذلك لا يتم اعتماد القرار إلا بعد التقييم.",
        },
        {
          title: "هل أستطيع تعديل هذه الصفحة قبل الإعلان؟",
          body: "نعم، الصفحة محفوظة داخل الصفحات المخصصة ويمكن تعديل النصوص والصور والأقسام بسهولة.",
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
      subtitle: "سيصل الطلب إلى CRM",
      body: "اتركي بياناتك وسيتم تسجيل الطلب مرتبطًا بالخدمة بالعربي داخل لوحة التحكم.",
      buttonLabel: "إرسال الطلب",
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
      title: "جاهزة للمراجعة النهائية قبل الإعلان",
      body: "راجعي صور قبل وبعد والنصوص النهائية، ثم استخدمي رابط الصفحة في حملاتك.",
      buttonLabel: "تواصل معنا",
      buttonHref: "/contact",
      accent,
      tone: "dark",
      align: "center",
    },
  ];

  return {
    slug,
    titleAr: `${service.name} - صفحة إعلان`,
    titleEn: service.nameEn ? `${service.nameEn} Landing Page` : undefined,
    htmlContent: renderPage(blocks),
    seoTitle: `${service.name} في ريجوفيرا`,
    seoDescription: `${service.excerpt} احجزي استشارة مرتبطة بخدمة ${service.name} وسيتم تسجيل طلبك مباشرة في لوحة التحكم.`,
    status: ContentStatus.PUBLISHED,
    noindex: false,
  };
}
