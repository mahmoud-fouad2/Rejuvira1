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
    "احتفظ بما أعجبك",
    "اسم الإجراء أو رابط الفيديو، لتشرح للفريق ما لفت انتباهك.",
  ],
  [
    "حدّد ما تريد تغييره",
    "اكتب التغيير الذي تريده وأي إجراء سابق في المنطقة نفسها.",
  ],
  [
    "اسأل عن ملاءمته لك",
    "اسأل عن ملاءمة الخيار لحالتك والتعافي والتكلفة الحالية قبل أن تقرر.",
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
    "هل العملية التي رأيتها على تيك توك هي الحل المناسب لي؟",
    "قد يعرض المقطع حالة واحدة أو جزءًا من الرحلة، فلا يحدد بنفسه الإجراء الذي يناسبك. اشرح للطبيب ما أعجبك، ويقيّم هو حالتك ويعرض عليك الخيارات والبدائل وحدود النتيجة.",
  ],
  [
    "كيف أختار الطبيب للإجراء الذي شاهدته؟",
    "حدد اسم الإجراء ثم راجع تخصص الطبيب وملفه، واسأل عن خبرته في حالات مشابهة لحالتك وعن الخطة والمخاطر والمتابعة، بدل الاعتماد على عدد المشاهدات.",
  ],
  [
    "هل السعر الذي رأيته في الفيديو هو السعر الحالي؟",
    "اذكر العرض أو الإجراء وتاريخ المحتوى إن أمكن، ويؤكد لك الفريق السعر والتوفر والبنود الحالية. قد تتغير العروض، وتختلف التكلفة من حالة لأخرى.",
  ],
  [
    "كيف أطلب استشارة إن لم أعرف اسم الإجراء؟",
    "اختر أقرب خدمة لما شاهدته، واكتب ما يزعجك أو ما تريد تحسينه عند تواصل الفريق معك. يؤكد الفريق التخصص والموعد، ويُحدَّد الإجراء بعد التقييم.",
  ],
  [
    "هل إرسال النموذج يعني أن موعدي تأكد؟",
    "لا. الإرسال يبدأ التواصل فقط، ويتأكد الموعد بعد أن يتواصل معك الفريق ويؤكد التوفر وتفاصيل الزيارة.",
  ],
  [
    "هل أحتاج استشارة قبل الإجراء؟",
    "نعم. التقييم هو ما يحدد الخطة الأنسب لك، وفيه تعرف الخيارات والتكلفة والتعافي قبل أن تقرر.",
  ],
] as const;

const searchGuideHtml = `<h2>شاهدت نتيجة على تيك توك؟ هكذا تحوّل اهتمامك إلى استشارة</h2><p>إذا وصلت إلى ريجوفيرا بعد مقطع عن تجميل الوجه أو الجسم أو العناية بالبشرة، فاذكر اسم الإجراء أو موضوع المقطع عند طلب التواصل ليساعدك الفريق في الوصول إلى الاستشاري المناسب. اختيار العملية والطبيب يبدأ بتقييم هدفك وحالتك، لا بتشابهك مع شخص ظهر في مقطع قصير.</p><h3>هل أستطيع حجز الخدمة نفسها التي ظهرت في المقطع؟</h3><p>اذكر موضوع المقطع للفريق ليتأكد من اسم الخدمة والطبيب والتوفر. حجز التقييم يساعدك على فهم الخيارات؛ أما تطبيق الإجراء نفسه فيتوقف على مناقشة حالتك مع الطبيب. وللتحضير للموعد اقرأ <a href="/journal/prepare-for-aesthetic-consultation">كيف تستعد لاستشارة التجميل</a>.</p><h3>رأيت سعرًا في فيديو قديم، هل هو السعر الحالي؟</h3><p>اطلب تأكيد السعر ومحتوى الخدمة وصلاحية العرض عند التواصل. قد تتغير العروض، وقد تختلف تكلفة الخطة باختلاف الحالة وعدد الجلسات وتفاصيل الإجراء.</p><h3>كيف أختار الطبيب؟</h3><p>راجع تخصص الطبيب وملفه، مثل <a href="${LOAI_ALSALMI.profile}">د. لؤي السالمي</a> أو <a href="${NATALI_DOMLOJ.profile}">د. ناتالي دوملوج</a> أو <a href="${SAHAM_ARFAJ.profile}">د. سهام العرفج</a>، وللمزيد اقرأ <a href="/journal/choose-plastic-surgeon-riyadh">كيف تختار جرّاح التجميل في الرياض</a>. <a href="#consultation-form">أرسل اسمك وجوالك والخدمة</a> وسنتواصل معك لتأكيد الموعد.</p>`;

/** Presentation only. Keep the CMS form, hidden fields and native POST intact. */
export function improveTiktokLanding(html: string, slug: string): string {
  if (!TIKTOK_SLUGS.has(slug) || html.includes(TIKTOK_MARKER)) return html;
  const form = extractAnyLeadForm(html);
  if (!form) return html;

  const { whatsapp, contacts, book } = landingLinks();

  const hero = `<section class="fl-hero"><div class="fl-wrap fl-hero-grid"><div class="fl-intro"><p class="fl-eyebrow">وصلت من تيك توك؟</p><h1>من تيك توك إلى استشارة تجميل في الرياض<span>شاهدت نتيجة أعجبتك؟ لنعرف إن كانت تناسبك</span></h1><p class="fl-lead">النتيجة التي رأيتها في المقطع حالة واحدة، وما يناسبك أنت يحدده جسمك وملامحك وأهدافك. اختر الخدمة التي لفتت انتباهك، ويتواصل معك فريق ريجوفيرا لتأكيد الاستشاري والموعد. وفي جلسة التقييم تعرف هل الإجراء مناسب لك، وما بدائله، والتكلفة والتعافي، قبل أن تقرر.</p>${checkList(
    [
      "تقييم أولًا: ما يناسبك قد يختلف عمّا رأيت",
      "استشاريون في جراحة التجميل والجلدية",
      "خصوصية كاملة من لحظة إرسال الطلب",
    ],
  )}<div class="fl-actions">${contacts}</div><a class="fl-text-link" href="#tiktok-tips">كيف تستفيد من المقطع الذي رأيته؟ ↓</a></div>${formCard(
    "خطوتك الأولى",
    "احجز استشارتك الآن",
    "اختر الخدمة التي لفتت انتباهك، وفريقنا يتواصل معك لتأكيد الموعد.",
    form,
  )}</div></section>`;

  const tipsSection = `<section class="fl-section" id="tiktok-tips"><div class="fl-wrap"><p class="fl-eyebrow">قبل أن ترسل طلبك</p><h2>كيف تستفيد من المقطع الذي رأيته؟</h2><div class="fl-grid fl-options">${tips
    .map(
      ([title, text], index) =>
        `<div class="fl-card"><span class="fl-number">0${index + 1}</span><h3>${title}</h3><p>${text}</p></div>`,
    )
    .join(
      "",
    )}</div><p class="fl-note">قد يعرض المقطع حالة واحدة أو جزءًا من الرحلة، لذلك لا يحدد بنفسه الإجراء الذي يناسبك؛ هذا ما يكشفه التقييم.</p></div></section>`;

  const servicesSection = `<section class="fl-section fl-soft" id="booking-services"><div class="fl-wrap"><p class="fl-eyebrow">الخدمات الأكثر طلبًا</p><h2>اختر ما أعجبك</h2><p class="fl-intro-text">لكل خدمة صفحة تشرح تفاصيلها، أو أرسل طلبك الآن وسنوجّهك إلى الاستشاري المناسب.</p>${serviceLinks(
    bookingServices,
  )}<div class="fl-actions fl-actions--center">${book("احجز استشارتك الآن")}</div></div></section>`;

  const teamSection = `<section class="fl-section" id="tiktok-team"><div class="fl-wrap"><p class="fl-eyebrow">فريقك الطبي</p><h2>استشاريون تختار منهم، أو نوجّهك للأنسب</h2><p class="fl-intro-text">إرسال النموذج لا يثبت موعدًا مع طبيب محدد؛ يتواصل معك الفريق لتنسيق الموعد وتوجيه حالتك حسب الخدمة والتوفر.</p>${teamTiles(
    team,
  )}</div></section>`;

  const faqAfter = `${finalBand(
    "اعرف الخيار الأنسب لحالتك",
    "تواصل مع الفريق لترتيب استشارة واضحة ومناسبة.",
    `${book("احجز استشارتك الآن")}${contacts}`,
  )}<p class="fl-note">معلومات عامة وليست تشخيصًا أو وعدًا بنتيجة. إرسال النموذج لا يثبت الموعد قبل تأكيد الفريق.</p>`;

  return pageShell(
    TIKTOK_MARKER,
    [
      topBar("روابط صفحة الحجز"),
      hero,
      trustStrip("لماذا ريجوفيرا", [
        ["تقييم طبي واضح", "شرح الخيارات قبل الحجز"],
        ["فريق متخصص", "أطباء وخبرات متعددة"],
        ["متابعة منظمة", "تواصل واضح بعد الطلب"],
        ["خصوصية وراحة", "تجربة هادئة وسرية"],
      ]),
      tipsSection,
      servicesSection,
      teamSection,
      journey("tiktok-steps", "من النموذج إلى جلسة التقييم", [
        [
          "اكتب بياناتك",
          "اسمك وجوالك والخدمة التي لفتت انتباهك، في أقل من دقيقة.",
        ],
        ["نتواصل معك", "يراجع الفريق طلبك ويؤكد الموعد والاستشاري المناسب."],
        [
          "جلسة التقييم",
          "يستمع إليك الاستشاري ويفحص حالتك ويشرح الخيارات والتكلفة والتعافي.",
        ],
        [
          "تقرر بهدوء",
          "القرار بعدها بيدك، وإن اخترت الإجراء تُرتَّب الخطوات والمتابعة.",
        ],
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
