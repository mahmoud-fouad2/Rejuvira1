import {
  LOAI_ALSALMI,
  MAHER_ALAHDAB,
  NAJWA_BATARFI,
  SAHAM_ARFAJ,
} from "./landing-doctors.ts";
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

export const BOOKING_MARKER = 'data-focused-landing="booking"';

// `book` is a CMS alias of `rejuvera-booking`; both routes show the same page.
const BOOKING_SLUGS = new Set(["book", "rejuvera-booking"]);

export const bookingServices = [
  {
    title: "شد الوجه والرقبة (الفيس لفت)",
    text: "ملامح متجددة بحيوية طبيعية، مع د. لؤي السالمي.",
    href: "/p/facelift-riyadh",
  },
  {
    title: "شفط الدهون والفيزر ونحت الجسم",
    text: "قوام انسيابي متناسق: البطن والخصر والجوانب والذراعان والفخذان.",
    href: "/p/body-contouring-riyadh",
  },
  {
    title: "تجميل الأنف",
    text: "تناسق مع ملامح الوجه وتنفس مريح، مع د. ماهر الأحدب.",
    href: MAHER_ALAHDAB.page,
  },
  {
    title: "جراحات الصدر التجميلية",
    text: "شد أو تصغير أو تكبير أو تغيير الحشوات، بخصوصية تامة وتناسق أنثوي راقٍ.",
    href: "/p/breast-surgery-riyadh",
  },
  {
    title: "التجميل النسائي وصحة المرأة",
    text: "استشارات بسرية وخصوصية مع استشارية التجميل النسائي د. نجوى باطرفي.",
    href: NAJWA_BATARFI.page,
  },
  {
    title: "البشرة والجلدية والليزر",
    text: "نضارة البشرة والهيدرافيشيال والفراكشنال ليزر، مع د. ناتالي دوملوج.",
    href: "/p/dr-natali-domloj",
  },
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
    name: MAHER_ALAHDAB.name,
    title: MAHER_ALAHDAB.title,
    photo: MAHER_ALAHDAB.photo,
    blurb: MAHER_ALAHDAB.focus,
    href: MAHER_ALAHDAB.profile,
  },
  {
    name: SAHAM_ARFAJ.name,
    title: SAHAM_ARFAJ.title,
    photo: SAHAM_ARFAJ.photo,
    blurb: "تخطيط متكامل للجراحات التجميلية مع اهتمام بالخصوصية والتناسق",
    href: SAHAM_ARFAJ.profile,
  },
  {
    name: NAJWA_BATARFI.name,
    title: NAJWA_BATARFI.title,
    photo: NAJWA_BATARFI.photo,
    blurb: NAJWA_BATARFI.focus,
    href: NAJWA_BATARFI.profile,
  },
] as const;

const faqItems = [
  [
    "هل أحتاج استشارة قبل أي إجراء؟",
    "الاستشارة هي أجمل بداية: فيها نصغي لتطلعاتك ونعرض عليك الخيارات والتكلفة والتعافي، وتقرر بعدها بكل راحة.",
  ],
  [
    "ماذا يحدث بعد أن أشاركم بياناتي؟",
    "يتواصل معك فريق ريجوفيرا ليرتّب لك الموعد الأنسب مع الاستشاري المناسب لاهتمامك، بخصوصية تامة.",
  ],
  [
    "كم رسوم الاستشارة؟",
    "يوضح لك الفريق رسوم الاستشارة عند التواصل، وتعرف تكلفة أي إجراء بعد جلستك الاستشارية.",
  ],
  [
    "لا أعرف اسم الإجراء الذي أريده، هل يمكنني الحجز؟",
    "بالتأكيد؛ يكفي أن تخبرنا بما يشغلك أو بما تتمنى تحسينه، وسنوجّهك إلى الاستشاري المناسب.",
  ],
  [
    "هل أستطيع اختيار طبيب معين؟",
    "نعم؛ أخبر الفريق باسم الطبيب الذي تفضّله وسننسّق لك الموعد معه.",
  ],
  [
    "متى تظهر النتيجة؟",
    "تختلف المدة بحسب الإجراء، ويشرح لك الاستشاري التعافي ومراحل ظهور النتيجة النهائية خلال جلستك.",
  ],
  [
    "هل بياناتي في أمان؟",
    "بالتأكيد؛ تُستخدم بياناتك للتواصل بخصوص طلبك فقط، وفق سياسة الخصوصية.",
  ],
] as const;

const searchGuideHtml = `<h2>حجز استشارة تجميل في الرياض: كيف تبدأ؟</h2><p>إذا كنت تبحث عن عيادة تجميل أو استشاري جراحة تجميل في الرياض ولم تحدد الإجراء بعد، فأجمل بداية جلسة استشارية خاصة تتعرّف فيها على ما يناسبك. في مركز ريجوفيرا يمكنك الحجز مع <a href="${LOAI_ALSALMI.profile}">د. لؤي السالمي</a> و<a href="${MAHER_ALAHDAB.profile}">د. ماهر الأحدب</a> و<a href="${SAHAM_ARFAJ.profile}">د. سهام العرفج</a> و<a href="${NAJWA_BATARFI.profile}">د. نجوى باطرفي</a>.</p><h3>كيف أختار استشاري التجميل المناسب؟</h3><p>ابدأ بالتخصص والخبرة في الإجراء الذي يهمّك، وتعرّف على ملفات استشاريينا. وللمزيد اقرأ <a href="/journal/choose-plastic-surgeon-riyadh">كيف تختار جرّاح التجميل في الرياض</a>.</p><h3>الاستشارة أولًا ثم الإجراء</h3><p>الاستشارة جلسة تعارف وتقييم تتعرّف فيها على الخيارات والتكلفة والتعافي، ثم تقرر بكل راحة. وللتحضير لموعدك اقرأ <a href="/journal/prepare-for-aesthetic-consultation">كيف تستعد لاستشارة التجميل</a>.</p><h3>رسوم الاستشارة وتكلفة الإجراء</h3><p>يوضح لك فريق ريجوفيرا رسوم الاستشارة عند التواصل، وتُحدَّد تكلفة الإجراء بعد جلستك الاستشارية.</p><h3>خصوصيتك</h3><p>تُستخدم بياناتك للتواصل بخصوص طلبك فقط وفق <a href="/privacy">سياسة الخصوصية</a>. <a href="#consultation-form">احجز استشارتك الخاصة</a> وسننسق لك الموعد.</p>`;

/** Presentation only. Keep the CMS form, hidden fields and native POST intact. */
export function improveBookingLanding(html: string, slug: string): string {
  if (!BOOKING_SLUGS.has(slug) || html.includes(BOOKING_MARKER)) return html;
  const form = extractAnyLeadForm(html);
  if (!form) return html;

  const { whatsapp, contacts, book } = landingLinks();

  const hero = `<section class="fl-hero"><div class="fl-wrap fl-hero-grid"><div class="fl-intro"><p class="fl-eyebrow">استشارة خاصة تبدأ بالإنصات إليك</p><h1>احجز استشارتك الخاصة مع استشاريي التجميل في الرياض<span>تبدأ بالإنصات لأولوياتك الجمالية، وتنسيق مباشر مع الاستشاري الأنسب لك</span></h1><p class="fl-lead">شد الوجه، تجميل الأنف، شفط الدهون ونحت الجسم، التجميل النسائي أو العناية بالبشرة… مهما كانت أولوياتك الجمالية، تبدأ رحلتك في ريجوفيرا بجلسة استشارية خاصة مع استشاري متخصص ينصت إليك أولًا، ثم يعرض عليك الخيارات والتعافي والتكلفة بوضوح لتقرر براحة. شاركنا اسمك وجوالك، وينسّق لك فريقنا الموعد الأنسب.</p>${checkList(
    [
      "استشاريون في جراحة التجميل والترميم والتجميل النسائي والجلدية",
      "جلسة استشارية خاصة تبدأ بالإنصات لأولوياتك",
      "خصوصية تامة من لحظة التواصل",
    ],
  )}<div class="fl-actions">${contacts}</div><a class="fl-text-link" href="#booking-services">اكتشف الخدمة التي تهمّك ↓</a></div>${formCard(
    "استشارة خاصة",
    "احجز استشارتك الخاصة الآن",
    "شاركنا اسمك وجوالك والخدمة، وسينسّق لك فريقنا موعدًا يناسبك مع الاستشاري الأنسب بكل خصوصية وراحة.",
    polishForm(form, "احجز استشارتك الخاصة الآن ←"),
  )}</div></section>`;

  const servicesSection = `<section class="fl-section" id="booking-services"><div class="fl-wrap"><p class="fl-eyebrow">اختر ما يهمّك</p><h2>ما الذي تتمنى تحسينه؟</h2><p class="fl-intro-text">لكل خدمة صفحة تعرض تفاصيلها، أو شاركنا اهتمامك وسنوجّهك إلى الاستشاري الأنسب.</p>${serviceLinks(
    bookingServices,
  )}<div class="fl-actions fl-actions--center">${book("احجز استشارتك الخاصة الآن")}</div></div></section>`;

  const teamSection = `<section class="fl-section fl-soft" id="booking-team"><div class="fl-wrap"><p class="fl-eyebrow">فريقك الطبي</p><h2>استشاريون يرافقونك في رحلتك</h2><p class="fl-intro-text">ينسّق لك فريقنا الموعد مع الاستشاري الأنسب لاهتمامك، أو مع من تفضّله منهم.</p>${teamTiles(
    team,
  )}</div></section>`;

  const faqAfter = `${finalBand(
    "ابدأ رحلتك بجلسة تليق بك",
    "جلسة استشارية خاصة مع استشاريي ريجوفيرا، بكل اهتمام وخصوصية.",
    `${book("احجز استشارتك الخاصة الآن")}${contacts}`,
  )}<p class="fl-note">تختلف النتائج من شخص لآخر، ويحدد الاستشاري الخطة الأنسب لك بعد الفحص.</p>`;

  return pageShell(
    BOOKING_MARKER,
    [
      topBar("روابط صفحة الحجز"),
      hero,
      trustStrip("لماذا ريجوفيرا", [
        ["جلسة خاصة", "تبدأ بالإنصات إليك"],
        ["فريق متخصص", "أطباء وخبرات متعددة"],
        ["تنسيق مباشر", "يرتّب لك الفريق الموعد"],
        ["خصوصية وراحة", "تجربة هادئة وسرية"],
      ]),
      servicesSection,
      teamSection,
      journey("booking-steps", "من أول تواصل إلى جلستك", [
        ["شاركنا بياناتك", "اسمك وجوالك والخدمة التي تهمّك، في أقل من دقيقة."],
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
        id: "booking-questions",
        eyebrow: "أسئلة قبل الحجز",
        heading: "إجابات سريعة قبل أن تحجز",
        items: faqItems,
        after: faqAfter,
      }),
      searchGuide("booking-search-guide", searchGuideHtml),
      stickyBar(whatsapp),
    ].join(""),
  );
}
