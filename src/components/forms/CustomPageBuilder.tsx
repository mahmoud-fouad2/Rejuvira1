"use client";

import { useMemo, useState } from "react";

import { ImagePicker } from "@/components/admin/ImagePicker";
import {
  APPOINTMENT_TIME_OPTIONS,
  buildAppointmentDateOptions,
} from "@/lib/appointment-slots";

type BlockKind =
  | "hero"
  | "text"
  | "image"
  | "stats"
  | "services"
  | "doctors"
  | "gallery"
  | "faq"
  | "steps"
  | "offer"
  | "testimonial"
  | "beforeAfter"
  | "video"
  | "leadForm"
  | "contact"
  | "cta";

type Tone = "light" | "soft" | "dark";
type Align = "right" | "center" | "left";

type BuilderBlock = {
  id: string;
  kind: BlockKind;
  title: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  buttonLabel?: string;
  buttonHref?: string;
  accent?: string;
  tone?: Tone;
  align?: Align;
  formEmailMode?: "hidden" | "optional" | "required";
  formShowAppointment?: boolean;
  formShowMessage?: boolean;
  webhookToken?: string;
  serviceSlug?: string;
};

type PageOptions = {
  showHeader: boolean;
  showFooter: boolean;
};

type WebhookOption = {
  token: string;
  name: string;
  isActive: boolean;
};

const blockLibrary: Array<{ kind: BlockKind; label: string; hint: string }> = [
  { kind: "hero", label: "Hero", hint: "واجهة أولى مع صورة وزر" },
  { kind: "text", label: "Text", hint: "محتوى طبي منظم" },
  { kind: "image", label: "Image", hint: "صورة أو حالة بصرية" },
  { kind: "stats", label: "Stats", hint: "أرقام ومؤشرات" },
  { kind: "services", label: "Services", hint: "كروت خدمات" },
  { kind: "doctors", label: "Doctors", hint: "أطباء أو فريق طبي" },
  { kind: "gallery", label: "Gallery", hint: "صور متعددة" },
  { kind: "faq", label: "FAQ", hint: "أسئلة شائعة" },
  { kind: "steps", label: "Steps", hint: "مسار زيارة أو علاج" },
  { kind: "offer", label: "Offer", hint: "عرض أو باقة للحملة" },
  { kind: "testimonial", label: "Review", hint: "اقتباس وتجربة عميل" },
  { kind: "video", label: "Video", hint: "فيديو أو صورة معاينة" },
  { kind: "leadForm", label: "Lead Form", hint: "فورم يحفظ في CRM" },
  { kind: "contact", label: "Contact", hint: "بيانات تواصل" },
  { kind: "cta", label: "CTA", hint: "دعوة للحجز" },
];

const presets: Record<BlockKind, Omit<BuilderBlock, "id" | "kind">> = {
  hero: {
    title: "خطة علاجية مصممة بعناية",
    subtitle: "ريجوفيرا",
    body: "صفحة مخصصة تعرض الخدمة أو العرض الطبي بلغة واضحة وتصميم متوازن يساعد الزائر على اتخاذ القرار.",
    imageUrl: "/media/curated/clinic-treatment-room.jpeg",
    buttonLabel: "احجزي موعدك",
    buttonHref: "/contact",
    accent: "#4a2476",
    tone: "soft",
    align: "right",
  },
  text: {
    title: "لماذا هذه الصفحة؟",
    body: "اكتبي هنا شرحًا واضحًا للميزة أو الخدمة. اجعلي الفقرة قصيرة ومباشرة ومرتبطة بما يحتاجه الزائر قبل التواصل.",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  image: {
    title: "صورة داعمة",
    body: "وصف قصير للصورة أو الحالة.",
    imageUrl: "/media/curated/service-skin-rejuvenation.webp",
    accent: "#4a2476",
    tone: "light",
    align: "center",
  },
  stats: {
    title: "مؤشرات الثقة",
    body: "سنوات خبرة|12+\nأطباء متخصصون|10\nخدمات متقدمة|24\nمتابعة منظمة|100%",
    accent: "#4a2476",
    tone: "light",
    align: "center",
  },
  services: {
    title: "خدمات مرتبطة",
    body: "تجديد البشرة المتقدم|خطة متدرجة لتحسين نضارة البشرة\nإزالة الشعر بالليزر|جلسات منظمة حسب نوع البشرة\nتناغم الوجه بالحقن|تحسين محسوب يحافظ على الملامح",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  doctors: {
    title: "فريق طبي مناسب للخطة",
    body: "د. لؤي السالمي|استشاري جراحة التجميل والترميم\nد. ناتالي دوملوج|استشارية الجلدية والتجميل\nد. سهام العرفج|استشارية جراحة التجميل والترميم",
    accent: "#4a2476",
    tone: "soft",
    align: "right",
  },
  gallery: {
    title: "لمحة بصرية",
    body: "/media/reference/legacy/18.png|نتيجة علاجية\n/media/reference/legacy/56549.webp|تنسيق القوام\n/media/curated/service-laser-hair-removal.jpg|جلسات الليزر",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  faq: {
    title: "أسئلة شائعة",
    body: "هل أحتاج إلى استشارة قبل الإجراء؟|نعم، التقييم يساعد على اختيار الخطة الأنسب.\nمتى تظهر النتيجة؟|يختلف ذلك حسب الإجراء وطبيعة الحالة.\nهل يمكن تعديل الصفحة لاحقًا؟|نعم، يمكن تعديل البلوكات وإعادة ترتيبها من لوحة التحكم.",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  steps: {
    title: "مسار الزيارة",
    body: "تقييم الحالة|نراجع الاحتياج والتوقعات قبل اختيار الخطة\nاختيار الإجراء|نقارن الخيارات المناسبة للحالة بوضوح\nالمتابعة|نوضح التعليمات والمتابعة بعد الزيارة",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  offer: {
    title: "عرض الحملة",
    subtitle: "مناسب لفترة محدودة",
    body: "استشارة أولية|تقييم طبي وخطة مناسبة\nجلسة متابعة|مراجعة التعليمات والنتيجة\nأولوية حجز|تنسيق موعد مناسب مع الفريق",
    buttonLabel: "احجزي العرض",
    buttonHref: "#lead-form",
    accent: "#4a2476",
    tone: "soft",
    align: "right",
  },
  testimonial: {
    title: "تجربة مراجعة",
    subtitle: "نورة",
    body: "الشرح كان واضحًا قبل البدء، والفريق وضح لي الخيارات المناسبة دون استعجال.",
    accent: "#4a2476",
    tone: "light",
    align: "center",
  },
  beforeAfter: {
    title: "Before and after",
    body: "Visual comparison for the case.",
    beforeImageUrl: "/media/reference/legacy/18.png",
    afterImageUrl: "/media/reference/legacy/56549.webp",
    buttonLabel: "Book a consultation",
    buttonHref: "#lead-form",
    accent: "#4a2476",
    tone: "light",
    align: "center",
  },
  video: {
    title: "فيديو تعريفي",
    body: "استخدمي رابط صورة معاينة أو ارفعي صورة مؤقتة حتى إضافة الفيديو النهائي.",
    imageUrl: "/media/curated/clinic-treatment-room.jpeg",
    buttonLabel: "مشاهدة التفاصيل",
    buttonHref: "/contact",
    accent: "#4a2476",
    tone: "dark",
    align: "center",
  },
  leadForm: {
    title: "احجزي استشارتك",
    subtitle: "Lead form",
    body: "املئي البيانات وسيصل الطلب مباشرة إلى CRM داخل لوحة التحكم.",
    buttonLabel: "إرسال الطلب",
    buttonHref: "/api/leads",
    accent: "#4a2476",
    tone: "soft",
    align: "right",
    formEmailMode: "optional",
    formShowAppointment: true,
    formShowMessage: true,
  },
  contact: {
    title: "ابدئي بخطوة واضحة",
    body: "الهاتف|0114999959\nواتساب|9200 17403\nالبريد|info@rejuvera.sa",
    buttonLabel: "افتحي صفحة التواصل",
    buttonHref: "/contact",
    accent: "#4a2476",
    tone: "dark",
    align: "center",
  },
  cta: {
    title: "اعرفي الخيار الأنسب لحالتك",
    body: "تواصلي مع الفريق لترتيب استشارة واضحة ومناسبة.",
    buttonLabel: "التواصل والحجز",
    buttonHref: "/contact",
    accent: "#4a2476",
    tone: "soft",
    align: "center",
  },
};

const templates: Array<{ label: string; blocks: BlockKind[] }> = [
  {
    label: "صفحة خدمة",
    blocks: [
      "hero",
      "stats",
      "steps",
      "services",
      "doctors",
      "faq",
      "leadForm",
      "cta",
    ],
  },
  {
    label: "Lead page",
    blocks: [
      "hero",
      "offer",
      "beforeAfter",
      "testimonial",
      "gallery",
      "leadForm",
      "faq",
    ],
  },
  {
    label: "حملة حجز",
    blocks: ["hero", "text", "gallery", "leadForm", "contact", "faq"],
  },
  { label: "تعريف طبي", blocks: ["hero", "text", "video", "services", "cta"] },
];

function uid() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function appointmentDateSelect(disabled: string) {
  const options = buildAppointmentDateOptions()
    .map(
      (date) =>
        `<option value="${date.value}">${escapeHtml(date.labelAr)}</option>`,
    )
    .join("");
  return `<select name="preferredDate"${disabled}><option value="">اختاري اليوم</option>${options}</select>`;
}

function appointmentTimeSelect(disabled: string) {
  const options = APPOINTMENT_TIME_OPTIONS.map(
    (slot) =>
      `<option value="${slot.value}">${escapeHtml(slot.labelAr)}</option>`,
  ).join("");
  return `<select name="preferredTime"${disabled}><option value="">اختاري الوقت</option>${options}</select>`;
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

function classes(block: BuilderBlock, base: string) {
  return `${base} is-${block.tone ?? "light"} align-${block.align ?? "right"}`;
}

function renderBlock(block: BuilderBlock, mode: "html" | "preview" = "html") {
  const accent = escapeHtml(block.accent || "#4a2476");
  const title = escapeHtml(block.title);
  const subtitle = escapeHtml(block.subtitle || "");
  const body = block.body || "";
  const image = escapeHtml(
    block.imageUrl || "/media/curated/clinic-treatment-room.jpeg",
  );
  const buttonLabel = escapeHtml(block.buttonLabel || "احجزي موعدك");
  const buttonHref = escapeHtml(block.buttonHref || "/contact");
  const style = `style="--builder-accent:${accent}"`;

  if (block.kind === "hero") {
    return `<section class="${classes(block, "rv-builder-section rv-builder-hero")}" ${style}><div><small>${subtitle}</small><h1>${title}</h1>${paragraphHtml(body)}<a href="${buttonHref}">${buttonLabel}</a></div><figure><img src="${image}" alt="${title}" loading="lazy" decoding="async"></figure></section>`;
  }

  if (block.kind === "text") {
    return `<section class="${classes(block, "rv-builder-section rv-builder-text")}" ${style}><h2>${title}</h2><div>${paragraphHtml(body)}</div></section>`;
  }

  if (block.kind === "image") {
    return `<section class="${classes(block, "rv-builder-section rv-builder-image")}" ${style}><figure><img src="${image}" alt="${title}" loading="lazy" decoding="async"><figcaption>${title}${body ? ` - ${escapeHtml(body)}` : ""}</figcaption></figure></section>`;
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

  if (block.kind === "services" || block.kind === "doctors") {
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

  if (block.kind === "testimonial") {
    return `<section class="${classes(block, "rv-builder-section rv-builder-testimonial")}" ${style}><blockquote>${paragraphHtml(body)}</blockquote><strong>${title}</strong>${subtitle ? `<span>${subtitle}</span>` : ""}</section>`;
  }

  if (block.kind === "beforeAfter") {
    const beforeImage = escapeHtml(
      block.beforeImageUrl || block.imageUrl || image,
    );
    const afterImage = escapeHtml(block.afterImageUrl || image);
    return `<section class="${classes(block, "rv-builder-section rv-builder-before-after")}" ${style}><div><small>${subtitle}</small><h2>${title}</h2>${paragraphHtml(body)}</div><div class="rv-builder-before-after__grid"><figure><img src="${beforeImage}" alt="Before ${title}" loading="lazy" decoding="async"><figcaption>Before</figcaption></figure><figure><img src="${afterImage}" alt="After ${title}" loading="lazy" decoding="async"><figcaption>After</figcaption></figure></div><a href="${buttonHref}">${buttonLabel}</a></section>`;
  }

  if (block.kind === "video") {
    return `<section class="${classes(block, "rv-builder-section rv-builder-video")}" ${style}><figure><img src="${image}" alt="${title}" loading="lazy" decoding="async"><span>▶</span></figure><div><h2>${title}</h2>${paragraphHtml(body)}<a href="${buttonHref}">${buttonLabel}</a></div></section>`;
  }

  if (block.kind === "gallery") {
    const images = parsePairs(body)
      .map(
        (item) =>
          `<figure><img src="${escapeHtml(item.title)}" alt="${escapeHtml(item.body || title)}" loading="lazy" decoding="async"><figcaption>${escapeHtml(item.body)}</figcaption></figure>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-gallery")}" ${style}><h2>${title}</h2><div>${images}</div></section>`;
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

  if (block.kind === "contact") {
    const rows = parsePairs(body)
      .map(
        (item) =>
          `<li><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span></li>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-contact")}" ${style}><h2>${title}</h2><ul>${rows}</ul><a href="${buttonHref}">${buttonLabel}</a></section>`;
  }

  if (block.kind === "leadForm") {
    const tag = mode === "preview" ? "div" : "form";
    const action = block.webhookToken
      ? `/api/webhooks/${encodeURIComponent(block.webhookToken)}`
      : "/api/leads";
    const attrs =
      mode === "preview"
        ? `class="rv-builder-lead-form-fields" aria-label="Lead form preview"`
        : `class="rv-builder-lead-form-fields" action="${action}" method="post"`;
    const disabled = mode === "preview" ? " disabled" : "";
    const required = mode === "preview" ? "" : " required";
    let controls =
      (mode === "preview"
        ? ""
        : `<input type="hidden" name="source" value="${title} landing page"><input type="hidden" name="preferredLanguage" value="ar">`) +
      `<label><span>الاسم الكامل</span><input name="fullName" autocomplete="name"${required}${disabled} placeholder="الاسم الثلاثي"></label>` +
      `<label><span>رقم الجوال</span><input name="phone" inputmode="tel" autocomplete="tel"${required}${disabled} placeholder="05xxxxxxxx"></label>` +
      `<label><span>تاريخ الموعد المفضل</span>${appointmentDateSelect(disabled)}</label>` +
      `<label><span>الوقت المفضل</span>${appointmentTimeSelect(disabled)}</label>` +
      `<label><span>البريد الإلكتروني</span><input name="email" type="email" autocomplete="email"${disabled} placeholder="name@example.com"></label>` +
      `<label><span>تفاصيل الطلب</span><textarea name="message" rows="4"${disabled} placeholder="اكتبي الخدمة أو الموعد المناسب"></textarea></label>` +
      (mode === "preview"
        ? ""
        : `<input type="hidden" name="appointmentNotes" value="Landing page appointment request">`) +
      `<button type="${mode === "preview" ? "button" : "submit"}">${buttonLabel}</button>`;
    if (mode !== "preview" && block.serviceSlug) {
      controls =
        `<input type="hidden" name="serviceSlug" value="${escapeHtml(block.serviceSlug)}">` +
        controls;
    }
    if ((block.formEmailMode ?? "optional") === "hidden") {
      controls = controls.replace(
        /<label><span>[^<]*<\/span><input name="email"[\s\S]*?<\/label>/,
        "",
      );
    } else if (mode !== "preview" && block.formEmailMode === "required") {
      controls = controls.replace(
        'name="email" type="email"',
        'name="email" type="email" required',
      );
    }
    if (block.formShowAppointment === false) {
      controls = controls
        .replace(
          /<label><span>[^<]*<\/span><select name="preferredDate"[\s\S]*?<\/label>/,
          "",
        )
        .replace(
          /<label><span>[^<]*<\/span><select name="preferredTime"[\s\S]*?<\/label>/,
          "",
        )
        .replace(
          '<input type="hidden" name="appointmentNotes" value="Landing page appointment request">',
          "",
        );
    }
    if (block.formShowMessage === false) {
      controls = controls.replace(
        /<label><span>[^<]*<\/span><textarea name="message"[\s\S]*?<\/label>/,
        "",
      );
    }
    return `<section id="lead-form" class="${classes(block, "rv-builder-section rv-builder-lead-form")}" ${style}><div><small>${subtitle}</small><h2>${title}</h2>${paragraphHtml(body)}</div><${tag} ${attrs}>${controls}</${tag}></section>`;
  }

  return `<section class="${classes(block, "rv-builder-section rv-builder-cta")}" ${style}><h2>${title}</h2>${paragraphHtml(body)}<a href="${buttonHref}">${buttonLabel}</a></section>`;
}

function renderPage(blocks: BuilderBlock[], options: PageOptions) {
  const encodedBlocks = encodeURIComponent(JSON.stringify(blocks));
  return `<div class="rv-builder-page" data-blocks="${encodedBlocks}" data-header="${options.showHeader ? "true" : "false"}" data-footer="${options.showFooter ? "true" : "false"}">${blocks.map((block) => renderBlock(block)).join("")}</div>`;
}

function createBlock(kind: BlockKind): BuilderBlock {
  return { id: uid(), kind, ...presets[kind] };
}

function createTemplate(kinds: BlockKind[]) {
  return kinds.map(createBlock);
}

function initialBlocks(html?: string): BuilderBlock[] {
  if (html?.includes("rv-builder-page")) {
    const encoded = html.match(/data-blocks="([^"]+)"/)?.[1];
    if (encoded) {
      try {
        const parsed = JSON.parse(
          decodeURIComponent(encoded),
        ) as BuilderBlock[];
        const valid = parsed.filter(
          (block) => block.id && block.kind && block.title,
        );
        if (valid.length) return valid;
      } catch {
        return createTemplate(["hero", "text", "cta"]);
      }
    }
    return createTemplate(["hero", "text", "leadForm", "cta"]);
  }
  if (html?.trim()) {
    return [
      {
        ...createBlock("text"),
        title: "محتوى الصفحة الحالي",
        body: "تم الاحتفاظ بالمحتوى الحالي في قاعدة البيانات. ابنِ نسخة احترافية بالبلوكات واحفظها عند الجاهزية.",
      },
    ];
  }
  return createTemplate([
    "hero",
    "stats",
    "steps",
    "services",
    "faq",
    "leadForm",
    "cta",
  ]);
}

function initialPageOptions(html?: string): PageOptions {
  return {
    showHeader: html?.match(/data-header="false"/) ? false : true,
    showFooter: html?.match(/data-footer="false"/) ? false : true,
  };
}

export function CustomPageBuilder({
  name,
  defaultValue = "",
  webhooks = [],
}: {
  name: string;
  defaultValue?: string;
  webhooks?: WebhookOption[];
}) {
  const [blocks, setBlocks] = useState<BuilderBlock[]>(() =>
    initialBlocks(defaultValue),
  );
  const [pageOptions, setPageOptions] = useState<PageOptions>(() =>
    initialPageOptions(defaultValue),
  );
  const [selectedId, setSelectedId] = useState(blocks[0]?.id ?? "");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showCode, setShowCode] = useState(false);
  const selected = blocks.find((block) => block.id === selectedId) ?? blocks[0];
  const html = useMemo(
    () => renderPage(blocks, pageOptions),
    [blocks, pageOptions],
  );

  function add(kind: BlockKind) {
    const next = createBlock(kind);
    setBlocks((current) => [...current, next]);
    setSelectedId(next.id);
  }

  function applyTemplate(kinds: BlockKind[]) {
    const next = createTemplate(kinds);
    setBlocks(next);
    setSelectedId(next[0]?.id ?? "");
  }

  function update(id: string, patch: Partial<BuilderBlock>) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === id ? { ...block, ...patch } : block,
      ),
    );
  }

  function duplicate(id: string) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const source = current[index];
      if (!source) return current;
      const copy = { ...source, id: uid(), title: `${source.title} - نسخة` };
      const next = [...current];
      next.splice(index + 1, 0, copy);
      setSelectedId(copy.id);
      return next;
    });
  }

  function remove(id: string) {
    setBlocks((current) => {
      const next = current.filter((block) => block.id !== id);
      setSelectedId(next[0]?.id ?? "");
      return next;
    });
  }

  function move(id: string, direction: -1 | 1) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      if (!item) return current;
      next.splice(target, 0, item);
      return next;
    });
  }

  function dropOn(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    setBlocks((current) => {
      const dragged = current.find((block) => block.id === draggedId);
      if (!dragged) return current;
      const without = current.filter((block) => block.id !== draggedId);
      const targetIndex = without.findIndex((block) => block.id === targetId);
      if (targetIndex < 0) return current;
      const next = [...without];
      next.splice(targetIndex, 0, dragged);
      return next;
    });
    setDraggedId(null);
  }

  return (
    <div className="pagecraft-admin">
      <input type="hidden" name={name} value={html} />
      <aside className="pagecraft-panel">
        <div className="pagecraft-panel__header">Page chrome</div>
        <div className="pagecraft-options">
          <label>
            <input
              type="checkbox"
              checked={pageOptions.showHeader}
              onChange={(event) =>
                setPageOptions((current) => ({
                  ...current,
                  showHeader: event.target.checked,
                }))
              }
            />
            <span>Show site header</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={pageOptions.showFooter}
              onChange={(event) =>
                setPageOptions((current) => ({
                  ...current,
                  showFooter: event.target.checked,
                }))
              }
            />
            <span>Show site footer</span>
          </label>
        </div>
        <div className="pagecraft-panel__header">القوالب</div>
        <div className="pagecraft-templates">
          {templates.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => applyTemplate(template.blocks)}
            >
              {template.label}
            </button>
          ))}
        </div>

        <div className="pagecraft-panel__header">العناصر</div>
        <div className="pagecraft-elements">
          {blockLibrary.map((item) => (
            <button
              key={item.kind}
              type="button"
              onClick={() => add(item.kind)}
            >
              <strong>{item.label}</strong>
              <span>{item.hint}</span>
            </button>
          ))}
          <button type="button" onClick={() => add("beforeAfter")}>
            <strong>Before/After</strong>
            <span>Before and after images</span>
          </button>
        </div>

        <div className="pagecraft-panel__header">المعاينة</div>
        <div className="pagecraft-devices">
          {(["desktop", "tablet", "mobile"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={mode === item ? "is-active" : ""}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="pagecraft-code-toggle"
          onClick={() => setShowCode((value) => !value)}
        >
          {showCode ? "إخفاء HTML" : "فحص HTML"}
        </button>
      </aside>

      <main className="pagecraft-canvas-wrap">
        {showCode ? (
          <textarea className="pagecraft-code" readOnly value={html} />
        ) : (
          <div className={`pagecraft-canvas is-${mode}`}>
            {blocks.map((block, index) => (
              <section
                key={block.id}
                draggable
                onDragStart={() => setDraggedId(block.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => dropOn(block.id)}
                onClick={() => setSelectedId(block.id)}
                className={`pagecraft-block ${selectedId === block.id ? "is-selected" : ""}`}
              >
                <div className="pagecraft-block__tools">
                  <button
                    type="button"
                    onClick={() => move(block.id, -1)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(block.id, 1)}
                    disabled={index === blocks.length - 1}
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => duplicate(block.id)}>
                    نسخ
                  </button>
                  <button type="button" onClick={() => remove(block.id)}>
                    حذف
                  </button>
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderBlock(block, "preview"),
                  }}
                />
              </section>
            ))}
          </div>
        )}
      </main>

      <aside className="pagecraft-panel">
        <div className="pagecraft-panel__header">الخصائص</div>
        {selected ? (
          <div className="pagecraft-props">
            <label>
              <span>العنوان</span>
              <input
                value={selected.title}
                onChange={(event) =>
                  update(selected.id, { title: event.target.value })
                }
              />
            </label>
            <label>
              <span>وصف قصير</span>
              <input
                value={selected.subtitle ?? ""}
                onChange={(event) =>
                  update(selected.id, { subtitle: event.target.value })
                }
              />
            </label>
            <label>
              <span>
                المحتوى
                {selected.kind === "services" ||
                selected.kind === "doctors" ||
                selected.kind === "stats" ||
                selected.kind === "gallery" ||
                selected.kind === "faq" ||
                selected.kind === "steps" ||
                selected.kind === "offer" ||
                selected.kind === "contact"
                  ? " (سطر لكل عنصر: عنوان|وصف)"
                  : ""}
              </span>
              <textarea
                value={selected.body ?? ""}
                rows={
                  [
                    "services",
                    "doctors",
                    "stats",
                    "gallery",
                    "faq",
                    "steps",
                    "offer",
                    "contact",
                  ].includes(selected.kind)
                    ? 8
                    : 5
                }
                onChange={(event) =>
                  update(selected.id, { body: event.target.value })
                }
              />
            </label>

            {selected.kind === "hero" ||
            selected.kind === "image" ||
            selected.kind === "video" ? (
              <ImagePicker
                name={`builder-${selected.id}-image`}
                label="الصورة"
                defaultValue={selected.imageUrl ?? ""}
                namespace="pages"
                aspect={16 / 9}
                onChange={(url) => update(selected.id, { imageUrl: url })}
              />
            ) : null}

            {selected.kind === "beforeAfter" ? (
              <div className="grid gap-3">
                <ImagePicker
                  name={`builder-${selected.id}-before`}
                  label="Before image"
                  defaultValue={selected.beforeImageUrl ?? ""}
                  namespace="pages"
                  aspect={4 / 3}
                  onChange={(url) =>
                    update(selected.id, { beforeImageUrl: url })
                  }
                />
                <ImagePicker
                  name={`builder-${selected.id}-after`}
                  label="After image"
                  defaultValue={selected.afterImageUrl ?? ""}
                  namespace="pages"
                  aspect={4 / 3}
                  onChange={(url) =>
                    update(selected.id, { afterImageUrl: url })
                  }
                />
              </div>
            ) : null}

            {selected.kind === "leadForm" ? (
              <div className="pagecraft-form-options">
                <label>
                  <span>Email field</span>
                  <select
                    value={selected.formEmailMode ?? "optional"}
                    onChange={(event) =>
                      update(selected.id, {
                        formEmailMode: event.target.value as
                          | "hidden"
                          | "optional"
                          | "required",
                      })
                    }
                  >
                    <option value="hidden">Hidden</option>
                    <option value="optional">Optional</option>
                    <option value="required">Required</option>
                  </select>
                </label>
                <label>
                  <span>Webhook</span>
                  <select
                    value={selected.webhookToken ?? ""}
                    onChange={(event) =>
                      update(selected.id, { webhookToken: event.target.value })
                    }
                  >
                    <option value="">Default CRM form</option>
                    {webhooks
                      .filter((webhook) => webhook.isActive)
                      .map((webhook) => (
                        <option key={webhook.token} value={webhook.token}>
                          {webhook.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  <span>Service slug</span>
                  <input
                    dir="ltr"
                    value={selected.serviceSlug ?? ""}
                    onChange={(event) =>
                      update(selected.id, { serviceSlug: event.target.value })
                    }
                    placeholder="rhinoplasty"
                  />
                </label>
                <label className="pagecraft-check-row">
                  <input
                    type="checkbox"
                    checked={selected.formShowAppointment !== false}
                    onChange={(event) =>
                      update(selected.id, {
                        formShowAppointment: event.target.checked,
                      })
                    }
                  />
                  <span>Show appointment date/time</span>
                </label>
                <label className="pagecraft-check-row">
                  <input
                    type="checkbox"
                    checked={selected.formShowMessage !== false}
                    onChange={(event) =>
                      update(selected.id, {
                        formShowMessage: event.target.checked,
                      })
                    }
                  />
                  <span>Show message field</span>
                </label>
              </div>
            ) : null}

            {selected.kind === "hero" ||
            selected.kind === "cta" ||
            selected.kind === "contact" ||
            selected.kind === "offer" ||
            selected.kind === "video" ||
            selected.kind === "leadForm" ? (
              <div className="grid gap-2">
                <label>
                  <span>نص الزر</span>
                  <input
                    value={selected.buttonLabel ?? ""}
                    onChange={(event) =>
                      update(selected.id, { buttonLabel: event.target.value })
                    }
                  />
                </label>
                <label>
                  <span>رابط الزر</span>
                  <input
                    dir="ltr"
                    value={selected.buttonHref ?? ""}
                    onChange={(event) =>
                      update(selected.id, { buttonHref: event.target.value })
                    }
                  />
                </label>
              </div>
            ) : null}

            <div className="pagecraft-segment">
              {(["right", "center", "left"] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  className={
                    (selected.align ?? "right") === align ? "is-active" : ""
                  }
                  onClick={() => update(selected.id, { align })}
                >
                  {align}
                </button>
              ))}
            </div>
            <div className="pagecraft-segment">
              {(["light", "soft", "dark"] as const).map((tone) => (
                <button
                  key={tone}
                  type="button"
                  className={
                    (selected.tone ?? "light") === tone ? "is-active" : ""
                  }
                  onClick={() => update(selected.id, { tone })}
                >
                  {tone}
                </button>
              ))}
            </div>

            <label>
              <span>لون الهوية</span>
              <input
                type="color"
                value={selected.accent ?? "#4a2476"}
                onChange={(event) =>
                  update(selected.id, { accent: event.target.value })
                }
              />
            </label>
          </div>
        ) : (
          <p className="pagecraft-empty">اختاري بلوك للتعديل.</p>
        )}
      </aside>
    </div>
  );
}
