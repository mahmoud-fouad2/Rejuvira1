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
    text: "ترهل الخدين وخط الفك والرقبة، مع د. لؤي السالمي.",
    href: "/p/facelift-riyadh",
  },
  {
    title: "شفط الدهون والفيزر ونحت الجسم",
    text: "البطن والخصر والجوانب والذراعان والفخذان، بعد تقييم الدهون والجلد كلٌّ على حدة.",
    href: "/p/body-contouring-riyadh",
  },
  {
    title: "تجميل الأنف",
    text: "تقييم الشكل والوظيفة والتناسق مع ملامح الوجه، مع د. ماهر الأحدب.",
    href: MAHER_ALAHDAB.page,
  },
  {
    title: "جراحات الصدر التجميلية",
    text: "شد أو تصغير أو تكبير أو تغيير الحشوات، بحسب هدفك وحالة الأنسجة.",
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
    "نعم. التقييم هو ما يحدد الإجراء الأنسب لك ومدى ملاءمته لحالتك، وليس اسم العملية الذي رأيته في إعلان. في الاستشارة تعرف الخيارات والتكلفة والتعافي، ثم تقرر.",
  ],
  [
    "ماذا يحدث بعد إرسال الطلب؟",
    "يراجع فريق ريجوفيرا طلبك ويتواصل معك لتأكيد بياناتك وتحديد الاستشاري والموعد الأنسب لك.",
  ],
  [
    "هل إرسال النموذج يعني أن موعدي تأكد؟",
    "لا. الإرسال يبدأ التواصل فقط، ويتأكد الموعد بعد أن يتواصل معك الفريق ويؤكد التوفر وتفاصيل الزيارة.",
  ],
  [
    "كم رسوم الاستشارة؟",
    "يوضح لك الفريق رسوم الاستشارة وما تشمله عند تأكيد الموعد. أما تكلفة أي إجراء فتُحدَّد بعد التقييم، لأنها تختلف من حالة لأخرى.",
  ],
  [
    "لا أعرف اسم الإجراء الذي أحتاجه، ماذا أكتب؟",
    "اختر «استفسار عام» أو أقرب قسم لما يشغلك، واكتب باختصار ما يزعجك. سنوجّه طلبك إلى الاستشاري المناسب، ولا حاجة لأن تعرف اسم العملية.",
  ],
  [
    "هل أستطيع اختيار طبيب معين؟",
    "نعم. اذكر اسمه عند تواصل الفريق معك ليؤكد توفره وتخصصه في الإجراء الذي تريده.",
  ],
  [
    "متى تظهر النتيجة؟",
    "تختلف حسب الإجراء وحالتك. يشرح لك الاستشاري المدة المتوقعة للتعافي وظهور النتيجة النهائية أثناء التقييم.",
  ],
] as const;

const searchGuideHtml = `<h2>حجز استشارة تجميل في الرياض: كيف تبدأ؟</h2><p>إذا كنت تبحث عن عيادة تجميل أو استشاري جراحة تجميل في الرياض ولم تحدد الإجراء بعد، فأفضل بداية استشارة تقييم تحدد معك ما تحتاجه فعلًا. في مركز ريجوفيرا يمكنك الحجز مع <a href="${LOAI_ALSALMI.profile}">د. لؤي السالمي</a> و<a href="${MAHER_ALAHDAB.profile}">د. ماهر الأحدب</a> و<a href="${SAHAM_ARFAJ.profile}">د. سهام العرفج</a> و<a href="${NAJWA_BATARFI.profile}">د. نجوى باطرفي</a>.</p><h3>كيف أختار استشاري التجميل المناسب؟</h3><p>ابدأ بالتخصص والخبرة في الإجراء الذي تفكر فيه، واسأل لماذا اقترح الاستشاري هذه الخطة وما بدائلها وحدود نتيجتها، لا عن اسم العملية وحده. وللمزيد اقرأ <a href="/journal/choose-plastic-surgeon-riyadh">كيف تختار جرّاح التجميل في الرياض</a>.</p><h3>الاستشارة أولًا ثم الإجراء</h3><p>الاستشارة جلسة تقييم وليست التزامًا بإجراء: تعرف فيها الخيارات والتكلفة والتعافي ثم تقرر. وللتحضير لموعدك اقرأ <a href="/journal/prepare-for-aesthetic-consultation">كيف تستعد لاستشارة التجميل</a>.</p><h3>رسوم الاستشارة وتكلفة الإجراء</h3><p>يوضح لك فريق ريجوفيرا رسوم الاستشارة عند تأكيد الموعد، أما تكلفة الإجراء فتُحدَّد بعد التقييم لأنها تختلف من حالة لأخرى.</p><h3>خصوصيتك</h3><p>تُستخدم بياناتك للتواصل بخصوص طلبك فقط وفق <a href="/privacy">سياسة الخصوصية</a>. <a href="#consultation-form">أرسل اسمك وجوالك والخدمة</a> وسنتواصل معك لتأكيد الموعد.</p>`;

/** Presentation only. Keep the CMS form, hidden fields and native POST intact. */
export function improveBookingLanding(html: string, slug: string): string {
  if (!BOOKING_SLUGS.has(slug) || html.includes(BOOKING_MARKER)) return html;
  const form = extractAnyLeadForm(html);
  if (!form) return html;

  const { whatsapp, contacts, book } = landingLinks();

  const hero = `<section class="fl-hero"><div class="fl-wrap fl-hero-grid"><div class="fl-intro"><p class="fl-eyebrow">قبل أن تقرر… استشر أطباء ريجوفيرا</p><h1>احجز استشارتك مع استشاريي التجميل في الرياض<span>تقييم واضح قبل أي قرار، وخطة تناسب حالتك</span></h1><p class="fl-lead">شد الوجه، تجميل الأنف، شفط الدهون ونحت الجسم، التجميل النسائي أو العناية بالبشرة… مهما كان ما يشغلك، تبدأ في ريجوفيرا بجلسة تقييم مع استشاري متخصص: يستمع إليك، ويفحص حالتك، ويشرح لك الخيارات والتكلفة والتعافي قبل أن تقرر. اكتب اسمك وجوالك والخدمة، ويتواصل معك فريقنا لتأكيد الموعد.</p>${checkList(
    [
      "استشاريون في جراحة التجميل والترميم والتجميل النسائي",
      "تقييم أولًا، ثم قرارك بهدوء",
      "خصوصية كاملة من لحظة إرسال الطلب",
    ],
  )}<div class="fl-actions">${contacts}</div><a class="fl-text-link" href="#booking-services">ما الذي تفكر في تحسينه؟ تعرّف على الخدمات ↓</a></div>${formCard(
    "خطوتك الأولى",
    "احجز استشارتك الآن",
    "اكتب اسمك وجوالك والخدمة، وفريقنا يتواصل معك لتأكيد الموعد.",
    form,
  )}</div></section>`;

  const servicesSection = `<section class="fl-section" id="booking-services"><div class="fl-wrap"><p class="fl-eyebrow">اختر ما يشغلك</p><h2>ما الذي تفكر في تحسينه؟</h2><p class="fl-intro-text">لكل خدمة صفحة تشرح تفاصيلها، أو أرسل طلبك الآن وسنوجّهك إلى الاستشاري المناسب.</p>${serviceLinks(
    bookingServices,
  )}<div class="fl-actions fl-actions--center">${book("احجز استشارتك الآن")}</div></div></section>`;

  const teamSection = `<section class="fl-section fl-soft" id="booking-team"><div class="fl-wrap"><p class="fl-eyebrow">فريقك الطبي</p><h2>استشاريون تختار منهم، أو نوجّهك للأنسب</h2><p class="fl-intro-text">إرسال النموذج لا يثبت موعدًا مع طبيب محدد؛ يتواصل معك الفريق لتنسيق الموعد وتوجيه حالتك حسب الخدمة والتوفر.</p>${teamTiles(
    team,
  )}</div></section>`;

  const faqAfter = `${finalBand(
    "اعرف الخيار الأنسب لحالتك",
    "تواصل مع الفريق لترتيب استشارة واضحة ومناسبة.",
    `${book("احجز استشارتك الآن")}${contacts}`,
  )}<p class="fl-note">معلومات عامة وليست تشخيصًا أو وعدًا بنتيجة. إرسال النموذج لا يثبت الموعد قبل تأكيد الفريق.</p>`;

  return pageShell(
    BOOKING_MARKER,
    [
      topBar("روابط صفحة الحجز"),
      hero,
      trustStrip("لماذا ريجوفيرا", [
        ["تقييم طبي واضح", "شرح الخيارات قبل الحجز"],
        ["فريق متخصص", "أطباء وخبرات متعددة"],
        ["متابعة منظمة", "تواصل واضح بعد الطلب"],
        ["خصوصية وراحة", "تجربة هادئة وسرية"],
      ]),
      servicesSection,
      teamSection,
      journey("booking-steps", "من النموذج إلى جلسة التقييم", [
        [
          "اكتب بياناتك",
          "اسمك وجوالك والخدمة التي تفكر فيها، في أقل من دقيقة.",
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
