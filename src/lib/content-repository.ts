import { ContentStatus, SubmissionStatus, UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type DoctorRecord = {
  id: string;
  slug: string;
  name: string;
  title: string;
  specialty: string;
  summary: string;
  bio: string;
  photoUrl: string;
  coverImageUrl: string;
  yearsExperience: number;
  languages: readonly string[];
  education: readonly string[];
  achievements: readonly string[];
  publications: readonly string[];
  status: ContentStatus;
  featured: boolean;
  serviceSlugs: readonly string[];
};

export type ServiceRecord = {
  id: string;
  slug: string;
  name: string;
  category: string;
  excerpt: string;
  description: string;
  coverImageUrl: string;
  benefits: readonly string[];
  doctorSlugs: readonly string[];
  deviceSlugs: readonly string[];
  status: ContentStatus;
  featured: boolean;
};

export type DeviceRecord = {
  id: string;
  slug: string;
  name: string;
  excerpt: string;
  description: string;
  imageUrl: string;
  certifications: readonly string[];
  serviceSlugs: readonly string[];
  status: ContentStatus;
};

export type GalleryRecord = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeImageAlt: string;
  afterImageAlt: string;
  /**
   * 0–100. Where the comparison slider should sit on first paint.
   * Defaults to 50 (split image evenly). Backwards-compatible — if absent,
   * the slider clamps the value into [5, 95] on mount.
   */
  initialSplitPercent: number;
};

export type JournalPostRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: readonly string[];
  coverImageUrl: string;
  category: string;
  publishedAt: string;
  readingTime: string;
  relatedServiceSlugs: readonly string[];
  relatedDoctorSlugs: readonly string[];
};

export type CrmRecord = {
  id: string;
  fullName: string;
  phone: string;
  email?: string | undefined;
  serviceLabel?: string | undefined;
  status: SubmissionStatus;
  source: string;
  createdAt: string;
  notes?: string | undefined;
};

export type SettingsGroup = {
  key: string;
  title: string;
  description: string;
  fields: Array<{
    key: string;
    label: string;
    value: string;
  }>;
};

export type ErrorLogRecord = {
  id: string;
  route: string;
  message: string;
  statusCode: number;
  isResolved: boolean;
  createdAt: string;
};

export type DashboardSnapshot = {
  doctorCount: number;
  serviceCount: number;
  leadCount: number;
  deviceCount: number;
};

export type MediaSelections = {
  brandLogo: string;
  brandMark: string;
  favicon: string;
  appleIcon: string;
  ogImage: string;
  homeHero: string;
  doctorsHero: string;
  servicesHero: string;
  aboutHero: string;
  journalHero: string;
};

export type HomeGalleryItem = {
  image: string;
  title: string;
  description: string;
};

export type HomePageSettings = {
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroPillLabel: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroTitleEn: string;
  heroTitleAccentEn: string;
  heroDescriptionEn: string;
  heroPillLabelEn: string;
  heroCtaPrimaryEn: string;
  heroCtaSecondaryEn: string;
  galleryEyebrow: string;
  galleryTitle: string;
  galleryDescription: string;
  galleryEyebrowEn: string;
  galleryTitleEn: string;
  galleryDescriptionEn: string;
  galleryItems: HomeGalleryItem[];
  quotesEyebrow: string;
  quotesTitle: string;
  quotesDescription: string;
  quotesEyebrowEn: string;
  quotesTitleEn: string;
  quotesDescriptionEn: string;
  stripEyebrow: string;
  stripTitle: string;
  stripDescription: string;
  stripEyebrowEn: string;
  stripTitleEn: string;
  stripDescriptionEn: string;
  trustEyebrow: string;
  trustTitle: string;
  trustDescription: string;
  trustEyebrowEn: string;
  trustTitleEn: string;
  trustDescriptionEn: string;
};

export type SocialSettings = {
  instagram: string;
  twitter: string;
  snapchat: string;
  tiktok: string;
  youtube: string;
  linkedin: string;
  facebook: string;
  whatsappBusiness: string;
  threads: string;
  x: string;
};

export type SeoPageDefaults = {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  keywordsAr: string;
  keywordsEn: string;
};

export type SeoSettings = {
  home: SeoPageDefaults;
  services: SeoPageDefaults;
  doctors: SeoPageDefaults;
  devices: SeoPageDefaults;
  gallery: SeoPageDefaults;
  journal: SeoPageDefaults;
  about: SeoPageDefaults;
  contact: SeoPageDefaults;
};

export type RuntimeSettings = {
  contact: {
    phone: string;
    phoneSecondary: string;
    email: string;
    emailSecondary: string;
    whatsapp: string;
    domain: string;
    mapsEmbedUrl: string;
    mapsShape: "square" | "rounded";
    addressAr: string;
    addressEn: string;
    // hours block - subagent #3
    hoursWeekdays: string;
    hoursWeekend: string;
    hoursWeekdaysEn: string;
    hoursWeekendEn: string;
  };
  brand: {
    siteName: string;
    shortName: string;
    tagline: string;
    announcement: string;
    seoDescription: string;
    logoAlt: string;
  };
  ops: {
    sla: string;
    owner: string;
    recaptchaEnabled?: boolean;
    maintenanceMode?: boolean;
    defaultTheme?: "light" | "dark" | "system";
    themeToggleEnabled?: boolean;
  };
  media: MediaSelections;
  homepage: HomePageSettings;
  social: SocialSettings;
  seo: SeoSettings;
  socialVisibility: Record<string, boolean>;
};

export type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  leadCount: number;
  lastLoginAt?: string | undefined;
  createdAt: string;
};

export type CreateDoctorInput = {
  slug: string;
  name: string;
  title: string;
  specialty: string;
  summary: string;
  bio?: string | undefined;
  yearsExperience: number;
  languages: string[];
  photoUrl?: string | undefined;
  coverImageUrl?: string | undefined;
  featured?: boolean | undefined;
  status?: ContentStatus | undefined;
};

export type UpdateDoctorInput = {
  id: string;
  slug: string;
  name: string;
  title: string;
  specialty: string;
  summary: string;
  bio: string;
  yearsExperience: number;
  languages: string[];
  photoUrl?: string | undefined;
  coverImageUrl?: string | undefined;
  featured: boolean;
  status: ContentStatus;
};

export type CreateServiceInput = {
  slug: string;
  name: string;
  category: string;
  excerpt: string;
  description: string;
  coverImageUrl?: string | undefined;
};

export type CreateDeviceInput = {
  slug: string;
  name: string;
  excerpt: string;
  description: string;
  certifications: string[];
  serviceSlugs: string[];
  imageUrl?: string | undefined;
};

export type CreateJournalPostInput = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  category: string;
  readingTime: string;
  relatedServiceSlugs: string[];
  relatedDoctorSlugs: string[];
  coverImageUrl?: string | undefined;
};

export type CreateContactInput = {
  fullName: string;
  phone: string;
  email?: string | undefined;
  message?: string | undefined;
  serviceSlug?: string | undefined;
  preferredLanguage?: string | undefined;
  source?: string | undefined;
};

export type UpdateCrmSubmissionInput = {
  id: string;
  status: SubmissionStatus;
  notes?: string | undefined;
};

export type CreateAdminUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UpdateAdminUserRoleInput = {
  id: string;
  role: UserRole;
};

const seedDoctors: DoctorRecord[] = [
  {
    id: "doctor-loai-alsalmi",
    slug: "loai-alsalmi",
    name: "د. لؤي السالمي",
    title: "استشاري جراحة التجميل والترميم",
    specialty: "جراحة التجميل والترميم",
    summary:
      "التخطيط الجراحي الدقيق يبدأ من تشخيص واضح وحدود واقعية للنتيجة قبل أي إجراء.",
    bio: "يعمل د. لؤي السالمي على تقييم الحالات الجراحية والتجميلية بمنهج واضح يوازن بين السلامة الطبية ودقة التخطيط وتحديد ما يمكن تحقيقه فعليًا لكل حالة. يركز في الاستشارة على شرح البدائل والخطة المتوقعة قبل اعتماد أي تدخل.",
    photoUrl: "/media/doctors/loai-alsalmi.png",
    coverImageUrl: "/media/doctors/loai-alsalmi.png",
    yearsExperience: 25,
    languages: ["العربية", "الإنجليزية"],
    education: [
      "استشاري جراحة التجميل والترميم",
      "خبرة سريرية في تقييم الحالات الجراحية المعقدة",
    ],
    achievements: [
      "تقييم جراحي منظم قبل الإجراء",
      "شرح واضح للخيارات الجراحية والترميمية",
    ],
    publications: [
      "التخطيط الجراحي الدقيق يبدأ من تشخيص واضح وحدود واقعية للنتيجة قبل أي إجراء.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: true,
    serviceSlugs: ["body-contouring"],
  },
  {
    id: "doctor-maher-alahdab",
    slug: "maher-alahdab",
    name: "د. ماهر الأحدب",
    title: "استشاري جراحة التجميل والترميم",
    specialty: "جراحة التجميل والترميم",
    summary:
      "نجاح الإجراء التجميلي يعتمد على قراءة الحالة بدقة واختيار ما يخدمها فعلًا دون مبالغة.",
    bio: "يتعامل د. ماهر الأحدب مع الحالات الجراحية والترميمية من منظور علاجي عملي يبدأ من التشخيص، ثم ترتيب الأولويات العلاجية والجراحية وفق ما تحتاجه الحالة. يركز على وضوح القرار قبل التنفيذ وعلى ملاءمة الخطة للمراجع.",
    photoUrl: "/media/doctors/maher-alahdab.png",
    coverImageUrl: "/media/doctors/maher-alahdab.png",
    yearsExperience: 20,
    languages: ["العربية", "الإنجليزية"],
    education: [
      "استشاري جراحة التجميل والترميم",
      "ممارسة متقدمة في إجراءات الترميم والتصحيح الجراحي",
    ],
    achievements: [
      "ترتيب الأولويات الجراحية قبل التنفيذ",
      "مواءمة الخطة العلاجية مع الحاجة الفعلية للحالة",
    ],
    publications: [
      "نجاح الإجراء التجميلي يعتمد على قراءة الحالة بدقة واختيار ما يخدمها فعلًا دون مبالغة.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: true,
    serviceSlugs: ["body-contouring"],
  },
  {
    id: "doctor-saham-arfaj",
    slug: "saham-arfaj",
    name: "د. سهام العرفج",
    title: "استشارية جراحة التجميل والترميم",
    specialty: "جراحة التجميل والترميم",
    summary:
      "كل قرار جراحي ناجح يحتاج إلى تشخيص منظم وخطة تراعي الوظيفة والشكل معًا.",
    bio: "تقدم د. سهام العرفج الاستشارات الجراحية والترميمية بمنهج يركز على السلامة ودقة التخطيط وتحديد الإجراء الأنسب وفق معطيات الحالة الفعلية. تهتم بإيضاح الخطوات والمتابعة المتوقعة قبل البدء.",
    photoUrl: "/media/doctors/saham-arfaj.png",
    coverImageUrl: "/media/doctors/saham-arfaj.png",
    yearsExperience: 15,
    languages: ["العربية", "الإنجليزية"],
    education: [
      "استشارية جراحة التجميل والترميم",
      "خبرة في تخطيط الإجراءات الترميمية والجمالية",
    ],
    achievements: [
      "تخطيط جراحي يوازن بين الوظيفة والشكل",
      "شرح واضح للخطوات والمتابعة المتوقعة",
    ],
    publications: [
      "كل قرار جراحي ناجح يحتاج إلى تشخيص منظم وخطة تراعي الوظيفة والشكل معًا.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: false,
    serviceSlugs: ["skin-rejuvenation", "injectable-harmony"],
  },
  {
    id: "doctor-sabah-alrashid",
    slug: "sabah-alrashid",
    name: "د. صباح الراشد",
    title: "استشاري جراحة المخ والأعصاب والعمود الفقري",
    specialty: "جراحة المخ والأعصاب والعمود الفقري",
    summary:
      "وضوح التشخيص هو الأساس في أي قرار جراحي، وكل خطوة يجب أن تبنى على معطيات دقيقة لا على تقدير سريع.",
    bio: "يعتمد د. صباح الراشد على تقييم سريري دقيق في الحالات الجراحية المعقدة، مع اهتمام واضح بسلامة القرار وتفسيره للمراجع بصورة مباشرة. يركز على دراسة الحالة قبل اقتراح أي مسار علاجي أو تدخل جراحي.",
    photoUrl: "/media/doctors/sabah-alrashid.png",
    coverImageUrl: "/media/doctors/sabah-alrashid.png",
    yearsExperience: 30,
    languages: ["العربية", "الإنجليزية"],
    education: [
      "استشاري جراحة المخ والأعصاب والعمود الفقري",
      "خبرة طويلة في تقييم الحالات الجراحية المتقدمة",
    ],
    achievements: [
      "قرارات علاجية مبنية على تقييم دقيق",
      "شرح واضح للمخاطر والخيارات قبل الإجراء",
    ],
    publications: [
      "وضوح التشخيص هو الأساس في أي قرار جراحي، وكل خطوة يجب أن تبنى على معطيات دقيقة لا على تقدير سريع.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: false,
    serviceSlugs: [],
  },
  {
    id: "doctor-karima-jamjoom",
    slug: "karima-jamjoom",
    name: "د. كريمة جمجوم",
    title: "أخصائية التجميل النسائي وطب النساء والولادة",
    specialty: "التجميل النسائي وطب النساء والولادة",
    summary:
      "الاستشارة الجيدة تبدأ بالخصوصية والوضوح، ثم اختيار الخطة التي تناسب الحالة فعليًا.",
    bio: "تقدم د. كريمة جمجوم خدماتها في التجميل النسائي وطب النساء والولادة بمنهج يركز على وضوح الخطة وخصوصية الحالة وشرح الخيارات المناسبة بصورة منظمة ومباشرة قبل أي إجراء.",
    photoUrl: "/media/doctors/karima-jamjoom.png",
    coverImageUrl: "/media/doctors/karima-jamjoom.png",
    yearsExperience: 15,
    languages: ["العربية", "الإنجليزية"],
    education: [
      "أخصائية التجميل النسائي وطب النساء والولادة",
      "خبرة في تقييم الحالات النسائية والإجراءات التجميلية المرتبطة بها",
    ],
    achievements: [
      "شرح منظم للحلول المناسبة لكل حالة",
      "متابعة تراعي الخصوصية وطبيعة الإجراء",
    ],
    publications: [
      "الاستشارة الجيدة تبدأ بالخصوصية والوضوح، ثم اختيار الخطة التي تناسب الحالة فعليًا.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: false,
    serviceSlugs: [],
  },
  {
    id: "doctor-najwa-batarfi",
    slug: "najwa-batarfi",
    name: "د. نجوى باطرفي",
    title: "استشارية التجميل النسائي",
    specialty: "التجميل النسائي",
    summary:
      "اختيار الإجراء المناسب لا ينفصل عن فهم الحالة وتحديد الأولوية العلاجية بدقة.",
    bio: "تعتمد د. نجوى باطرفي على تقييم واضح ومباشر في خدمات التجميل النسائي، مع شرح منظم للخيارات والإجراءات المتاحة وحدود كل خيار وفق حاجة الحالة الفعلية.",
    photoUrl: "/media/doctors/najwa-batarfi.png",
    coverImageUrl: "/media/doctors/najwa-batarfi.png",
    yearsExperience: 15,
    languages: ["العربية", "الإنجليزية"],
    education: [
      "استشارية التجميل النسائي",
      "خبرة في الإجراءات النسائية التجميلية غير الجراحية والجراحية",
    ],
    achievements: [
      "تقييم علاجي منظم قبل الإجراء",
      "تحديد واضح للتوقعات والخطة",
    ],
    publications: [
      "اختيار الإجراء المناسب لا ينفصل عن فهم الحالة وتحديد الأولوية العلاجية بدقة.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: false,
    serviceSlugs: [],
  },
  {
    id: "doctor-natali-domloj",
    slug: "natali-domloj",
    name: "د. ناتالي دوملوج",
    title: "استشارية الجلدية والتجميل",
    specialty: "الجلدية والتجميل",
    summary:
      "النتيجة المتوازنة تأتي من تشخيص أدق، وخطة مدروسة، واختيار الإجراء المناسب للبشرة والملامح.",
    bio: "تعمل د. ناتالي دوملوج على الحالات الجلدية والتجميلية بمنهج يركز على التشخيص الواضح، وضبط الخطة العلاجية وفق طبيعة البشرة، وتحديد ما تحتاجه الحالة من إجراءات جلدية أو تجميلية بصورة متدرجة.",
    photoUrl: "/media/doctors/natali-domloj.png",
    coverImageUrl: "/media/doctors/natali-domloj.png",
    yearsExperience: 20,
    languages: ["العربية", "الإنجليزية", "الفرنسية"],
    education: [
      "استشارية الجلدية والتجميل",
      "خبرة في إجراءات الجلدية العلاجية والتجميلية",
    ],
    achievements: [
      "ربط التشخيص بالخطة العلاجية المناسبة",
      "تنسيق الإجراءات الجلدية والتجميلية ضمن مسار واضح",
    ],
    publications: [
      "النتيجة المتوازنة تأتي من تشخيص أدق، وخطة مدروسة، واختيار الإجراء المناسب للبشرة والملامح.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: true,
    serviceSlugs: [
      "skin-rejuvenation",
      "injectable-harmony",
      "laser-hair-removal",
    ],
  },
  {
    id: "doctor-falwah-aljanoubi",
    slug: "falwah-aljanoubi",
    name: "د. فلوة الجنوبي",
    title: "أخصائية الجراحة العامة",
    specialty: "الجراحة العامة",
    summary:
      "القرار الجراحي السليم يبدأ من فهم الحاجة الفعلية للحالة وترتيب الأولويات العلاجية بوضوح.",
    bio: "تقدم د. فلوة الجنوبي تقييمًا واضحًا في الجراحة العامة، مع تركيز على شرح الخطة العلاجية وتحديد ما إذا كان التدخل الجراحي هو الخيار الأنسب وفق معطيات الحالة.",
    photoUrl: "/media/doctors/falwah-aljanoubi.png",
    coverImageUrl: "/media/doctors/falwah-aljanoubi.png",
    yearsExperience: 5,
    languages: ["العربية", "الإنجليزية"],
    education: [
      "أخصائية الجراحة العامة",
      "ممارسة سريرية في تقييم الحالات الجراحية العامة",
    ],
    achievements: [
      "قراءة منهجية للحالة قبل الإجراء",
      "توضيح الخطة للمراجع بلغة مباشرة",
    ],
    publications: [
      "القرار الجراحي السليم يبدأ من فهم الحاجة الفعلية للحالة وترتيب الأولويات العلاجية بوضوح.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: false,
    serviceSlugs: [],
  },
  {
    id: "doctor-bandar-alharthi",
    slug: "bandar-alharthi",
    name: "البروفيسور بندر الحارثي",
    title: "استشاري جراحة عامة وجراحة أورام الثدي والغدد الصماء",
    specialty: "جراحة عامة وجراحة أورام الثدي والغدد الصماء",
    summary:
      "الخطة العلاجية الدقيقة لا تبنى على السرعة، بل على تشخيص واضح وترتيب مدروس للخيارات.",
    bio: "يعتمد البروفيسور بندر الحارثي على منهج سريري دقيق في تقييم الحالات الجراحية، مع اهتمام بترتيب الخيارات العلاجية وشرحها بصورة واضحة تساعد المراجع على اتخاذ القرار المناسب.",
    photoUrl: "/media/doctors/bandar-alharthi.png",
    coverImageUrl: "/media/doctors/bandar-alharthi.png",
    yearsExperience: 21,
    languages: ["العربية", "الإنجليزية"],
    education: [
      "استشاري جراحة عامة وجراحة أورام الثدي والغدد الصماء",
      "خبرة أكاديمية وسريرية طويلة في الحالات الجراحية التخصصية",
    ],
    achievements: [
      "تقييم تخصصي للحالات الجراحية المعقدة",
      "شرح تنظيمي للمسار العلاجي قبل التدخل",
    ],
    publications: [
      "الخطة العلاجية الدقيقة لا تبنى على السرعة، بل على تشخيص واضح وترتيب مدروس للخيارات.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: false,
    serviceSlugs: [],
  },
  {
    id: "doctor-ahmed-eldesouki",
    slug: "ahmed-eldesouki",
    name: "د. أحمد الدسوقي",
    title: "نائب أول جراحة التجميل",
    specialty: "جراحة التجميل",
    summary:
      "النتيجة الجيدة تأتي حين تكون الخطة مناسبة للحالة ومبنية على شرح واضح قبل التنفيذ.",
    bio: "يقدم د. أحمد الدسوقي استشارات جراحة التجميل بمنهج عملي يركز على تقييم الحالة وتحديد ما يناسبها من إجراءات وشرح الخطوات المتوقعة بصورة مباشرة ومنظمة قبل البدء.",
    photoUrl: "/media/doctors/ahmed-eldesouki.png",
    coverImageUrl: "/media/doctors/ahmed-eldesouki.png",
    yearsExperience: 7,
    languages: ["العربية", "الإنجليزية"],
    education: [
      "نائب أول جراحة التجميل",
      "خبرة سريرية في تقييم الإجراءات التجميلية والجراحية",
    ],
    achievements: [
      "شرح عملي للمسار الجراحي قبل الإجراء",
      "تحديد واقعي لأهداف العلاج والنتيجة",
    ],
    publications: [
      "النتيجة الجيدة تأتي حين تكون الخطة مناسبة للحالة ومبنية على شرح واضح قبل التنفيذ.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: true,
    serviceSlugs: ["body-contouring"],
  },
];

const seedServices: ServiceRecord[] = [
  {
    id: "service-skin-rejuvenation",
    slug: "skin-rejuvenation",
    name: "تجديد البشرة المتقدم",
    category: "الجلدية المتقدمة",
    excerpt:
      "خطة متدرجة لتحسين نضارة البشرة، توحيد اللون، واستعادة الإشراق بقراءة دقيقة لاحتياج الحالة.",
    description:
      "تجمع هذه الخدمة بين التشخيص الدقيق واختيار الجلسات أو الوسائل المناسبة بحسب حالة البشرة ودرجة الحساسية والتصبغات وآثار الإرهاق. الهدف هو إعداد خطة تمنح البشرة مظهرًا أكثر صفاءً مع متابعة منظمة بحسب الحاجة.",
    coverImageUrl: "/media/curated/service-skin-rejuvenation.jpg",
    benefits: [
      "قراءة أدق لاحتياج البشرة",
      "خطة علاجية متدرجة حسب الحالة",
      "إشراقة طبيعية ومظهر أكثر صفاءً",
    ],
    doctorSlugs: ["natali-domloj", "saham-arfaj"],
    deviceSlugs: ["fractional-laser-platform"],
    status: ContentStatus.PUBLISHED,
    featured: true,
  },
  {
    id: "service-laser-hair-removal",
    slug: "laser-hair-removal",
    name: "إزالة الشعر بالليزر",
    category: "الليزر والتقنيات",
    excerpt:
      "جلسات مريحة ومدروسة تهدف إلى تقليل الشعر غير المرغوب فيه وفق نوع البشرة وكثافة الشعر والمنطقة المستهدفة.",
    description:
      "تبدأ هذه الخدمة بتحديد طبيعة الشعر ونوع البشرة ثم اختيار الخطة الملائمة لعدد الجلسات والفواصل الزمنية والتعليمات المطلوبة قبل الجلسة وبعدها. ما يميز التجربة هنا هو الوضوح في الشرح، وهدوء التنفيذ، والاهتمام بأن تكون التوقعات واقعية والنتيجة مريحة على المدى الطويل.",
    coverImageUrl: "/media/curated/service-laser-hair-removal.jpg",
    benefits: [
      "خطة مناسبة لنوع البشرة والشعر",
      "تعليمات واضحة قبل الجلسة وبعدها",
      "تجربة أكثر راحة وثباتًا عبر الجلسات",
    ],
    doctorSlugs: ["natali-domloj"],
    deviceSlugs: ["diode-laser-suite"],
    status: ContentStatus.PUBLISHED,
    featured: true,
  },
  {
    id: "service-injectable-harmony",
    slug: "injectable-harmony",
    name: "تناغم الوجه بالحقن",
    category: "التجميل غير الجراحي",
    excerpt:
      "نهج تجميلي يركز على إبراز التوازن في الملامح والحفاظ على تعبير الوجه الطبيعي دون مبالغة.",
    description:
      "تعتمد هذه الخدمة على تقييم تفاصيل الوجه، ونقاط الحاجة الفعلية، وما إذا كان المطلوب تعزيز الامتلاء أو تخفيف الخطوط أو إعادة التوازن العام للملامح. النتيجة المستهدفة هنا ليست التغيير الجذري، بل تحسين محسوب يجعل المظهر أكثر نضارة واتزانًا وثقة.",
    coverImageUrl: "/media/curated/service-prp.jpg",
    benefits: [
      "نتائج متزنة تحافظ على الملامح",
      "تخطيط هادئ قبل أي إجراء",
      "شرح أوضح للتوقعات والخيارات المناسبة",
    ],
    doctorSlugs: ["natali-domloj", "saham-arfaj"],
    deviceSlugs: [],
    status: ContentStatus.PUBLISHED,
    featured: true,
  },
  {
    id: "service-body-contouring",
    slug: "body-contouring",
    name: "نحت القوام غير الجراحي",
    category: "الأجهزة والتقنيات",
    excerpt:
      "خدمة تهدف إلى تحسين التناسق العام للجسم بطرق غير جراحية وخطة تناسب طبيعة الهدف المطلوب.",
    description:
      "تخدم هذه الجلسات من يبحث عن تحسينات مدروسة في تناسق القوام عبر وسائل غير جراحية وبتوقعات واقعية. تبدأ الخطة بفهم الهدف من العلاج، وتحديد المناطق المناسبة للعمل، ثم اختيار الإجراء الذي يخدم الحالة بصورة عملية.",
    coverImageUrl: "/media/curated/device-emface.jpg",
    benefits: [
      "تحسين التناسق العام للجسم",
      "تقنيات غير جراحية مناسبة للحالات المختارة",
      "خطة أكثر وضوحًا قبل البدء",
    ],
    doctorSlugs: ["loai-alsalmi", "ahmed-eldesouki"],
    deviceSlugs: ["body-contour-station"],
    status: ContentStatus.DRAFT,
    featured: false,
  },
];

const seedDevices: DeviceRecord[] = [
  {
    id: "device-fractional-laser-platform",
    slug: "fractional-laser-platform",
    name: "منصة الفراكشنال ليزر",
    excerpt:
      "تقنية تساعد على تحسين ملمس البشرة وتقليل آثار الندبات والمسام وتفاوت اللون وفق تقييم الحالة.",
    description:
      "تستخدم هذه التقنية في خطط تجديد البشرة التي تحتاج إلى تحفيز أعمق وتحسين تدريجي في الملمس والمظهر العام. اختيارها لا يكون لمجرد الاسم، بل حين تكون مناسبة لنوع البشرة والهدف العلاجي المطلوب.",
    imageUrl: "/media/curated/device-laser-platform.png",
    certifications: ["اعتماد طبي معتمد", "ملائم لخطط تجديد البشرة"],
    serviceSlugs: ["skin-rejuvenation"],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: "device-diode-laser-suite",
    slug: "diode-laser-suite",
    name: "جهاز الدايود ليزر",
    excerpt:
      "تقنية شائعة وفعالة لجلسات إزالة الشعر، مع قدرة على العمل وفق احتياج مناطق مختلفة ونوع البشرة.",
    description:
      "يدعم هذا الجهاز جلسات إزالة الشعر التي تحتاج إلى توازن بين الراحة والفعالية والاستمرارية، ويتم اعتماده ضمن خطة يشرح فيها الطبيب عدد الجلسات المتوقع والتعليمات المناسبة لكل حالة.",
    imageUrl: "/media/curated/service-laser-hair-removal.jpg",
    certifications: ["مناسب لجلسات الليزر", "إجراءات مبنية على تقييم مسبق"],
    serviceSlugs: ["laser-hair-removal"],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: "device-body-contour-station",
    slug: "body-contour-station",
    name: "تقنية نحت القوام",
    excerpt:
      "تقنية داعمة لتحسين تناسق القوام في الحالات التي تناسب الحلول غير الجراحية المتدرجة.",
    description:
      "تأتي هذه التقنية ضمن مسارات تهدف إلى دعم مظهر أكثر تناسقًا في بعض المناطق المختارة، مع أهمية التقييم الواقعي للحالة وتحديد ما إذا كانت الخدمة مناسبة بالفعل للهدف المطلوب.",
    imageUrl: "/media/curated/device-emface.jpg",
    certifications: [
      "اختيار مناسب للحالات المحددة",
      "خطة تعتمد على التقييم الواقعي",
    ],
    serviceSlugs: ["body-contouring"],
    status: ContentStatus.PUBLISHED,
  },
];

const seedGallery: GalleryRecord[] = [
  {
    id: "gallery-reference-01",
    slug: "reference-01",
    title: "مرجع بصري واضح",
    category: "أجواء المكان",
    description:
      "مرجع بصري يساعد على بناء واجهة أكثر اتزانًا، ويعكس نوع الأجواء التي نريد إيصالها للزائر من اللحظة الأولى.",
    beforeImageUrl: "/media/reference/legacy/15.png",
    afterImageUrl: "/media/reference/legacy/16.png",
    beforeImageAlt: "مرجع بصري واضح - قبل",
    afterImageAlt: "مرجع بصري واضح - بعد",
    initialSplitPercent: 50,
  },
  {
    id: "gallery-reference-02",
    slug: "reference-02",
    title: "تفاصيل الخدمة",
    category: "الواجهة والخدمات",
    description:
      "صورة مرجعية تدعم بناء أقسام الخدمات بأسلوب أكثر أناقة وتوازنًا بين الصورة والنص والمساحة البيضاء.",
    beforeImageUrl: "/media/reference/legacy/13.png",
    afterImageUrl: "/media/reference/legacy/18.png",
    beforeImageAlt: "تفاصيل الخدمة - قبل",
    afterImageAlt: "تفاصيل الخدمة - بعد",
    initialSplitPercent: 50,
  },
  {
    id: "gallery-reference-03",
    slug: "reference-03",
    title: "هوية أكثر حضورًا",
    category: "الهوية البصرية",
    description:
      "مرجع بصري يساعد في استلهام حضور العلامة بشكل أكثر نضجًا وهدوءًا من النسخ التقليدية المعتادة.",
    beforeImageUrl: "/media/reference/legacy/56549.png",
    afterImageUrl: "/media/reference/legacy/88985959.png",
    beforeImageAlt: "هوية أكثر حضورًا - قبل",
    afterImageAlt: "هوية أكثر حضورًا - بعد",
    initialSplitPercent: 50,
  },
];

const seedJournalPosts: JournalPostRecord[] = [
  {
    id: "journal-skin-timing",
    slug: "skin-renewal-timing",
    title:
      "متى يصبح تجديد البشرة قرارًا علاجيًا صحيحًا وليس مجرد رغبة تجميلية؟",
    excerpt:
      "مقال يوضح متى تبدأ الحاجة الطبية أو التجميلية لتجديد البشرة، وكيف يتم تقييم الحالة قبل اعتماد أي خطة علاجية.",
    body: [
      "القرار الصحيح لا يبدأ من اسم الجهاز أو العرض السعري، بل من قراءة الجلد نفسها: التصبغ، المسام، الندبات، نمط الالتهاب، ودرجة حساسية البشرة. لهذا السبب يجب أن يبدأ أي مسار لتجديد البشرة بتقييم سريري واضح يحدد هل المطلوب تحفيز، تقشير، ليزر، أم فقط تعديل روتين علاجي.",
      "المراجعين غالبًا يأتون بطلب عام: أريد نضارة أو أريد تجديدًا. لكن الفريق الطبي يحتاج ترجمة هذا الطلب إلى خطة قابلة للتنفيذ. أحيانًا يكون الحل في جلسات خفيفة متدرجة، وأحيانًا في ربط الخدمة بجهاز أدق أو فترة متابعة أطول. لذلك فالتشخيص الهادئ هو ما يصنع الفرق بين نتيجة جميلة مؤقتة وخطة تعيد للبشرة توازنها بصورة أكثر ثباتًا.",
      "حين تُعرض هذه الفكرة بوضوح، يدرك الزائر أن العناية هنا تبدأ من فهم الحالة لا من الترويج. وهذا ما يجعل القرار أكثر استقرارًا قبل الزيارة الأولى.",
    ],
    coverImageUrl: "/media/curated/service-skin-rejuvenation.jpg",
    category: "تثقيف طبي",
    publishedAt: "2026-05-12T09:00:00.000Z",
    readingTime: "4 دقائق",
    relatedServiceSlugs: ["skin-rejuvenation"],
    relatedDoctorSlugs: ["natali-domloj"],
  },
  {
    id: "journal-laser-readiness",
    slug: "laser-readiness-checklist",
    title: "كيف نهيئ المراجع لجلسات الليزر بشكل يقلل الأسئلة ويرفع الثقة؟",
    excerpt:
      "هذه المادة تشرح ما يجب معرفته قبل جلسات الليزر: التوقعات، التعليمات الأساسية، وما الذي يجب تقييمه قبل البدء.",
    body: [
      "أحد أكبر أسباب التردد قبل جلسات الليزر هو غياب التهيئة الصحيحة. عندما تكون الصفحة التعليمية واضحة، تصبح الأسئلة المتكررة أقل، ويصل المراجع إلى مسار التواصل وهو يفهم المطلوب منه وما يمكن توقعه من الجلسات الأولى.",
      "التهيئة الجيدة لا تعني فقط شرح التعليمات، بل أيضًا توضيح التوقعات الواقعية وعدد الجلسات المحتمل وما إذا كانت الحالة تحتاج إلى تعديل في العناية المنزلية أو في توقيت بعض الإجراءات الأخرى. هذه التفاصيل تصنع فرقًا كبيرًا في راحة المراجع وثقته.",
      "وحين يجد الزائر هذا المستوى من الشرح قبل الحجز، يصبح القرار أسهل لأن المحتوى يقدم معلومات طبية مباشرة لا عبارات دعائية.",
    ],
    coverImageUrl: "/media/curated/service-injectables.png",
    category: "دليل الليزر",
    publishedAt: "2026-05-10T13:30:00.000Z",
    readingTime: "5 دقائق",
    relatedServiceSlugs: ["laser-hair-removal"],
    relatedDoctorSlugs: ["natali-domloj"],
  },
  {
    id: "journal-injectables-trust",
    slug: "injectables-trust-framework",
    title: "بناء الثقة في صفحات الحقن يبدأ باللغة والخطة لا بالصور وحدها",
    excerpt:
      "طرح خدمات الحقن يحتاج لغة دقيقة وخطة واضحة تشرح النتيجة المتوقعة دون مبالغة أو وعود غير منضبطة.",
    body: [
      "في صفحات الحقن تحديدًا، المشكلة ليست نقص الصور فقط، بل ضعف اللغة المستخدمة في العرض. كلما زادت الوعود أو انخفضت دقة الشرح، تراجعت الثقة حتى لو كان التصميم جيدًا. لهذا السبب نحتاج محتوى يشرح التوازن، اختيار الحالة المناسبة، وحدود ما يمكن تحقيقه.",
      "المراجع الذي يفكر في الحقن لا يبحث فقط عن صورة نتيجة، بل عن طبيب يفهم التناسق، وخطة واضحة، وحدودًا آمنة ومقنعة لما يمكن تحسينه. لذلك فإن اللغة التي تُعرض بها الخدمة لا تقل أهمية عن الإجراء ذاته.",
      "كلما كانت الصفحة أكثر اتزانًا في الشرح وأقرب إلى الحس الطبي الدقيق، شعر الزائر أن القرار هنا مبني على خبرة حقيقية لا على انطباع سريع. وهذه هي الثقة التي تصنع الفرق قبل أي جلسة.",
    ],
    coverImageUrl: "/media/curated/service-laser-hair-removal.jpg",
    category: "استراتيجيات الحقن",
    publishedAt: "2026-05-08T11:00:00.000Z",
    readingTime: "4 دقائق",
    relatedServiceSlugs: ["injectable-harmony"],
    relatedDoctorSlugs: ["saham-arfaj", "natali-domloj"],
  },
];

const seedCrmRecords: CrmRecord[] = [
  {
    id: "crm-01",
    fullName: "سارة الجهني",
    phone: "+966500000001",
    email: "sarah@example.com",
    serviceLabel: "تجديد البشرة المتقدم",
    status: SubmissionStatus.NEW,
    source: "Home contact form",
    createdAt: "2026-05-10T10:30:00.000Z",
    notes: "تحتاج متابعة خلال 12 ساعة.",
  },
  {
    id: "crm-02",
    fullName: "رهف سالم",
    phone: "+966500000002",
    serviceLabel: "إزالة الشعر بالليزر",
    status: SubmissionStatus.CONTACTED,
    source: "WhatsApp CTA",
    createdAt: "2026-05-09T13:15:00.000Z",
    notes: "تم الرد وإرسال مواعيد مبدئية.",
  },
  {
    id: "crm-03",
    fullName: "مها أنور",
    phone: "+966500000003",
    serviceLabel: "تناغم الوجه بالحقن",
    status: SubmissionStatus.BOOKED,
    source: "Doctor page",
    createdAt: "2026-05-08T08:45:00.000Z",
    notes: "تم تأكيد الموعد الأول.",
  },
];

const seedSettings: SettingsGroup[] = [
  {
    key: "contact",
    title: "بيانات التواصل",
    description:
      "الحد الأدنى التشغيلي الذي يظهر في الـ CTA والنماذج والواجهة العامة.",
    fields: [
      { key: "phone", label: "الرقم الرئيسي", value: "0114999959" },
      {
        key: "phoneSecondary",
        label: "الرقم الموحد",
        value: "9200 17403",
      },
      {
        key: "email",
        label: "البريد الرسمي",
        value: "info@rejuveracenter.sa",
      },
      {
        key: "emailSecondary",
        label: "البريد البديل",
        value: "info@rejuveracenter.sa",
      },
      { key: "whatsapp", label: "واتساب", value: "0114999959" },
      { key: "domain", label: "النطاق الرسمي", value: "rejuveracenter.sa" },
      // hours block - subagent #3
      {
        key: "hoursWeekdays",
        label: "ساعات العمل (السبت — الخميس)",
        value: "السبت — الخميس · 2:00 م — 10:00 م",
      },
      {
        key: "hoursWeekend",
        label: "اليوم المغلق",
        value: "الجمعة مغلق",
      },
      {
        key: "hoursWeekdaysEn",
        label: "Working hours (Sat – Thu, English)",
        value: "Sat – Thu · 2:00 PM – 10:00 PM",
      },
      {
        key: "hoursWeekendEn",
        label: "Closed day (English)",
        value: "Closed Friday",
      },
    ],
  },
  {
    key: "brand",
    title: "العلامة والرسائل",
    description:
      "نصوص الواجهة الأساسية والـ announcement bar والـ CTA الرئيسي.",
    fields: [
      {
        key: "siteName",
        label: "اسم العلامة الرئيسي",
        value: "Rejuvira Center",
      },
      {
        key: "shortName",
        label: "الاسم المختصر",
        value: "Rejuvira",
      },
      {
        key: "tagline",
        label: "الجملة الافتتاحية",
        value: "رعاية جلدية وتجميلية مبنية على تشخيص واضح وخطة مناسبة لكل حالة",
      },
      {
        key: "announcement",
        label: "شريط الإعلان",
        value: "حجز منظم واستجابة سريعة ومتابعة دقيقة عبر جميع قنوات التواصل",
      },
      {
        key: "seoDescription",
        label: "الوصف التعريفي للموقع",
        value:
          "مركز متخصص في الجلدية والتجميل الطبي يقدم خدمات مدروسة، أطباء متخصصين، وتجربة علاجية واضحة من أول تواصل حتى المتابعة.",
      },
      {
        key: "logoAlt",
        label: "النص البديل للشعار",
        value: "شعار Rejuvira Center للجلدية والتجميل الطبي",
      },
    ],
  },
  {
    key: "ops",
    title: "التشغيل والإدارة",
    description:
      "إعدادات أولية تتعلق بالإشعارات والتعامل مع الطلبات داخل الـ CRM.",
    fields: [
      { key: "sla", label: "زمن الرد المستهدف", value: "خلال 2 ساعة" },
      { key: "owner", label: "مسؤول المتابعة", value: "Front Desk" },
    ],
  },
  {
    key: "media",
    title: "الصور المميزة للأقسام",
    description:
      "مسارات الصور المحلية التي تتحكم في المشاهد الرئيسية داخل الصفحات العامة.",
    fields: [
      {
        key: "brandLogo",
        label: "الشعار الرئيسي",
        value: "/media/curated/brand-logo.jpg",
      },
      {
        key: "brandMark",
        label: "أيقونة الهوية المربعة",
        value: "/media/curated/brand-logo.jpg",
      },
      {
        key: "favicon",
        label: "Favicon",
        value: "/media/curated/brand-logo.jpg",
      },
      {
        key: "appleIcon",
        label: "Apple Touch Icon",
        value: "/media/curated/brand-logo.jpg",
      },
      {
        key: "ogImage",
        label: "صورة المشاركة الاجتماعية",
        value: "/media/curated/brand-logo.jpg",
      },
      {
        key: "homeHero",
        label: "صورة الصفحة الرئيسية",
        value: "/media/curated/service-skin-rejuvenation.jpg",
      },
      {
        key: "doctorsHero",
        label: "صورة قسم الأطباء",
        value: "/media/doctors/loai-alsalmi.png",
      },
      {
        key: "servicesHero",
        label: "صورة قسم الخدمات",
        value: "/media/curated/service-laser-hair-removal.jpg",
      },
      {
        key: "aboutHero",
        label: "صورة صفحة من نحن",
        value: "/media/curated/device-emface.jpg",
      },
      {
        key: "journalHero",
        label: "صورة المجلة الطبية",
        value: "/media/curated/service-injectables.png",
      },
    ],
  },
  {
    key: "homepage",
    title: "سكاشن الصفحة الرئيسية",
    description:
      "محتوى الأقسام المتحركة في الصفحة الرئيسية من عناوين ونصوص وصور محلية.",
    fields: [
      {
        key: "heroTitle",
        label: "عنوان الهيرو",
        value: "خدمات جلدية وتجميلية بإشراف طبي وخيارات أوضح من أول زيارة.",
      },
      {
        key: "heroTitleAccent",
        label: "العبارة المميزة في الهيرو",
        value: "بخطة طبية واضحة",
      },
      {
        key: "heroDescription",
        label: "وصف الهيرو",
        value:
          "يعرض الموقع الخدمات، الأطباء، والأجهزة بصورة منظمة تساعد على فهم الخيارات المتاحة قبل طلب الاستشارة.",
      },
      {
        key: "heroPillLabel",
        label: "شارة الهيرو العلوية",
        value: "مركز ريجوفيرا الطبي",
      },
      {
        key: "heroCtaPrimary",
        label: "زر الهيرو الأساسي",
        value: "احجزي استشارتك المجانية",
      },
      {
        key: "heroCtaSecondary",
        label: "زر الهيرو الثانوي",
        value: "شاهدي قصص النجاح",
      },
      {
        key: "stripEyebrow",
        label: "عنوان فرعي لشريط الخدمات السريع",
        value: "مختارات من الخدمات",
      },
      {
        key: "stripTitle",
        label: "عنوان شريط الخدمات السريع",
        value: "استعرضي خدمات مرتبطة بحالتك",
      },
      {
        key: "stripDescription",
        label: "وصف شريط الخدمات السريع",
        value: "شريط سريع لتصفح الخدمات وفتح ما يهمك بنقرة واحدة.",
      },
      {
        key: "trustEyebrow",
        label: "عنوان فرعي لقسم الثقة والاعتمادات",
        value: "معتمدون دوليا ومحليا",
      },
      {
        key: "trustTitle",
        label: "عنوان قسم الثقة والاعتمادات",
        value: "ثقة طبية ومعايير واضحة",
      },
      {
        key: "trustDescription",
        label: "وصف قسم الثقة والاعتمادات",
        value:
          "اعتمادات معلنة، تقنيات موثوقة، وخصوصية عالية تمنحك قرارًا أكثر اطمئنانًا.",
      },
      {
        key: "galleryEyebrow",
        label: "عنوان فرعي لقسم الصورة المتغيرة",
        value: "من معرض الواجهة",
      },
      {
        key: "galleryTitle",
        label: "عنوان قسم الصورة المتغيرة",
        value: "مشاهد منتقاة تشرح بوضوح ما تعكسه كل صورة من خدمة أو نتيجة.",
      },
      {
        key: "galleryDescription",
        label: "وصف قسم الصورة المتغيرة",
        value:
          "يعرض هذا القسم صورًا حقيقية مرتبطة بالخدمات والأجهزة داخل المركز، مع وصف مهني يوضح دلالة كل لقطة في سياق التجربة العلاجية.",
      },
      {
        key: "galleryItem1Image",
        label: "صورة العنصر الأول",
        value: "/media/curated/service-skin-rejuvenation.jpg",
      },
      {
        key: "galleryItem1Title",
        label: "عنوان العنصر الأول",
        value: "خدمات البشرة",
      },
      {
        key: "galleryItem1Description",
        label: "وصف العنصر الأول",
        value:
          "صورة مخصصة لمسارات تجديد البشرة والعناية العلاجية المرتبطة بتحسين الملمس والصفاء.",
      },
      {
        key: "galleryItem2Image",
        label: "صورة العنصر الثاني",
        value: "/media/curated/service-laser-hair-removal.jpg",
      },
      {
        key: "galleryItem2Title",
        label: "عنوان العنصر الثاني",
        value: "جلسات الليزر",
      },
      {
        key: "galleryItem2Description",
        label: "وصف العنصر الثاني",
        value:
          "واجهة بصرية مرتبطة بخدمات الليزر وإزالة الشعر والتقنيات المعتمدة على الطاقة الضوئية.",
      },
      {
        key: "galleryItem3Image",
        label: "صورة العنصر الثالث",
        value: "/media/curated/device-emface.jpg",
      },
      {
        key: "galleryItem3Title",
        label: "عنوان العنصر الثالث",
        value: "الأجهزة والتقنيات",
      },
      {
        key: "galleryItem3Description",
        label: "وصف العنصر الثالث",
        value:
          "مشهد يوضح الأجهزة المستخدمة ضمن الخطة العلاجية وكيف يظهر دورها داخل الواجهة العامة.",
      },
      {
        key: "quotesEyebrow",
        label: "عنوان فرعي لقسم مقولات الأطباء",
        value: "من أطباء المركز",
      },
      {
        key: "quotesTitle",
        label: "عنوان قسم مقولات الأطباء",
        value: "رؤية الأطباء في التشخيص وصياغة القرار العلاجي.",
      },
      {
        key: "quotesDescription",
        label: "وصف قسم مقولات الأطباء",
        value:
          "اقتباسات مختارة من الأطباء تعكس منهجهم السريري وطريقتهم في تقييم الحالة وبناء الخطة المناسبة.",
      },
    ],
  },
  {
    key: "social",
    title: "قنوات التواصل الاجتماعي",
    description: "روابط الحسابات الرسمية التي تظهر في تذييل الصفحة.",
    fields: [
      { key: "instagram", label: "Instagram", value: "" },
      { key: "twitter", label: "Twitter / X", value: "" },
      { key: "snapchat", label: "Snapchat", value: "" },
      { key: "tiktok", label: "TikTok", value: "" },
      { key: "youtube", label: "YouTube", value: "" },
      { key: "linkedin", label: "LinkedIn", value: "" },
    ],
  },
];

const seedAdminUsers: AdminUserRecord[] = [
  {
    id: "user-super-admin",
    name: "مدير المنصة",
    email: "admin@rejuveracenter.sa",
    role: UserRole.SUPER_ADMIN,
    leadCount: 12,
    lastLoginAt: "2026-05-12T08:00:00.000Z",
    createdAt: "2026-04-28T09:00:00.000Z",
  },
  {
    id: "user-operations-admin",
    name: "مسؤول التشغيل",
    email: "operations@rejuveracenter.sa",
    role: UserRole.ADMIN,
    leadCount: 31,
    lastLoginAt: "2026-05-11T14:40:00.000Z",
    createdAt: "2026-04-29T08:30:00.000Z",
  },
  {
    id: "user-content-editor",
    name: "مسؤول المحتوى",
    email: "content@rejuveracenter.sa",
    role: UserRole.EDITOR,
    leadCount: 0,
    createdAt: "2026-05-01T10:15:00.000Z",
  },
];

const defaultMediaSelections: MediaSelections = {
  brandLogo: "/media/curated/brand-logo.jpg",
  brandMark: "/icon.svg",
  favicon: "/icon.svg",
  appleIcon: "/media/curated/brand-logo.jpg",
  ogImage: "/media/curated/brand-logo.jpg",
  homeHero: "/media/curated/service-skin-rejuvenation.jpg",
  doctorsHero: "/media/doctors/loai-alsalmi.png",
  servicesHero: "/media/curated/service-laser-hair-removal.jpg",
  aboutHero: "/media/curated/device-emface.jpg",
  journalHero: "/media/curated/service-injectables.png",
};

const defaultHomeGalleryItems: HomeGalleryItem[] = [
  {
    image: "/media/curated/service-skin-rejuvenation.jpg",
    title: "تجديد البشرة المتقدم",
    description:
      "مشهد مخصص لخدمات تحسين نضارة البشرة، الملمس، وتوحيد اللون ضمن خطة متدرجة.",
  },
  {
    image: "/media/curated/service-laser-hair-removal.jpg",
    title: "جلسات الليزر",
    description:
      "صورة توضيحية لخدمات الليزر المرتبطة بإزالة الشعر وبعض المسارات المعتمدة على الأجهزة.",
  },
  {
    image: "/media/curated/device-emface.jpg",
    title: "الأجهزة المعتمدة",
    description:
      "واجهة توضح الأجهزة المستخدمة داخل الخطة العلاجية وربطها بالحالات المناسبة.",
  },
];

const seedErrorLogs: ErrorLogRecord[] = [
  {
    id: "log-01",
    route: "/contact",
    message: "لم تكتمل بعد تهيئة خدمة تصدير الطلبات داخل بيئة العمل الحالية.",
    statusCode: 503,
    isResolved: true,
    createdAt: "2026-05-10T07:15:00.000Z",
  },
  {
    id: "log-02",
    route: "/admin/crm",
    message:
      "تعذر الوصول إلى مصدر البيانات الأساسي، لذلك تم عرض البيانات المرجعية المؤقتة داخل وحدة الإدارة.",
    statusCode: 200,
    isResolved: false,
    createdAt: "2026-05-11T11:50:00.000Z",
  },
];

function cloneSettingsGroups(groups: readonly SettingsGroup[]) {
  return groups.map((group) => ({
    ...group,
    fields: group.fields.map((field) => ({ ...field })),
  }));
}

function readSettingFieldKey(settingKey: string, groupName: string) {
  const prefix = `${groupName}.`;
  return settingKey.startsWith(prefix)
    ? settingKey.slice(prefix.length)
    : settingKey;
}

function stringifySettingValue(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function canUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function sortFeaturedFirst<T extends { featured: boolean }>(items: T[]) {
  return items.sort(
    (left, right) => Number(right.featured) - Number(left.featured),
  );
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function toPrimaryAsset(value: unknown, fallback: string): string {
  const assets = toStringList(value);

  return assets[0] ?? fallback;
}

function toDoctorSummary(publications: unknown, bio: string) {
  return toStringList(publications)[0] ?? bio.slice(0, 180);
}

export async function getDoctors() {
  if (!canUseDatabase()) {
    return sortFeaturedFirst([...seedDoctors]);
  }

  try {
    const doctors = await prisma.doctor.findMany({
      include: { services: { select: { slug: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return sortFeaturedFirst(
      doctors.map((doctor) => ({
        id: doctor.id,
        slug: doctor.slug,
        name: doctor.nameAr,
        title: doctor.titleAr,
        specialty: doctor.specialtyAr,
        summary: toDoctorSummary(doctor.publications, doctor.bioAr),
        bio: doctor.bioAr,
        photoUrl: doctor.photoUrl ?? "/media/curated/service-prp.jpg",
        coverImageUrl:
          doctor.coverImageUrl ??
          doctor.photoUrl ??
          "/media/curated/service-skin-rejuvenation.jpg",
        yearsExperience: doctor.yearsExperience ?? 0,
        languages: doctor.languages,
        education: toStringList(doctor.education),
        achievements: toStringList(doctor.achievements),
        publications: toStringList(doctor.publications),
        status: doctor.status,
        featured: doctor.isFeatured,
        serviceSlugs: doctor.services.map((service) => service.slug),
      })),
    );
  } catch {
    return sortFeaturedFirst([...seedDoctors]);
  }
}

export async function getDoctorBySlug(slug: string) {
  const doctors = await getDoctors();
  return doctors.find((doctor) => doctor.slug === slug) ?? null;
}

export async function getServices() {
  if (!canUseDatabase()) {
    return sortFeaturedFirst([...seedServices]);
  }

  try {
    const services = await prisma.service.findMany({
      include: {
        doctors: { select: { slug: true } },
        devices: { select: { slug: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return sortFeaturedFirst(
      services.map((service) => ({
        id: service.id,
        slug: service.slug,
        name: service.nameAr,
        category: service.categoryKey,
        excerpt: service.excerptAr,
        description: service.descriptionAr,
        coverImageUrl:
          service.coverImageUrl ??
          "/media/curated/service-skin-rejuvenation.jpg",
        benefits: [service.excerptAr, service.descriptionAr.slice(0, 120)],
        doctorSlugs: service.doctors.map((doctor) => doctor.slug),
        deviceSlugs: service.devices.map((device) => device.slug),
        status: service.status,
        featured: service.isFeatured,
      })),
    );
  } catch {
    return sortFeaturedFirst([...seedServices]);
  }
}

export async function getServiceBySlug(slug: string) {
  const services = await getServices();
  return services.find((service) => service.slug === slug) ?? null;
}

export async function getDevices() {
  if (!canUseDatabase()) {
    return [...seedDevices];
  }

  try {
    const devices = await prisma.device.findMany({
      include: { services: { select: { slug: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return devices.map((device) => ({
      id: device.id,
      slug: device.slug,
      name: device.nameAr,
      excerpt: device.excerptAr ?? device.descriptionAr.slice(0, 120),
      description: device.descriptionAr,
      imageUrl: toPrimaryAsset(
        device.gallery,
        "/media/curated/device-emface.jpg",
      ),
      certifications: toStringList(device.certifications),
      serviceSlugs: device.services.map((service) => service.slug),
      status: device.status,
    }));
  } catch {
    return [...seedDevices];
  }
}

export async function getGalleryItems() {
  if (!canUseDatabase()) {
    return [...seedGallery];
  }

  try {
    const gallery = await prisma.galleryItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return gallery.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.titleAr,
      category: item.categoryKey,
      description: item.descriptionAr ?? "",
      beforeImageUrl: item.beforeImageUrl,
      afterImageUrl: item.afterImageUrl,
      beforeImageAlt: item.beforeImageAlt ?? item.titleAr,
      afterImageAlt: item.afterImageAlt ?? item.titleAr,
      initialSplitPercent: item.initialSplitPercent,
    }));
  } catch {
    return [...seedGallery];
  }
}

export async function getJournalPosts() {
  if (!canUseDatabase()) {
    return [...seedJournalPosts].sort(
      (left, right) =>
        new Date(right.publishedAt).getTime() -
        new Date(left.publishedAt).getTime(),
    );
  }

  try {
    const posts = await prisma.journalPost.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
    });

    if (posts.length === 0) {
      return [...seedJournalPosts].sort(
        (left, right) =>
          new Date(right.publishedAt).getTime() -
          new Date(left.publishedAt).getTime(),
      );
    }

    return posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.titleAr,
      excerpt: post.excerptAr,
      body: toStringList(post.bodyAr),
      coverImageUrl: post.coverImageUrl,
      category: post.categoryKey,
      publishedAt:
        post.publishedAt?.toISOString() ?? post.createdAt.toISOString(),
      readingTime: post.readingTimeLabel ?? "4 دقائق",
      relatedServiceSlugs: post.relatedServiceSlugs,
      relatedDoctorSlugs: post.relatedDoctorSlugs,
    }));
  } catch {
    return [...seedJournalPosts].sort(
      (left, right) =>
        new Date(right.publishedAt).getTime() -
        new Date(left.publishedAt).getTime(),
    );
  }
}

export async function getJournalPostBySlug(slug: string) {
  const posts = await getJournalPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getCrmSubmissions() {
  if (!canUseDatabase()) {
    return [...seedCrmRecords];
  }

  try {
    const submissions = await prisma.contactSubmission.findMany({
      include: { service: { select: { nameAr: true } } },
      orderBy: [{ createdAt: "desc" }],
    });

    return submissions.map((submission) => ({
      id: submission.id,
      fullName: submission.fullName,
      phone: submission.phone,
      email: submission.email ?? undefined,
      serviceLabel: submission.service?.nameAr ?? undefined,
      status: submission.status,
      source: submission.source ?? "الموقع الإلكتروني",
      createdAt: submission.createdAt.toISOString(),
      notes: submission.internalNotes ?? undefined,
    }));
  } catch {
    return [...seedCrmRecords];
  }
}

export async function getSettingsGroups() {
  if (!canUseDatabase()) {
    return cloneSettingsGroups(seedSettings);
  }

  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: [{ groupName: "asc" }, { key: "asc" }],
    });

    if (settings.length === 0) {
      return cloneSettingsGroups(seedSettings);
    }

    const groups = new Map(
      cloneSettingsGroups(seedSettings).map((group) => [group.key, group]),
    );
    for (const setting of settings) {
      const group = groups.get(setting.groupName);
      const fieldKey = readSettingFieldKey(setting.key, setting.groupName);
      const entry = {
        key: fieldKey,
        label:
          group?.fields.find((field) => field.key === fieldKey)?.label ??
          fieldKey,
        value: stringifySettingValue(setting.value),
      };

      if (group) {
        const existingField = group.fields.find(
          (field) => field.key === fieldKey,
        );

        if (existingField) {
          existingField.value = entry.value;
        } else {
          group.fields.push(entry);
        }
      } else {
        groups.set(setting.groupName, {
          key: setting.groupName,
          title: setting.groupName,
          description: "إعدادات تشغيلية محفوظة",
          fields: [entry],
        });
      }
    }

    return Array.from(groups.values());
  } catch {
    return cloneSettingsGroups(seedSettings);
  }
}

export async function getRuntimeSettings(): Promise<RuntimeSettings> {
  const groups = await getSettingsGroups();
  const getValue = (groupKey: string, fieldKey: string, fallback: string) =>
    groups
      .find((group) => group.key === groupKey)
      ?.fields.find((field) => field.key === fieldKey)?.value ?? fallback;

  return {
    contact: {
      phone: getValue(
        "contact",
        "phone",
        process.env.CONTACT_PHONE_PRIMARY || "0114999959",
      ),
      phoneSecondary: getValue(
        "contact",
        "phoneSecondary",
        process.env.CONTACT_PHONE_SECONDARY || "9200 17403",
      ),
      email: getValue(
        "contact",
        "email",
        process.env.CONTACT_EMAIL_PRIMARY || "info@rejuveracenter.sa",
      ),
      emailSecondary: getValue(
        "contact",
        "emailSecondary",
        process.env.CONTACT_EMAIL_SECONDARY || "info@rejuveracenter.sa",
      ),
      whatsapp: getValue("contact", "whatsapp", "0114999959"),
      domain: getValue("contact", "domain", "rejuveracenter.sa"),
      mapsEmbedUrl: getValue(
        "contact",
        "mapsEmbedUrl",
        process.env.GOOGLE_MAPS_EMBED_URL ||
          "https://www.google.com/maps?q=Riyadh&output=embed",
      ),
      mapsShape:
        (getValue("contact", "mapsShape", "rounded") as
          | "square"
          | "rounded") ?? "rounded",
      addressAr: getValue(
        "contact",
        "addressAr",
        "الرياض، المملكة العربية السعودية",
      ),
      addressEn: getValue(
        "contact",
        "addressEn",
        "Riyadh, Saudi Arabia",
      ),
      // hours block - subagent #3
      hoursWeekdays: getValue(
        "contact",
        "hoursWeekdays",
        "السبت — الخميس · 2:00 م — 10:00 م",
      ),
      hoursWeekend: getValue(
        "contact",
        "hoursWeekend",
        "الجمعة مغلق",
      ),
      hoursWeekdaysEn: getValue(
        "contact",
        "hoursWeekdaysEn",
        "Sat – Thu · 2:00 PM – 10:00 PM",
      ),
      hoursWeekendEn: getValue(
        "contact",
        "hoursWeekendEn",
        "Closed Friday",
      ),
    },
    brand: {
      siteName: getValue("brand", "siteName", "Rejuvira Center"),
      shortName: getValue("brand", "shortName", "Rejuvira"),
      tagline: getValue(
        "brand",
        "tagline",
        "رعاية جلدية وتجميلية مبنية على تشخيص واضح وخطة مناسبة لكل حالة",
      ),
      announcement: getValue(
        "brand",
        "announcement",
        "حجز منظم واستجابة سريعة ومتابعة دقيقة عبر جميع قنوات التواصل",
      ),
      seoDescription: getValue(
        "brand",
        "seoDescription",
        "مركز متخصص في الجلدية والتجميل الطبي يقدم خدمات مدروسة، أطباء متخصصين، وتجربة علاجية واضحة من أول تواصل حتى المتابعة.",
      ),
      logoAlt: getValue(
        "brand",
        "logoAlt",
        "شعار Rejuvira Center للجلدية والتجميل الطبي",
      ),
    },
    ops: {
      sla: getValue("ops", "sla", "خلال ساعتين"),
      owner: getValue("ops", "owner", "إدارة الاستقبال"),
      recaptchaEnabled:
        getValue(
          "ops",
          "recaptchaEnabled",
          process.env.RECAPTCHA_SECRET_KEY ? "true" : "false",
        ) !== "false",
      maintenanceMode:
        getValue("ops", "maintenanceMode", "false") === "true",
      defaultTheme:
        (getValue("ops", "defaultTheme", "system") as
          | "light"
          | "dark"
          | "system") ?? "system",
      themeToggleEnabled:
        getValue("ops", "themeToggleEnabled", "true") !== "false",
    },
    media: {
      brandLogo: getValue(
        "media",
        "brandLogo",
        defaultMediaSelections.brandLogo,
      ),
      brandMark: getValue(
        "media",
        "brandMark",
        defaultMediaSelections.brandMark,
      ),
      favicon: getValue(
        "media",
        "favicon",
        defaultMediaSelections.favicon,
      ),
      appleIcon: getValue(
        "media",
        "appleIcon",
        defaultMediaSelections.appleIcon,
      ),
      ogImage: getValue(
        "media",
        "ogImage",
        defaultMediaSelections.ogImage,
      ),
      homeHero: getValue("media", "homeHero", defaultMediaSelections.homeHero),
      doctorsHero: getValue(
        "media",
        "doctorsHero",
        defaultMediaSelections.doctorsHero,
      ),
      servicesHero: getValue(
        "media",
        "servicesHero",
        defaultMediaSelections.servicesHero,
      ),
      aboutHero: getValue(
        "media",
        "aboutHero",
        defaultMediaSelections.aboutHero,
      ),
      journalHero: getValue(
        "media",
        "journalHero",
        defaultMediaSelections.journalHero,
      ),
    },
    homepage: {
      heroTitle: getValue(
        "homepage",
        "heroTitle",
        "خدمات جلدية وتجميلية بإشراف طبي وخيارات أوضح من أول زيارة.",
      ),
      heroTitleAccent: getValue(
        "homepage",
        "heroTitleAccent",
        "بخطة طبية واضحة",
      ),
      heroDescription: getValue(
        "homepage",
        "heroDescription",
        "يعرض الموقع الخدمات، الأطباء، والأجهزة بصورة منظمة تساعد على فهم الخيارات المتاحة قبل طلب الاستشارة.",
      ),
      heroPillLabel: getValue(
        "homepage",
        "heroPillLabel",
        "مركز ريجوفيرا الطبي",
      ),
      heroCtaPrimary: getValue(
        "homepage",
        "heroCtaPrimary",
        "احجزي استشارتك المجانية",
      ),
      heroCtaSecondary: getValue(
        "homepage",
        "heroCtaSecondary",
        "شاهدي قصص النجاح",
      ),
      heroTitleEn: getValue(
        "homepage",
        "heroTitleEn",
        "Medical-grade dermatology and aesthetics — clear guidance from your first visit.",
      ),
      heroTitleAccentEn: getValue(
        "homepage",
        "heroTitleAccentEn",
        "with a clinician-led treatment plan.",
      ),
      heroDescriptionEn: getValue(
        "homepage",
        "heroDescriptionEn",
        "Browse services, clinicians, and technology in one calm layout so you can understand your options before you book.",
      ),
      heroPillLabelEn: getValue(
        "homepage",
        "heroPillLabelEn",
        "Rejuvira Medical Center",
      ),
      heroCtaPrimaryEn: getValue(
        "homepage",
        "heroCtaPrimaryEn",
        "Book your consultation",
      ),
      heroCtaSecondaryEn: getValue(
        "homepage",
        "heroCtaSecondaryEn",
        "View results gallery",
      ),
      stripEyebrow: getValue(
        "homepage",
        "stripEyebrow",
        "مختارات من الخدمات",
      ),
      stripTitle: getValue(
        "homepage",
        "stripTitle",
        "استعرضي خدمات مرتبطة بحالتك",
      ),
      stripDescription: getValue(
        "homepage",
        "stripDescription",
        "شريط سريع لتصفح الخدمات وفتح ما يهمك بنقرة واحدة.",
      ),
      stripEyebrowEn: getValue(
        "homepage",
        "stripEyebrowEn",
        "Curated picks",
      ),
      stripTitleEn: getValue(
        "homepage",
        "stripTitleEn",
        "Browse services tailored to common goals",
      ),
      stripDescriptionEn: getValue(
        "homepage",
        "stripDescriptionEn",
        "A fast-moving strip — open any card in one tap.",
      ),
      trustEyebrow: getValue(
        "homepage",
        "trustEyebrow",
        "معتمدون دوليا ومحليا",
      ),
      trustTitle: getValue("homepage", "trustTitle", "ثقة طبية ومعايير واضحة"),
      trustDescription: getValue(
        "homepage",
        "trustDescription",
        "اعتمادات معلنة، تقنيات موثوقة، وخصوصية عالية تمنحك قرارًا أكثر اطمئنانًا.",
      ),
      trustEyebrowEn: getValue(
        "homepage",
        "trustEyebrowEn",
        "Internationally and locally grounded",
      ),
      trustTitleEn: getValue(
        "homepage",
        "trustTitleEn",
        "Clinical trust with transparent standards",
      ),
      trustDescriptionEn: getValue(
        "homepage",
        "trustDescriptionEn",
        "Published credentials, vetted technologies, and strict privacy practices to help you decide with confidence.",
      ),
      galleryEyebrow: getValue("homepage", "galleryEyebrow", "من معرض الواجهة"),
      galleryTitle: getValue(
        "homepage",
        "galleryTitle",
        "مشاهد منتقاة تشرح بوضوح ما تعكسه كل صورة من خدمة أو نتيجة.",
      ),
      galleryDescription: getValue(
        "homepage",
        "galleryDescription",
        "يعرض هذا القسم صورًا حقيقية مرتبطة بالخدمات والأجهزة داخل المركز، مع وصف مهني يوضح دلالة كل لقطة في سياق التجربة العلاجية.",
      ),
      galleryEyebrowEn: getValue(
        "homepage",
        "galleryEyebrowEn",
        "From our gallery",
      ),
      galleryTitleEn: getValue(
        "homepage",
        "galleryTitleEn",
        "Selected scenes tied to treatments and realistic outcomes.",
      ),
      galleryDescriptionEn: getValue(
        "homepage",
        "galleryDescriptionEn",
        "Each frame is anchored to in-clinic workflows and paired with clinician-written context.",
      ),
      galleryItems: [1, 2, 3].map((index) => {
        const fallbackGalleryItem = defaultHomeGalleryItems[index - 1] ??
          defaultHomeGalleryItems[0] ?? {
            image: "/media/curated/service-skin-rejuvenation.jpg",
            title: "خدمات البشرة",
            description:
              "صورة مخصصة لمسارات تجديد البشرة والعناية العلاجية المرتبطة بتحسين الملمس والصفاء.",
          };

        return {
          image: getValue(
            "homepage",
            `galleryItem${index}Image`,
            fallbackGalleryItem.image,
          ),
          title: getValue(
            "homepage",
            `galleryItem${index}Title`,
            fallbackGalleryItem.title,
          ),
          description: getValue(
            "homepage",
            `galleryItem${index}Description`,
            fallbackGalleryItem.description,
          ),
        };
      }),
      quotesEyebrow: getValue("homepage", "quotesEyebrow", "من أطباء المركز"),
      quotesTitle: getValue(
        "homepage",
        "quotesTitle",
        "رؤية الأطباء في التشخيص وصياغة القرار العلاجي.",
      ),
      quotesDescription: getValue(
        "homepage",
        "quotesDescription",
        "اقتباسات مختارة من الأطباء تعكس منهجهم السريري وطريقتهم في تقييم الحالة وبناء الخطة المناسبة.",
      ),
      quotesEyebrowEn: getValue(
        "homepage",
        "quotesEyebrowEn",
        "From our physicians",
      ),
      quotesTitleEn: getValue(
        "homepage",
        "quotesTitleEn",
        "Our specialists on diagnosis and therapeutic planning.",
      ),
      quotesDescriptionEn: getValue(
        "homepage",
        "quotesDescriptionEn",
        "Short excerpts that reflect bedside judgement and conservative decision-making.",
      ),
    },
    social: {
      instagram: getValue("social", "instagram", ""),
      twitter: getValue("social", "twitter", ""),
      snapchat: getValue("social", "snapchat", ""),
      tiktok: getValue("social", "tiktok", ""),
      youtube: getValue("social", "youtube", ""),
      linkedin: getValue("social", "linkedin", ""),
      facebook: getValue("social", "facebook", ""),
      whatsappBusiness: getValue("social", "whatsappBusiness", ""),
      threads: getValue("social", "threads", ""),
      x: getValue("social", "x", getValue("social", "twitter", "")),
    },
    socialVisibility: {
      instagram: getValue("socialVisibility", "instagram", "true") !== "false",
      twitter: getValue("socialVisibility", "twitter", "true") !== "false",
      snapchat: getValue("socialVisibility", "snapchat", "true") !== "false",
      tiktok: getValue("socialVisibility", "tiktok", "true") !== "false",
      youtube: getValue("socialVisibility", "youtube", "true") !== "false",
      linkedin: getValue("socialVisibility", "linkedin", "true") !== "false",
      facebook: getValue("socialVisibility", "facebook", "true") !== "false",
      whatsappBusiness:
        getValue("socialVisibility", "whatsappBusiness", "true") !== "false",
      threads: getValue("socialVisibility", "threads", "true") !== "false",
      x: getValue("socialVisibility", "x", "true") !== "false",
    },
    seo: buildSeoSettings(getValue),
  };
}

function buildSeoSettings(
  getValue: (groupKey: string, fieldKey: string, fallback: string) => string,
): SeoSettings {
  const pages: Array<keyof SeoSettings> = [
    "home",
    "services",
    "doctors",
    "devices",
    "gallery",
    "journal",
    "about",
    "contact",
  ];
  const defaults: Record<keyof SeoSettings, SeoPageDefaults> = {
    home: {
      titleAr: "Rejuvira Center — رعاية جلدية وتجميل طبي في الرياض",
      titleEn: "Rejuvira Center — Dermatology & Aesthetic Care in Riyadh",
      descriptionAr:
        "مركز ريجوفيرا الطبي في الرياض: استشارات جلدية، خدمات تجميل، أجهزة معتمدة وأطباء متخصصون. خطة علاجية واضحة من أول زيارة.",
      descriptionEn:
        "Rejuvira Center in Riyadh: dermatology consultations, aesthetic services, certified devices, and board-specialised doctors. A clear treatment plan from your first visit.",
      keywordsAr:
        "ريجوفيرا، عيادة جلدية، تجميل طبي، الرياض، علاج البشرة، حقن، ليزر، استشارة جلدية",
      keywordsEn:
        "Rejuvira, dermatology Riyadh, aesthetic clinic, medical aesthetics, laser, injectables, skin treatments",
    },
    services: {
      titleAr: "خدمات المركز الطبية والتجميلية",
      titleEn: "Medical & Aesthetic Services",
      descriptionAr:
        "اطلعي على الخدمات المعتمدة في Rejuvira Center: جلسات بشرة، حقن، ليزر، وعناية متخصصة بإشراف أطباء.",
      descriptionEn:
        "Explore Rejuvira Center's approved services: skin care, injectables, laser, and specialised treatments under medical supervision.",
      keywordsAr: "خدمات تجميل، عناية بالبشرة، حقن، ليزر، الرياض",
      keywordsEn: "aesthetic services, skin care, injectables, laser, Riyadh",
    },
    doctors: {
      titleAr: "الأطباء — تخصصات وخبرات معتمدة",
      titleEn: "Our Doctors — Certified Specialists",
      descriptionAr:
        "تعرّفي على فريق الأطباء في Rejuvira Center: تخصصات واضحة، شهادات معتمدة، وخبرة في الجلدية والتجميل الطبي.",
      descriptionEn:
        "Meet the medical team at Rejuvira Center — board-specialised dermatologists and aesthetic physicians with verified credentials.",
      keywordsAr: "أطباء جلدية، استشاري، تجميل، الرياض",
      keywordsEn: "dermatologists, aesthetic physicians, Riyadh",
    },
    devices: {
      titleAr: "الأجهزة الطبية والتقنيات المعتمدة",
      titleEn: "Approved Medical Devices & Technologies",
      descriptionAr:
        "أجهزة معتمدة دوليًا تستخدم في الخدمات العلاجية داخل المركز، مع توضيح لكل تقنية ودورها.",
      descriptionEn:
        "FDA/CE-cleared devices used in treatments at Rejuvira Center, with a clear explanation of each technology.",
      keywordsAr: "أجهزة طبية، ليزر، تقنيات تجميل، الرياض",
      keywordsEn: "medical devices, laser, aesthetic technologies",
    },
    gallery: {
      titleAr: "نتائج وقصص العناية — المعرض",
      titleEn: "Results & Care Stories — Gallery",
      descriptionAr:
        "مشاهد من الخدمات والنتائج داخل Rejuvira Center، بتوضيح الحالة قبل وبعد ضمن خطة علاجية واضحة.",
      descriptionEn:
        "Curated before-and-after visuals from Rejuvira Center's treatments, presented within a transparent clinical plan.",
      keywordsAr: "نتائج تجميل، قبل وبعد، عناية بالبشرة",
      keywordsEn: "before after, aesthetic results, skin care",
    },
    journal: {
      titleAr: "المجلة الطبية — مقالات وإرشادات",
      titleEn: "Medical Journal — Articles & Guidance",
      descriptionAr:
        "مقالات طبية موجزة تساعدك على فهم الخدمات والإجراءات قبل اتخاذ القرار العلاجي.",
      descriptionEn:
        "Concise medical articles to help you understand procedures before deciding on a treatment plan.",
      keywordsAr: "مقالات طبية، إرشادات، تجميل، جلدية",
      keywordsEn: "medical articles, aesthetics, dermatology",
    },
    about: {
      titleAr: "عن Rejuvira Center",
      titleEn: "About Rejuvira Center",
      descriptionAr:
        "تعرّفي على رؤية المركز وفلسفته في تقديم رعاية جلدية وتجميلية مبنية على تشخيص واضح وخطة علاجية مدروسة.",
      descriptionEn:
        "Learn about Rejuvira Center's philosophy: dermatology and aesthetic care guided by clear diagnosis and thoughtful planning.",
      keywordsAr: "عن المركز، فريق طبي، رؤية",
      keywordsEn: "about the clinic, medical team, philosophy",
    },
    contact: {
      titleAr: "التواصل والحجز — Rejuvira Center",
      titleEn: "Contact & Booking — Rejuvira Center",
      descriptionAr:
        "احجزي استشارتك في Rejuvira Center الرياض. واتساب، هاتف، بريد إلكتروني، وخرائط الموقع.",
      descriptionEn:
        "Book your consultation at Rejuvira Center in Riyadh. WhatsApp, phone, email, and map.",
      keywordsAr: "تواصل، حجز، الرياض، استشارة",
      keywordsEn: "contact, booking, Riyadh, consultation",
    },
  };

  const result = {} as SeoSettings;
  for (const page of pages) {
    const base = defaults[page];
    result[page] = {
      titleAr: getValue("seo", `${page}TitleAr`, base.titleAr),
      titleEn: getValue("seo", `${page}TitleEn`, base.titleEn),
      descriptionAr: getValue(
        "seo",
        `${page}DescriptionAr`,
        base.descriptionAr,
      ),
      descriptionEn: getValue(
        "seo",
        `${page}DescriptionEn`,
        base.descriptionEn,
      ),
      keywordsAr: getValue("seo", `${page}KeywordsAr`, base.keywordsAr),
      keywordsEn: getValue("seo", `${page}KeywordsEn`, base.keywordsEn),
    };
  }
  return result;
}

export async function getErrorLogs() {
  if (!canUseDatabase()) {
    return [...seedErrorLogs];
  }

  try {
    const logs = await prisma.errorLog.findMany({
      orderBy: [{ createdAt: "desc" }],
    });

    return logs.map((log) => ({
      id: log.id,
      route: log.route ?? "Unknown",
      message: log.message,
      statusCode: log.statusCode ?? 500,
      isResolved: log.isResolved,
      createdAt: log.createdAt.toISOString(),
    }));
  } catch {
    return [...seedErrorLogs];
  }
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [doctors, services, submissions, devices] = await Promise.all([
    getDoctors(),
    getServices(),
    getCrmSubmissions(),
    getDevices(),
  ]);

  return {
    doctorCount: doctors.length,
    serviceCount: services.length,
    leadCount: submissions.length,
    deviceCount: devices.length,
  };
}

export async function getAdminUsers() {
  if (!canUseDatabase()) {
    return [...seedAdminUsers];
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            assignedLeads: true,
          },
        },
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });

    if (users.length === 0) {
      return [...seedAdminUsers];
    }

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      leadCount: user._count.assignedLeads,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
    }));
  } catch {
    return [...seedAdminUsers];
  }
}

export async function createDoctorDraft(input: CreateDoctorInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, item: input };
  }

  const doctor = await prisma.doctor.create({
    data: {
      slug: input.slug,
      nameAr: input.name,
      titleAr: input.title,
      specialtyAr: input.specialty,
      bioAr: input.bio ?? input.summary,
      languages: input.languages,
      yearsExperience: input.yearsExperience,
      education: [],
      publications: input.summary ? [input.summary] : [],
      achievements: [],
      status: input.status ?? ContentStatus.DRAFT,
      isFeatured: input.featured ?? false,
      photoUrl: input.photoUrl ?? null,
      coverImageUrl: input.coverImageUrl ?? input.photoUrl ?? null,
    },
  });

  return { mode: "database" as const, item: doctor };
}

export async function updateDoctorProfile(input: UpdateDoctorInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, item: input };
  }

  const doctor = await prisma.doctor.update({
    where: { id: input.id },
    data: {
      slug: input.slug,
      nameAr: input.name,
      titleAr: input.title,
      specialtyAr: input.specialty,
      bioAr: input.bio,
      languages: input.languages,
      yearsExperience: input.yearsExperience,
      publications: input.summary ? [input.summary] : [],
      status: input.status,
      isFeatured: input.featured,
      photoUrl: input.photoUrl || null,
      coverImageUrl: input.coverImageUrl || input.photoUrl || null,
    },
  });

  return { mode: "database" as const, item: doctor };
}

export async function createAdminUser(input: CreateAdminUserInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, item: input };
  }

  const { hash } = await import("bcryptjs");
  const hashedPassword = await hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      hashedPassword,
      role: input.role,
    },
  });

  return { mode: "database" as const, item: user };
}

export async function updateAdminUserRole(input: UpdateAdminUserRoleInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, item: input };
  }

  const user = await prisma.user.update({
    where: { id: input.id },
    data: { role: input.role },
  });

  return { mode: "database" as const, item: user };
}

export async function createServiceDraft(input: CreateServiceInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, item: input };
  }

  const service = await prisma.service.create({
    data: {
      slug: input.slug,
      nameAr: input.name,
      categoryKey: input.category,
      excerptAr: input.excerpt,
      descriptionAr: input.description,
      status: ContentStatus.DRAFT,
      ...(input.coverImageUrl
        ? {
            coverImageUrl: input.coverImageUrl,
          }
        : {}),
    },
  });

  return { mode: "database" as const, item: service };
}

export async function createDeviceDraft(input: CreateDeviceInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, item: input };
  }

  const relatedServices = input.serviceSlugs.length
    ? await prisma.service.findMany({
        where: { slug: { in: input.serviceSlugs } },
        select: { id: true },
      })
    : [];

  const device = await prisma.device.create({
    data: {
      slug: input.slug,
      nameAr: input.name,
      excerptAr: input.excerpt,
      descriptionAr: input.description,
      certifications: input.certifications,
      status: ContentStatus.DRAFT,
      ...(input.imageUrl
        ? {
            gallery: [input.imageUrl],
          }
        : {}),
      ...(relatedServices.length
        ? {
            services: {
              connect: relatedServices.map((service) => ({ id: service.id })),
            },
          }
        : {}),
    },
  });

  return { mode: "database" as const, item: device };
}

export async function createJournalPostDraft(input: CreateJournalPostInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, item: input };
  }

  const post = await prisma.journalPost.create({
    data: {
      slug: input.slug,
      titleAr: input.title,
      excerptAr: input.excerpt,
      bodyAr: input.body,
      coverImageUrl:
        input.coverImageUrl ?? "/media/curated/service-laser-hair-removal.jpg",
      categoryKey: input.category,
      readingTimeLabel: input.readingTime,
      relatedServiceSlugs: input.relatedServiceSlugs,
      relatedDoctorSlugs: input.relatedDoctorSlugs,
      status: ContentStatus.DRAFT,
    },
  });

  return { mode: "database" as const, item: post };
}

export async function saveSettingsGroup(
  groupKey: string,
  values: Record<string, string>,
) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, key: groupKey, values };
  }

  await Promise.all(
    Object.entries(values).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key: `${groupKey}.${key}` },
        update: { value, groupName: groupKey },
        create: { key: `${groupKey}.${key}`, groupName: groupKey, value },
      }),
    ),
  );

  return { mode: "database" as const, key: groupKey, values };
}

export async function updateJournalPostStatus(
  slug: string,
  status: ContentStatus,
) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, slug, status };
  }

  const post = await prisma.journalPost.update({
    where: { slug },
    data: {
      status,
      ...(status === ContentStatus.PUBLISHED
        ? {
            publishedAt: new Date(),
          }
        : {}),
    },
  });

  return { mode: "database" as const, item: post };
}

export async function deleteJournalPost(slug: string) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, slug };
  }

  const post = await prisma.journalPost.delete({
    where: { slug },
  });

  return { mode: "database" as const, item: post };
}

/* ── Gallery CRUD ────────────────────────────────────────── */

export type CreateGalleryItemInput = {
  slug: string;
  title: string;
  category: string;
  description: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeImageAlt: string;
  afterImageAlt: string;
  /** 0–100, default 50. Backwards compatible. */
  initialSplitPercent?: number;
};

export type UpdateGalleryItemInput = CreateGalleryItemInput & {
  id: string;
};

export async function createGalleryItem(input: CreateGalleryItemInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, input };
  }

  const item = await prisma.galleryItem.create({
    data: {
      slug: input.slug,
      titleAr: input.title,
      categoryKey: input.category,
      descriptionAr: input.description,
      beforeImageUrl: input.beforeImageUrl,
      afterImageUrl: input.afterImageUrl,
      beforeImageAlt: input.beforeImageAlt,
      afterImageAlt: input.afterImageAlt,
      status: ContentStatus.PUBLISHED,
      initialSplitPercent: input.initialSplitPercent ?? 50,
    },
  });

  return { mode: "database" as const, item };
}

export async function updateGalleryItem(input: UpdateGalleryItemInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, input };
  }

  const item = await prisma.galleryItem.update({
    where: { id: input.id },
    data: {
      slug: input.slug,
      titleAr: input.title,
      categoryKey: input.category,
      descriptionAr: input.description,
      beforeImageUrl: input.beforeImageUrl,
      afterImageUrl: input.afterImageUrl,
      beforeImageAlt: input.beforeImageAlt,
      afterImageAlt: input.afterImageAlt,
      initialSplitPercent: input.initialSplitPercent ?? 50,
    },
  });

  return { mode: "database" as const, item };
}

export async function deleteGalleryItem(id: string) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id };
  }

  const item = await prisma.galleryItem.delete({ where: { id } });
  return { mode: "database" as const, item };
}

export async function createContactLead(input: CreateContactInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, input };
  }

  const service = input.serviceSlug
    ? await prisma.service.findUnique({
        where: { slug: input.serviceSlug },
        select: { id: true },
      })
    : null;

  const submission = await prisma.contactSubmission.create({
    data: {
      fullName: input.fullName,
      phone: input.phone,
      preferredLanguage: input.preferredLanguage ?? "ar",
      source: input.source ?? "Website form",
      status: SubmissionStatus.NEW,
      ...(input.email
        ? {
            email: input.email,
          }
        : {}),
      ...(input.message
        ? {
            message: input.message,
          }
        : {}),
      ...(service?.id
        ? {
            serviceId: service.id,
          }
        : {}),
    },
  });

  return { mode: "database" as const, submission };
}

export async function updateErrorLogResolution(
  logId: string,
  isResolved: boolean,
) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id: logId, isResolved };
  }

  const log = await prisma.errorLog.update({
    where: { id: logId },
    data: { isResolved },
  });

  return { mode: "database" as const, item: log };
}

export async function updateCrmSubmission(input: UpdateCrmSubmissionInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, input };
  }

  const submission = await prisma.contactSubmission.update({
    where: { id: input.id },
    data: {
      status: input.status,
      internalNotes: input.notes ?? null,
    },
  });

  return { mode: "database" as const, item: submission };
}

export async function getMediaSelections(): Promise<MediaSelections> {
  const runtimeSettings = await getRuntimeSettings();
  return runtimeSettings.media;
}
