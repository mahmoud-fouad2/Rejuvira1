export type StaticRoute =
  | "/"
  | "/about"
  | "/journal"
  | "/doctors"
  | "/services"
  | "/devices"
  | "/gallery"
  | "/contact"
  | "/admin"
  | "/admin/content"
  | "/admin/doctors"
  | "/admin/devices"
  | "/admin/services"
  | "/admin/service-categories"
  | "/admin/journal"
  | "/admin/gallery"
  | "/admin/crm"
  | "/admin/media"
  | "/admin/users"
  | "/admin/logs"
  | "/admin/maintenance"
  | "/admin/settings"
  | "/login";

/** Bilingual string pair for mega menu / public routing. */
export type BiString = { readonly ar: string; readonly en: string };

export type MenuCard = {
  title: BiString;
  description: BiString;
  href: StaticRoute;
};

export type MegaMenuEntry = {
  label: BiString;
  href: StaticRoute;
  summary: BiString;
  featured: {
    eyebrow: BiString;
    title: BiString;
    description: BiString;
    href: StaticRoute;
    image: string;
  };
  cards: readonly MenuCard[];
};

export const megaMenuEntries: readonly MegaMenuEntry[] = [
  {
    label: { ar: "الخدمات", en: "Services" },
    href: "/services",
    summary: {
      ar: "خدمات رئيسية معروضة بصورة مباشرة لتوضيح الفارق بينها وما يناسب كل احتياج.",
      en: "Core treatments laid out side by side so you can compare goals, downtime, and fit.",
    },
    featured: {
      eyebrow: { ar: "الخدمات الرئيسية", en: "Signature services" },
      title: {
        ar: "تعرفي على الخدمات الأساسية وما يميز كل خدمة قبل طلب الاستشارة.",
        en: "Understand what each offering is for — before you book a consultation.",
      },
      description: {
        ar: "يعرض هذا القسم الخدمات الأساسية بصورة واضحة، مع تعريف مختصر يساعد على فهم الغرض من كل خدمة وما إذا كانت مناسبة للحالة.",
        en: "Concise medical context for every pathway so expectations stay realistic from day one.",
      },
      href: "/services",
      image: "/media/curated/service-skin-rejuvenation.webp",
    },
    cards: [
      {
        title: { ar: "خدمات الوجه والبشرة", en: "Face & skin programs" },
        description: {
          ar: "عرض واضح لخدمات العناية والتجديد مع تعريف مختصر بهدف كل خدمة ونطاقها.",
          en: "Renewal-focused options with clear intent, scope, and candidacy notes.",
        },
        href: "/services",
      },
      {
        title: { ar: "جلسات الليزر والأجهزة", en: "Laser & device sessions" },
        description: {
          ar: "تعريف منظم بالخدمات المعتمدة على الليزر والأجهزة ودورها داخل الخطة العلاجية.",
          en: "How energy-based platforms support — not replace — the overall plan.",
        },
        href: "/services",
      },
      {
        title: { ar: "نتائج وصور مرجعية", en: "Reference imagery" },
        description: {
          ar: "صور ومرئيات مرتبطة بالخدمات والنتائج لتوضيح مستوى العناية بصورة مباشرة.",
          en: "Clinic-captured examples that mirror the services you are exploring.",
        },
        href: "/gallery",
      },
      {
        title: { ar: "ابدئي بخطة مناسبة", en: "Start with the right plan" },
        description: {
          ar: "اطلبي استشارة أولية ليتم توجيهك إلى الخدمة أو الطبيب الأنسب لحالتك.",
          en: "Request a triage consult so we can pair you with the right clinician or track.",
        },
        href: "/contact",
      },
    ],
  },
  {
    label: { ar: "الأطباء", en: "Doctors" },
    href: "/doctors",
    summary: {
      ar: "ملفات طبية واضحة تعرّف بالأطباء وخبراتهم ومجالات الرعاية المرتبطة بهم.",
      en: "Profiles that foreground credentials, focus areas, and how each physician practices.",
    },
    featured: {
      eyebrow: { ar: "الخبرة الطبية", en: "Clinical depth" },
      title: {
        ar: "أطباء بخبرات واضحة وتخصصات محددة تساعد على اختيار الأنسب لحالتك.",
        en: "Choose a specialist with transparent training and a calm, evidence-led style.",
      },
      description: {
        ar: "يعرض هذا القسم الملف الطبي لكل طبيب بصورة مختصرة تبرز التخصص، الخبرة، والخدمات المرتبطة به.",
        en: "Each bio highlights scope of practice, languages, and aligned services.",
      },
      href: "/doctors",
      image: "/media/curated/doctor-team.jpg",
    },
    cards: [
      {
        title: { ar: "تعرفي على الفريق", en: "Meet the team" },
        description: {
          ar: "ملفات مختصرة وواضحة تساعدك على اختيار الطبيب الأقرب لاحتياجك.",
          en: "Short, substantive bios that speed up confident decision-making.",
        },
        href: "/doctors",
      },
      {
        title: { ar: "تخصصات دقيقة", en: "Focused expertise" },
        description: {
          ar: "ربط كل طبيب بالخدمات والتخصصات الأقرب إلى مجال عمله لتسهيل قرار الحجز.",
          en: "See how each doctor maps to the treatments you already researched.",
        },
        href: "/services",
      },
      {
        title: { ar: "عرض مهني مباشر", en: "Understated presentation" },
        description: {
          ar: "عرض مهني هادئ يعكس الطابع الطبي للمركز بعيدًا عن الصياغات المبالغ فيها.",
          en: "A restrained, medical-grade tone instead of marketing hype.",
        },
        href: "/about",
      },
      {
        title: { ar: "احجزي استشارة", en: "Book a consult" },
        description: {
          ar: "بعد التعرف على الطبيب، ابدئي تواصلك بخطوة مباشرة وسهلة.",
          en: "When you’re ready, move from research to a private conversation.",
        },
        href: "/contact",
      },
    ],
  },
  {
    label: { ar: "الأجهزة", en: "Devices" },
    href: "/devices",
    summary: {
      ar: "الأجهزة المعتمدة معروضة بما يوضح دور كل جهاز داخل الخدمة والخطة العلاجية.",
      en: "Hardware is shown in-context: what it solves, approvals, and how it complements care.",
    },
    featured: {
      eyebrow: { ar: "الأجهزة المعتمدة", en: "Certified platforms" },
      title: {
        ar: "الأجهزة والتقنيات المعتمدة مع شرح مختصر لدورها العلاجي.",
        en: "Technology partners with clinical guardrails and honest indications.",
      },
      description: {
        ar: "يعرض هذا القسم الأجهزة المستخدمة داخل المركز مع توضيح ارتباطها بالخدمات والحالات المناسبة.",
        en: "Understand how each platform slots into the broader treatment pathway.",
      },
      href: "/devices",
      image: "/media/curated/device-laser-platform.webp",
    },
    cards: [
      {
        title: { ar: "تقنيات معتمدة", en: "Vetted technologies" },
        description: {
          ar: "عرض مباشر للأجهزة التي تدعم جلسات العناية والتجديد والليزر داخل المركز.",
          en: "The same equipment you will see in treatment rooms, not stock photography.",
        },
        href: "/devices",
      },
      {
        title: { ar: "مرئيات تشغيلية واضحة", en: "Real clinic visuals" },
        description: {
          ar: "صور محلية مرتبطة بالأجهزة والخدمات بدل الاعتماد على لقطات عامة غير مرتبطة بالسياق.",
          en: "Local captures tied to each device line and its intended outcomes.",
        },
        href: "/gallery",
      },
      {
        title: { ar: "الخدمة المناسبة أولًا", en: "Service before gadget" },
        description: {
          ar: "اختيار الجهاز يأتي بعد تحديد الخدمة والحاجة العلاجية، لا باعتباره قرارًا منفصلًا.",
          en: "Device choice follows clinical need — never the other way around.",
        },
        href: "/contact",
      },
      {
        title: { ar: "استشارة قبل البدء", en: "Consult first" },
        description: {
          ar: "احصلي على مراجعة أولية لتحديد الخدمة والجهاز المناسبين قبل البدء.",
          en: "We align indications in-person before scheduling energy-based work.",
        },
        href: "/contact",
      },
    ],
  },
  {
    label: { ar: "المعرفة", en: "Knowledge" },
    href: "/journal",
    summary: {
      ar: "مقالات طبية مختصرة تساعد على فهم الإجراءات والخدمات قبل الحجز أو الاستشارة.",
      en: "Editorial notes that answer recurring questions before you commit to a visit.",
    },
    featured: {
      eyebrow: { ar: "المجلة الطبية", en: "Medical journal" },
      title: {
        ar: "محتوى طبي موجز يجيب عن الأسئلة الشائعة قبل الزيارة الأولى.",
        en: "Plain-language primers on procedures, recovery, and candidacy.",
      },
      description: {
        ar: "يعرض هذا القسم مقالات مختصرة مرتبطة بالخدمات والأطباء لتوضيح الصورة قبل الاستشارة.",
        en: "Each article links back to services or physicians for a seamless next step.",
      },
      href: "/journal",
      image: "/media/curated/service-injectables.webp",
    },
    cards: [
      {
        title: { ar: "المقالات الطبية", en: "Clinical articles" },
        description: {
          ar: "مواد تحريرية مختارة توضح الأسئلة الشائعة وتدعم القرار قبل الحجز.",
          en: "Trusted answers to the questions patients ask us every week.",
        },
        href: "/journal",
      },
      {
        title: { ar: "قراءة قبل القرار", en: "Read, then decide" },
        description: {
          ar: "كل مقال يضع الخدمة أو الإجراء في سياقه الصحيح بصورة مختصرة وواضحة.",
          en: "Context-first writing so marketing claims never outpace evidence.",
        },
        href: "/journal",
      },
      {
        title: { ar: "ربط بالخدمات", en: "Service cross-links" },
        description: {
          ar: "يرتبط المحتوى بالخدمات ذات الصلة لتسهيل الانتقال من القراءة إلى الإجراء المناسب.",
          en: "Jump from education to the exact offering that matches your goals.",
        },
        href: "/services",
      },
      {
        title: { ar: "طلب الاستشارة", en: "Request guidance" },
        description: {
          ar: "بعد اكتمال الصورة، يصبح طلب الاستشارة خطوة مباشرة وواضحة.",
          en: "Once the story makes sense, booking feels like the natural follow-up.",
        },
        href: "/contact",
      },
    ],
  },
];

export const heroMetrics = [
  { value: "CRM", label: "طلبات ومتابعة" },
  { value: "CMS", label: "محتوى الموقع" },
  { value: "Media", label: "صور وهوية" },
] as const;

export const operationsHighlights = [
  {
    eyebrow: "الثقة",
    title: "استشارة تبدأ من فهم الحالة لا من عرض سريع",
    description:
      "كل نقطة تواصل مرتبة بحيث يعرف الزائر ما الذي سيجده في كل خطوة قبل إرسال الطلب.",
  },
  {
    eyebrow: "العناية",
    title: "مرئيات مرتبطة بالخدمة بدل صور عامة بلا معنى",
    description:
      "تم ربط الأقسام بصور علاجية وتشغيلية أقرب لطبيعة الخدمة المعروضة في كل صفحة.",
  },
] as const;

export const serviceBlocks = [
  {
    eyebrow: "الوجه والبشرة",
    title: "خدمات الجلدية والوجه مع تعريف مختصر لكل مسار",
    description:
      "توضح كل خدمة هدفها الأساسي، نطاقها، وما الذي يجعلها مناسبة للحالة دون مبالغة أو إطالة.",
    badge: "عرض مباشر",
    background:
      "linear-gradient(145deg, rgba(201,162,106,0.22), rgba(255,255,255,0.78) 48%, rgba(240,235,227,0.96) 100%)",
  },
  {
    eyebrow: "الفريق الطبي",
    title: "أطباء يوازنـون بين الدقة الطبية والنتيجة الطبيعية",
    description:
      "يعرض كل ملف طبي التخصص، الخبرة، والخدمات المرتبطة به دون صور أو عبارات غير منضبطة.",
    badge: "ملفات واضحة",
    background:
      "linear-gradient(145deg, rgba(26,122,94,0.16), rgba(255,255,255,0.78) 42%, rgba(250,248,245,0.94) 100%)",
  },
  {
    eyebrow: "التجربة البصرية",
    title: "صور محلية مرتبطة بالخدمة والهوية العامة للمركز",
    description:
      "المراجع البصرية الآن تعتمد على ملفات محلية مناسبة للسياق بدل العناصر العشوائية السابقة.",
    badge: "أصول محلية",
    background:
      "linear-gradient(145deg, rgba(92,45,62,0.14), rgba(255,255,255,0.8) 46%, rgba(250,248,245,0.94) 100%)",
  },
  {
    eyebrow: "رحلة واضحة",
    title: "رحلة واضحة من التعرف على الخدمة حتى طلب الاستشارة المناسبة",
    description:
      "التنقل بين الصفحات صار أوضح، والنصوص تشرح الغرض من كل قسم دون حشو أو مبالغة.",
    badge: "تنقل واضح",
    background:
      "linear-gradient(145deg, rgba(10,12,16,0.08), rgba(255,255,255,0.84) 44%, rgba(240,235,227,0.94) 100%)",
  },
] as const;

export const adminModules = [
  {
    title: "صندوق الطلبات",
    metric: "المراجعين",
    description:
      "طلبات التواصل والحجز مع حالة المتابعة والتصدير.",
    href: "/admin/crm" as const,
  },
  {
    title: "ملفات الأطباء",
    metric: "الملفات",
    description:
      "إضافة وتعديل بيانات الأطباء والصور والخدمات المرتبطة.",
    href: "/admin/doctors" as const,
  },
  {
    title: "مكتبة الخدمات",
    metric: "الخدمات",
    description:
      "إدارة الخدمات، النصوص، الصور، وبيانات الظهور.",
    href: "/admin/services" as const,
  },
  {
    title: "الإعدادات",
    metric: "الهوية",
    description:
      "التواصل، الهوية، SEO، التكاملات، وروابط السوشيال.",
    href: "/admin/settings" as const,
  },
  {
    title: "مكتبة الصور",
    metric: "الأصول",
    description:
      "معاينة الأصول ورفع صور جديدة لاستخدامها في الموقع.",
    href: "/admin/media" as const,
  },
  {
    title: "جاهزية التشغيل",
    metric: "المنصة",
    description:
      "حالة المنصة والربط الأساسي قبل الإطلاق.",
    href: "/admin" as const,
  },
] as const;

export type AdminNavGroupKey = "overview" | "content" | "ops" | "settings";

export const adminNavGroups: Record<AdminNavGroupKey, { label: string; description: string }> = {
  overview: { label: "نظرة عامة", description: "الرؤية اليومية للأعمال" },
  content: { label: "المحتوى", description: "صفحات الواجهة والمحتوى" },
  ops: { label: "العمليات", description: "متابعة العمل والتشغيل" },
  settings: { label: "الإعدادات", description: "التكوين والعلامة" },
};

export const adminNavigation = [
  {
    label: "الرئيسية",
    labelEn: "Dashboard",
    href: "/admin",
    description: "نظرة تشغيلية",
    descriptionEn: "Operational overview",
    group: "overview" as AdminNavGroupKey,
  },
  {
    label: "الخدمات",
    labelEn: "Content Hub",
    href: "/admin/content",
    description: "ربط الأقسام والخدمات والأطباء والأجهزة",
    descriptionEn: "Unified content relationships",
    group: "content" as AdminNavGroupKey,
  },
  {
    label: "مركز المحتوى",
    labelEn: "Services",
    href: "/admin/services",
    description: "إدارة مكتبة الخدمات",
    descriptionEn: "Manage service library",
    group: "content" as AdminNavGroupKey,
  },
  {
    label: "أقسام الخدمات",
    labelEn: "Service Categories",
    href: "/admin/service-categories",
    description: "تنظيم الخدمات داخل أقسام",
    descriptionEn: "Organize services into sections",
    group: "content" as AdminNavGroupKey,
  },
  {
    label: "الأطباء",
    labelEn: "Doctors",
    href: "/admin/doctors",
    description: "إدارة ملفات الأطباء",
    descriptionEn: "Manage doctor profiles",
    group: "content" as AdminNavGroupKey,
  },
  {
    label: "الأجهزة",
    labelEn: "Devices",
    href: "/admin/devices",
    description: "إدارة الأجهزة المعتمدة",
    descriptionEn: "Manage approved devices",
    group: "content" as AdminNavGroupKey,
  },
  {
    label: "المعرض",
    labelEn: "Gallery",
    href: "/admin/gallery",
    description: "قبل/بعد و SEO",
    descriptionEn: "Before/after and SEO",
    group: "content" as AdminNavGroupKey,
  },
  {
    label: "المجلة",
    labelEn: "Journal",
    href: "/admin/journal",
    description: "إدارة المقالات الطبية",
    descriptionEn: "Manage medical articles",
    group: "content" as AdminNavGroupKey,
  },
  {
    label: "الميديا",
    labelEn: "Media",
    href: "/admin/media",
    description: "رفع ومعاينة الصور",
    descriptionEn: "Upload and review images",
    group: "content" as AdminNavGroupKey,
  },
  {
    label: "صفحات مخصصة",
    labelEn: "Custom Pages",
    href: "/admin/pages",
    description: "صفحات خارجية بـ HTML",
    descriptionEn: "Standalone HTML pages",
    group: "content" as AdminNavGroupKey,
  },
  {
    label: "الطلبات",
    labelEn: "CRM",
    href: "/admin/crm",
    description: "طلبات التواصل والمتابعة",
    descriptionEn: "Leads and follow-up",
    group: "ops" as AdminNavGroupKey,
  },
  {
    label: "ويب هوكس",
    labelEn: "Webhooks",
    href: "/admin/webhooks",
    description: "استقبال leads من فورمات خارجية",
    descriptionEn: "Receive leads from external forms",
    group: "ops" as AdminNavGroupKey,
  },
  {
    label: "السجلات",
    labelEn: "Logs",
    href: "/admin/logs",
    description: "أخطاء وتحليلات",
    descriptionEn: "Errors and analytics",
    group: "ops" as AdminNavGroupKey,
  },
  {
    label: "الصيانة",
    labelEn: "Maintenance",
    href: "/admin/maintenance",
    description: "النسخ الاحتياطية والصيانة العامة",
    descriptionEn: "Backups and maintenance",
    group: "ops" as AdminNavGroupKey,
  },
  {
    label: "المستخدمون",
    labelEn: "Users",
    href: "/admin/users",
    description: "إدارة الحسابات والصلاحيات",
    descriptionEn: "Accounts and roles",
    group: "settings" as AdminNavGroupKey,
  },
  {
    label: "الإعدادات",
    labelEn: "Settings",
    href: "/admin/settings",
    description: "هوية وتكاملات",
    descriptionEn: "Brand and integrations",
    group: "settings" as AdminNavGroupKey,
  },
] as const;
