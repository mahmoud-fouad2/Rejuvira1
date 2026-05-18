/**
 * Rejuvera Center — bilingual text dictionary
 * AR is the primary language; EN is the secondary language.
 *
 * Usage in components:
 *   <span className="lang-ar">نص عربي</span>
 *   <span className="lang-en">English text</span>
 *
 * Or use the T component: <T ar="نص" en="Text" />
 */

export type Lang = "ar" | "en";

/* ── Core Site Identity ───────────────────────────────────── */
export const siteTranslations = {
  brandSubtitle: {
    ar: "الجلدية والتجميل",
    en: "Dermatology & Aesthetics",
  },
  bookNow: { ar: "احجز موعدك", en: "Book Now" },
  bookConsultation: { ar: "احجزي استشارتك", en: "Book a Consultation" },
  viewResults: { ar: "شاهدي النتائج", en: "View Results" },
  seeAll: { ar: "عرض الكل", en: "View All" },
  learnMore: { ar: "تفاصيل الخدمة", en: "View Details" },
  viewProfile: { ar: "عرض الملف الطبي", en: "View Medical Profile" },
  contact: { ar: "التواصل", en: "Contact" },
  aboutUs: { ar: "من نحن", en: "About Us" },
} as const;

/* ── Navigation ───────────────────────────────────────────── */
export const navTranslations = {
  services: { ar: "الخدمات", en: "Services" },
  doctors: { ar: "الأطباء", en: "Doctors" },
  devices: { ar: "الأجهزة", en: "Devices" },
  gallery: { ar: "المعرض", en: "Gallery" },
  journal: { ar: "المجلة", en: "Journal" },
  contact: { ar: "التواصل", en: "Contact" },
  aboutUs: { ar: "من نحن", en: "About Us" },
  announcementTeam: { ar: "فريق متخصص", en: "Specialist Team" },
  announcementDevices: {
    ar: "أجهزة طبية معتمدة",
    en: "Certified Medical Devices",
  },
  bookNowLink: { ar: "احجز الآن", en: "Book Now" },
} as const;

/* ── Homepage ─────────────────────────────────────────────── */
export const homeTranslations = {
  heroTitle: {
    ar: "رعاية متكاملة",
    en: "Comprehensive Care",
  },
  heroTagline: {
    ar: "Advanced Natural Aesthetic Transformations",
    en: "Advanced Natural Aesthetic Transformations",
  },
  heroCta1: { ar: "احجزي استشارتك", en: "Book a Consultation" },
  heroCta2: { ar: "شاهدي النتائج", en: "View Results" },

  statsServices: { ar: "خدمة متخصصة", en: "Specialist Services" },
  statsDoctors: { ar: "طبيب معتمد", en: "Certified Doctors" },
  statsResults: { ar: "نتيجة موثقة", en: "Documented Results" },

  brandValuesSection: {
    eyebrows: {
      ar: ["الوضوح", "العناية", "الدقة"],
      en: ["Clarity", "Care", "Precision"],
    },
    titles: {
      ar: [
        "وضوح من اللحظة الأولى",
        "رعاية تبدأ قبل الجلسة",
        "دقة في كل تفصيلة",
      ],
      en: [
        "Clarity from the First Moment",
        "Care Begins Before Your Session",
        "Precision in Every Detail",
      ],
    },
    descriptions: {
      ar: [
        "كل خدمة وكل طبيب يُقدَّم بطريقة تجعل القرار واضحًا وسهلًا دون إرباك أو تشتت.",
        "من أول استفسار حتى المتابعة، تعرض الخطوات بصورة مرتبة تساعد على فهم القرار قبل تنفيذه.",
        "نتائج متزنة تأتي من تشخيص دقيق وأسلوب علاجي هادئ يحترم طبيعة كل حالة وملامحها الطبيعية.",
      ],
      en: [
        "Every service and every doctor is presented in a way that makes the decision clear and simple without confusion.",
        "From the first inquiry to follow-up, steps are presented in an organized manner to help understand the decision before execution.",
        "Balanced results come from precise diagnosis and a calm therapeutic approach that respects each case's nature.",
      ],
    },
  },

  servicesEyebrow: { ar: "الخدمات الرئيسية", en: "Core Services" },
  servicesHeading: {
    ar: "خدمات طبية متقدمة تحت إشراف أطباء متخصصين.",
    en: "Advanced medical services under specialized physicians.",
  },
  seeAllServices: { ar: "عرض كل الخدمات", en: "View All Services" },
  serviceDetails: { ar: "تفاصيل الخدمة", en: "Service Details" },

  journeyEyebrow: { ar: "رحلة الاستشارة", en: "Consultation Journey" },
  journeyHeading: {
    ar: "من أول قراءة إلى أول استشارة بخطوات واضحة.",
    en: "From First Read to First Consultation in Clear Steps.",
  },
  journeyDesc: {
    ar: "الغرض من هذا المسار هو ترتيب الخيارات وعرض ما يلزم فقط قبل طلب الاستشارة.",
    en: "This path is designed to organize options and present only what is needed before requesting a consultation.",
  },
  journeySteps: {
    ar: [
      {
        step: "01",
        title: "استشارة أولى أكثر وضوحًا",
        description:
          "تبدأ الرحلة بتقييم واضح للاحتياج والحالة، ثم تحديد الأولوية العلاجية المناسبة قبل أي توصية.",
      },
      {
        step: "02",
        title: "اختيار هادئ للخطة الأنسب",
        description:
          "تُعرض الخيارات بصورة منظمة توضح الغرض من الخدمة، نطاقها، وما يمكن توقعه منها بواقعية.",
      },
      {
        step: "03",
        title: "خطوة نهائية واضحة قبل الحجز",
        description:
          "بعد فهم الخدمة المناسبة، يصبح الانتقال إلى طلب الاستشارة مباشرًا وواضحًا دون تشتت.",
      },
    ],
    en: [
      {
        step: "01",
        title: "A Clearer First Consultation",
        description:
          "The journey begins with a clear assessment of the need and condition, then identifying the appropriate treatment priority before any recommendation.",
      },
      {
        step: "02",
        title: "A Calm Choice of the Right Plan",
        description:
          "Options are presented in an organized manner clarifying the purpose, scope, and realistic expectations of each service.",
      },
      {
        step: "03",
        title: "A Clear Final Step Before Booking",
        description:
          "After understanding the right service, moving to a consultation request becomes straightforward and clear without distraction.",
      },
    ],
  },

  doctorsEyebrow: { ar: "الفريق الطبي", en: "Medical Team" },
  doctorsHeading: {
    ar: "أطباء متخصصون بخبرة موثقة في كل تخصص.",
    en: "Specialist physicians with documented expertise in every field.",
  },
  seeAllDoctors: { ar: "عرض كل الأطباء", en: "View All Doctors" },

  galleryEyebrow: { ar: "معرض النتائج", en: "Results Gallery" },
  galleryHeading: {
    ar: "نتائج حقيقية تعكس دقة العلاج ومستوى الاهتمام.",
    en: "Real results reflecting treatment precision and level of care.",
  },
  seeAllGallery: { ar: "عرض كل النتائج", en: "View All Results" },

  journalEyebrow: { ar: "المجلة الطبية", en: "Medical Journal" },
  journalHeading: {
    ar: "مقالات طبية معمقة للتوعية والمعرفة.",
    en: "In-depth medical articles for awareness and knowledge.",
  },
  seeAllJournal: { ar: "عرض كل المقالات", en: "View All Articles" },

  ctaBannerHeading: {
    ar: "هل أنتِ مستعدة للخطوة الأولى؟",
    en: "Are You Ready for the First Step?",
  },
  ctaBannerDesc: {
    ar: "احجزي استشارتك الأولى مع أحد أطبائنا المتخصصين وابدأي رحلتك بوضوح وثقة.",
    en: "Book your first consultation with one of our specialist physicians and begin your journey with clarity and confidence.",
  },
} as const;

/* ── Services Page ────────────────────────────────────────── */
export const servicesTranslations = {
  pageEyebrow: { ar: "الخدمات", en: "Services" },
  pageHeading: {
    ar: "خدمات علاجية وتجميلية مرتبة لتسهيل الاختيار بثقة ووضوح.",
    en: "Therapeutic and aesthetic services organized to make choices with confidence and clarity.",
  },
  pageDesc: {
    ar: "يعرض هذا القسم كل خدمة مع تعريف مختصر، الفئة، وأبرز الفوائد بما يساعد على المقارنة قبل طلب الاستشارة.",
    en: "This section presents each service with a brief description, category, and key benefits to help with comparison before requesting a consultation.",
  },
  available: { ar: "الخدمات المتاحة", en: "Available Services" },
  sections: { ar: "الأقسام", en: "Sections" },
  suitableFor: { ar: "مناسبة لـ", en: "Suitable for" },
  suitableValue: { ar: "بشرة ووجه", en: "Skin & Face" },
  featured: { ar: "الخدمة المميزة", en: "Featured Service" },
  viewService: { ar: "تفاصيل الخدمة المميزة", en: "View Featured Service" },
} as const;

/* ── Gallery Page ─────────────────────────────────────────── */
export const galleryTranslations = {
  pageEyebrow: { ar: "معرض النتائج", en: "Results Gallery" },
  pageHeading: {
    ar: "نتائج حقيقية تعكس الدقة والاهتمام بكل تفصيلة.",
    en: "Real results reflecting precision and attention to every detail.",
  },
  pageDesc: {
    ar: "هذا القسم يجمع مرجعًا بصريًا صادقًا لما يمكن تحقيقه. مقارنات قبل وبعد تُظهر النتيجة الفعلية دون مبالغة، لأن الثقة تُبنى بالوضوح لا بالإبهار.",
    en: "This section brings together an honest visual reference for what can be achieved. Before and after comparisons show the actual result without exaggeration, because trust is built through clarity, not spectacle.",
  },
  documented: { ar: "حالات موثقة", en: "Documented Cases" },
  categories: { ar: "أقسام العناية", en: "Care Sections" },
  satisfaction: { ar: "نسبة الرضا", en: "Satisfaction Rate" },
  before: { ar: "قبل", en: "Before" },
  after: { ar: "بعد", en: "After" },
  moodVisual: { ar: "الانطباع البصري", en: "Visual Impression" },
  moodCaption: {
    ar: "صور محلية مرتبطة بالخدمة والنتيجة",
    en: "Local images linked to services and outcomes",
  },
  allCategories: { ar: "الكل", en: "All" },
} as const;

/* ── Doctors Page ─────────────────────────────────────────── */
export const doctorsTranslations = {
  pageEyebrow: { ar: "الأطباء", en: "Physicians" },
  pageHeading: {
    ar: "فريق طبي متخصص يجمع الخبرة والاهتمام الحقيقي بالنتيجة.",
    en: "A specialist medical team combining expertise and genuine attention to results.",
  },
  yearsExperience: { ar: "سنة خبرة", en: "Years Experience" },
  viewProfile: { ar: "الملف الطبي ←", en: "Medical Profile →" },
} as const;

/* ── Devices Page ─────────────────────────────────────────── */
export const devicesTranslations = {
  pageEyebrow: { ar: "الأجهزة الطبية", en: "Medical Devices" },
  pageHeading: {
    ar: "أجهزة طبية معتمدة تضمن الدقة والفاعلية في كل جلسة.",
    en: "Certified medical devices ensuring precision and efficacy in every session.",
  },
} as const;

/* ── Contact Page ─────────────────────────────────────────── */
export const contactTranslations = {
  pageHeading: { ar: "تواصلي معنا", en: "Contact Us" },
  nameLabel: { ar: "الاسم", en: "Name" },
  phoneLabel: { ar: "رقم الهاتف", en: "Phone Number" },
  messageLabel: { ar: "الرسالة", en: "Message" },
  send: { ar: "إرسال الطلب", en: "Send Request" },
} as const;

/* ── About Page ───────────────────────────────────────────── */
export const aboutTranslations = {
  pageHeading: { ar: "من نحن", en: "About Us" },
} as const;

/* ── Footer ───────────────────────────────────────────────── */
export const footerTranslations = {
  brandDesc: {
    ar: "مركز متخصص في طب الجلد والتجميل غير الجراحي، يقدم خدماته بإشراف طبي متكامل وبيئة احترافية.",
    en: "A specialist center in dermatology and non-surgical aesthetics, offering services under comprehensive medical supervision in a professional environment.",
  },
  quickLinks: { ar: "روابط سريعة", en: "Quick Links" },
  ourServices: { ar: "خدماتنا", en: "Our Services" },
  contactUs: { ar: "تواصل معنا", en: "Contact Us" },
  followUs: { ar: "تابعونا", en: "Follow Us" },
  allRights: { ar: "جميع الحقوق محفوظة", en: "All rights reserved" },
  privacyPolicy: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
  termsOfService: { ar: "شروط الاستخدام", en: "Terms of Service" },
  medicalDisclaimer: { ar: "إخلاء المسؤولية الطبية", en: "Medical Disclaimer" },
} as const;
