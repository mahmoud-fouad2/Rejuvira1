import { bookingServices } from "./booking-landing.ts";
import { LOAI_ALSALMI, NATALI_DOMLOJ, SAHAM_ARFAJ } from "./landing-doctors.ts";
import {
  checkList,
  extractAnyLeadForm,
  faqSection,
  finalBand,
  formCard,
  journey,
  landingLinks,
  pageShell,
  polishForm,
  searchGuide,
  serviceLinks,
  stickyBar,
  teamTiles,
  topBar,
  trustStrip,
} from "./landing-blocks.ts";

export const TIKTOK_MARKER = 'data-focused-landing="tiktok"';

// `tk` is a CMS alias of `tiktok-customer`; both routes show the same page.
const TIKTOK_SLUGS = new Set(["tk", "tiktok-customer"]);

const tips = [
  [
    "شاركنا ما لفت انتباهك",
    "الفيديو أو اسم الإجراء الذي أعجبك، لنفهم ذوقك وتطلعاتك بدقة.",
  ],
  [
    "استشارة مخصصة لملامحك",
    "يقيّم استشاريونا ما يحقق لك التناسق الطبيعي الأنسب لملامحك وقوامك.",
  ],
  [
    "خطة واضحة ومريحة",
    "معرفة تامة بتفاصيل الإجراء والتعافي والنتيجة المتوقعة، لتقرر براحة.",
  ],
] as const;

const team = [
  {
    name: LOAI_ALSALMI.name,
    title: LOAI_ALSALMI.title,
    photo: LOAI_ALSALMI.photo,
    blurb: "جراحات الوجه والجسم والصدر",
    href: LOAI_ALSALMI.profile,
  },
  {
    name: NATALI_DOMLOJ.name,
    title: NATALI_DOMLOJ.title,
    photo: NATALI_DOMLOJ.photo,
    blurb: NATALI_DOMLOJ.focus,
    href: NATALI_DOMLOJ.profile,
  },
  {
    name: SAHAM_ARFAJ.name,
    title: SAHAM_ARFAJ.title,
    photo: SAHAM_ARFAJ.photo,
    blurb: "تخطيط متكامل للجراحات التجميلية مع اهتمام بالخصوصية والتناسق",
    href: SAHAM_ARFAJ.profile,
  },
] as const;

const faqItems = [
  [
    "هل أستطيع حجز الخدمة نفسها التي رأيتها في المقطع؟",
    "بالتأكيد؛ شاركنا اسم الخدمة أو فكرة المقطع، ويرتّب لك الفريق جلسة استشارية مع الاستشاري المناسب لتتعرّف على الخيارات التي تلائم ملامحك وقوامك.",
  ],
  [
    "هل سيمنحني الإجراء النتيجة نفسها التي رأيتها؟",
    "لكل وجه وجسم ملامحه، ولذلك نصمّم الخطة على مقاسك لتنسجم مع تفاصيلك أنت. وفي جلستك الاستشارية تتعرّف على أمثلة وخيارات تناسب تطلعاتك.",
  ],
  [
    "هل السعر الذي رأيته في الفيديو هو السعر الحالي؟",
    "يطلعك فريقنا على الأسعار والعروض الحالية بوضوح عند التواصل، وتعرف تكلفة خطتك كاملة بعد الجلسة الاستشارية.",
  ],
  [
    "لا أعرف اسم الإجراء الذي أريده، فماذا أفعل؟",
    "يكفي أن تخبرنا بما أعجبك أو بما تتمنى تغييره، وسنوجّهك إلى الاستشاري المناسب ونحدد معك الإجراء الأنسب.",
  ],
  [
    "كيف أختار الطبيب المناسب؟",
    "لا داعي للحيرة؛ يوجّه فريقنا طلبك إلى الاستشاري الأنسب لما ألهمك، وتتعرّف عليه في جلسة خاصة تطمئن فيها إلى خطتك.",
  ],
  [
    "هل أحتاج استشارة قبل الإجراء؟",
    "الاستشارة هي بداية كل رحلة؛ فيها نصغي لتطلعاتك ونعرض الخيارات والتكلفة والتعافي، وتقرر بعدها بكل راحة.",
  ],
] as const;

const searchGuideHtml = `<h2>شاهدت نتيجة على تيك توك؟ هكذا تبدأ رحلتك</h2><p>إذا وصلت إلى ريجوفيرا بعد مقطع عن تجميل الوجه أو الجسم أو العناية بالبشرة، فيكفي أن تشاركنا ما أعجبك ليرتّب لك الفريق جلسة استشارية خاصة مع الاستشاري المناسب.</p><h3>هل أستطيع حجز الخدمة التي ظهرت في المقطع؟</h3><p>نعم؛ نؤكد لك اسم الخدمة والاستشاري المناسب والموعد، وتتعرّف في جلستك على الخيارات الأقرب لملامحك. وللاستعداد لموعدك اقرأ <a href="/journal/prepare-for-aesthetic-consultation">كيف تستعد لاستشارة التجميل</a>.</p><h3>رأيت سعرًا في فيديو قديم؟</h3><p>نطلعك على الأسعار والعروض الحالية بوضوح عند التواصل، وتعرف تكلفة خطتك كاملة بعد الجلسة الاستشارية.</p><h3>كيف أختار الطبيب؟</h3><p>تعرّف على استشاريينا <a href="${LOAI_ALSALMI.profile}">د. لؤي السالمي</a> و<a href="${NATALI_DOMLOJ.profile}">د. ناتالي دوملوج</a> و<a href="${SAHAM_ARFAJ.profile}">د. سهام العرفج</a>، وللمزيد اقرأ <a href="/journal/choose-plastic-surgeon-riyadh">كيف تختار جرّاح التجميل في الرياض</a>. <a href="#consultation-form">لنكتشف الخطة الأنسب لك</a>.</p>`;

/** Presentation only. Keep the CMS form, hidden fields and native POST intact. */
export function improveTiktokLanding(html: string, slug: string): string {
  if (!TIKTOK_SLUGS.has(slug) || html.includes(TIKTOK_MARKER)) return html;
  const form = extractAnyLeadForm(html);
  if (!form) return html;

  const { whatsapp, contacts, book } = landingLinks();

  const hero = `<section class="fl-hero"><div class="fl-wrap fl-hero-grid"><div class="fl-intro"><p class="fl-eyebrow">من تيك توك إلى ريجوفيرا</p><h1>من تيك توك إلى استشارة تجميل خاصة في الرياض<span>ألهمتك نتيجة على تيك توك؟ لنكتشف معًا ما يناسب ملامحك وقوامك</span></h1><p class="fl-lead">الإلهام يبدأ من نتيجة أعجبتك، والجمال الحقيقي هو ما يشبهك أنت. في ريجوفيرا نصغي لما أثار إعجابك، ثم يقدّم لك استشاريو التجميل والجلدية جلسة خاصة يرسمون فيها معك الخطة الأنسب لملامحك وقوامك، بكل اهتمام وخصوصية.</p>${checkList(
    [
      "جلسة استشارية مصممة لملامحك وقوامك",
      "استشاريون في جراحة التجميل والجلدية",
      "خصوصية تامة من أول تواصل",
    ],
  )}<div class="fl-actions">${contacts}</div><a class="fl-text-link" href="#tiktok-tips">كيف تبدأ رحلتك؟ ↓</a></div>${formCard(
    "جلسة استشارية خاصة",
    "خطوتك الأولى لتحويل الإلهام إلى خطة",
    "الخدمة التي لفتت انتباهك تكفي لنبدأ؛ وسيتواصل معك فريقنا لتنسيق جلستك الاستشارية الخاصة بكل اهتمام.",
    polishForm(form, "لنكتشف الخطة الأنسب لك ←"),
  )}</div></section>`;

  const tipsSection = `<section class="fl-section" id="tiktok-tips"><div class="fl-wrap"><p class="fl-eyebrow">رحلتك في ثلاث خطوات</p><h2>من الإلهام إلى خطة تناسبك</h2><div class="fl-grid fl-options">${tips
    .map(
      ([title, text], index) =>
        `<div class="fl-card"><span class="fl-number">0${index + 1}</span><h3>${title}</h3><p>${text}</p></div>`,
    )
    .join("")}</div></div></section>`;

  const servicesSection = `<section class="fl-section fl-soft" id="booking-services"><div class="fl-wrap"><p class="fl-eyebrow">الخدمات الأكثر طلبًا</p><h2>اكتشف ما ألهمك</h2><p class="fl-intro-text">لكل خدمة صفحة تعرض تفاصيلها، أو شاركنا ما أعجبك وسنوجّهك إلى الاستشاري الأنسب.</p>${serviceLinks(
    bookingServices,
  )}<div class="fl-actions fl-actions--center">${book("لنكتشف الخطة الأنسب لك")}</div></div></section>`;

  const teamSection = `<section class="fl-section" id="tiktok-team"><div class="fl-wrap"><p class="fl-eyebrow">فريقك الطبي</p><h2>استشاريون يرافقونك في رحلتك</h2><p class="fl-intro-text">يختار لك فريقنا الاستشاري الأنسب لما ألهمك، وينسّق لك موعدًا يناسبك.</p>${teamTiles(
    team,
  )}</div></section>`;

  const faqAfter = `${finalBand(
    "جاهز لتحويل الإلهام إلى خطة؟",
    "جلسة استشارية خاصة في ريجوفيرا، بكل اهتمام وخصوصية.",
    `${book("لنكتشف الخطة الأنسب لك")}${contacts}`,
  )}<p class="fl-note">تختلف النتائج من شخص لآخر، ويحدد الاستشاري الخطة الأنسب لك بعد الفحص.</p>`;

  return pageShell(
    TIKTOK_MARKER,
    [
      topBar("روابط صفحة الحجز"),
      hero,
      trustStrip("لماذا ريجوفيرا", [
        ["جلسة خاصة", "تبدأ بالإنصات إليك"],
        ["فريق متخصص", "أطباء وخبرات متعددة"],
        ["تنسيق مباشر", "يرتّب لك الفريق الموعد"],
        ["خصوصية وراحة", "تجربة هادئة وسرية"],
      ]),
      tipsSection,
      servicesSection,
      teamSection,
      journey("tiktok-steps", "من الإلهام إلى جلستك", [
        [
          "شاركنا ما ألهمك",
          "اسمك وجوالك والخدمة التي لفتت انتباهك، في أقل من دقيقة.",
        ],
        [
          "ينسّق معك فريقنا",
          "يرتّب لك الفريق الموعد المناسب مع الاستشاري الأنسب.",
        ],
        [
          "جلستك الاستشارية الخاصة",
          "ينصت إليك الاستشاري ويعرض عليك الخيارات والتكلفة والتعافي بوضوح.",
        ],
        ["قرارك بكل هدوء", "تقرر في وقتك، وإن اخترت الإجراء نرافقك بعده."],
      ]),
      faqSection({
        id: "tiktok-questions",
        eyebrow: "أسئلة قبل الحجز",
        heading: "أسئلة يطرحها من وصل من تيك توك",
        items: faqItems,
        after: faqAfter,
      }),
      searchGuide("tiktok-search-guide", searchGuideHtml),
      stickyBar(whatsapp),
    ].join(""),
  );
}
