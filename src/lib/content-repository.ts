import { ContentStatus, SubmissionStatus, UserRole } from "@prisma/client";
import { cache } from "react";
import type { Prisma } from "@prisma/client";

import {
  ABOUT_PROFILE_DEFAULTS,
  ABOUT_SECTION_DEFAULTS,
} from "@/lib/about-content";
import {
  GENERAL_INQUIRY_SERVICE_AR,
  hasGeneralInquiryTag,
} from "@/lib/general-inquiry";
import { prisma } from "@/lib/prisma";

export type DoctorRecord = {
  id: string;
  slug: string;
  name: string;
  nameEn?: string | null;
  title: string;
  titleEn?: string | null;
  specialty: string;
  specialtyEn?: string | null;
  summary: string;
  summaryEn?: string | null;
  bio: string;
  bioEn?: string | null;
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
  nameEn?: string | null;
  categoryId?: string | null;
  categorySlug?: string | null;
  category: string;
  categoryEn?: string | null;
  excerpt: string;
  excerptEn?: string | null;
  description: string;
  descriptionEn?: string | null;
  coverImageUrl: string;
  benefits: readonly string[];
  doctorSlugs: readonly string[];
  deviceSlugs: readonly string[];
  status: ContentStatus;
  featured: boolean;
};

export type ServiceCategoryRecord = {
  id: string;
  slug: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  status: ContentStatus;
  sortOrder: number;
  serviceCount: number;
};

export type DeviceRecord = {
  id: string;
  slug: string;
  name: string;
  nameEn?: string | null;
  excerpt: string;
  excerptEn?: string | null;
  description: string;
  descriptionEn?: string | null;
  imageUrl: string;
  certifications: readonly string[];
  serviceSlugs: readonly string[];
  status: ContentStatus;
  featured?: boolean;
};

export type GalleryRecord = {
  id: string;
  slug: string;
  title: string;
  titleEn?: string | null;
  category: string;
  categoryEn?: string | null;
  description: string;
  descriptionEn?: string | null;
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
  status?: ContentStatus;
};

export type JournalPostRecord = {
  id: string;
  slug: string;
  title: string;
  titleEn?: string | null;
  excerpt: string;
  excerptEn?: string | null;
  body: readonly string[];
  coverImageUrl: string;
  category: string;
  publishedAt: string;
  readingTime: string;
  relatedServiceSlugs: readonly string[];
  relatedDoctorSlugs: readonly string[];
  status?: ContentStatus;
};

export type CrmRecord = {
  id: string;
  fullName: string;
  phone: string;
  email?: string | undefined;
  serviceLabel?: string | undefined;
  serviceSlug?: string | undefined;
  serviceId?: string | undefined;
  status: SubmissionStatus;
  source: string;
  createdAt: string;
  updatedAt?: string | undefined;
  notes?: string | undefined;
  tags: readonly string[];
  assignedToId?: string | undefined;
  assignedToName?: string | undefined;
  webhookId?: string | undefined;
  webhookName?: string | undefined;
  utmSource?: string | undefined;
  utmMedium?: string | undefined;
  utmCampaign?: string | undefined;
  utmContent?: string | undefined;
  ipAddress?: string | undefined;
  country?: string | undefined;
  referrerUrl?: string | undefined;
  landingPageUrl?: string | undefined;
  userAgent?: string | undefined;
  message?: string | undefined;
  comments: ReadonlyArray<{
    id: string;
    body: string;
    authorId?: string | undefined;
    authorName?: string | undefined;
    createdAt: string;
  }>;
};

export type CustomPageRecord = {
  id: string;
  slug: string;
  titleAr: string;
  titleEn?: string | null;
  htmlContent: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords: readonly string[];
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  seoSlug?: string | null;
  hashtags: readonly string[];
  formConfig?: Prisma.JsonValue | null;
  leadWebhookEnabled: boolean;
  leadWebhookUrl?: string | null;
  leadWebhookSecret?: string | null;
  leadWebhookLabel?: string | null;
  status: ContentStatus;
  noindex: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WebhookRecord = {
  id: string;
  name: string;
  token: string;
  isActive: boolean;
  defaultStatus: SubmissionStatus;
  defaultTags: readonly string[];
  defaultSource?: string | null;
  serviceId?: string | null;
  serviceLabel?: string | null;
  createdAt: string;
  updatedAt: string;
  recentEvents: ReadonlyArray<{
    id: string;
    statusCode: number;
    errorMessage?: string | null;
    createdAt: string;
  }>;
  totalEvents: number;
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

type ErrorLogRecord = {
  id: string;
  route: string;
  message: string;
  statusCode: number;
  isResolved: boolean;
  createdAt: string;
};

export type MediaSelections = {
  brandLogo: string;
  brandMark: string;
  favicon: string;
  appleIcon: string;
  ogImage: string;
  homeHero: string;
  heroCard1: string;
  heroCard2: string;
  heroCard3: string;
  doctorsHero: string;
  servicesHero: string;
  aboutHero: string;
  journalHero: string;
};

type HomeGalleryItem = {
  image: string;
  title: string;
  description: string;
};

type HomeTestimonialItem = {
  authorAr: string;
  authorEn: string;
  quoteAr: string;
  quoteEn: string;
  avatarUrl: string;
};

type ContactFaqItem = {
  questionAr: string;
  answerAr: string;
  questionEn: string;
  answerEn: string;
};

export type AboutProfileRecord = {
  key: string;
  labelAr: string;
  labelEn: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl: string;
  visible: boolean;
};

export type AboutSettings = {
  eyebrowAr: string;
  eyebrowEn: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  profiles: AboutProfileRecord[];
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
  testimonials: HomeTestimonialItem[];
};

type SocialSettings = {
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
    faqs: ContactFaqItem[];
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
  about: AboutSettings;
  social: SocialSettings;
  seo: SeoSettings;
  socialVisibility: Record<string, boolean>;
  integrations: {
    chatbaseEnabled: boolean;
    chatbaseWidgetId: string;
    googleTagEnabled: boolean;
    googleTagUrl: string;
    customHeadCode: string;
    customBodyCode: string;
    formWebhookEnabled: boolean;
    formWebhookUrl: string;
    formWebhookSecret: string;
  };
};

type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  positionTitle?: string | undefined;
  department?: string | undefined;
  isActive?: boolean | undefined;
  leadCount: number;
  lastLoginAt?: string | undefined;
  createdAt: string;
};

export type CreateDoctorInput = {
  slug: string;
  name: string;
  nameEn?: string | undefined;
  title: string;
  titleEn?: string | undefined;
  specialty: string;
  specialtyEn?: string | undefined;
  summary: string;
  bio?: string | undefined;
  bioEn?: string | undefined;
  yearsExperience: number;
  languages: string[];
  photoUrl?: string | undefined;
  coverImageUrl?: string | undefined;
  featured?: boolean | undefined;
  status?: ContentStatus | undefined;
  serviceSlugs?: string[] | undefined;
};

export type UpdateDoctorInput = {
  id: string;
  slug: string;
  name: string;
  nameEn?: string | undefined;
  title: string;
  titleEn?: string | undefined;
  specialty: string;
  specialtyEn?: string | undefined;
  summary: string;
  bio: string;
  bioEn?: string | undefined;
  yearsExperience: number;
  languages: string[];
  photoUrl?: string | undefined;
  coverImageUrl?: string | undefined;
  featured: boolean;
  status: ContentStatus;
  serviceSlugs?: string[] | undefined;
};

export type CreateServiceInput = {
  slug: string;
  name: string;
  nameEn?: string | undefined;
  category: string;
  categoryId?: string | undefined;
  excerpt: string;
  excerptEn?: string | undefined;
  description: string;
  descriptionEn?: string | undefined;
  coverImageUrl?: string | undefined;
  doctorSlugs?: string[] | undefined;
  deviceSlugs?: string[] | undefined;
};

export type CreateServiceCategoryInput = {
  slug: string;
  name: string;
  nameEn?: string | undefined;
  description?: string | undefined;
  descriptionEn?: string | undefined;
  status?: ContentStatus | undefined;
  sortOrder?: number | undefined;
};

export type UpdateServiceCategoryInput = CreateServiceCategoryInput & {
  id: string;
};

export type CreateDeviceInput = {
  slug: string;
  name: string;
  nameEn?: string | undefined;
  excerpt: string;
  excerptEn?: string | undefined;
  description: string;
  descriptionEn?: string | undefined;
  certifications: string[];
  serviceSlugs: string[];
  imageUrl?: string | undefined;
};

export type CreateJournalPostInput = {
  slug: string;
  title: string;
  titleEn?: string | undefined;
  excerpt: string;
  excerptEn?: string | undefined;
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
  utmSource?: string | undefined;
  utmMedium?: string | undefined;
  utmCampaign?: string | undefined;
  utmContent?: string | undefined;
  ipAddress?: string | undefined;
  country?: string | undefined;
  referrerUrl?: string | undefined;
  landingPageUrl?: string | undefined;
  userAgent?: string | undefined;
  notes?: string | undefined;
};

export type UpdateCrmSubmissionInput = {
  id: string;
  status?: SubmissionStatus | undefined;
  notes?: string | undefined;
  fullName?: string | undefined;
  phone?: string | undefined;
  email?: string | null | undefined;
  serviceSlug?: string | null | undefined;
  tags?: readonly string[] | undefined;
  assignedToId?: string | null | undefined;
  source?: string | null | undefined;
};

export type CreateCustomPageInput = {
  slug: string;
  titleAr: string;
  titleEn?: string | undefined;
  htmlContent: string;
  seoTitle?: string | undefined;
  seoDescription?: string | undefined;
  metaTitle?: string | undefined;
  metaDescription?: string | undefined;
  keywords?: readonly string[] | undefined;
  ogTitle?: string | undefined;
  ogDescription?: string | undefined;
  ogImage?: string | undefined;
  seoSlug?: string | undefined;
  hashtags?: readonly string[] | undefined;
  formConfig?: Prisma.InputJsonValue | undefined;
  leadWebhookEnabled?: boolean | undefined;
  leadWebhookUrl?: string | undefined;
  leadWebhookSecret?: string | undefined;
  leadWebhookLabel?: string | undefined;
  status?: ContentStatus | undefined;
  noindex?: boolean | undefined;
};

export type UpdateCustomPageInput = CreateCustomPageInput & { id: string };
export type UpsertCustomPageInput = CreateCustomPageInput;

export type CreateWebhookInput = {
  name: string;
  defaultStatus?: SubmissionStatus | undefined;
  defaultTags?: readonly string[] | undefined;
  defaultSource?: string | undefined;
  serviceSlug?: string | undefined;
};

export type UpdateWebhookInput = {
  id: string;
  name: string;
  isActive: boolean;
  defaultStatus: SubmissionStatus;
  defaultTags: readonly string[];
  defaultSource?: string | undefined;
  serviceSlug?: string | undefined;
};

export type CreateAdminUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  positionTitle?: string | undefined;
  department?: string | undefined;
  isActive?: boolean | undefined;
};

export type UpdateAdminUserRoleInput = {
  id: string;
  role: UserRole;
  positionTitle?: string | undefined;
  department?: string | undefined;
  isActive?: boolean | undefined;
};

export type UpdateServiceInput = {
  id: string;
  slug: string;
  name: string;
  nameEn?: string | undefined;
  category: string;
  categoryId?: string | undefined;
  excerpt: string;
  excerptEn?: string | undefined;
  description: string;
  descriptionEn?: string | undefined;
  status: ContentStatus;
  featured: boolean;
  coverImageUrl?: string | undefined;
  doctorSlugs?: string[] | undefined;
  deviceSlugs?: string[] | undefined;
};

export type UpdateDeviceInput = {
  id: string;
  slug: string;
  name: string;
  nameEn?: string | undefined;
  excerpt: string;
  excerptEn?: string | undefined;
  description: string;
  descriptionEn?: string | undefined;
  certifications: string[];
  serviceSlugs: string[];
  status: ContentStatus;
  featured: boolean;
  imageUrl?: string | undefined;
};

export type UpdateJournalPostInput = CreateJournalPostInput & {
  id: string;
  status: ContentStatus;
};

const doctorPortraitBySlug = {
  "loai-alsalmi": "/media/doctors/loai-alsalmi.webp",
  "maher-alahdab": "/media/doctors/maher-alahdab.webp",
  "saham-arfaj": "/media/doctors/saham-arfaj.webp",
  "sabah-alrashid": "/media/doctors/sabah-alrashid.webp",
  "karima-jamjoom": "/media/doctors/karima-jamjoom.webp",
  "najwa-batarfi": "/media/doctors/najwa-batarfi.webp",
  "natali-domloj": "/media/doctors/natali-domloj.webp",
  "falwah-aljanoubi": "/media/doctors/falwah-aljanoubi.webp",
  "bandar-alharthi": "/media/doctors/bandar-alharthi.webp",
  "ahmed-eldesouki": "/media/doctors/ahmed-eldesouki.webp",
} as const;

const doctorPortraits = [
  doctorPortraitBySlug["loai-alsalmi"],
  doctorPortraitBySlug["maher-alahdab"],
  doctorPortraitBySlug["saham-arfaj"],
  doctorPortraitBySlug["sabah-alrashid"],
  doctorPortraitBySlug["karima-jamjoom"],
  doctorPortraitBySlug["najwa-batarfi"],
  doctorPortraitBySlug["natali-domloj"],
  doctorPortraitBySlug["falwah-aljanoubi"],
  doctorPortraitBySlug["bandar-alharthi"],
  doctorPortraitBySlug["ahmed-eldesouki"],
] as const;

const serviceImages = {
  aestheticSurgery:
    "/media/reference/legacy/WhatsApp-Image-2024-08-12-at-4.55.56-PM.jpeg",
  skinCare: "/media/curated/service-skin-rejuvenation.webp",
  laser: "/media/curated/service-laser-hair-removal.jpg",
  injectables: "/media/curated/service-injectables.webp",
  devices: "/media/curated/device-laser-platform.webp",
  body: "/media/reference/legacy/88985959.webp",
  prp: "/media/curated/service-prp.jpg",
  journal: "/media/curated/clinic-treatment-room.jpeg",
} as const;

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
    photoUrl: doctorPortraits[0],
    coverImageUrl: doctorPortraits[0],
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
    serviceSlugs: [
      "aesthetic-surgery",
      "rhinoplasty",
      "liposuction",
      "body-contouring",
    ],
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
    photoUrl: doctorPortraits[1],
    coverImageUrl: doctorPortraits[1],
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
    featured: false,
    serviceSlugs: ["aesthetic-surgery", "rhinoplasty", "liposuction"],
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
    photoUrl: doctorPortraits[2],
    coverImageUrl: doctorPortraits[2],
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
    serviceSlugs: [
      "skin-rejuvenation",
      "injectable-harmony",
      "aesthetic-surgery",
      "rhinoplasty",
    ],
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
    photoUrl: doctorPortraits[3],
    coverImageUrl: doctorPortraits[3],
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
    serviceSlugs: ["neurosurgery-spine-care"],
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
    photoUrl: doctorPortraits[4],
    coverImageUrl: doctorPortraits[4],
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
    serviceSlugs: ["female-aesthetic-care", "obgyn-care"],
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
    photoUrl: doctorPortraits[5],
    coverImageUrl: doctorPortraits[5],
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
    serviceSlugs: ["female-aesthetic-care"],
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
    photoUrl: doctorPortraits[6],
    coverImageUrl: doctorPortraits[6],
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
    featured: false,
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
    photoUrl: doctorPortraits[7],
    coverImageUrl: doctorPortraits[7],
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
    serviceSlugs: ["general-surgery-consultation"],
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
    photoUrl: doctorPortraits[8],
    coverImageUrl: doctorPortraits[8],
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
    serviceSlugs: ["general-surgery-consultation", "aesthetic-surgery"],
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
    photoUrl: doctorPortraits[9],
    coverImageUrl: doctorPortraits[9],
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
    featured: false,
    serviceSlugs: ["aesthetic-surgery", "liposuction", "body-contouring"],
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
    coverImageUrl: serviceImages.skinCare,
    benefits: [
      "قراءة أدق لاحتياج البشرة",
      "خطة علاجية متدرجة حسب الحالة",
      "إشراقة طبيعية ومظهر أكثر صفاءً",
    ],
    doctorSlugs: ["natali-domloj", "saham-arfaj"],
    deviceSlugs: [],
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
    coverImageUrl: serviceImages.laser,
    benefits: [
      "خطة مناسبة لنوع البشرة والشعر",
      "تعليمات واضحة قبل الجلسة وبعدها",
      "تجربة أكثر راحة وثباتًا عبر الجلسات",
    ],
    doctorSlugs: ["natali-domloj"],
    deviceSlugs: [],
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
    coverImageUrl: serviceImages.prp,
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
    coverImageUrl: serviceImages.body,
    benefits: [
      "تحسين التناسق العام للجسم",
      "تقنيات غير جراحية مناسبة للحالات المختارة",
      "خطة أكثر وضوحًا قبل البدء",
    ],
    doctorSlugs: ["loai-alsalmi", "ahmed-eldesouki"],
    deviceSlugs: [],
    status: ContentStatus.PUBLISHED,
    featured: true,
  },
  {
    id: "service-rhinoplasty",
    slug: "rhinoplasty",
    name: "عمليات تجميل الأنف",
    category: "عمليات تجميل الوجه",
    excerpt:
      "تقييم جراحي لتناسق الأنف مع ملامح الوجه ووظيفة التنفس قبل تحديد الخطة المناسبة.",
    description:
      "يركز مسار تجميل الأنف على فهم الهدف الجمالي والوظيفي معًا، ثم شرح الخيارات وحدود النتيجة المتوقعة قبل أي قرار جراحي.",
    coverImageUrl: serviceImages.injectables,
    benefits: [
      "تحليل تناسق الأنف والوجه",
      "شرح الخيارات الجراحية بوضوح",
      "خطة تراعي الشكل والوظيفة",
    ],
    doctorSlugs: [
      "loai-alsalmi",
      "maher-alahdab",
      "saham-arfaj",
      "ahmed-eldesouki",
    ],
    deviceSlugs: [],
    status: ContentStatus.PUBLISHED,
    featured: true,
  },
  {
    id: "service-liposuction",
    slug: "liposuction",
    name: "عمليات شفط الدهون",
    category: "جراحة التجميل",
    excerpt:
      "تخطيط جراحي لإزالة الدهون العنيدة وتحسين خطوط الجسم للحالات المناسبة.",
    description:
      "تبدأ الخدمة بتقييم توزيع الدهون وجودة الجلد والهدف المطلوب، ثم اختيار ما إذا كان شفط الدهون أو مسار آخر أكثر ملاءمة للحالة.",
    coverImageUrl: serviceImages.body,
    benefits: [
      "تقييم ملاءمة الحالة قبل الجراحة",
      "تحسين موضعي لتناسق القوام",
      "متابعة واضحة قبل وبعد الإجراء",
    ],
    doctorSlugs: ["loai-alsalmi", "maher-alahdab", "ahmed-eldesouki"],
    deviceSlugs: [],
    status: ContentStatus.PUBLISHED,
    featured: true,
  },
  {
    id: "service-aesthetic-surgery",
    slug: "aesthetic-surgery",
    name: "الجراحات التجميلية",
    category: "الجراحة التجميلية",
    excerpt:
      "استشارات وإجراءات جراحية تجميلية وترميمية تبدأ من تقييم طبي دقيق وحدود واضحة للتوقعات.",
    description:
      "يركز هذا المسار على الجراحات التجميلية والترميمية التي تحتاج إلى تخطيط دقيق، شرح للمخاطر والبدائل، وتحديد واقعي لما يناسب كل حالة قبل اعتماد أي إجراء.",
    coverImageUrl: serviceImages.aestheticSurgery,
    benefits: [
      "تقييم جراحي واضح قبل القرار",
      "شرح البدائل والمخاطر والتوقعات",
      "متابعة منظمة بعد الإجراء",
    ],
    doctorSlugs: [
      "loai-alsalmi",
      "maher-alahdab",
      "saham-arfaj",
      "ahmed-eldesouki",
    ],
    deviceSlugs: [],
    status: ContentStatus.PUBLISHED,
    featured: true,
  },
  {
    id: "service-dermatology-consultation",
    slug: "dermatology-consultation",
    name: "استشارات الجلدية والعناية بالبشرة",
    category: "الجلدية والعناية",
    excerpt:
      "تقييم طبي لحالة البشرة ووضع خطة علاجية أو تجميلية تناسب نوع الجلد والهدف المطلوب.",
    description:
      "تبدأ الاستشارة بفهم التاريخ الطبي ونوع البشرة والمشكلة الحالية، ثم اختيار مسار مناسب قد يشمل العناية الطبية، الجلسات الجلدية، أو الأجهزة بحسب احتياج الحالة.",
    coverImageUrl: serviceImages.skinCare,
    benefits: [
      "تشخيص أوضح قبل اختيار الخدمة",
      "خطة مناسبة لنوع البشرة",
      "تدرج علاجي يحافظ على سلامة الجلد",
    ],
    doctorSlugs: ["natali-domloj", "saham-arfaj"],
    deviceSlugs: [],
    status: ContentStatus.PUBLISHED,
    featured: true,
  },
  {
    id: "service-facial-contouring",
    slug: "facial-contouring",
    name: "تحديد ملامح الوجه",
    category: "التجميل غير الجراحي",
    excerpt:
      "تحسين مدروس لتوازن الملامح عبر خيارات غير جراحية تُختار حسب شكل الوجه واحتياج الحالة.",
    description:
      "يهدف هذا المسار إلى تحسين التناسق العام للوجه دون مبالغة، من خلال تقييم مواضع الحاجة واختيار التقنية أو المادة المناسبة مع شرح الحدود الواقعية للنتيجة.",
    coverImageUrl: serviceImages.injectables,
    benefits: [
      "توازن أفضل للملامح",
      "خيارات غير جراحية مدروسة",
      "حفاظ على التعبير الطبيعي",
    ],
    doctorSlugs: ["natali-domloj", "saham-arfaj"],
    deviceSlugs: [],
    status: ContentStatus.PUBLISHED,
    featured: false,
  },
  {
    id: "service-female-aesthetic-care",
    slug: "female-aesthetic-care",
    name: "خدمات التجميل النسائي",
    category: "التجميل النسائي",
    excerpt:
      "خدمات نسائية تجميلية وعلاجية تراعي الخصوصية وتبدأ بتقييم واضح للحالة.",
    description:
      "تقدم الخدمة مسارًا منظمًا للتقييم والشرح قبل اختيار أي إجراء، مع مراعاة خصوصية الحالة وحدود كل خيار علاجي أو تجميلي.",
    coverImageUrl: serviceImages.journal,
    benefits: [
      "خصوصية وشرح واضح",
      "اختيار الخدمة حسب الحالة",
      "متابعة تناسب طبيعة الإجراء",
    ],
    doctorSlugs: ["karima-jamjoom", "najwa-batarfi"],
    deviceSlugs: [],
    status: ContentStatus.PUBLISHED,
    featured: true,
  },
  {
    id: "service-obgyn-care",
    slug: "obgyn-care",
    name: "خدمات النساء والولادة",
    category: "النساء والولادة",
    excerpt: "رعاية نسائية منظمة تبدأ بالتقييم والمتابعة حسب احتياج كل حالة.",
    description:
      "يركز المسار على وضوح المتابعة والخصوصية، مع شرح الخيارات الطبية المناسبة قبل اعتماد الخطة العلاجية.",
    coverImageUrl: serviceImages.journal,
    benefits: [
      "متابعة نسائية منظمة",
      "خطة علاجية واضحة",
      "تقييم حسب احتياج الحالة",
    ],
    doctorSlugs: ["karima-jamjoom"],
    deviceSlugs: [],
    status: ContentStatus.PUBLISHED,
    featured: false,
  },
  {
    id: "service-general-surgery-consultation",
    slug: "general-surgery-consultation",
    name: "استشارات الجراحة العامة",
    category: "الجراحة العامة",
    excerpt:
      "تقييم جراحي عام يوضح الخيارات العلاجية وما إذا كان التدخل الجراحي مناسبًا.",
    description:
      "تساعد الاستشارة على ترتيب الأولويات العلاجية وشرح البدائل والمخاطر والخطوات المتوقعة قبل أي تدخل.",
    coverImageUrl: serviceImages.journal,
    benefits: ["تقييم جراحي أولي", "شرح البدائل والخطة", "تحديد الحاجة للتدخل"],
    doctorSlugs: ["falwah-aljanoubi", "bandar-alharthi"],
    deviceSlugs: [],
    status: ContentStatus.PUBLISHED,
    featured: false,
  },
  {
    id: "service-neurosurgery-spine-care",
    slug: "neurosurgery-spine-care",
    name: "جراحة المخ والأعصاب والعمود الفقري",
    category: "الجراحات العصبية",
    excerpt:
      "تقييم متخصص لحالات المخ والأعصاب والعمود الفقري بخطة علاجية دقيقة.",
    description:
      "يعتمد المسار على التشخيص الدقيق وشرح الخيارات العلاجية أو الجراحية المناسبة، مع توضيح المخاطر والمتابعة المتوقعة.",
    coverImageUrl: serviceImages.journal,
    benefits: [
      "تقييم عصبي وجراحي متخصص",
      "شرح خيارات العلاج",
      "خطة مبنية على التشخيص",
    ],
    doctorSlugs: ["sabah-alrashid"],
    deviceSlugs: [],
    status: ContentStatus.PUBLISHED,
    featured: false,
  },
];

const seedDevices: DeviceRecord[] = [];

const seedGallery: GalleryRecord[] = [
  {
    id: "gallery-reference-01",
    slug: "skin-renewal-before-after",
    title: "تحسن ملمس البشرة",
    category: "العناية بالبشرة",
    description:
      "مقارنة توضح كيف تساعد الخطة المناسبة على تحسين صفاء البشرة وملمسها بصورة تدريجية.",
    beforeImageUrl: "/media/reference/legacy/13.png",
    afterImageUrl: "/media/reference/legacy/18.png",
    beforeImageAlt: "تحسن ملمس البشرة قبل",
    afterImageAlt: "تحسن ملمس البشرة بعد",
    initialSplitPercent: 50,
  },
  {
    id: "gallery-reference-02",
    slug: "laser-care-result",
    title: "مسار ليزر منظم",
    category: "جلسات الليزر",
    description:
      "عرض مختصر لنتيجة علاجية مرتبطة بخطة جلسات واضحة، مع متابعة مناسبة لكل حالة.",
    beforeImageUrl: "/media/reference/legacy/9.png",
    afterImageUrl: "/media/curated/service-laser-hair-removal.jpg",
    beforeImageAlt: "جلسات الليزر قبل",
    afterImageAlt: "جلسات الليزر بعد",
    initialSplitPercent: 50,
  },
  {
    id: "gallery-reference-03",
    slug: "body-contouring-plan",
    title: "تنسيق القوام",
    category: "تجميل القوام",
    description:
      "مثال بصري لخطة تركز على التناسق الطبيعي وتوقعات واضحة قبل البدء.",
    beforeImageUrl: "/media/reference/legacy/88985959.webp",
    afterImageUrl: "/media/reference/legacy/56549.webp",
    beforeImageAlt: "تنسيق القوام قبل",
    afterImageAlt: "تنسيق القوام بعد",
    initialSplitPercent: 50,
  },
  {
    id: "gallery-reference-04",
    slug: "face-neck-lift-result",
    title: "شد الوجه والرقبة",
    category: "الجراحة التجميلية",
    description:
      "مقارنة مرتبطة بإجراءات شد الوجه والرقبة مع إبراز أهمية التقييم الجراحي والتوقعات الواقعية.",
    beforeImageUrl:
      "/media/reference/legacy/WhatsApp-Image-2024-08-12-at-2.50.24-PM.jpeg",
    afterImageUrl:
      "/media/reference/legacy/WhatsApp-Image-2024-08-12-at-4.55.56-PM.jpeg",
    beforeImageAlt: "شد الوجه والرقبة قبل",
    afterImageAlt: "شد الوجه والرقبة بعد",
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
    coverImageUrl: serviceImages.skinCare,
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
    coverImageUrl: serviceImages.injectables,
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
    coverImageUrl: serviceImages.laser,
    category: "استراتيجيات الحقن",
    publishedAt: "2026-05-08T11:00:00.000Z",
    readingTime: "4 دقائق",
    relatedServiceSlugs: ["injectable-harmony"],
    relatedDoctorSlugs: ["saham-arfaj", "natali-domloj"],
  },
  {
    id: "journal-aesthetic-surgery-planning",
    slug: "aesthetic-surgery-planning-riyadh",
    title: "كيف تبدأ استشارة الجراحة التجميلية بخطة واضحة وآمنة؟",
    excerpt:
      "دليل مختصر من ريجوفيرا يوضح ما يجب مناقشته قبل أي قرار جراحي تجميلي في الرياض.",
    body: [
      "الاستشارة الجراحية الناجحة لا تبدأ من اسم العملية، بل من فهم الهدف، تقييم الحالة، وتوضيح الخيارات الممكنة وحدود كل خيار.",
      "في ريجوفيرا نركز على أن تكون المراجعة مطمئنة وواضحة، مع شرح مسار التحضير والمتابعة حتى يكون القرار مبنيًا على معرفة لا على توقعات غير دقيقة.",
    ],
    coverImageUrl: serviceImages.aestheticSurgery,
    category: "جراحة تجميلية",
    publishedAt: "2026-05-06T10:00:00.000Z",
    readingTime: "5 دقائق",
    relatedServiceSlugs: ["cosmetic-surgery-consultation"],
    relatedDoctorSlugs: ["loai-alsalmi", "maher-alahdab"],
  },
  {
    id: "journal-body-contouring-expectations",
    slug: "body-contouring-realistic-expectations",
    title: "تنسيق القوام: ماذا يجب أن تعرفي قبل اختيار الإجراء؟",
    excerpt:
      "مقال يشرح الفروق بين تحسين التناسق وتغيير الشكل، وكيف تحدد الاستشارة الخيار المناسب.",
    body: [
      "تنسيق القوام يحتاج قراءة دقيقة لتوزيع الدهون، جودة الجلد، نمط الحياة، والهدف المطلوب. لذلك تختلف الخطة من حالة لأخرى.",
      "الأفضل دائمًا هو اختيار إجراء يخدم التناسق الطبيعي ويضع توقعات واقعية حول مدة التعافي ووقت ظهور النتيجة.",
    ],
    coverImageUrl: serviceImages.body,
    category: "تجميل القوام",
    publishedAt: "2026-05-04T12:00:00.000Z",
    readingTime: "4 دقائق",
    relatedServiceSlugs: ["body-contouring"],
    relatedDoctorSlugs: ["loai-alsalmi"],
  },
  {
    id: "journal-skin-tightening-guide",
    slug: "skin-tightening-options-guide",
    title: "شد البشرة غير الجراحي: متى يكون مناسبًا؟",
    excerpt:
      "شرح مبسط للحالات التي يناسبها الشد غير الجراحي ومتى تكون الخيارات الأخرى أفضل.",
    body: [
      "تقنيات الشد غير الجراحي قد تكون مناسبة عند وجود ترهل خفيف أو متوسط، لكنها ليست بديلًا لكل الحالات الجراحية.",
      "التقييم الطبي يحدد هل الهدف هو تحفيز الكولاجين، تحسين الملمس، أو الانتقال إلى خطة مختلفة أكثر ملاءمة.",
    ],
    coverImageUrl: serviceImages.devices,
    category: "تقنيات البشرة",
    publishedAt: "2026-05-02T09:30:00.000Z",
    readingTime: "4 دقائق",
    relatedServiceSlugs: ["skin-tightening"],
    relatedDoctorSlugs: ["natali-domloj"],
  },
  {
    id: "journal-prp-hair-skin",
    slug: "prp-hair-skin-before-treatment",
    title: "حقن البلازما للشعر والبشرة: أسئلة مهمة قبل البدء",
    excerpt:
      "متى تكون البلازما خيارًا مناسبًا، وما الذي يجب تقييمه قبل تحديد عدد الجلسات؟",
    body: [
      "البلازما ليست إجراءً موحدًا لكل الحالات. في الشعر مثلًا نحتاج تقييم درجة التساقط والأسباب المحتملة قبل اعتماد الخطة.",
      "وفي البشرة، يختلف الهدف بين تحسين النضارة ودعم التعافي ضمن خطة أوسع. لذلك تبدأ النتيجة الجيدة من تشخيص صحيح.",
    ],
    coverImageUrl: serviceImages.injectables,
    category: "البلازما والتجديد",
    publishedAt: "2026-04-30T14:00:00.000Z",
    readingTime: "5 دقائق",
    relatedServiceSlugs: ["prp-hair-skin"],
    relatedDoctorSlugs: ["natali-domloj"],
  },
  {
    id: "journal-choosing-doctor",
    slug: "choosing-aesthetic-doctor-riyadh",
    title: "كيف تختارين الطبيب المناسب للتجميل الطبي؟",
    excerpt:
      "معايير تساعدك على قراءة الملف الطبي والخبرة وطريقة شرح الخطة قبل الحجز.",
    body: [
      "اختيار الطبيب لا يعتمد على الصورة أو عدد السنوات فقط، بل على وضوح التواصل، التخصص، وطريقة شرح التوقعات والمخاطر.",
      "ملف الطبيب الجيد يجب أن يوضح مجالات الخبرة والخدمات المرتبطة به، حتى تختاري الاستشارة المناسبة من البداية.",
    ],
    coverImageUrl: serviceImages.journal,
    category: "اختيار الطبيب",
    publishedAt: "2026-04-28T11:30:00.000Z",
    readingTime: "4 دقائق",
    relatedServiceSlugs: ["dermatology-consultation"],
    relatedDoctorSlugs: ["natali-domloj", "saham-arfaj"],
  },
  {
    id: "journal-before-after-reading",
    slug: "how-to-read-before-after-photos",
    title: "كيف تقرئين صور قبل وبعد بطريقة صحيحة؟",
    excerpt:
      "دليل لفهم صور النتائج دون مبالغة: الإضاءة، الزاوية، الفترة الزمنية، وطبيعة الحالة.",
    body: [
      "صور قبل وبعد تساعد على تكوين تصور، لكنها تحتاج قراءة دقيقة. اختلاف الإضاءة أو الزاوية قد يغير الانطباع بشكل كبير.",
      "الأهم هو ربط الصورة بالخدمة، نوع الحالة، والمدة بين الصورتين، حتى يصبح القرار مبنيًا على فهم واقعي.",
    ],
    coverImageUrl: serviceImages.skinCare,
    category: "معرض النتائج",
    publishedAt: "2026-04-25T10:15:00.000Z",
    readingTime: "3 دقائق",
    relatedServiceSlugs: ["skin-rejuvenation"],
    relatedDoctorSlugs: ["natali-domloj"],
  },
  {
    id: "journal-consultation-prep",
    slug: "prepare-for-aesthetic-consultation",
    title: "كيف تستعدين لاستشارة التجميل في ريجوفيرا؟",
    excerpt:
      "خطوات بسيطة تساعدك على الاستفادة من الاستشارة: الأسئلة، الصور، التاريخ الطبي، والهدف المطلوب.",
    body: [
      "قبل الاستشارة، اكتبي الأسئلة الأساسية والنتيجة التي تتمنينها، وأحضري أي معلومات طبية قد تؤثر على الخطة.",
      "كلما كانت المعلومات أوضح، أصبح بإمكان الفريق الطبي اقتراح مسار أدق وأكثر ملاءمة لحالتك.",
    ],
    coverImageUrl: serviceImages.journal,
    category: "قبل الزيارة",
    publishedAt: "2026-04-22T13:45:00.000Z",
    readingTime: "4 دقائق",
    relatedServiceSlugs: ["dermatology-consultation"],
    relatedDoctorSlugs: ["loai-alsalmi", "natali-domloj"],
  },
  {
    id: "journal-face-neck-lift-fillers",
    slug: "face-neck-lift-threads-fillers",
    title:
      "شد الوجه والرقبة: متى تحتاجين العملية؟ وما الفرق بينها وبين الخيوط والفيلر؟",
    excerpt:
      "دليل مبسط يوضح الفرق بين شد الوجه والفيلر والخيوط، ومتى تكون العملية خيارًا أنسب للترهل الواضح.",
    body: [
      "مع التقدم في العمر، قد تبدأ ملامح الوجه في فقدان تحديدها تدريجيًا، ويظهر الترهل في منطقة الخدين، خط الفك، والرقبة. هنا تتساءل كثير من السيدات: هل أحتاج إلى فيلر؟ أم خيوط؟ أم أن شد الوجه هو الخيار الأنسب؟",
      "الفيلر يساعد في تعويض فقدان الحجم في مناطق محددة، بينما قد تستخدم الخيوط لتحسين الرفع بدرجة بسيطة ومؤقتة لدى بعض الحالات. أما عملية شد الوجه والرقبة فتهدف إلى التعامل مع الترهل الواضح في الجلد والأنسجة العميقة وتحسين تحديد الفك والرقبة بصورة أشمل.",
      "قد تكون العملية مناسبة عند وجود ترهل واضح أسفل الوجه، طيات أو ارتخاء في الرقبة، فقدان تحديد الفك، أو رغبة في نتيجة أكثر ثباتًا ووضوحًا من الإجراءات غير الجراحية.",
      "الاختيار الصحيح لا يعتمد على العمر فقط، بل على طبيعة التغيرات في الوجه، جودة البشرة، ودرجة الترهل. لذلك تبقى الاستشارة الطبية هي الخطوة الأهم لتحديد الإجراء الأنسب لكل حالة.",
      "في ريجوفيرا، يتم تقييم ملامح الوجه بشكل دقيق للوصول إلى خطة تجميلية تحافظ على المظهر الطبيعي وتحسن التناسق دون مبالغة. احجزي استشارتك لمعرفة الخيار الأنسب لشد الوجه والرقبة حسب حالتك.",
      "#ريجوفيرا #شد_الوجه #شد_الرقبة #تجميل_الوجه #جراحة_التجميل #الفيلر #الخيوط #تجميل_الوجه_في_الرياض",
    ],
    coverImageUrl: serviceImages.aestheticSurgery,
    category: "الجراحة التجميلية",
    publishedAt: "2026-05-16T09:00:00.000Z",
    readingTime: "5 دقائق",
    relatedServiceSlugs: ["aesthetic-surgery", "facial-contouring"],
    relatedDoctorSlugs: ["loai-alsalmi", "maher-alahdab"],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: "journal-breast-augmentation-size",
    slug: "breast-augmentation-size-riyadh",
    title:
      "تكبير الثدي في الرياض: كيف تختارين المقاس المناسب والنتيجة الطبيعية؟",
    excerpt:
      "تكبير الثدي ليس اختيار حجم أكبر فقط، بل تخطيط للتناسق مع شكل الجسم والأنسجة والنتيجة الطبيعية.",
    body: [
      "تكبير الثدي ليس مجرد اختيار حجم أكبر، بل هو قرار يعتمد على التناسق الكامل مع شكل الجسم. فالنتيجة الجميلة لا تقاس بالمقاس وحده، وإنما بمدى تناسب الامتلاء مع عرض الصدر، شكل الكتفين، الخصر، وطبيعة الأنسجة.",
      "عند التفكير في تكبير الثدي، يتم تقييم حجم الثدي الحالي، عرض القفص الصدري، شكل الجسم العام، سماكة الجلد والأنسجة، ورغبة المريضة في نتيجة ناعمة أو أكثر امتلاءً.",
      "الهدف من التخطيط الجيد هو الوصول إلى شكل أنثوي متوازن، لا يبدو مبالغًا فيه أو غير منسجم مع القوام. لذلك فإن الصور المرجعية وحدها لا تكفي، لأن ما يناسب جسمًا معينًا قد لا يناسب جسمًا آخر.",
      "نوع الحشوة، مقاسها، وموضعها يتم تحديده طبيًا بحسب الحالة. والنتيجة النهائية تبنى على مبدأ مهم: التجميل الناجح هو الذي يبدو طبيعيًا ومناسبًا لصاحبة الحالة.",
      "في ريجوفيرا، يتم التعامل مع كل حالة بشكل فردي، مع التركيز على التناسق، السلامة، وفهم توقعات المريضة قبل اتخاذ القرار. ابدئي باستشارة متخصصة لتحديد الحجم والشكل الأنسب لك.",
      "#ريجوفيرا #تكبير_الثدي #تجميل_الثدي #جراحة_الثدي #عيادات_الرياض #جراحة_التجميل #نتائج_طبيعية",
    ],
    coverImageUrl: serviceImages.aestheticSurgery,
    category: "الجراحة التجميلية",
    publishedAt: "2026-05-15T09:00:00.000Z",
    readingTime: "5 دقائق",
    relatedServiceSlugs: ["aesthetic-surgery"],
    relatedDoctorSlugs: ["loai-alsalmi", "maher-alahdab"],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: "journal-body-contouring-weight-loss",
    slug: "body-contouring-after-weight-loss",
    title: "نحت الجسم بعد فقدان الوزن: ما المناطق التي يمكن تحسينها جراحيًا؟",
    excerpt:
      "بعد نزول الوزن قد تظهر ترهلات في البطن والذراعين والفخذين، وتحتاج الخطة إلى تقييم دقيق للتناسق.",
    body: [
      "فقدان الوزن إنجاز كبير، لكنه في بعض الحالات قد يترك خلفه ترهلات جلدية أو مناطق غير متناسقة لا تختفي بالرياضة وحدها. وهنا يأتي دور جراحات تنسيق القوام ونحت الجسم لتحسين شكل الجسم بعد النزول.",
      "قد تظهر الترهلات في البطن والخصر، الذراعين، الفخذين، الظهر، والصدر في بعض الحالات. ولا يهدف نحت الجسم فقط إلى إزالة الجلد الزائد، بل إلى إعادة تحسين الانسيابية والتناسق بين أجزاء الجسم.",
      "قد تحتاج بعض الحالات إلى إجراء واحد، بينما تستفيد حالات أخرى من خطة متكاملة تنفذ على مراحل لضمان نتيجة متوازنة ومناسبة صحيًا.",
      "هذه الإجراءات ليست بديلًا عن خسارة الوزن، بل تأتي غالبًا بعد الوصول إلى وزن مستقر نسبيًا بهدف تحسين الشكل النهائي للقوام.",
      "في ريجوفيرا، يتم تقييم مناطق الجسم بدقة واقتراح الخطة الأكثر ملاءمة وفق احتياج كل حالة، مع التركيز على النتيجة الطبيعية والتناسق العام.",
      "#ريجوفيرا #نحت_الجسم #بعد_نزول_الوزن #شد_الجسم #تنسيق_القوام #جراحة_التجميل #الرياض",
    ],
    coverImageUrl: serviceImages.body,
    category: "تجميل القوام",
    publishedAt: "2026-05-14T09:00:00.000Z",
    readingTime: "4 دقائق",
    relatedServiceSlugs: ["body-contouring"],
    relatedDoctorSlugs: ["loai-alsalmi", "ahmed-eldesouki"],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: "journal-liposuction-vs-contouring",
    slug: "liposuction-vs-body-contouring",
    title: "شفط الدهون أم نحت الجسم؟ الفرق بين الإجرائين وأيهما أنسب لكِ",
    excerpt:
      "شرح الفرق بين شفط الدهون ونحت الجسم، وكيف يحدد الفحص الإجراء الأنسب حسب الدهون والترهل ومرونة الجلد.",
    body: [
      "كثير من الأشخاص يستخدمون مصطلحي شفط الدهون ونحت الجسم وكأنهما شيء واحد، لكن بينهما فرق مهم في الهدف والنتيجة.",
      "شفط الدهون يركز على إزالة التراكمات الدهنية الموضعية التي لا تستجيب بسهولة للرياضة أو النظام الغذائي، مثل دهون البطن، الخاصرتين، الذراعين، أو الظهر.",
      "أما نحت الجسم فهو مفهوم أوسع يهدف إلى تحسين التناسق وإبراز شكل القوام، وقد يشمل إزالة الدهون، إعادة توزيع الانحناءات، أو شد الجلد بحسب الحاجة.",
      "إذا كانت المشكلة الأساسية دهونًا موضعية فقد يكون شفط الدهون مناسبًا، وإذا كان الهدف تحسين شكل الجسم العام وإبراز التحديد فقد يكون النحت أقرب. أما مع الترهل الجلدي الواضح فقد يحتاج الأمر إلى دمج تقنيات أخرى.",
      "في ريجوفيرا، تبنى الخطة على تحليل القوام كاملًا وليس على منطقة واحدة فقط، للوصول إلى نتيجة متجانسة تحافظ على شكل طبيعي ومتوازن.",
      "#ريجوفيرا #شفط_الدهون #نحت_الجسم #تنسيق_القوام #تجميل_الجسم #الخصر #جراحة_التجميل",
    ],
    coverImageUrl: serviceImages.body,
    category: "تجميل القوام",
    publishedAt: "2026-05-13T09:00:00.000Z",
    readingTime: "4 دقائق",
    relatedServiceSlugs: ["body-contouring"],
    relatedDoctorSlugs: ["loai-alsalmi", "ahmed-eldesouki"],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: "journal-tummy-tuck-after-pregnancy",
    slug: "tummy-tuck-after-pregnancy-weight-loss",
    title:
      "ترهلات البطن بعد الحمل أو نزول الوزن: متى تكون عملية شد البطن هي الحل؟",
    excerpt:
      "متى لا تكفي الرياضة أو شفط الدهون وحدهما، ومتى يكون شد البطن خيارًا لتحسين شكل المنطقة؟",
    body: [
      "بعد الحمل أو فقدان الوزن، قد تلاحظ بعض السيدات أن منطقة البطن لم تعد تستجيب للرياضة بنفس الشكل السابق. قد يقل الوزن، لكن يظل هناك جلد زائد، ارتخاء، أو بروز في البطن يؤثر على تناسق القوام.",
      "قد تكون المشكلة ناتجة عن ترهل الجلد، ضعف أو تباعد عضلات البطن، تجمع دهون موضعية، أو تغير شكل السرة وأسفل البطن.",
      "عندما تكون المشكلة في الجلد والعضلات، قد لا يكون الشفط وحده كافيًا، وهنا قد تطرح عملية شد البطن كخيار لتحسين شكل المنطقة وإعادة التناسق إليها.",
      "شد البطن لا يهدف إلى إنقاص الوزن، بل إلى تحسين الشكل بعد استقرار الوزن، خصوصًا عند وجود ترهل لا يمكن معالجته بالتمارين فقط.",
      "في ريجوفيرا، يتم التعامل مع كل حالة بدقة لاختيار التقنية الأنسب، سواء كانت شدًا محدودًا أو شدًا أكثر شمولًا حسب احتياج المريضة.",
      "#ريجوفيرا #شد_البطن #ترهلات_البطن #بعد_الحمل #بعد_نزول_الوزن #تجميل_البطن #جراحة_التجميل",
    ],
    coverImageUrl: serviceImages.body,
    category: "تجميل القوام",
    publishedAt: "2026-05-12T09:00:00.000Z",
    readingTime: "5 دقائق",
    relatedServiceSlugs: ["body-contouring"],
    relatedDoctorSlugs: ["loai-alsalmi"],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: "journal-rhinoplasty-face-balance",
    slug: "rhinoplasty-face-balance",
    title: "تجميل الأنف: كيف تعرفين أن النتيجة ستناسب ملامح وجهك؟",
    excerpt:
      "تجميل الأنف لا يعني التصغير فقط، بل تحقيق الانسجام مع الذقن والشفاه والجبهة والهوية الطبيعية للوجه.",
    body: [
      "الأنف من أكثر ملامح الوجه تأثيرًا على التوازن العام، ولهذا فإن تجميل الأنف لا يعتمد على تصغيره فقط، بل على تحقيق الانسجام مع باقي تفاصيل الوجه.",
      "النتيجة الناجحة تحافظ على الهوية الطبيعية للوجه، تتناسب مع الذقن والشفاه والجبهة، تعالج الملاحظة التي تزعج المريض دون مبالغة، وتبدو متوازنة من الأمام والجانب.",
      "قد تختلف الرغبات من شخص لآخر؛ فبعض الحالات تبحث عن تحسين حدبة الأنف، وأخرى عن تعديل طرف الأنف أو عرض الأنف أو زاوية الانسجام مع الوجه.",
      "التقييم الدقيق يساعد على معرفة ما يمكن تحسينه بواقعية، وما إذا كانت التوقعات منطقية ومناسبة. كما أن الجانب الوظيفي والتنفس يجب أن يؤخذ في الاعتبار عند الحاجة.",
      "في ريجوفيرا، تدرس ملامح الوجه بشكل شامل للوصول إلى خطة تجميلية تحسن الشكل مع الحفاظ على النتيجة الطبيعية والمتناسقة.",
      "#ريجوفيرا #تجميل_الأنف #عملية_الأنف #جراحة_الأنف #تناسق_الوجه #جراحة_التجميل #الرياض",
    ],
    coverImageUrl: serviceImages.aestheticSurgery,
    category: "الجراحة التجميلية",
    publishedAt: "2026-05-11T09:00:00.000Z",
    readingTime: "4 دقائق",
    relatedServiceSlugs: ["aesthetic-surgery", "facial-contouring"],
    relatedDoctorSlugs: ["loai-alsalmi", "maher-alahdab"],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: "journal-before-aesthetic-surgery-questions",
    slug: "questions-before-aesthetic-surgery",
    title: "قبل عملية التجميل: 10 أسئلة مهمة يجب طرحها على الجرّاح",
    excerpt:
      "قائمة أسئلة تساعد على فهم الإجراء والنتيجة والبدائل والتعافي قبل اتخاذ قرار العملية.",
    body: [
      "اتخاذ قرار بإجراء عملية تجميلية يحتاج إلى فهم واضح، وليس استعجالًا. الاستشارة الجيدة لا تقتصر على معرفة السعر أو موعد العملية، بل تشمل أسئلة تساعدك على تكوين صورة واقعية عن الإجراء والنتيجة.",
      "من أهم الأسئلة: هل هذا الإجراء مناسب لحالتي؟ ما النتيجة المتوقعة؟ ما البدائل؟ ما مدة التعافي؟ متى تظهر النتيجة النهائية؟ هل سأحتاج إلى راحة من العمل؟ ما التعليمات قبل وبعد الإجراء؟ ما المضاعفات المحتملة؟ هل يمكن مشاهدة حالات مشابهة؟ وكيف تتم المتابعة؟",
      "هذه الأسئلة تمنح المريض وعيًا أكبر، وتساعد على اتخاذ قرار مبني على فهم وثقة. كما تفتح حوارًا مهمًا بين المريض والطبيب حول التوقعات والنتائج الممكنة.",
      "في ريجوفيرا، نؤمن أن وضوح المعلومات جزء أساسي من التجربة العلاجية، وأن الاستشارة الجيدة هي بداية النتيجة الناجحة.",
      "#ريجوفيرا #قبل_عملية_التجميل #استشارة_تجميلية #جراحة_التجميل #وعي_تجميلي #اختيار_الطبيب #عيادات_الرياض",
    ],
    coverImageUrl: serviceImages.journal,
    category: "قبل الزيارة",
    publishedAt: "2026-05-10T09:00:00.000Z",
    readingTime: "4 دقائق",
    relatedServiceSlugs: ["aesthetic-surgery", "dermatology-consultation"],
    relatedDoctorSlugs: ["loai-alsalmi", "natali-domloj"],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: "journal-results-recovery-timeline",
    slug: "facelift-body-contouring-results-recovery",
    title: "متى تظهر نتيجة عمليات شد الوجه ونحت الجسم؟ دليل التعافي خطوة بخطوة",
    excerpt:
      "النتائج تمر بمراحل، من التورم الأولي إلى التحسن التدريجي والنتيجة النهائية خلال أشهر حسب الحالة.",
    body: [
      "من أكثر الأسئلة شيوعًا بعد الإجراءات التجميلية: متى أرى النتيجة؟ والإجابة تختلف حسب نوع العملية، طبيعة الجسم، ومدى الالتزام بتعليمات التعافي.",
      "في الأيام الأولى قد يظهر تورم أو كدمات بدرجات متفاوتة، وهذا جزء متوقع من مرحلة الشفاء. بعد ذلك تبدأ الملامح في التحسن تدريجيًا، لكن الحكم النهائي على النتيجة يحتاج إلى وقت.",
      "النتائج الأولية قد تظهر بعد تحسن التورم، ويصبح المظهر أوضح خلال الأسابيع التالية، بينما قد تحتاج النتيجة النهائية عدة أشهر حسب نوع العملية وطبيعة الحالة.",
      "الالتزام بتعليمات الطبيب بعد العملية له دور مهم، مثل ارتداء المشد عند الحاجة، العناية بالجرح، تجنب المجهود الزائد مبكرًا، وحضور مواعيد المتابعة.",
      "في ريجوفيرا، يتم شرح مراحل التعافي بوضوح قبل الإجراء، حتى تكون التوقعات واقعية ومريحة للمريض.",
      "#ريجوفيرا #نتائج_التجميل #التعافي_بعد_الجراحة #شد_الوجه #نحت_الجسم #جراحة_التجميل #متى_تظهر_النتيجة",
    ],
    coverImageUrl: serviceImages.body,
    category: "التعافي والنتائج",
    publishedAt: "2026-05-09T09:00:00.000Z",
    readingTime: "5 دقائق",
    relatedServiceSlugs: ["aesthetic-surgery", "body-contouring"],
    relatedDoctorSlugs: ["loai-alsalmi", "ahmed-eldesouki"],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: "journal-early-face-sagging",
    slug: "early-face-sagging-causes-treatment",
    title: "أسباب ترهل الوجه المبكر وطرق التعامل معه جراحيًا وغير جراحيًا",
    excerpt:
      "ترهل الوجه لا يرتبط بالعمر فقط؛ فقد يظهر مع فقدان الوزن أو ضعف مرونة الجلد وتغير توزيع الدهون.",
    body: [
      "ترهل الوجه لا يرتبط بالعمر فقط، بل قد يظهر بدرجات مختلفة نتيجة عوامل متعددة تؤثر على مرونة الجلد وتناسق الملامح.",
      "من الأسباب الشائعة: التقدم الطبيعي في العمر، فقدان الوزن الكبير، تغير توزيع الدهون في الوجه، ضعف مرونة الجلد، والتعرض المستمر للعوامل الخارجية دون عناية مناسبة.",
      "تظهر علامات الترهل غالبًا في الخدين، أسفل الفك، الرقبة، وحول الفم. وتختلف طرق التعامل حسب درجة المشكلة؛ ففي المراحل البسيطة قد تناسب بعض الخيارات غير الجراحية، أما الترهل الأوضح فقد يحتاج إلى خيارات جراحية أكثر ملاءمة.",
      "الأهم هو عدم اختيار الإجراء بناءً على الشهرة أو التجارب العامة، بل بناءً على تقييم الحالة نفسها. فلكل وجه طبيعته، ولكل درجة ترهل حل مختلف.",
      "في ريجوفيرا، يتم التركيز على اختيار الخطة التي تناسب ملامح المريض ودرجة التغير، بهدف الوصول إلى مظهر أكثر شبابًا مع الحفاظ على الشخصية الطبيعية للوجه.",
      "#ريجوفيرا #ترهل_الوجه #شد_الوجه #علاج_الترهل #تجميل_الوجه #شباب_البشرة #الرقبة",
    ],
    coverImageUrl: serviceImages.skinCare,
    category: "تجميل الوجه",
    publishedAt: "2026-05-08T09:00:00.000Z",
    readingTime: "4 دقائق",
    relatedServiceSlugs: ["facial-contouring", "skin-rejuvenation"],
    relatedDoctorSlugs: ["natali-domloj", "saham-arfaj"],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: "journal-choose-plastic-surgeon-riyadh",
    slug: "choose-plastic-surgeon-riyadh",
    title:
      "كيف تختارين أفضل جرّاح تجميل في الرياض؟ علامات الجودة والثقة قبل الحجز",
    excerpt:
      "اختيار جرّاح التجميل يبدأ من الخبرة، وضوح التواصل، الخطة الواقعية، والمتابعة قبل وبعد الإجراء.",
    body: [
      "اختيار جرّاح التجميل خطوة لا تقل أهمية عن اختيار الإجراء نفسه. فالنتيجة الجيدة تبدأ من التقييم الصحيح، وضوح التواصل، والخبرة المناسبة للحالة.",
      "عند البحث عن جرّاح تجميل، انتبهي إلى وضوح المؤهلات والخبرة، القدرة على شرح الخيارات بواقعية، مناقشة التوقعات، تقديم خطة تناسب الحالة لا نسخة مكررة للجميع، وجود متابعة واضحة، والتركيز على السلامة وليس النتيجة الشكلية فقط.",
      "من العلامات الإيجابية أن يشرح الطبيب ما يمكن تحقيقه وما لا يمكن تحقيقه، وأن يرفض المبالغات أو التوقعات غير الواقعية.",
      "لا تتخذي القرار بناءً على صورة واحدة أو إعلان فقط؛ الاستشارة هي فرصتك لفهم أسلوب الطبيب، مستوى التواصل، ومدى شعورك بالثقة والاطمئنان.",
      "في ريجوفيرا، تبنى رحلة المريض على التقييم الطبي، الشفافية، والاهتمام بالتفاصيل، بهدف تقديم تجربة تجميلية أكثر وعيًا واحترافية.",
      "#ريجوفيرا #جراح_تجميل #أفضل_جراح_تجميل #تجميل_الرياض #اختيار_الطبيب #جراحة_التجميل #استشارة_طبية",
    ],
    coverImageUrl: serviceImages.journal,
    category: "اختيار الطبيب",
    publishedAt: "2026-05-07T09:00:00.000Z",
    readingTime: "4 دقائق",
    relatedServiceSlugs: ["aesthetic-surgery"],
    relatedDoctorSlugs: ["loai-alsalmi", "maher-alahdab"],
    status: ContentStatus.PUBLISHED,
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
    tags: ["VIP", "Skin"],
    comments: [],
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
    tags: ["Laser"],
    comments: [],
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
    tags: ["Booked"],
    comments: [],
  },
];

const defaultContactFaqs: ContactFaqItem[] = [
  {
    questionAr: "هل يجب حجز موعد مسبق؟",
    answerAr:
      "نعم، يفضّل حجز موعد مسبق لتقليل الانتظار وضمان توفر الطبيب أو الخدمة المناسبة في الوقت المطلوب.",
    questionEn: "Should I book an appointment in advance?",
    answerEn:
      "Yes. Booking ahead helps reduce waiting time and ensures the right physician or service is available.",
  },
  {
    questionAr: "ما هي أوقات العمل؟",
    answerAr:
      "يعمل المركز من السبت إلى الخميس من الساعة 2:00 مساءً إلى 10:00 مساءً.",
    questionEn: "What are the working hours?",
    answerEn:
      "The center is open Saturday to Thursday from 2:00 PM to 10:00 PM.",
  },
  {
    questionAr: "هل تتوفر متابعة بعد العلاج؟",
    answerAr:
      "نعم، يتم ترتيب المتابعة حسب خطة العلاج وتوصية الطبيب لضمان وضوح التعليمات بعد الزيارة.",
    questionEn: "Is follow-up available after treatment?",
    answerEn:
      "Yes. Follow-up is arranged according to the treatment plan and the physician's recommendation.",
  },
  {
    questionAr: "كيف أصل إلى موقع المركز؟",
    answerAr:
      "يمكنك استخدام الخريطة في صفحة التواصل أو فتح الموقع عبر خرائط Google، والعنوان موضح بصيغة مناسبة لمحركات البحث.",
    questionEn: "How can I reach the center?",
    answerEn:
      "You can use the map on the contact page or open the location in Google Maps. The address is listed clearly for navigation.",
  },
  {
    questionAr: "ما طرق الدفع المتاحة؟",
    answerAr:
      "تتوفر وسائل دفع متعددة تشمل البطاقات البنكية وبعض حلول الدفع الإلكتروني، ويمكن التأكد من التفاصيل عند الحجز.",
    questionEn: "What payment methods are available?",
    answerEn:
      "Multiple payment methods are available, including bank cards and selected digital payment options.",
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
        value: "info@rejuvera.sa",
      },
      {
        key: "emailSecondary",
        label: "البريد البديل",
        value: "info@rejuvera.sa",
      },
      { key: "whatsapp", label: "واتساب", value: "0114999959" },
      { key: "domain", label: "النطاق الرسمي", value: "rejuvera.sa" },
      {
        key: "addressAr",
        label: "العنوان بالعربية",
        value: "Al Takhassousi, Ar Rahmaniyyah, التخصصي, طريق الملك عبدالله",
      },
      {
        key: "addressEn",
        label: "Address in English",
        value:
          "Al Takhassousi, Ar Rahmaniyyah, Al Takhassousi, King Abdullah Road, Riyadh",
      },
      // hours block - subagent #3
      {
        key: "hoursWeekdays",
        label: "ساعات العمل (السبت — الخميس)",
        value: "السبت إلى الخميس: 2:00 م - 10:00 م",
      },
      {
        key: "hoursWeekend",
        label: "اليوم المغلق",
        value: "",
      },
      {
        key: "mapsEmbedUrl",
        label: "رابط خريطة Google",
        value:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.125146317555!2d46.6527524!3d24.7225835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f1d4473cdb6e9%3A0xaae6f892cde87ef5!2z2YXYsdmD2LIg2LHZitis2YjZgdmK2LHYpyDYp9mE2LfYqNmKIHwgUmVqdXZlcmEgTWVkaWNhbCBDZW50ZXI!5e0!3m2!1sar!2ssa!4v1778808648059!5m2!1sar!2ssa",
      },
      {
        key: "mapsShape",
        label: "شكل الخريطة",
        value: "rounded",
      },
      {
        key: "hoursWeekdaysEn",
        label: "Working hours (Sat – Thu, English)",
        value: "Saturday to Thursday: 2:00 PM - 10:00 PM",
      },
      {
        key: "hoursWeekendEn",
        label: "Closed day (English)",
        value: "",
      },
      {
        key: "faq1QuestionAr",
        label: "السؤال الشائع الأول",
        value: "هل يجب حجز موعد مسبق؟",
      },
      {
        key: "faq1AnswerAr",
        label: "إجابة السؤال الشائع الأول",
        value:
          "نعم، يفضّل حجز موعد مسبق لتقليل الانتظار وضمان توفر الطبيب أو الخدمة المناسبة في الوقت المطلوب.",
      },
      {
        key: "faq1QuestionEn",
        label: "FAQ 1 question",
        value: "Should I book an appointment in advance?",
      },
      {
        key: "faq1AnswerEn",
        label: "FAQ 1 answer",
        value:
          "Yes. Booking ahead helps reduce waiting time and ensures the right physician or service is available.",
      },
      {
        key: "faq2QuestionAr",
        label: "السؤال الشائع الثاني",
        value: "ما هي أوقات العمل؟",
      },
      {
        key: "faq2AnswerAr",
        label: "إجابة السؤال الشائع الثاني",
        value:
          "يعمل المركز من السبت إلى الخميس من الساعة 2:00 مساءً إلى 10:00 مساءً.",
      },
      {
        key: "faq2QuestionEn",
        label: "FAQ 2 question",
        value: "What are the working hours?",
      },
      {
        key: "faq2AnswerEn",
        label: "FAQ 2 answer",
        value:
          "The center is open Saturday to Thursday from 2:00 PM to 10:00 PM.",
      },
      {
        key: "faq3QuestionAr",
        label: "السؤال الشائع الثالث",
        value: "هل تتوفر متابعة بعد العلاج؟",
      },
      {
        key: "faq3AnswerAr",
        label: "إجابة السؤال الشائع الثالث",
        value:
          "نعم، يتم ترتيب المتابعة حسب خطة العلاج وتوصية الطبيب لضمان وضوح التعليمات بعد الزيارة.",
      },
      {
        key: "faq3QuestionEn",
        label: "FAQ 3 question",
        value: "Is follow-up available after treatment?",
      },
      {
        key: "faq3AnswerEn",
        label: "FAQ 3 answer",
        value:
          "Yes. Follow-up is arranged according to the treatment plan and the physician's recommendation.",
      },
      {
        key: "faq4QuestionAr",
        label: "السؤال الشائع الرابع",
        value: "كيف أصل إلى موقع المركز؟",
      },
      {
        key: "faq4AnswerAr",
        label: "إجابة السؤال الشائع الرابع",
        value:
          "يمكنك استخدام الخريطة في صفحة التواصل أو فتح الموقع عبر خرائط Google، والعنوان موضح بصيغة مناسبة لمحركات البحث.",
      },
      {
        key: "faq4QuestionEn",
        label: "FAQ 4 question",
        value: "How can I reach the center?",
      },
      {
        key: "faq4AnswerEn",
        label: "FAQ 4 answer",
        value:
          "You can use the map on the contact page or open the location in Google Maps. The address is listed clearly for navigation.",
      },
      {
        key: "faq5QuestionAr",
        label: "السؤال الشائع الخامس",
        value: "ما طرق الدفع المتاحة؟",
      },
      {
        key: "faq5AnswerAr",
        label: "إجابة السؤال الشائع الخامس",
        value:
          "تتوفر وسائل دفع متعددة تشمل البطاقات البنكية وبعض حلول الدفع الإلكتروني، ويمكن التأكد من التفاصيل عند الحجز.",
      },
      {
        key: "faq5QuestionEn",
        label: "FAQ 5 question",
        value: "What payment methods are available?",
      },
      {
        key: "faq5AnswerEn",
        label: "FAQ 5 answer",
        value:
          "Multiple payment methods are available, including bank cards and selected digital payment options.",
      },
    ],
  },
  {
    key: "integrations",
    title: "التكاملات والأكواد المؤقتة",
    description:
      "إدارة أكواد خارجية مؤقتة مثل Chatbase و Google tags وروابط Webhook للنماذج دون تعديل الكود.",
    fields: [
      { key: "chatbaseEnabled", label: "تفعيل Chatbase", value: "true" },
      {
        key: "chatbaseWidgetId",
        label: "Chatbase Widget ID",
        value: "wjegZOeOaeYGtbw422le3",
      },
      { key: "googleTagEnabled", label: "تفعيل Google Tag", value: "false" },
      {
        key: "googleTagUrl",
        label: "Google Tag / GTM",
        value: "",
      },
      { key: "customHeadCode", label: "كود مخصص داخل head", value: "" },
      { key: "customBodyCode", label: "كود مخصص قبل نهاية body", value: "" },
      {
        key: "formWebhookEnabled",
        label: "تفعيل Webhook للنماذج",
        value: "false",
      },
      { key: "formWebhookUrl", label: "رابط Webhook للنماذج", value: "" },
      {
        key: "formWebhookSecret",
        label: "Webhook Secret اختياري",
        value: "",
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
        value: "Rejuvera Center",
      },
      {
        key: "shortName",
        label: "الاسم المختصر",
        value: "Rejuvera",
      },
      {
        key: "tagline",
        label: "الجملة الافتتاحية",
        value:
          "مركز طبي للتجميل والجراحات التجميلية وطب الجلدية والعناية بالبشرة",
      },
      {
        key: "announcement",
        label: "شريط الإعلان",
        value: "حجز منظم واستجابة واضحة ومتابعة دقيقة عبر جميع قنوات التواصل",
      },
      {
        key: "seoDescription",
        label: "الوصف التعريفي للموقع",
        value:
          "مركز طبي متخصص في الجراحات التجميلية وطب الجلدية والعناية بالبشرة، يقدم خدمات مدروسة بأطباء متخصصين وتقنيات حديثة وتجربة واضحة من الاستشارة حتى المتابعة.",
      },
      {
        key: "logoAlt",
        label: "النص البديل للشعار",
        value:
          "شعار Rejuvera Center للتجميل الطبي والجراحات التجميلية والعناية بالبشرة",
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
        value: "/media/brand-logo-main.png",
      },
      {
        key: "brandMark",
        label: "أيقونة الهوية المربعة",
        value: "/media/brand-logo-main.png",
      },
      {
        key: "favicon",
        label: "Favicon",
        value: "/icon.svg",
      },
      {
        key: "appleIcon",
        label: "Apple Touch Icon",
        value: "/media/brand-logo-main.png",
      },
      {
        key: "ogImage",
        label: "صورة المشاركة الاجتماعية",
        value: "/media/brand-logo-main.png",
      },
      {
        key: "homeHero",
        label: "صورة الصفحة الرئيسية",
        value: "/media/hero/rejuvira-hero-1.jpg",
      },
      {
        key: "heroCard1",
        label: "صورة الهيرو الأولى",
        value: "/media/hero/rejuvira-hero-1.jpg",
      },
      {
        key: "heroCard2",
        label: "صورة الهيرو الثانية",
        value: "/media/hero/rejuvira-hero-2.jpg",
      },
      {
        key: "heroCard3",
        label: "صورة الهيرو الثالثة",
        value: "/media/hero/rejuvira-hero-3.jpg",
      },
      {
        key: "doctorsHero",
        label: "صورة قسم الأطباء",
        value: "/media/curated/doctor-team.jpg",
      },
      {
        key: "servicesHero",
        label: "صورة قسم الخدمات",
        value: serviceImages.aestheticSurgery,
      },
      {
        key: "aboutHero",
        label: "صورة صفحة من نحن",
        value: serviceImages.devices,
      },
      {
        key: "journalHero",
        label: "صورة المجلة الطبية",
        value: serviceImages.journal,
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
        value: "اكتشفي جمالك",
      },
      {
        key: "heroTitleAccent",
        label: "العبارة المميزة في الهيرو",
        value: "مع خبراء التجميل",
      },
      {
        key: "heroDescription",
        label: "وصف الهيرو",
        value:
          "نقدم لكِ أحدث التقنيات في الجراحات التجميلية والعناية بالبشرة، بأيدي نخبة من الأطباء المتخصصين وضمن خطة واضحة تناسب حالتكِ.",
      },
      {
        key: "heroPillLabel",
        label: "شارة الهيرو العلوية",
        value: "ريجوفيرا للتجميل الطبي",
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
        label: "عنوان فرعي لشريط تصفح الخدمات",
        value: "مختارات من الخدمات",
      },
      {
        key: "stripTitle",
        label: "عنوان شريط تصفح الخدمات",
        value: "استعرضي خدمات مرتبطة بحالتك",
      },
      {
        key: "stripDescription",
        label: "وصف شريط تصفح الخدمات",
        value: "مدخل منظم لتصفح الخدمات وفتح ما يهمك بنقرة واحدة.",
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
        value: "نتائج وخطوات واضحة بالصورة",
      },
      {
        key: "galleryDescription",
        label: "وصف قسم الصورة المتغيرة",
        value:
          "مقارنات قبل وبعد تعرض الخدمة في سياقها الصحيح، مع صورة أكبر وتفاصيل مختصرة تساعدك على فهم طبيعة النتيجة.",
      },
      {
        key: "galleryItem1Image",
        label: "صورة العنصر الأول",
        value: serviceImages.skinCare,
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
        value: serviceImages.laser,
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
        value: serviceImages.devices,
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
      {
        key: "testimonial1AuthorAr",
        label: "اسم رأي العميل الأول",
        value: "سارة العتيبي",
      },
      {
        key: "testimonial1AuthorEn",
        label: "Testimonial 1 author",
        value: "Sara Alotaibi",
      },
      {
        key: "testimonial1QuoteAr",
        label: "تعليق العميل الأول",
        value:
          "شرح الطبيب الخطة بوضوح قبل البدء، وكانت المتابعة بعد الجلسة منظمة.",
      },
      {
        key: "testimonial1QuoteEn",
        label: "Testimonial 1 quote",
        value:
          "The plan was clear before starting, and follow-up after the visit was organized.",
      },
      {
        key: "testimonial1Avatar",
        label: "صورة العميل الأول",
        value: "/media/curated/fallback-portrait.jpg",
      },
      {
        key: "testimonial2AuthorAr",
        label: "اسم رأي العميل الثاني",
        value: "نورة خالد",
      },
      {
        key: "testimonial2AuthorEn",
        label: "Testimonial 2 author",
        value: "Noura Khalid",
      },
      {
        key: "testimonial2QuoteAr",
        label: "تعليق العميل الثاني",
        value:
          "الاستشارة كانت هادئة ومباشرة، ولم أشعر بضغط لاختيار إجراء معين.",
      },
      {
        key: "testimonial2QuoteEn",
        label: "Testimonial 2 quote",
        value:
          "The consultation was calm and direct, with no pressure to choose a procedure.",
      },
      {
        key: "testimonial2Avatar",
        label: "صورة العميل الثاني",
        value: "/media/curated/doctor-candidate-1.jpg",
      },
      {
        key: "testimonial3AuthorAr",
        label: "اسم رأي العميل الثالث",
        value: "مها محمد",
      },
      {
        key: "testimonial3AuthorEn",
        label: "Testimonial 3 author",
        value: "Maha Mohammed",
      },
      {
        key: "testimonial3QuoteAr",
        label: "تعليق العميل الثالث",
        value:
          "الحجز واضح، والاستقبال منظم، والتعليمات بعد الزيارة وصلت في وقت مناسب.",
      },
      {
        key: "testimonial3QuoteEn",
        label: "Testimonial 3 quote",
        value:
          "Booking was clear, reception was organized, and aftercare instructions arrived on time.",
      },
      {
        key: "testimonial3Avatar",
        label: "صورة العميل الثالث",
        value: "/media/curated/doctor-candidate-2.jpg",
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
    email: "admin@rejuvera.sa",
    role: UserRole.SUPER_ADMIN,
    positionTitle: "Platform owner",
    department: "Leadership",
    isActive: true,
    leadCount: 12,
    lastLoginAt: "2026-05-12T08:00:00.000Z",
    createdAt: "2026-04-28T09:00:00.000Z",
  },
  {
    id: "user-operations-admin",
    name: "مسؤول التشغيل",
    email: "operations@rejuvera.sa",
    role: UserRole.ADMIN,
    positionTitle: "Operations manager",
    department: "Operations",
    isActive: true,
    leadCount: 31,
    lastLoginAt: "2026-05-11T14:40:00.000Z",
    createdAt: "2026-04-29T08:30:00.000Z",
  },
  {
    id: "user-content-editor",
    name: "مسؤول المحتوى",
    email: "content@rejuvera.sa",
    role: UserRole.EDITOR,
    positionTitle: "Content editor",
    department: "Marketing",
    isActive: true,
    leadCount: 0,
    createdAt: "2026-05-01T10:15:00.000Z",
  },
];

const defaultMediaSelections: MediaSelections = {
  brandLogo: "/media/brand-logo-main.png",
  brandMark: "/media/brand/rejuvira-app-icon.png",
  favicon: "/favicon.ico",
  appleIcon: "/apple-touch-icon.png",
  ogImage: "/media/brand-logo-main.png",
  homeHero: "/media/hero/rejuvira-hero-1.jpg",
  heroCard1: "/media/hero/rejuvira-hero-1.jpg",
  heroCard2: "/media/hero/rejuvira-hero-2.jpg",
  heroCard3: "/media/hero/rejuvira-hero-3.jpg",
  doctorsHero: "/media/curated/doctor-team.jpg",
  servicesHero: serviceImages.aestheticSurgery,
  aboutHero: serviceImages.devices,
  journalHero: serviceImages.journal,
};

const defaultHomeGalleryItems: HomeGalleryItem[] = [
  {
    image: serviceImages.skinCare,
    title: "تجديد البشرة المتقدم",
    description:
      "مشهد مخصص لخدمات تحسين نضارة البشرة، الملمس، وتوحيد اللون ضمن خطة متدرجة.",
  },
  {
    image: serviceImages.laser,
    title: "جلسات الليزر",
    description:
      "صورة توضيحية لخدمات الليزر المرتبطة بإزالة الشعر وبعض المسارات المعتمدة على الأجهزة.",
  },
  {
    image: serviceImages.devices,
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

function isTransientDatabaseError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("PostgreSQL connection") ||
    message.includes("kind: Closed") ||
    message.includes("Connection terminated") ||
    message.includes("Can't reach database server") ||
    message.includes("Timed out fetching a new connection")
  );
}

async function withDatabaseRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isTransientDatabaseError(error)) {
      throw error;
    }
    console.warn(
      "[database] transient Prisma connection error; retrying once.",
    );
    /* Wait briefly for the connection pool to recover instead of
       calling $disconnect() which kills ALL open connections and
       causes cascading failures on concurrent requests. */
    await new Promise((resolve) => setTimeout(resolve, 200));
    return operation();
  }
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

const imageFallbackMap: Record<string, string> = {
  "/media/reference/legacy/56549.png": "/media/reference/legacy/56549.webp",
  "/media/reference/legacy/88985959.png":
    "/media/reference/legacy/88985959.webp",
  "/media/curated/doctor-candidate-3.jpg":
    "/media/curated/doctor-candidate-3.webp",
  "/media/doctors/loai-alsalmi.png": "/media/doctors/loai-alsalmi.webp",
  "/media/doctors/maher-alahdab.png": "/media/doctors/maher-alahdab.webp",
  "/media/doctors/saham-arfaj.png": "/media/doctors/saham-arfaj.webp",
  "/media/doctors/sabah-alrashid.png": "/media/doctors/sabah-alrashid.webp",
  "/media/doctors/karima-jamjoom.png": "/media/doctors/karima-jamjoom.webp",
  "/media/doctors/najwa-batarfi.png": "/media/doctors/najwa-batarfi.webp",
  "/media/doctors/natali-domloj.png": "/media/doctors/natali-domloj.webp",
  "/media/doctors/falwah-aljanoubi.png": "/media/doctors/falwah-aljanoubi.webp",
  "/media/doctors/bandar-alharthi.png": "/media/doctors/bandar-alharthi.webp",
  "/media/doctors/ahmed-eldesouki.png": "/media/doctors/ahmed-eldesouki.webp",
  "/media/curated/service-skin-rejuvenation.jpg": serviceImages.skinCare,
  "/media/curated/brand-logo.jpg": "/media/brand-logo-main.png",
  "/media/curated/service-laser-hair-removal.jpg": serviceImages.laser,
  "/media/curated/service-injectables.png": serviceImages.injectables,
  "/media/curated/service-prp.jpg": serviceImages.prp,
  "/media/curated/device-laser-platform.png": serviceImages.devices,
  "/media/curated/device-emface.jpg": serviceImages.body,
  "/media/curated/service-skin-care.svg": serviceImages.skinCare,
  "/media/curated/service-laser.svg": serviceImages.laser,
  "/media/curated/service-injectables.svg": serviceImages.injectables,
  "/media/curated/service-aesthetic-surgery.svg":
    serviceImages.aestheticSurgery,
  "/media/curated/device-platform.svg": serviceImages.devices,
  "/media/curated/device-body.svg": serviceImages.body,
  "/media/curated/doctor-profile.svg": "/media/curated/fallback-portrait.jpg",
};

function toDisplayAsset(
  value: string | null | undefined,
  fallback: string,
): string {
  const source = value?.trim() || fallback;
  if (source.includes("images.unsplash.com")) {
    return fallback;
  }
  return imageFallbackMap[source] ?? source;
}

function toDoctorAsset(slug: string, value: string | null | undefined): string {
  const fallback =
    (doctorPortraitBySlug as Record<string, string>)[slug] ??
    "/media/curated/fallback-portrait.jpg";
  const source = value?.trim();
  if (
    !source ||
    source.includes("images.unsplash.com") ||
    source === "/media/curated/doctor-profile.svg"
  ) {
    return fallback;
  }
  return imageFallbackMap[source] ?? source;
}

function serviceImageForSlug(slug: string): string {
  if (slug.includes("laser")) return serviceImages.laser;
  if (slug.includes("inject") || slug.includes("facial"))
    return serviceImages.injectables;
  if (slug.includes("body")) return serviceImages.body;
  if (slug.includes("surgery")) return serviceImages.aestheticSurgery;
  if (slug.includes("prp")) return serviceImages.prp;
  return serviceImages.skinCare;
}

function deviceImageForSlug(slug: string): string {
  if (
    slug.includes("body") ||
    slug.includes("emsculpt") ||
    slug.includes("emface")
  )
    return serviceImages.body;
  if (slug.includes("laser")) return serviceImages.devices;
  return serviceImages.devices;
}

function toPrimaryAsset(value: unknown, fallback: string): string {
  const assets = toStringList(value);

  return toDisplayAsset(assets[0], fallback);
}

function toDoctorSummary(publications: unknown, bio: string) {
  return toStringList(publications)[0] ?? bio.slice(0, 180);
}

export const getDoctors = cache(async () => {
  if (!canUseDatabase()) {
    return sortFeaturedFirst([...seedDoctors]);
  }

  try {
    const doctors = await prisma.doctor.findMany({
      include: { services: { select: { slug: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    if (doctors.length === 0) {
      return sortFeaturedFirst([...seedDoctors]);
    }

    const databaseDoctors = doctors.map((doctor) => ({
      id: doctor.id,
      slug: doctor.slug,
      name: doctor.nameAr,
      nameEn: doctor.nameEn,
      title: doctor.titleAr,
      titleEn: doctor.titleEn,
      specialty: doctor.specialtyAr,
      specialtyEn: doctor.specialtyEn,
      summary: toDoctorSummary(doctor.publications, doctor.bioAr),
      summaryEn: doctor.bioEn
        ? toDoctorSummary(doctor.publications, doctor.bioEn)
        : null,
      bio: doctor.bioAr,
      bioEn: doctor.bioEn,
      photoUrl: toDoctorAsset(doctor.slug, doctor.photoUrl),
      coverImageUrl: toDoctorAsset(
        doctor.slug,
        doctor.coverImageUrl ?? doctor.photoUrl,
      ),
      yearsExperience: doctor.yearsExperience ?? 0,
      languages: doctor.languages,
      education: toStringList(doctor.education),
      achievements: toStringList(doctor.achievements),
      publications: toStringList(doctor.publications),
      status: doctor.status,
      featured: doctor.isFeatured,
      serviceSlugs: doctor.services.map((service) => service.slug),
    }));
    const databaseSlugs = new Set(databaseDoctors.map((doctor) => doctor.slug));
    const missingSeedDoctors = seedDoctors.filter(
      (doctor) => !databaseSlugs.has(doctor.slug),
    );

    return sortFeaturedFirst([...databaseDoctors, ...missingSeedDoctors]);
  } catch {
    return sortFeaturedFirst([...seedDoctors]);
  }
});

export const getDoctorBySlug = cache(async (slug: string) => {
  const doctors = await getDoctors();
  return doctors.find((doctor) => doctor.slug === slug) ?? null;
});

function seedServiceCategories(): ServiceCategoryRecord[] {
  const names = Array.from(
    new Set(seedServices.map((service) => service.category)),
  );
  return names.map((name, index) => ({
    id: `seed-${index + 1}`,
    slug: `category-${index + 1}`,
    name,
    nameEn: null,
    description: null,
    descriptionEn: null,
    status: ContentStatus.PUBLISHED,
    sortOrder: index + 1,
    serviceCount: seedServices.filter((service) => service.category === name)
      .length,
  }));
}

export const getServiceCategories = cache(
  async (): Promise<ServiceCategoryRecord[]> => {
    if (!canUseDatabase()) {
      return seedServiceCategories();
    }

    try {
      const categories = await prisma.serviceCategory.findMany({
        include: { _count: { select: { services: true } } },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });

      if (categories.length === 0) {
        return seedServiceCategories();
      }

      return categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.nameAr,
        nameEn: category.nameEn,
        description: category.descriptionAr,
        descriptionEn: category.descriptionEn,
        status: category.status,
        sortOrder: category.sortOrder,
        serviceCount: category._count.services,
      }));
    } catch {
      return seedServiceCategories();
    }
  },
);

export const getServices = cache(async () => {
  if (!canUseDatabase()) {
    return sortFeaturedFirst([...seedServices]);
  }

  try {
    const services = await withDatabaseRetry(() =>
      prisma.service.findMany({
        include: {
          doctors: { select: { slug: true } },
          devices: { select: { slug: true } },
          category: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
    );

    if (services.length === 0) {
      return sortFeaturedFirst([...seedServices]);
    }

    return sortFeaturedFirst(
      services.map((service) => ({
        id: service.id,
        slug: service.slug,
        name: service.nameAr,
        nameEn: service.nameEn,
        categoryId: service.categoryId,
        categorySlug: service.category?.slug ?? null,
        category: service.category?.nameAr ?? service.categoryKey,
        categoryEn: service.category?.nameEn ?? null,
        excerpt: service.excerptAr,
        excerptEn: service.excerptEn,
        description: service.descriptionAr,
        descriptionEn: service.descriptionEn,
        coverImageUrl: toDisplayAsset(
          service.coverImageUrl,
          serviceImageForSlug(service.slug),
        ),
        benefits: [service.excerptAr, service.descriptionAr.slice(0, 120)],
        doctorSlugs: service.doctors.map((doctor) => doctor.slug),
        deviceSlugs: service.devices.map((device) => device.slug),
        status: service.status,
        featured: service.isFeatured,
      })),
    );
  } catch (error) {
    console.error(
      "[content-repository] getServices failed; using seed fallback.",
      error,
    );
    return sortFeaturedFirst([...seedServices]);
  }
});

export const getServiceBySlug = cache(async (slug: string) => {
  const services = await getServices();
  return services.find((service) => service.slug === slug) ?? null;
});

export const getServiceByReference = cache(
  async (reference?: string | null) => {
    const value = reference?.trim();
    if (!value) return null;
    const normalized = value.toLowerCase();
    const services = await getServices();
    return (
      services.find((service) => service.slug.toLowerCase() === normalized) ??
      services.find((service) => service.name.trim() === value) ??
      services.find((service) => service.nameEn?.trim() === value) ??
      null
    );
  },
);

export const getDevices = cache(async () => {
  if (!canUseDatabase()) {
    return [...seedDevices];
  }

  try {
    const devices = await prisma.device.findMany({
      include: { services: { select: { slug: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    if (devices.length === 0) {
      return [...seedDevices];
    }

    return devices.map((device) => ({
      id: device.id,
      slug: device.slug,
      name: device.nameAr,
      nameEn: device.nameEn,
      excerpt: device.excerptAr ?? device.descriptionAr.slice(0, 120),
      excerptEn: device.excerptEn,
      description: device.descriptionAr,
      descriptionEn: device.descriptionEn,
      imageUrl: toPrimaryAsset(device.gallery, deviceImageForSlug(device.slug)),
      certifications: toStringList(device.certifications),
      serviceSlugs: device.services.map((service) => service.slug),
      status: device.status,
      featured: device.isFeatured,
    }));
  } catch {
    return [...seedDevices];
  }
});

export const getGalleryItems = cache(async () => {
  if (!canUseDatabase()) {
    return [...seedGallery];
  }

  try {
    const gallery = await prisma.galleryItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    if (gallery.length === 0) {
      return [...seedGallery];
    }

    return gallery.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.titleAr,
      titleEn: item.titleEn,
      category: item.categoryKey,
      categoryEn: item.categoryKey,
      description: item.descriptionAr ?? "",
      descriptionEn: item.descriptionEn,
      beforeImageUrl: toDisplayAsset(
        item.beforeImageUrl,
        "/media/reference/legacy/13.png",
      ),
      afterImageUrl: toDisplayAsset(
        item.afterImageUrl,
        "/media/reference/legacy/18.png",
      ),
      beforeImageAlt: item.beforeImageAlt ?? item.titleAr,
      afterImageAlt: item.afterImageAlt ?? item.titleAr,
      initialSplitPercent: item.initialSplitPercent,
      status: item.status,
    }));
  } catch {
    return [...seedGallery];
  }
});

export const getJournalPosts = cache(async () => {
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

    const databasePosts = posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.titleAr,
      titleEn: post.titleEn,
      excerpt: post.excerptAr,
      excerptEn: post.excerptEn,
      body: toStringList(post.bodyAr),
      coverImageUrl: toDisplayAsset(post.coverImageUrl, serviceImages.journal),
      category: post.categoryKey,
      publishedAt:
        post.publishedAt?.toISOString() ?? post.createdAt.toISOString(),
      readingTime: post.readingTimeLabel ?? "4 دقائق",
      relatedServiceSlugs: post.relatedServiceSlugs,
      relatedDoctorSlugs: post.relatedDoctorSlugs,
      status: post.status,
    }));

    const databaseSlugs = new Set(databasePosts.map((post) => post.slug));
    const missingSeedPosts = seedJournalPosts.filter(
      (post) => !databaseSlugs.has(post.slug),
    );

    return [...databasePosts, ...missingSeedPosts].sort(
      (left, right) =>
        new Date(right.publishedAt).getTime() -
        new Date(left.publishedAt).getTime(),
    );
  } catch {
    return [...seedJournalPosts].sort(
      (left, right) =>
        new Date(right.publishedAt).getTime() -
        new Date(left.publishedAt).getTime(),
    );
  }
});

export const getJournalPostBySlug = cache(async (slug: string) => {
  const posts = await getJournalPosts();
  return posts.find((post) => post.slug === slug) ?? null;
});

export async function getCrmSubmissions(): Promise<CrmRecord[]> {
  if (!canUseDatabase()) {
    return seedCrmRecords.map((entry) => ({
      ...entry,
      tags: entry.tags ?? [],
      comments: entry.comments ?? [],
    }));
  }

  try {
    const submissions = await prisma.contactSubmission.findMany({
      include: {
        service: { select: { nameAr: true, slug: true, id: true } },
        assignedTo: { select: { id: true, name: true } },
        webhook: { select: { id: true, name: true } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: [{ createdAt: "desc" }],
        },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    return submissions.map((submission) => {
      const rawSource = submission.source?.trim();
      const shouldUseWebhookName =
        !rawSource ||
        rawSource.toLowerCase() === "webhook" ||
        rawSource === "ويب هوك";
      const readableSource =
        shouldUseWebhookName && submission.webhook?.name
          ? submission.webhook.name
          : (rawSource ?? "الموقع الإلكتروني");

      return {
        id: submission.id,
        fullName: submission.fullName,
        phone: submission.phone,
        email: submission.email ?? undefined,
        serviceLabel:
          submission.service?.nameAr ??
          (hasGeneralInquiryTag(submission.tags)
            ? GENERAL_INQUIRY_SERVICE_AR
            : undefined),
        serviceSlug: submission.service?.slug ?? undefined,
        serviceId: submission.service?.id ?? undefined,
        status: submission.status,
        source: readableSource,
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
        notes: submission.internalNotes ?? undefined,
        tags: submission.tags ?? [],
        assignedToId: submission.assignedTo?.id,
        assignedToName: submission.assignedTo?.name,
        webhookId: submission.webhook?.id,
        webhookName: submission.webhook?.name,
        utmSource: submission.utmSource ?? undefined,
        utmMedium: submission.utmMedium ?? undefined,
        utmCampaign: submission.utmCampaign ?? undefined,
        utmContent: submission.utmContent ?? undefined,
        ipAddress: submission.ipAddress ?? undefined,
        country: submission.country ?? undefined,
        referrerUrl: submission.referrerUrl ?? undefined,
        landingPageUrl: submission.landingPageUrl ?? undefined,
        userAgent: submission.userAgent ?? undefined,
        message: submission.message ?? undefined,
        comments: submission.comments.map((c) => ({
          id: c.id,
          body: c.body,
          authorId: c.author?.id,
          authorName: c.author?.name ?? c.authorName ?? undefined,
          createdAt: c.createdAt.toISOString(),
        })),
      };
    });
  } catch {
    return seedCrmRecords.map((entry) => ({
      ...entry,
      tags: entry.tags ?? [],
      comments: entry.comments ?? [],
    }));
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

/**
 * Per-request memoized runtime settings. Called from layouts, metadata, and
 * downstream components — caching dedupes repeated DB roundtrips during a
 * single render and significantly reduces TTFB on cold pages.
 */
export const getRuntimeSettings = cache(async (): Promise<RuntimeSettings> => {
  const groups = await getSettingsGroups();
  const normalizeLegacyValue = (fieldKey: string, value: string) => {
    if (
      fieldKey === "email" ||
      fieldKey === "emailSecondary" ||
      fieldKey === "domain"
    ) {
      return value
        .replaceAll("info@" + "rejuvera" + "center.sa", "info@rejuvera.sa")
        .replaceAll("info@" + "rejuvera" + "center.com.sa", "info@rejuvera.sa")
        .replaceAll("rejuvera" + "center.sa", "rejuvera.sa")
        .replaceAll("rejuvera" + "center.com.sa", "rejuvera.sa");
    }
    if (fieldKey === "siteName") {
      return value.replaceAll("Rejuvira", "Rejuvera");
    }
    return value;
  };
  const getValue = (groupKey: string, fieldKey: string, fallback: string) => {
    const value =
      groups
        .find((group) => group.key === groupKey)
        ?.fields.find((field) => field.key === fieldKey)?.value ?? fallback;
    return normalizeLegacyValue(fieldKey, value);
  };

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
        process.env.CONTACT_EMAIL_PRIMARY || "info@rejuvera.sa",
      ),
      emailSecondary: getValue(
        "contact",
        "emailSecondary",
        process.env.CONTACT_EMAIL_SECONDARY || "info@rejuvera.sa",
      ),
      whatsapp: getValue("contact", "whatsapp", "0114999959"),
      domain: getValue("contact", "domain", "rejuvera.sa"),
      mapsEmbedUrl: getValue(
        "contact",
        "mapsEmbedUrl",
        process.env.GOOGLE_MAPS_EMBED_URL ||
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.125146317555!2d46.6527524!3d24.7225835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f1d4473cdb6e9%3A0xaae6f892cde87ef5!2z2YXYsdmD2LIg2LHZitis2YjZgdmK2LHYpyDYp9mE2LfYqNmKIHwgUmVqdXZlcmEgTWVkaWNhbCBDZW50ZXI!5e0!3m2!1sar!2ssa!4v1778808648059!5m2!1sar!2ssa",
      ),
      mapsShape:
        (getValue("contact", "mapsShape", "rounded") as "square" | "rounded") ??
        "rounded",
      addressAr: getValue(
        "contact",
        "addressAr",
        "Al Takhassousi, Ar Rahmaniyyah, التخصصي, طريق الملك عبدالله",
      ),
      addressEn: getValue(
        "contact",
        "addressEn",
        "Al Takhassousi, Ar Rahmaniyyah, Al Takhassousi, King Abdullah Road, Riyadh",
      ),
      faqs: defaultContactFaqs
        .map((fallback, offset) => {
          const index = offset + 1;
          return {
            questionAr: getValue(
              "contact",
              `faq${index}QuestionAr`,
              fallback.questionAr,
            ),
            answerAr: getValue(
              "contact",
              `faq${index}AnswerAr`,
              fallback.answerAr,
            ),
            questionEn: getValue(
              "contact",
              `faq${index}QuestionEn`,
              fallback.questionEn,
            ),
            answerEn: getValue(
              "contact",
              `faq${index}AnswerEn`,
              fallback.answerEn,
            ),
          };
        })
        .filter((item) => item.questionAr && item.answerAr),
      // hours block - subagent #3
      hoursWeekdays: getValue(
        "contact",
        "hoursWeekdays",
        "السبت — الخميس · 2:00 م — 10:00 م",
      ),
      hoursWeekend: getValue("contact", "hoursWeekend", ""),
      hoursWeekdaysEn: getValue(
        "contact",
        "hoursWeekdaysEn",
        "Sat – Thu · 2:00 PM – 10:00 PM",
      ),
      hoursWeekendEn: getValue("contact", "hoursWeekendEn", ""),
    },
    brand: {
      siteName: getValue("brand", "siteName", "Rejuvera Center"),
      shortName: getValue("brand", "shortName", "Rejuvera"),
      tagline: getValue(
        "brand",
        "tagline",
        "مركز طبي تجميلي متكامل يجمع الخبرة الطبية والتقنيات الحديثة وخطة واضحة تناسب كل حالة",
      ),
      announcement: getValue(
        "brand",
        "announcement",
        "حجز منظم واستجابة واضحة ومتابعة دقيقة عبر جميع قنوات التواصل",
      ),
      seoDescription: getValue(
        "brand",
        "seoDescription",
        "مركز متخصص في الجلدية والتجميل الطبي يقدم خدمات مدروسة، أطباء متخصصين، وتجربة علاجية واضحة من أول تواصل حتى المتابعة.",
      ),
      logoAlt: getValue(
        "brand",
        "logoAlt",
        "شعار Rejuvera Center للجلدية والتجميل الطبي",
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
      maintenanceMode: getValue("ops", "maintenanceMode", "false") === "true",
      defaultTheme:
        (getValue("ops", "defaultTheme", "system") as
          | "light"
          | "dark"
          | "system") ?? "system",
      themeToggleEnabled:
        getValue("ops", "themeToggleEnabled", "true") !== "false",
    },
    media: {
      brandLogo: toDisplayAsset(
        getValue("media", "brandLogo", defaultMediaSelections.brandLogo),
        defaultMediaSelections.brandLogo,
      ),
      brandMark: toDisplayAsset(
        getValue("media", "brandMark", defaultMediaSelections.brandMark),
        defaultMediaSelections.brandMark,
      ),
      favicon: toDisplayAsset(
        getValue("media", "favicon", defaultMediaSelections.favicon),
        defaultMediaSelections.favicon,
      ),
      appleIcon: toDisplayAsset(
        getValue("media", "appleIcon", defaultMediaSelections.appleIcon),
        defaultMediaSelections.appleIcon,
      ),
      ogImage: toDisplayAsset(
        getValue("media", "ogImage", defaultMediaSelections.ogImage),
        defaultMediaSelections.ogImage,
      ),
      homeHero: toDisplayAsset(
        getValue("media", "homeHero", defaultMediaSelections.homeHero),
        defaultMediaSelections.homeHero,
      ),
      heroCard1: toDisplayAsset(
        getValue("media", "heroCard1", defaultMediaSelections.heroCard1),
        defaultMediaSelections.heroCard1,
      ),
      heroCard2: toDisplayAsset(
        getValue("media", "heroCard2", defaultMediaSelections.heroCard2),
        defaultMediaSelections.heroCard2,
      ),
      heroCard3: toDisplayAsset(
        getValue("media", "heroCard3", defaultMediaSelections.heroCard3),
        defaultMediaSelections.heroCard3,
      ),
      doctorsHero: toDisplayAsset(
        getValue("media", "doctorsHero", defaultMediaSelections.doctorsHero),
        defaultMediaSelections.doctorsHero,
      ),
      servicesHero: toDisplayAsset(
        getValue("media", "servicesHero", defaultMediaSelections.servicesHero),
        defaultMediaSelections.servicesHero,
      ),
      aboutHero: toDisplayAsset(
        getValue("media", "aboutHero", defaultMediaSelections.aboutHero),
        defaultMediaSelections.aboutHero,
      ),
      journalHero: toDisplayAsset(
        getValue("media", "journalHero", defaultMediaSelections.journalHero),
        defaultMediaSelections.journalHero,
      ),
    },
    homepage: {
      heroTitle: getValue("homepage", "heroTitle", "اكتشفي جمالك"),
      heroTitleAccent: getValue(
        "homepage",
        "heroTitleAccent",
        "مع خبراء التجميل",
      ),
      heroDescription: getValue(
        "homepage",
        "heroDescription",
        "نقدم لكِ أحدث التقنيات في الجراحات التجميلية والعناية بالبشرة، بأيدي نخبة من الأطباء المتخصصين وضمن خطة واضحة تناسب حالتكِ.",
      ),
      heroPillLabel: getValue(
        "homepage",
        "heroPillLabel",
        "ريجوفيرا للتجميل الطبي",
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
      heroTitleEn: getValue("homepage", "heroTitleEn", "Discover refined care"),
      heroTitleAccentEn: getValue(
        "homepage",
        "heroTitleAccentEn",
        "at Rejuvera",
      ),
      heroDescriptionEn: getValue(
        "homepage",
        "heroDescriptionEn",
        "Browse services, clinicians, and technology in one calm layout so you can understand your options before you book.",
      ),
      heroPillLabelEn: getValue(
        "homepage",
        "heroPillLabelEn",
        "Rejuvera Aesthetic Medical Center",
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
      stripEyebrow: getValue("homepage", "stripEyebrow", "مختارات من الخدمات"),
      stripTitle: getValue(
        "homepage",
        "stripTitle",
        "استعرضي خدمات مرتبطة بحالتك",
      ),
      stripDescription: getValue(
        "homepage",
        "stripDescription",
        "مدخل منظم لتصفح الخدمات وفتح ما يهمك بنقرة واحدة.",
      ),
      stripEyebrowEn: getValue("homepage", "stripEyebrowEn", "Curated picks"),
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
        "نتائج وخطوات واضحة بالصورة",
      ),
      galleryDescription: getValue(
        "homepage",
        "galleryDescription",
        "مقارنات قبل وبعد تعرض الخدمة في سياقها الصحيح، مع صورة أكبر وتفاصيل مختصرة تساعدك على فهم طبيعة النتيجة.",
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
            image: serviceImages.skinCare,
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
      testimonials: [1, 2, 3].map((index) => ({
        authorAr: getValue(
          "homepage",
          `testimonial${index}AuthorAr`,
          "مراجعة موثقة",
        ),
        authorEn: getValue(
          "homepage",
          `testimonial${index}AuthorEn`,
          "Verified patient",
        ),
        quoteAr: getValue(
          "homepage",
          `testimonial${index}QuoteAr`,
          "تجربة واضحة ومنظمة من الحجز حتى المتابعة.",
        ),
        quoteEn: getValue(
          "homepage",
          `testimonial${index}QuoteEn`,
          "A clear and organized experience from booking to follow-up.",
        ),
        avatarUrl: toDisplayAsset(
          getValue(
            "homepage",
            `testimonial${index}Avatar`,
            "/media/curated/fallback-portrait.jpg",
          ),
          "/media/curated/fallback-portrait.jpg",
        ),
      })),
    },
    about: {
      eyebrowAr: getValue(
        "about",
        "eyebrowAr",
        ABOUT_SECTION_DEFAULTS.eyebrowAr,
      ),
      eyebrowEn: getValue(
        "about",
        "eyebrowEn",
        ABOUT_SECTION_DEFAULTS.eyebrowEn,
      ),
      titleAr: getValue("about", "titleAr", ABOUT_SECTION_DEFAULTS.titleAr),
      titleEn: getValue("about", "titleEn", ABOUT_SECTION_DEFAULTS.titleEn),
      descriptionAr: getValue(
        "about",
        "descriptionAr",
        ABOUT_SECTION_DEFAULTS.descriptionAr,
      ),
      descriptionEn: getValue(
        "about",
        "descriptionEn",
        ABOUT_SECTION_DEFAULTS.descriptionEn,
      ),
      profiles: ABOUT_PROFILE_DEFAULTS.map((profile) => ({
        key: profile.key,
        labelAr: profile.labelAr,
        labelEn: profile.labelEn,
        nameAr: getValue("about", `${profile.key}NameAr`, profile.nameAr),
        nameEn: getValue("about", `${profile.key}NameEn`, profile.nameEn),
        titleAr: getValue("about", `${profile.key}TitleAr`, profile.titleAr),
        titleEn: getValue("about", `${profile.key}TitleEn`, profile.titleEn),
        descriptionAr: getValue(
          "about",
          `${profile.key}DescriptionAr`,
          profile.descriptionAr,
        ),
        descriptionEn: getValue(
          "about",
          `${profile.key}DescriptionEn`,
          profile.descriptionEn,
        ),
        imageUrl: toDisplayAsset(
          getValue("about", `${profile.key}ImageUrl`, profile.imageUrl),
          profile.imageUrl,
        ),
        visible: getValue("about", `${profile.key}Visible`, "true") !== "false",
      })),
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
    integrations: {
      chatbaseEnabled:
        getValue("integrations", "chatbaseEnabled", "true") !== "false",
      chatbaseWidgetId: getValue(
        "integrations",
        "chatbaseWidgetId",
        "wjegZOeOaeYGtbw422le3",
      ),
      googleTagEnabled:
        getValue("integrations", "googleTagEnabled", "false") === "true",
      googleTagUrl: getValue("integrations", "googleTagUrl", ""),
      customHeadCode: getValue("integrations", "customHeadCode", ""),
      customBodyCode: getValue("integrations", "customBodyCode", ""),
      formWebhookEnabled:
        getValue("integrations", "formWebhookEnabled", "false") === "true",
      formWebhookUrl: getValue("integrations", "formWebhookUrl", ""),
      formWebhookSecret: getValue("integrations", "formWebhookSecret", ""),
    },
  };
});

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
      titleAr:
        "Rejuvera Center — جراحات تجميلية وطب جلدية وعناية بالبشرة في الرياض",
      titleEn:
        "Rejuvera Center — Aesthetic Surgery, Dermatology & Skin Care in Riyadh",
      descriptionAr:
        "مركز ريجوفيرا الطبي في الرياض: استشارات جلدية، خدمات تجميل، أجهزة معتمدة وأطباء متخصصون. خطة علاجية واضحة من أول زيارة.",
      descriptionEn:
        "Rejuvera Center in Riyadh: dermatology consultations, aesthetic services, certified devices, and board-specialised doctors. A clear treatment plan from your first visit.",
      keywordsAr:
        "ريجوفيرا، عيادة جلدية، تجميل طبي، الرياض، علاج البشرة، حقن، ليزر، استشارة جلدية",
      keywordsEn:
        "Rejuvera, dermatology Riyadh, aesthetic clinic, medical aesthetics, laser, injectables, skin treatments",
    },
    services: {
      titleAr: "خدمات المركز الطبية والتجميلية",
      titleEn: "Medical & Aesthetic Services",
      descriptionAr:
        "اطلعي على الخدمات المعتمدة في Rejuvera Center: جلسات بشرة، حقن، ليزر، وعناية متخصصة بإشراف أطباء.",
      descriptionEn:
        "Explore Rejuvera Center's approved services: skin care, injectables, laser, and specialised treatments under medical supervision.",
      keywordsAr: "خدمات تجميل، عناية بالبشرة، حقن، ليزر، الرياض",
      keywordsEn: "aesthetic services, skin care, injectables, laser, Riyadh",
    },
    doctors: {
      titleAr: "الأطباء — تخصصات وخبرات معتمدة",
      titleEn: "Our Doctors — Certified Specialists",
      descriptionAr:
        "تعرّفي على فريق الأطباء في Rejuvera Center: تخصصات واضحة، شهادات معتمدة، وخبرة في الجلدية والتجميل الطبي.",
      descriptionEn:
        "Meet the medical team at Rejuvera Center — board-specialised dermatologists and aesthetic physicians with verified credentials.",
      keywordsAr: "أطباء جلدية، استشاري، تجميل، الرياض",
      keywordsEn: "dermatologists, aesthetic physicians, Riyadh",
    },
    devices: {
      titleAr: "الأجهزة الطبية والتقنيات المعتمدة",
      titleEn: "Approved Medical Devices & Technologies",
      descriptionAr:
        "أجهزة معتمدة دوليًا تستخدم في الخدمات العلاجية داخل المركز، مع توضيح لكل تقنية ودورها.",
      descriptionEn:
        "FDA/CE-cleared devices used in treatments at Rejuvera Center, with a clear explanation of each technology.",
      keywordsAr: "أجهزة طبية، ليزر، تقنيات تجميل، الرياض",
      keywordsEn: "medical devices, laser, aesthetic technologies",
    },
    gallery: {
      titleAr: "نتائج وقصص العناية — المعرض",
      titleEn: "Results & Care Stories — Gallery",
      descriptionAr:
        "مشاهد من الخدمات والنتائج داخل Rejuvera Center، بتوضيح الحالة قبل وبعد ضمن خطة علاجية واضحة.",
      descriptionEn:
        "Curated before-and-after visuals from Rejuvera Center's treatments, presented within a transparent clinical plan.",
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
      titleAr: "عن Rejuvera Center",
      titleEn: "About Rejuvera Center",
      descriptionAr:
        "تعرّفي على رؤية مركز طبي تجميلي متكامل يقدم خدمات البشرة والجسم والتجميل بخطط واضحة ومتابعة منظمة.",
      descriptionEn:
        "Learn about Rejuvera Center's philosophy: dermatology and aesthetic care guided by clear diagnosis and thoughtful planning.",
      keywordsAr: "عن المركز، فريق طبي، رؤية",
      keywordsEn: "about the clinic, medical team, philosophy",
    },
    contact: {
      titleAr: "التواصل والحجز — Rejuvera Center",
      titleEn: "Contact & Booking — Rejuvera Center",
      descriptionAr:
        "احجزي استشارتك في Rejuvera Center الرياض. واتساب، هاتف، بريد إلكتروني، وخرائط الموقع.",
      descriptionEn:
        "Book your consultation at Rejuvera Center in Riyadh. WhatsApp, phone, email, and map.",
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
      positionTitle: user.positionTitle ?? undefined,
      department: user.department ?? undefined,
      isActive: user.isActive,
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

  const requestedServiceSlugs = (input.serviceSlugs ?? []).filter(Boolean);
  const serviceConnect = requestedServiceSlugs.length
    ? await prisma.service.findMany({
        where: { slug: { in: requestedServiceSlugs } },
        select: { slug: true },
      })
    : [];

  const doctor = await prisma.doctor.create({
    data: {
      slug: input.slug,
      nameAr: input.name,
      nameEn: input.nameEn || null,
      titleAr: input.title,
      titleEn: input.titleEn || null,
      specialtyAr: input.specialty,
      specialtyEn: input.specialtyEn || null,
      bioAr: input.bio ?? input.summary,
      bioEn: input.bioEn || null,
      languages: input.languages,
      yearsExperience: input.yearsExperience,
      education: [],
      publications: input.summary ? [input.summary] : [],
      achievements: [],
      status: input.status ?? ContentStatus.DRAFT,
      isFeatured: input.featured ?? false,
      photoUrl: input.photoUrl ?? null,
      coverImageUrl: input.coverImageUrl ?? input.photoUrl ?? null,
      ...(serviceConnect.length
        ? {
            services: {
              connect: serviceConnect.map((service) => ({
                slug: service.slug,
              })),
            },
          }
        : {}),
    },
  });

  return { mode: "database" as const, item: doctor };
}

export async function updateDoctorProfile(input: UpdateDoctorInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, item: input };
  }

  const serviceSlugs = Array.isArray(input.serviceSlugs)
    ? input.serviceSlugs.filter(Boolean)
    : undefined;
  const validServiceSlugs = serviceSlugs
    ? (
        await prisma.service.findMany({
          where: { slug: { in: serviceSlugs } },
          select: { slug: true },
        })
      ).map((service) => service.slug)
    : undefined;
  const data = {
    slug: input.slug,
    nameAr: input.name,
    nameEn: input.nameEn || null,
    titleAr: input.title,
    titleEn: input.titleEn || null,
    specialtyAr: input.specialty,
    specialtyEn: input.specialtyEn || null,
    bioAr: input.bio,
    bioEn: input.bioEn || null,
    languages: input.languages,
    yearsExperience: input.yearsExperience,
    publications: input.summary ? [input.summary] : [],
    status: input.status,
    isFeatured: input.featured,
    photoUrl: input.photoUrl || null,
    coverImageUrl: input.coverImageUrl || input.photoUrl || null,
    ...(Array.isArray(validServiceSlugs)
      ? {
          services: {
            set: validServiceSlugs.map((slug) => ({ slug })),
          },
        }
      : {}),
  };
  const doctor = await prisma.doctor.upsert({
    where: { id: input.id },
    update: data,
    create: {
      id: input.id,
      slug: input.slug,
      nameAr: input.name,
      nameEn: input.nameEn || null,
      titleAr: input.title,
      titleEn: input.titleEn || null,
      specialtyAr: input.specialty,
      specialtyEn: input.specialtyEn || null,
      bioAr: input.bio,
      bioEn: input.bioEn || null,
      languages: input.languages,
      yearsExperience: input.yearsExperience,
      publications: input.summary ? [input.summary] : [],
      status: input.status,
      isFeatured: input.featured,
      photoUrl: input.photoUrl || null,
      coverImageUrl: input.coverImageUrl || input.photoUrl || null,
      ...(Array.isArray(validServiceSlugs) && validServiceSlugs.length
        ? {
            services: {
              connect: validServiceSlugs.map((slug) => ({ slug })),
            },
          }
        : {}),
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
      positionTitle: input.positionTitle || null,
      department: input.department || null,
      isActive: input.isActive ?? true,
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
    data: {
      role: input.role,
      positionTitle: input.positionTitle || null,
      department: input.department || null,
      ...(typeof input.isActive === "boolean"
        ? { isActive: input.isActive }
        : {}),
    },
  });

  return { mode: "database" as const, item: user };
}

export async function createServiceDraft(input: CreateServiceInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, item: input };
  }

  const doctorSlugs = normalizeSlugList(input.doctorSlugs);
  const deviceSlugs = normalizeSlugList(input.deviceSlugs);
  const category = input.categoryId
    ? await prisma.serviceCategory.findUnique({
        where: { id: input.categoryId },
        select: { id: true, nameAr: true },
      })
    : null;
  const [relatedDoctors, relatedDevices] = await Promise.all([
    doctorSlugs.length ? ensureDoctorsForServiceSlugs(doctorSlugs) : [],
    deviceSlugs.length
      ? prisma.device.findMany({
          where: { slug: { in: deviceSlugs } },
          select: { id: true },
        })
      : [],
  ]);

  const service = await prisma.service.create({
    data: {
      slug: input.slug,
      nameAr: input.name,
      nameEn: input.nameEn || null,
      categoryKey: category?.nameAr ?? input.category,
      categoryId: category?.id ?? null,
      excerptAr: input.excerpt,
      excerptEn: input.excerptEn || null,
      descriptionAr: input.description,
      descriptionEn: input.descriptionEn || null,
      status: ContentStatus.DRAFT,
      ...(input.coverImageUrl
        ? {
            coverImageUrl: input.coverImageUrl,
          }
        : {}),
      ...(relatedDoctors.length
        ? {
            doctors: {
              connect: relatedDoctors.map((doctor) => ({ id: doctor.id })),
            },
          }
        : {}),
      ...(relatedDevices.length
        ? {
            devices: {
              connect: relatedDevices.map((device) => ({ id: device.id })),
            },
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
      nameEn: input.nameEn || null,
      excerptAr: input.excerpt,
      excerptEn: input.excerptEn || null,
      descriptionAr: input.description,
      descriptionEn: input.descriptionEn || null,
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
      titleEn: input.titleEn || null,
      excerptAr: input.excerpt,
      excerptEn: input.excerptEn || null,
      bodyAr: input.body,
      coverImageUrl: input.coverImageUrl ?? serviceImages.laser,
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

  const publishedAt =
    status === ContentStatus.PUBLISHED ? new Date() : undefined;
  const seed = seedJournalPosts.find((post) => post.slug === slug);
  const post = await prisma.journalPost.upsert({
    where: { slug },
    update: {
      status,
      ...(publishedAt ? { publishedAt } : {}),
    },
    create: seed
      ? {
          id: seed.id,
          slug: seed.slug,
          titleAr: seed.title,
          titleEn: seed.titleEn || null,
          excerptAr: seed.excerpt,
          excerptEn: seed.excerptEn || null,
          bodyAr: [...seed.body],
          coverImageUrl: seed.coverImageUrl,
          categoryKey: seed.category,
          readingTimeLabel: seed.readingTime,
          relatedServiceSlugs: [...seed.relatedServiceSlugs],
          relatedDoctorSlugs: [...seed.relatedDoctorSlugs],
          status,
          publishedAt: publishedAt ?? new Date(seed.publishedAt),
        }
      : {
          slug,
          titleAr: slug,
          excerptAr: "",
          bodyAr: [],
          coverImageUrl: serviceImages.journal,
          categoryKey: "عام",
          relatedServiceSlugs: [],
          relatedDoctorSlugs: [],
          status,
          ...(publishedAt ? { publishedAt } : {}),
        },
  });

  return { mode: "database" as const, item: post };
}

export async function updateJournalPost(input: UpdateJournalPostInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, item: input };
  }

  const data = {
    slug: input.slug,
    titleAr: input.title,
    titleEn: input.titleEn || null,
    excerptAr: input.excerpt,
    excerptEn: input.excerptEn || null,
    bodyAr: input.body,
    coverImageUrl: input.coverImageUrl ?? serviceImages.journal,
    categoryKey: input.category,
    readingTimeLabel: input.readingTime,
    relatedServiceSlugs: input.relatedServiceSlugs,
    relatedDoctorSlugs: input.relatedDoctorSlugs,
    status: input.status,
    ...(input.status === ContentStatus.PUBLISHED
      ? { publishedAt: new Date() }
      : {}),
  };

  const post = await prisma.journalPost.upsert({
    where: { id: input.id },
    update: data,
    create: {
      id: input.id,
      ...data,
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
  titleEn?: string | undefined;
  category: string;
  description: string;
  descriptionEn?: string | undefined;
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeImageAlt: string;
  afterImageAlt: string;
  /** 0–100, default 50. Backwards compatible. */
  initialSplitPercent?: number;
  status?: ContentStatus | undefined;
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
      titleEn: input.titleEn || null,
      categoryKey: input.category,
      descriptionAr: input.description,
      descriptionEn: input.descriptionEn || null,
      beforeImageUrl: input.beforeImageUrl,
      afterImageUrl: input.afterImageUrl,
      beforeImageAlt: input.beforeImageAlt,
      afterImageAlt: input.afterImageAlt,
      status: input.status ?? ContentStatus.PUBLISHED,
      initialSplitPercent: input.initialSplitPercent ?? 50,
    },
  });

  return { mode: "database" as const, item };
}

export async function updateGalleryItem(input: UpdateGalleryItemInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, input };
  }

  const data = {
    slug: input.slug,
    titleAr: input.title,
    titleEn: input.titleEn || null,
    categoryKey: input.category,
    descriptionAr: input.description,
    descriptionEn: input.descriptionEn || null,
    beforeImageUrl: input.beforeImageUrl,
    afterImageUrl: input.afterImageUrl,
    beforeImageAlt: input.beforeImageAlt,
    afterImageAlt: input.afterImageAlt,
    initialSplitPercent: input.initialSplitPercent ?? 50,
    ...(input.status ? { status: input.status } : {}),
  };

  const item = await prisma.galleryItem.upsert({
    where: { id: input.id },
    update: data,
    create: {
      id: input.id,
      slug: input.slug,
      titleAr: input.title,
      titleEn: input.titleEn || null,
      categoryKey: input.category,
      descriptionAr: input.description,
      descriptionEn: input.descriptionEn || null,
      beforeImageUrl: input.beforeImageUrl,
      afterImageUrl: input.afterImageUrl,
      beforeImageAlt: input.beforeImageAlt,
      afterImageAlt: input.afterImageAlt,
      initialSplitPercent: input.initialSplitPercent ?? 50,
      status: input.status ?? ContentStatus.PUBLISHED,
    },
  });

  return { mode: "database" as const, item };
}

export async function updateGalleryItemStatus(
  id: string,
  status: ContentStatus,
) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id, status };
  }
  const seed = seedGallery.find((item) => item.id === id);
  const item = await prisma.galleryItem.upsert({
    where: { id },
    update: { status },
    create: seed
      ? {
          id: seed.id,
          slug: seed.slug,
          titleAr: seed.title,
          titleEn: seed.titleEn || null,
          categoryKey: seed.category,
          descriptionAr: seed.description,
          descriptionEn: seed.descriptionEn || null,
          beforeImageUrl: seed.beforeImageUrl,
          afterImageUrl: seed.afterImageUrl,
          beforeImageAlt: seed.beforeImageAlt,
          afterImageAlt: seed.afterImageAlt,
          initialSplitPercent: seed.initialSplitPercent,
          status,
        }
      : {
          id,
          slug: id,
          titleAr: id,
          categoryKey: "عام",
          beforeImageUrl: "/media/brand/logo-light.png",
          afterImageUrl: "/media/brand/logo-light.png",
          status,
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

export async function createContactLead(
  input: CreateContactInput & {
    webhookId?: string | undefined;
    tags?: readonly string[] | undefined;
    status?: SubmissionStatus | undefined;
  },
) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, input };
  }

  const duplicateWindowMinutes = Math.max(
    0,
    Number(process.env.LEAD_DEDUP_WINDOW_MINUTES ?? 12 * 60),
  );
  const shortDuplicateWindowMinutes = Math.max(
    0,
    Number(process.env.LEAD_SHORT_DEDUP_WINDOW_MINUTES ?? 30),
  );
  const source = input.source?.trim() || "Website form";
  const refreshDuplicate = async (id: string) =>
    prisma.contactSubmission.update({
      where: { id },
      data: {
        updatedAt: new Date(),
        fullName: input.fullName,
        preferredLanguage: input.preferredLanguage ?? "ar",
        source,
        ...(input.email ? { email: input.email } : {}),
        ...(input.message ? { message: input.message } : {}),
        ...(input.utmSource ? { utmSource: input.utmSource } : {}),
        ...(input.utmMedium ? { utmMedium: input.utmMedium } : {}),
        ...(input.utmCampaign ? { utmCampaign: input.utmCampaign } : {}),
        ...(input.utmContent ? { utmContent: input.utmContent } : {}),
        ...(input.referrerUrl ? { referrerUrl: input.referrerUrl } : {}),
        ...(input.landingPageUrl ? { landingPageUrl: input.landingPageUrl } : {}),
        ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
        ...(input.country ? { country: input.country } : {}),
        ...(input.userAgent ? { userAgent: input.userAgent } : {}),
        ...(input.notes ? { internalNotes: input.notes } : {}),
      },
    });

  if (shortDuplicateWindowMinutes > 0) {
    const duplicateSince = new Date(
      Date.now() - shortDuplicateWindowMinutes * 60 * 1000,
    );
    const duplicate = await prisma.contactSubmission.findFirst({
      where: {
        phone: input.phone,
        createdAt: { gte: duplicateSince },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    if (duplicate) {
      return {
        mode: "duplicate" as const,
        submission: await refreshDuplicate(duplicate.id),
      };
    }
  }

  if (duplicateWindowMinutes > 0) {
    const duplicateSince = new Date(
      Date.now() - duplicateWindowMinutes * 60 * 1000,
    );
    const duplicate = await prisma.contactSubmission.findFirst({
      where: {
        phone: input.phone,
        createdAt: { gte: duplicateSince },
        OR: [
          { source },
          ...(input.webhookId ? [{ webhookId: input.webhookId }] : []),
        ],
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    if (duplicate) {
      return {
        mode: "duplicate" as const,
        submission: await refreshDuplicate(duplicate.id),
      };
    }
  }

  const service = input.serviceSlug
    ? await prisma.service.findFirst({
        where: {
          OR: [
            { slug: input.serviceSlug },
            { nameAr: input.serviceSlug },
            { nameEn: input.serviceSlug },
          ],
        },
        select: { id: true },
      })
    : null;
  const submission = await prisma.contactSubmission.create({
    data: {
      fullName: input.fullName,
      phone: input.phone,
      preferredLanguage: input.preferredLanguage ?? "ar",
      source,
      status: input.status ?? SubmissionStatus.NEW,
      ...(input.utmSource ? { utmSource: input.utmSource } : {}),
      ...(input.utmMedium ? { utmMedium: input.utmMedium } : {}),
      ...(input.utmCampaign ? { utmCampaign: input.utmCampaign } : {}),
      ...(input.utmContent ? { utmContent: input.utmContent } : {}),
      ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
      ...(input.country ? { country: input.country } : {}),
      ...(input.referrerUrl ? { referrerUrl: input.referrerUrl } : {}),
      ...(input.landingPageUrl ? { landingPageUrl: input.landingPageUrl } : {}),
      ...(input.userAgent ? { userAgent: input.userAgent } : {}),
      ...(input.notes ? { internalNotes: input.notes } : {}),
      ...(input.tags && input.tags.length ? { tags: [...input.tags] } : {}),
      ...(input.webhookId ? { webhookId: input.webhookId } : {}),
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

export async function deleteErrorLog(id: string) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id };
  }
  await prisma.errorLog.delete({ where: { id } });
  return { mode: "database" as const, id };
}

export async function clearErrorLogs(options: { onlyResolved?: boolean } = {}) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, deleted: 0 };
  }
  const where = options.onlyResolved ? { isResolved: true } : {};
  const result = await prisma.errorLog.deleteMany({ where });
  return { mode: "database" as const, deleted: result.count };
}

export async function deleteAppLog(id: string) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id };
  }
  try {
    const client = prisma as unknown as {
      appLog?: {
        delete: (args: { where: { id: string } }) => Promise<unknown>;
      };
    };
    if (!client.appLog) return { mode: "noop" as const, id };
    await client.appLog.delete({ where: { id } });
    return { mode: "database" as const, id };
  } catch {
    return { mode: "noop" as const, id };
  }
}

export async function clearAppLogs(options: { level?: string } = {}) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, deleted: 0 };
  }
  try {
    const client = prisma as unknown as {
      appLog?: {
        deleteMany: (args: {
          where: Record<string, unknown>;
        }) => Promise<{ count: number }>;
      };
    };
    if (!client.appLog) return { mode: "noop" as const, deleted: 0 };
    const where: Record<string, unknown> = {};
    if (options.level && options.level !== "all") where.level = options.level;
    const result = await client.appLog.deleteMany({ where });
    return { mode: "database" as const, deleted: result.count };
  } catch {
    return { mode: "noop" as const, deleted: 0 };
  }
}

export type AuditLogRecord = {
  id: string;
  actorUserId: string;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export async function getAuditLogs(
  options: { limit?: number } = {},
): Promise<AuditLogRecord[]> {
  if (!canUseDatabase()) {
    return [];
  }
  const limit = Math.min(Math.max(options.limit ?? 100, 1), 500);
  try {
    const rows = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { actor: { select: { name: true, email: true } } },
    });
    return rows.map((row) => ({
      id: row.id,
      actorUserId: row.actorUserId,
      actorName: row.actor?.name ?? row.actor?.email ?? null,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId ?? null,
      metadata:
        row.metadata &&
        typeof row.metadata === "object" &&
        !Array.isArray(row.metadata)
          ? (row.metadata as Record<string, unknown>)
          : null,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function recordAuditLog(input: {
  actorUserId?: string | undefined;
  action: string;
  entityType: string;
  entityId?: string | null | undefined;
  metadata?: Record<string, unknown> | undefined;
}) {
  if (!canUseDatabase() || !input.actorUserId) {
    return { mode: "skipped" as const };
  }

  try {
    const item = await prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
    return { mode: "database" as const, item };
  } catch {
    return { mode: "skipped" as const };
  }
}

export async function updateCrmSubmission(input: UpdateCrmSubmissionInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, input };
  }

  let serviceUpdate: { serviceId: string | null } | undefined;
  if (input.serviceSlug !== undefined) {
    if (!input.serviceSlug) {
      serviceUpdate = { serviceId: null };
    } else {
      const service = await prisma.service.findUnique({
        where: { slug: input.serviceSlug },
        select: { id: true },
      });
      serviceUpdate = { serviceId: service?.id ?? null };
    }
  }
  const submission = await prisma.contactSubmission.update({
    where: { id: input.id },
    data: {
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.notes !== undefined
        ? { internalNotes: input.notes ?? null }
        : {}),
      ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.email !== undefined ? { email: input.email || null } : {}),
      ...(input.source !== undefined ? { source: input.source || null } : {}),
      ...(input.tags !== undefined ? { tags: [...input.tags] } : {}),
      ...(input.assignedToId !== undefined
        ? { assignedToId: input.assignedToId || null }
        : {}),
      ...(serviceUpdate ?? {}),
    },
  });

  return { mode: "database" as const, item: submission };
}

export async function deleteCrmSubmission(id: string) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id };
  }
  const item = await prisma.contactSubmission.delete({ where: { id } });
  return { mode: "database" as const, item };
}

export async function addCrmComment(input: {
  submissionId: string;
  body: string;
  authorId?: string | undefined;
  authorName?: string | undefined;
}) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, input };
  }
  const item = await prisma.crmComment.create({
    data: {
      submissionId: input.submissionId,
      body: input.body,
      authorId: input.authorId ?? null,
      authorName: input.authorName ?? null,
    },
  });
  return { mode: "database" as const, item };
}

export async function deleteCrmComment(id: string) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id };
  }
  const item = await prisma.crmComment.delete({ where: { id } });
  return { mode: "database" as const, item };
}

/* ── Custom Pages ────────────────────────────────────────── */

function mapCustomPageRecord(p: {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string | null;
  htmlContent: string;
  seoTitle: string | null;
  seoDescription: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  seoSlug: string | null;
  hashtags: string[];
  formConfig: Prisma.JsonValue | null;
  leadWebhookEnabled: boolean;
  leadWebhookUrl: string | null;
  leadWebhookSecret: string | null;
  leadWebhookLabel: string | null;
  status: ContentStatus;
  noindex: boolean;
  createdAt: Date;
  updatedAt: Date;
}): CustomPageRecord {
  return {
    id: p.id,
    slug: p.slug,
    titleAr: p.titleAr,
    titleEn: p.titleEn,
    htmlContent: p.htmlContent,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    keywords: p.keywords,
    ogTitle: p.ogTitle,
    ogDescription: p.ogDescription,
    ogImage: p.ogImage,
    seoSlug: p.seoSlug,
    hashtags: p.hashtags,
    formConfig: p.formConfig,
    leadWebhookEnabled: p.leadWebhookEnabled,
    leadWebhookUrl: p.leadWebhookUrl,
    leadWebhookSecret: p.leadWebhookSecret,
    leadWebhookLabel: p.leadWebhookLabel,
    status: p.status,
    noindex: p.noindex,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function customPageData(input: CreateCustomPageInput) {
  const seoTitle = input.seoTitle || input.metaTitle || null;
  const seoDescription = input.seoDescription || input.metaDescription || null;
  return {
    slug: input.slug,
    titleAr: input.titleAr,
    titleEn: input.titleEn || null,
    htmlContent: input.htmlContent,
    seoTitle,
    seoDescription,
    metaTitle: input.metaTitle || seoTitle,
    metaDescription: input.metaDescription || seoDescription,
    keywords: [...(input.keywords ?? [])],
    ogTitle: input.ogTitle || null,
    ogDescription: input.ogDescription || null,
    ogImage: input.ogImage || null,
    seoSlug: input.seoSlug || null,
    hashtags: [...(input.hashtags ?? [])],
    ...(input.formConfig !== undefined ? { formConfig: input.formConfig } : {}),
    leadWebhookEnabled: input.leadWebhookEnabled ?? false,
    leadWebhookUrl: input.leadWebhookUrl?.trim() || null,
    leadWebhookSecret: input.leadWebhookSecret?.trim() || null,
    leadWebhookLabel: input.leadWebhookLabel?.trim() || null,
    status: input.status ?? ContentStatus.DRAFT,
    noindex: input.noindex ?? false,
  };
}

export type CustomPageLeadWebhookConfig = {
  id: string;
  slug: string;
  titleAr: string;
  leadWebhookEnabled: boolean;
  leadWebhookUrl?: string | null;
  leadWebhookSecret?: string | null;
  leadWebhookLabel?: string | null;
};

export async function getCustomPageLeadWebhookBySlug(
  slug: string,
): Promise<CustomPageLeadWebhookConfig | null> {
  if (!canUseDatabase()) return null;
  const safeSlug = slug.trim();
  if (!safeSlug) return null;
  try {
    const page = await prisma.customPage.findFirst({
      where: { OR: [{ slug: safeSlug }, { seoSlug: safeSlug }] },
      select: {
        id: true,
        slug: true,
        titleAr: true,
        leadWebhookEnabled: true,
        leadWebhookUrl: true,
        leadWebhookSecret: true,
        leadWebhookLabel: true,
      },
    });
    return page;
  } catch {
    return null;
  }
}

export async function getCustomPages(): Promise<CustomPageRecord[]> {
  if (!canUseDatabase()) return [];
  try {
    const items = await prisma.customPage.findMany({
      orderBy: [{ updatedAt: "desc" }],
    });
    return items.map(mapCustomPageRecord);
  } catch {
    return [];
  }
}

export async function getCustomPageBySlug(
  slug: string,
): Promise<CustomPageRecord | null> {
  if (!canUseDatabase()) return null;
  try {
    const p = await prisma.customPage.findFirst({
      where: { OR: [{ slug }, { seoSlug: slug }] },
    });
    if (!p) return null;
    return mapCustomPageRecord(p);
  } catch {
    return null;
  }
}

export async function getCustomPageById(
  id: string,
): Promise<CustomPageRecord | null> {
  if (!canUseDatabase()) return null;
  try {
    const p = await prisma.customPage.findUnique({ where: { id } });
    if (!p) return null;
    return mapCustomPageRecord(p);
  } catch {
    return null;
  }
}

export async function createCustomPage(input: CreateCustomPageInput) {
  if (!canUseDatabase()) return { mode: "preview" as const, input };
  const item = await prisma.customPage.create({
    data: customPageData(input),
  });
  return { mode: "database" as const, item };
}

export async function updateCustomPage(input: UpdateCustomPageInput) {
  if (!canUseDatabase()) return { mode: "preview" as const, input };
  const item = await prisma.customPage.update({
    where: { id: input.id },
    data: customPageData(input),
  });
  return { mode: "database" as const, item };
}

export async function upsertCustomPageBySlug(input: UpsertCustomPageInput) {
  if (!canUseDatabase()) return { mode: "preview" as const, input };
  const data = customPageData(input);
  const item = await prisma.customPage.upsert({
    where: { slug: input.slug },
    create: data,
    update: data,
  });
  return { mode: "database" as const, item };
}

export async function deleteCustomPage(id: string) {
  if (!canUseDatabase()) return { mode: "preview" as const, id };
  const item = await prisma.customPage.delete({ where: { id } });
  return { mode: "database" as const, item };
}

/* ── Webhooks ─────────────────────────────────────────────── */

function generateWebhookToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  // Fallback: 32-char hex from random
  let out = "";
  while (out.length < 32) {
    out += Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, "0");
  }
  return out.slice(0, 32);
}

export async function getWebhooks(): Promise<WebhookRecord[]> {
  if (!canUseDatabase()) return [];
  try {
    const items = await prisma.webhook.findMany({
      include: {
        service: { select: { nameAr: true } },
        events: {
          orderBy: [{ createdAt: "desc" }],
          take: 5,
        },
        _count: { select: { events: true } },
      },
      orderBy: [{ updatedAt: "desc" }],
    });
    return items.map((w) => ({
      id: w.id,
      name: w.name,
      token: w.token,
      isActive: w.isActive,
      defaultStatus: w.defaultStatus,
      defaultTags: w.defaultTags,
      defaultSource: w.defaultSource,
      serviceId: w.serviceId,
      serviceLabel: w.service?.nameAr ?? null,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
      recentEvents: w.events.map((e) => ({
        id: e.id,
        statusCode: e.statusCode,
        errorMessage: e.errorMessage,
        createdAt: e.createdAt.toISOString(),
      })),
      totalEvents: w._count.events,
    }));
  } catch {
    return [];
  }
}

export async function getWebhookByToken(token: string) {
  if (!canUseDatabase()) return null;
  try {
    return await prisma.webhook.findUnique({
      where: { token },
      include: { service: { select: { id: true, nameAr: true, slug: true } } },
    });
  } catch {
    return null;
  }
}

export async function createWebhook(input: CreateWebhookInput) {
  if (!canUseDatabase()) return { mode: "preview" as const, input };
  const service = input.serviceSlug
    ? await prisma.service.findUnique({
        where: { slug: input.serviceSlug },
        select: { id: true },
      })
    : null;
  const item = await prisma.webhook.create({
    data: {
      name: input.name,
      token: generateWebhookToken(),
      defaultStatus: input.defaultStatus ?? SubmissionStatus.NEW,
      defaultTags: input.defaultTags ? [...input.defaultTags] : [],
      defaultSource: input.defaultSource || null,
      serviceId: service?.id ?? null,
    },
  });
  return { mode: "database" as const, item };
}

export async function updateWebhook(input: UpdateWebhookInput) {
  if (!canUseDatabase()) return { mode: "preview" as const, input };
  const service = input.serviceSlug
    ? await prisma.service.findUnique({
        where: { slug: input.serviceSlug },
        select: { id: true },
      })
    : null;
  const item = await prisma.webhook.update({
    where: { id: input.id },
    data: {
      name: input.name,
      isActive: input.isActive,
      defaultStatus: input.defaultStatus,
      defaultTags: [...input.defaultTags],
      defaultSource: input.defaultSource || null,
      serviceId: input.serviceSlug ? (service?.id ?? null) : null,
    },
  });
  return { mode: "database" as const, item };
}

export async function deleteWebhook(id: string) {
  if (!canUseDatabase()) return { mode: "preview" as const, id };
  const item = await prisma.webhook.delete({ where: { id } });
  return { mode: "database" as const, item };
}

export async function rotateWebhookToken(id: string) {
  if (!canUseDatabase()) return { mode: "preview" as const, id };
  const item = await prisma.webhook.update({
    where: { id },
    data: { token: generateWebhookToken() },
  });
  return { mode: "database" as const, item };
}

export async function recordWebhookEvent(input: {
  webhookId: string;
  payload: unknown;
  statusCode: number;
  errorMessage?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}) {
  if (!canUseDatabase()) return null;
  try {
    return await prisma.webhookEvent.create({
      data: {
        webhookId: input.webhookId,
        payload: input.payload as object,
        statusCode: input.statusCode,
        errorMessage: input.errorMessage ?? null,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch {
    return null;
  }
}

export async function getMediaSelections(): Promise<MediaSelections> {
  const runtimeSettings = await getRuntimeSettings();
  return runtimeSettings.media;
}

/* ── Service category CRUD ───────────────────────────────── */

export async function createServiceCategory(input: CreateServiceCategoryInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, item: input };
  }

  const item = await prisma.serviceCategory.create({
    data: {
      slug: input.slug,
      nameAr: input.name,
      nameEn: input.nameEn || null,
      descriptionAr: input.description || null,
      descriptionEn: input.descriptionEn || null,
      status: input.status ?? ContentStatus.PUBLISHED,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  return { mode: "database" as const, item };
}

export async function updateServiceCategory(input: UpdateServiceCategoryInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, item: input };
  }

  const item = await prisma.serviceCategory.update({
    where: { id: input.id },
    data: {
      slug: input.slug,
      nameAr: input.name,
      nameEn: input.nameEn || null,
      descriptionAr: input.description || null,
      descriptionEn: input.descriptionEn || null,
      status: input.status ?? ContentStatus.PUBLISHED,
      sortOrder: input.sortOrder ?? 0,
    },
  });

  await prisma.service.updateMany({
    where: { categoryId: item.id },
    data: { categoryKey: item.nameAr },
  });

  return { mode: "database" as const, item };
}

export async function deleteServiceCategory(id: string) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id };
  }

  const item = await prisma.serviceCategory.delete({ where: { id } });
  return { mode: "database" as const, item };
}

/* ── Service CRUD (extra) ────────────────────────────────── */

function normalizeSlugList(slugs?: string[]): string[] {
  return Array.from(
    new Set((slugs ?? []).map((slug) => slug.trim()).filter(Boolean)),
  );
}

async function ensureDoctorsForServiceSlugs(slugs: string[]) {
  if (!slugs.length) return [];

  const existingDoctors = await prisma.doctor.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const existingSlugs = new Set(existingDoctors.map((doctor) => doctor.slug));
  const missingSeedDoctors = seedDoctors.filter(
    (doctor) => slugs.includes(doctor.slug) && !existingSlugs.has(doctor.slug),
  );

  if (!missingSeedDoctors.length) return existingDoctors;

  const createdDoctors = await Promise.all(
    missingSeedDoctors.map((doctor) =>
      prisma.doctor.upsert({
        where: { slug: doctor.slug },
        update: {},
        create: {
          slug: doctor.slug,
          nameAr: doctor.name,
          nameEn: doctor.nameEn || null,
          titleAr: doctor.title,
          titleEn: doctor.titleEn || null,
          specialtyAr: doctor.specialty,
          specialtyEn: doctor.specialtyEn || null,
          bioAr: doctor.bio,
          bioEn: doctor.bioEn || null,
          photoUrl: doctor.photoUrl,
          coverImageUrl: doctor.coverImageUrl || doctor.photoUrl,
          yearsExperience: doctor.yearsExperience,
          languages: [...doctor.languages],
          education: [...doctor.education],
          achievements: [...doctor.achievements],
          publications: [...doctor.publications],
          status: doctor.status,
          isFeatured: doctor.featured,
        },
        select: { id: true, slug: true },
      }),
    ),
  );

  return [...existingDoctors, ...createdDoctors];
}

export async function updateService(input: UpdateServiceInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, input };
  }
  const doctorSlugs = Array.isArray(input.doctorSlugs)
    ? normalizeSlugList(input.doctorSlugs)
    : undefined;
  const deviceSlugs = Array.isArray(input.deviceSlugs)
    ? normalizeSlugList(input.deviceSlugs)
    : undefined;
  const category = input.categoryId
    ? await prisma.serviceCategory.findUnique({
        where: { id: input.categoryId },
        select: { id: true, nameAr: true },
      })
    : null;
  const [relatedDoctors, relatedDevices] = await withDatabaseRetry(() =>
    Promise.all([
      Array.isArray(doctorSlugs) && doctorSlugs.length
        ? ensureDoctorsForServiceSlugs(doctorSlugs)
        : [],
      Array.isArray(deviceSlugs) && deviceSlugs.length
        ? prisma.device.findMany({
            where: { slug: { in: deviceSlugs } },
            select: { id: true, slug: true },
          })
        : [],
    ]),
  );
  const data = {
    slug: input.slug,
    nameAr: input.name,
    nameEn: input.nameEn || null,
    categoryKey: category?.nameAr ?? input.category,
    categoryId: category?.id ?? null,
    excerptAr: input.excerpt,
    excerptEn: input.excerptEn || null,
    descriptionAr: input.description,
    descriptionEn: input.descriptionEn || null,
    status: input.status,
    isFeatured: input.featured,
    ...(input.coverImageUrl ? { coverImageUrl: input.coverImageUrl } : {}),
    ...(Array.isArray(doctorSlugs)
      ? {
          doctors: {
            set: relatedDoctors.map((doctor) => ({ id: doctor.id })),
          },
        }
      : {}),
    ...(Array.isArray(deviceSlugs)
      ? {
          devices: {
            set: relatedDevices.map((device) => ({ id: device.id })),
          },
        }
      : {}),
  };
  const item = await withDatabaseRetry(() =>
    prisma.service.upsert({
      where: { id: input.id },
      update: data,
      create: {
        id: input.id,
        slug: input.slug,
        nameAr: input.name,
        nameEn: input.nameEn || null,
        categoryKey: category?.nameAr ?? input.category,
        categoryId: category?.id ?? null,
        excerptAr: input.excerpt,
        excerptEn: input.excerptEn || null,
        descriptionAr: input.description,
        descriptionEn: input.descriptionEn || null,
        status: input.status,
        isFeatured: input.featured,
        ...(input.coverImageUrl ? { coverImageUrl: input.coverImageUrl } : {}),
        ...(Array.isArray(doctorSlugs)
          ? {
              doctors: {
                connect: relatedDoctors.map((doctor) => ({ id: doctor.id })),
              },
            }
          : {}),
        ...(Array.isArray(deviceSlugs)
          ? {
              devices: {
                connect: relatedDevices.map((device) => ({ id: device.id })),
              },
            }
          : {}),
      },
      include: {
        doctors: { select: { slug: true } },
        devices: { select: { slug: true } },
      },
    }),
  );
  return { mode: "database" as const, item };
}

export async function updateServiceStatus(id: string, status: ContentStatus) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id, status };
  }
  const seed = seedServices.find((service) => service.id === id);
  const item = await prisma.service.upsert({
    where: { id },
    update: { status },
    create: seed
      ? {
          id: seed.id,
          slug: seed.slug,
          nameAr: seed.name,
          nameEn: seed.nameEn || null,
          categoryKey: seed.category,
          excerptAr: seed.excerpt,
          excerptEn: seed.excerptEn || null,
          descriptionAr: seed.description,
          descriptionEn: seed.descriptionEn || null,
          coverImageUrl: seed.coverImageUrl,
          status,
          isFeatured: seed.featured,
        }
      : {
          id,
          slug: id,
          nameAr: id,
          categoryKey: "عام",
          excerptAr: "",
          descriptionAr: "",
          status,
        },
  });
  return { mode: "database" as const, item };
}

export async function deleteService(id: string) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id };
  }
  const item = await prisma.service.delete({ where: { id } });
  return { mode: "database" as const, item };
}

/* ── Device CRUD (extra) ─────────────────────────────────── */

export async function updateDevice(input: UpdateDeviceInput) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, input };
  }
  const relatedServices = input.serviceSlugs.length
    ? await prisma.service.findMany({
        where: { slug: { in: input.serviceSlugs } },
        select: { id: true },
      })
    : [];
  const data = {
    slug: input.slug,
    nameAr: input.name,
    nameEn: input.nameEn || null,
    excerptAr: input.excerpt,
    excerptEn: input.excerptEn || null,
    descriptionAr: input.description,
    descriptionEn: input.descriptionEn || null,
    certifications: input.certifications,
    status: input.status,
    isFeatured: input.featured,
    ...(input.imageUrl ? { gallery: [input.imageUrl] } : {}),
    services: {
      set: relatedServices.map((service) => ({ id: service.id })),
    },
  };
  const item = await prisma.device.upsert({
    where: { id: input.id },
    update: data,
    create: {
      id: input.id,
      ...data,
      services: {
        connect: relatedServices.map((service) => ({ id: service.id })),
      },
    },
  });
  return { mode: "database" as const, item };
}

export async function updateDeviceStatus(id: string, status: ContentStatus) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id, status };
  }
  const seed = seedDevices.find((device) => device.id === id);
  const item = await prisma.device.upsert({
    where: { id },
    update: { status },
    create: seed
      ? {
          id: seed.id,
          slug: seed.slug,
          nameAr: seed.name,
          nameEn: seed.nameEn || null,
          excerptAr: seed.excerpt,
          excerptEn: seed.excerptEn || null,
          descriptionAr: seed.description,
          descriptionEn: seed.descriptionEn || null,
          gallery: [seed.imageUrl],
          certifications: [...seed.certifications],
          status,
        }
      : {
          id,
          slug: id,
          nameAr: id,
          descriptionAr: "",
          status,
        },
  });
  return { mode: "database" as const, item };
}

export async function deleteDevice(id: string) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id };
  }
  const item = await prisma.device.delete({ where: { id } });
  return { mode: "database" as const, item };
}

/* ── Doctor CRUD (extra) ─────────────────────────────────── */

export async function updateDoctorStatus(id: string, status: ContentStatus) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id, status };
  }
  const seed = seedDoctors.find((doctor) => doctor.id === id);
  const item = await prisma.doctor.upsert({
    where: { id },
    update: { status },
    create: seed
      ? {
          id: seed.id,
          slug: seed.slug,
          nameAr: seed.name,
          nameEn: seed.nameEn || null,
          titleAr: seed.title,
          titleEn: seed.titleEn || null,
          specialtyAr: seed.specialty,
          specialtyEn: seed.specialtyEn || null,
          bioAr: seed.bio,
          bioEn: seed.bioEn || null,
          photoUrl: seed.photoUrl,
          coverImageUrl: seed.coverImageUrl,
          education: [...seed.education],
          publications: [...seed.publications],
          achievements: [...seed.achievements],
          languages: [...seed.languages],
          yearsExperience: seed.yearsExperience,
          status,
          isFeatured: seed.featured,
        }
      : {
          id,
          slug: id,
          nameAr: id,
          titleAr: "",
          specialtyAr: "",
          bioAr: "",
          languages: [],
          status,
        },
  });
  return { mode: "database" as const, item };
}

export async function deleteDoctor(id: string) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id };
  }
  const item = await prisma.doctor.deleteMany({ where: { id } });
  return { mode: "database" as const, item };
}

/* ── Admin User delete ───────────────────────────────────── */

export async function deleteAdminUser(id: string) {
  if (!canUseDatabase()) {
    return { mode: "preview" as const, id };
  }
  const item = await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
  return { mode: "database" as const, item };
}
