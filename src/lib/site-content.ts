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
  | "/admin/doctors"
  | "/admin/devices"
  | "/admin/services"
  | "/admin/journal"
  | "/admin/crm"
  | "/admin/media"
  | "/admin/users"
  | "/admin/logs"
  | "/admin/settings"
  | "/login";

export type MenuCard = {
  title: string;
  description: string;
  href: StaticRoute;
};

export type MegaMenuEntry = {
  label: string;
  href: StaticRoute;
  summary: string;
  featured: {
    eyebrow: string;
    title: string;
    description: string;
    href: StaticRoute;
    image: string;
  };
  cards: readonly MenuCard[];
};

export const megaMenuEntries: readonly MegaMenuEntry[] = [
  {
    label: "الخدمات",
    href: "/services",
    summary:
      "خدمات رئيسية معروضة بصورة مباشرة لتوضيح الفارق بينها وما يناسب كل احتياج.",
    featured: {
      eyebrow: "الخدمات الرئيسية",
      title: "تعرفي على الخدمات الأساسية وما يميز كل خدمة قبل طلب الاستشارة.",
      description:
        "يعرض هذا القسم الخدمات الأساسية بصورة واضحة، مع تعريف مختصر يساعد على فهم الغرض من كل خدمة وما إذا كانت مناسبة للحالة.",
      href: "/services",
      image: "/media/curated/service-skin-rejuvenation.jpg",
    },
    cards: [
      {
        title: "خدمات الوجه والبشرة",
        description:
          "عرض واضح لخدمات العناية والتجديد مع تعريف مختصر بهدف كل خدمة ونطاقها.",
        href: "/services",
      },
      {
        title: "جلسات الليزر والأجهزة",
        description:
          "تعريف منظم بالخدمات المعتمدة على الليزر والأجهزة ودورها داخل الخطة العلاجية.",
        href: "/services",
      },
      {
        title: "نتائج وصور مرجعية",
        description:
          "صور ومرئيات مرتبطة بالخدمات والنتائج لتوضيح مستوى العناية بصورة مباشرة.",
        href: "/gallery",
      },
      {
        title: "ابدئي بخطة مناسبة",
        description:
          "اطلبي استشارة أولية ليتم توجيهك إلى الخدمة أو الطبيب الأنسب لحالتك.",
        href: "/contact",
      },
    ],
  },
  {
    label: "الأطباء",
    href: "/doctors",
    summary:
      "ملفات طبية واضحة تعرّف بالأطباء وخبراتهم ومجالات الرعاية المرتبطة بهم.",
    featured: {
      eyebrow: "الخبرة الطبية",
      title: "أطباء بخبرات واضحة وتخصصات محددة تساعد على اختيار الأنسب لحالتك.",
      description:
        "يعرض هذا القسم الملف الطبي لكل طبيب بصورة مختصرة تبرز التخصص، الخبرة، والخدمات المرتبطة به.",
      href: "/doctors",
      image: "/media/curated/service-prp.jpg",
    },
    cards: [
      {
        title: "تعرفي على الفريق",
        description:
          "ملفات مختصرة وواضحة تساعدك على اختيار الطبيب الأقرب لاحتياجك.",
        href: "/doctors",
      },
      {
        title: "تخصصات دقيقة",
        description:
          "ربط كل طبيب بالخدمات والتخصصات الأقرب إلى مجال عمله لتسهيل قرار الحجز.",
        href: "/services",
      },
      {
        title: "عرض مهني مباشر",
        description:
          "عرض مهني هادئ يعكس الطابع الطبي للمركز بعيدًا عن الصياغات المبالغ فيها.",
        href: "/about",
      },
      {
        title: "احجزي استشارة",
        description: "بعد التعرف على الطبيب، ابدئي تواصلك بخطوة مباشرة وسهلة.",
        href: "/contact",
      },
    ],
  },
  {
    label: "الأجهزة",
    href: "/devices",
    summary:
      "الأجهزة المعتمدة معروضة بما يوضح دور كل جهاز داخل الخدمة والخطة العلاجية.",
    featured: {
      eyebrow: "الأجهزة المعتمدة",
      title: "الأجهزة والتقنيات المعتمدة مع شرح مختصر لدورها العلاجي.",
      description:
        "يعرض هذا القسم الأجهزة المستخدمة داخل المركز مع توضيح ارتباطها بالخدمات والحالات المناسبة.",
      href: "/devices",
      image: "/media/curated/device-emface.jpg",
    },
    cards: [
      {
        title: "تقنيات معتمدة",
        description:
          "عرض مباشر للأجهزة التي تدعم جلسات العناية والتجديد والليزر داخل المركز.",
        href: "/devices",
      },
      {
        title: "مرئيات تشغيلية واضحة",
        description:
          "صور محلية مرتبطة بالأجهزة والخدمات بدل الاعتماد على لقطات عامة غير مرتبطة بالسياق.",
        href: "/gallery",
      },
      {
        title: "الخدمة المناسبة أولًا",
        description:
          "اختيار الجهاز يأتي بعد تحديد الخدمة والحاجة العلاجية، لا باعتباره قرارًا منفصلًا.",
        href: "/contact",
      },
      {
        title: "استشارة قبل البدء",
        description:
          "احصلي على مراجعة أولية لتحديد الخدمة والجهاز المناسبين قبل البدء.",
        href: "/contact",
      },
    ],
  },
  {
    label: "المعرفة",
    href: "/journal",
    summary:
      "مقالات طبية مختصرة تساعد على فهم الإجراءات والخدمات قبل الحجز أو الاستشارة.",
    featured: {
      eyebrow: "المجلة الطبية",
      title: "محتوى طبي موجز يجيب عن الأسئلة الشائعة قبل الزيارة الأولى.",
      description:
        "يعرض هذا القسم مقالات مختصرة مرتبطة بالخدمات والأطباء لتوضيح الصورة قبل الاستشارة.",
      href: "/journal",
      image: "/media/curated/service-injectables.png",
    },
    cards: [
      {
        title: "المقالات الطبية",
        description:
          "مواد تحريرية مختارة توضح الأسئلة الشائعة وتدعم القرار قبل الحجز.",
        href: "/journal",
      },
      {
        title: "قراءة قبل القرار",
        description:
          "كل مقال يضع الخدمة أو الإجراء في سياقه الصحيح بصورة مختصرة وواضحة.",
        href: "/journal",
      },
      {
        title: "ربط بالخدمات",
        description:
          "يرتبط المحتوى بالخدمات ذات الصلة لتسهيل الانتقال من القراءة إلى الإجراء المناسب.",
        href: "/services",
      },
      {
        title: "طلب الاستشارة",
        description:
          "بعد اكتمال الصورة، يصبح طلب الاستشارة خطوة مباشرة وواضحة.",
        href: "/contact",
      },
    ],
  },
];

export const heroMetrics = [
  { value: "جلسات", label: "مبنية على تشخيص واضح وهدف علاجي محدد" },
  { value: "أطباء", label: "بتخصصات واضحة وملفات مختصرة سهلة المراجعة" },
  { value: "خطط", label: "تعرض الخدمات والأجهزة بصورة تسهّل المقارنة" },
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
      "متابعة الطلبات الجديدة والحجوزات والاستفسارات بصورة منظمة وواضحة للفريق.",
    href: "/admin/crm" as const,
  },
  {
    title: "ملفات الأطباء",
    metric: "الملفات",
    description:
      "عرض وتحديث محتوى الأطباء بصورة مرتبة تحافظ على جودة الظهور وسهولة المراجعة.",
    href: "/admin/doctors" as const,
  },
  {
    title: "مكتبة الخدمات",
    metric: "الخدمات",
    description:
      "تنظيم الخدمات الرئيسية وتحديث تفاصيلها بما يحافظ على وضوح التجربة العامة.",
    href: "/admin/services" as const,
  },
  {
    title: "الإعدادات",
    metric: "الهوية",
    description:
      "إدارة بيانات التواصل والعلامة والعناصر الأساسية التي تظهر في الواجهة العامة.",
    href: "/admin/settings" as const,
  },
  {
    title: "مكتبة الصور",
    metric: "الأصول",
    description:
      "مراجعة الصور والأصول المرجعية التي تدعم بناء الهوية البصرية الجديدة للمركز.",
    href: "/admin/media" as const,
  },
  {
    title: "جاهزية التشغيل",
    metric: "المنصة",
    description:
      "صورة عامة عن الحالة الحالية للمنصة وما تم تجهيزه لتسليم وتشغيل أكثر استقرارًا.",
    href: "/admin" as const,
  },
] as const;

export const adminNavigation = [
  {
    label: "الرئيسية",
    href: "/admin",
    description: "الرؤية العامة ومؤشرات البدء",
  },
  {
    label: "الأطباء",
    href: "/admin/doctors",
    description: "إدارة ملفات الأطباء",
  },
  {
    label: "الأجهزة",
    href: "/admin/devices",
    description: "إدارة الأجهزة المعتمدة",
  },
  {
    label: "الخدمات",
    href: "/admin/services",
    description: "إدارة مكتبة الخدمات",
  },
  {
    label: "المجلة",
    href: "/admin/journal",
    description: "إدارة المقالات الطبية",
  },
  {
    label: "المعرض",
    href: "/admin/gallery",
    description: "إدارة صور المعرض وبيانات SEO",
  },
  {
    label: "الطلبات",
    href: "/admin/crm",
    description: "طلبات التواصل والمتابعة",
  },
  {
    label: "الميديا",
    href: "/admin/media",
    description: "الأصول المرجعية والصور المحلية",
  },
  {
    label: "المستخدمون",
    href: "/admin/users",
    description: "إدارة الحسابات والصلاحيات",
  },
  {
    label: "السجلات",
    href: "/admin/logs",
    description: "أخطاء النظام وسجل المراقبة",
  },
  {
    label: "الإعدادات",
    href: "/admin/settings",
    description: "إعدادات التشغيل والعلامة",
  },
] as const;
