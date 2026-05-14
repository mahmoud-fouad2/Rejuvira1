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
   * 0â€“100. Where the comparison slider should sit on first paint.
   * Defaults to 50 (split image evenly). Backwards-compatible â€” if absent,
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
    name: "Ø¯. Ù„Ø¤ÙŠ Ø§Ù„Ø³Ø§Ù„Ù…ÙŠ",
    title: "Ø§Ø³ØªØ´Ø§Ø±ÙŠ Ø¬Ø±Ø§Ø­Ø© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ ÙˆØ§Ù„ØªØ±Ù…ÙŠÙ…",
    specialty: "Ø¬Ø±Ø§Ø­Ø© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ ÙˆØ§Ù„ØªØ±Ù…ÙŠÙ…",
    summary:
      "Ø§Ù„ØªØ®Ø·ÙŠØ· Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠ Ø§Ù„Ø¯Ù‚ÙŠÙ‚ ÙŠØ¨Ø¯Ø£ Ù…Ù† ØªØ´Ø®ÙŠØµ ÙˆØ§Ø¶Ø­ ÙˆØ­Ø¯ÙˆØ¯ ÙˆØ§Ù‚Ø¹ÙŠØ© Ù„Ù„Ù†ØªÙŠØ¬Ø© Ù‚Ø¨Ù„ Ø£ÙŠ Ø¥Ø¬Ø±Ø§Ø¡.",
    bio: "ÙŠØ¹Ù…Ù„ Ø¯. Ù„Ø¤ÙŠ Ø§Ù„Ø³Ø§Ù„Ù…ÙŠ Ø¹Ù„Ù‰ ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© ÙˆØ§Ù„ØªØ¬Ù…ÙŠÙ„ÙŠØ© Ø¨Ù…Ù†Ù‡Ø¬ ÙˆØ§Ø¶Ø­ ÙŠÙˆØ§Ø²Ù† Ø¨ÙŠÙ† Ø§Ù„Ø³Ù„Ø§Ù…Ø© Ø§Ù„Ø·Ø¨ÙŠØ© ÙˆØ¯Ù‚Ø© Ø§Ù„ØªØ®Ø·ÙŠØ· ÙˆØªØ­Ø¯ÙŠØ¯ Ù…Ø§ ÙŠÙ…ÙƒÙ† ØªØ­Ù‚ÙŠÙ‚Ù‡ ÙØ¹Ù„ÙŠÙ‹Ø§ Ù„ÙƒÙ„ Ø­Ø§Ù„Ø©. ÙŠØ±ÙƒØ² ÙÙŠ Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø© Ø¹Ù„Ù‰ Ø´Ø±Ø­ Ø§Ù„Ø¨Ø¯Ø§Ø¦Ù„ ÙˆØ§Ù„Ø®Ø·Ø© Ø§Ù„Ù…ØªÙˆÙ‚Ø¹Ø© Ù‚Ø¨Ù„ Ø§Ø¹ØªÙ…Ø§Ø¯ Ø£ÙŠ ØªØ¯Ø®Ù„.",
    photoUrl: "/media/doctors/loai-alsalmi.png",
    coverImageUrl: "/media/doctors/loai-alsalmi.png",
    yearsExperience: 25,
    languages: ["Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©", "Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©"],
    education: [
      "Ø§Ø³ØªØ´Ø§Ø±ÙŠ Ø¬Ø±Ø§Ø­Ø© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ ÙˆØ§Ù„ØªØ±Ù…ÙŠÙ…",
      "Ø®Ø¨Ø±Ø© Ø³Ø±ÙŠØ±ÙŠØ© ÙÙŠ ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© Ø§Ù„Ù…Ø¹Ù‚Ø¯Ø©",
    ],
    achievements: [
      "ØªÙ‚ÙŠÙŠÙ… Ø¬Ø±Ø§Ø­ÙŠ Ù…Ù†Ø¸Ù… Ù‚Ø¨Ù„ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡",
      "Ø´Ø±Ø­ ÙˆØ§Ø¶Ø­ Ù„Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© ÙˆØ§Ù„ØªØ±Ù…ÙŠÙ…ÙŠØ©",
    ],
    publications: [
      "Ø§Ù„ØªØ®Ø·ÙŠØ· Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠ Ø§Ù„Ø¯Ù‚ÙŠÙ‚ ÙŠØ¨Ø¯Ø£ Ù…Ù† ØªØ´Ø®ÙŠØµ ÙˆØ§Ø¶Ø­ ÙˆØ­Ø¯ÙˆØ¯ ÙˆØ§Ù‚Ø¹ÙŠØ© Ù„Ù„Ù†ØªÙŠØ¬Ø© Ù‚Ø¨Ù„ Ø£ÙŠ Ø¥Ø¬Ø±Ø§Ø¡.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: true,
    serviceSlugs: ["body-contouring"],
  },
  {
    id: "doctor-maher-alahdab",
    slug: "maher-alahdab",
    name: "Ø¯. Ù…Ø§Ù‡Ø± Ø§Ù„Ø£Ø­Ø¯Ø¨",
    title: "Ø§Ø³ØªØ´Ø§Ø±ÙŠ Ø¬Ø±Ø§Ø­Ø© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ ÙˆØ§Ù„ØªØ±Ù…ÙŠÙ…",
    specialty: "Ø¬Ø±Ø§Ø­Ø© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ ÙˆØ§Ù„ØªØ±Ù…ÙŠÙ…",
    summary:
      "Ù†Ø¬Ø§Ø­ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„ØªØ¬Ù…ÙŠÙ„ÙŠ ÙŠØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ø­Ø§Ù„Ø© Ø¨Ø¯Ù‚Ø© ÙˆØ§Ø®ØªÙŠØ§Ø± Ù…Ø§ ÙŠØ®Ø¯Ù…Ù‡Ø§ ÙØ¹Ù„Ù‹Ø§ Ø¯ÙˆÙ† Ù…Ø¨Ø§Ù„ØºØ©.",
    bio: "ÙŠØªØ¹Ø§Ù…Ù„ Ø¯. Ù…Ø§Ù‡Ø± Ø§Ù„Ø£Ø­Ø¯Ø¨ Ù…Ø¹ Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© ÙˆØ§Ù„ØªØ±Ù…ÙŠÙ…ÙŠØ© Ù…Ù† Ù…Ù†Ø¸ÙˆØ± Ø¹Ù„Ø§Ø¬ÙŠ Ø¹Ù…Ù„ÙŠ ÙŠØ¨Ø¯Ø£ Ù…Ù† Ø§Ù„ØªØ´Ø®ÙŠØµØŒ Ø«Ù… ØªØ±ØªÙŠØ¨ Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ§Øª Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© ÙˆØ§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© ÙˆÙÙ‚ Ù…Ø§ ØªØ­ØªØ§Ø¬Ù‡ Ø§Ù„Ø­Ø§Ù„Ø©. ÙŠØ±ÙƒØ² Ø¹Ù„Ù‰ ÙˆØ¶ÙˆØ­ Ø§Ù„Ù‚Ø±Ø§Ø± Ù‚Ø¨Ù„ Ø§Ù„ØªÙ†ÙÙŠØ° ÙˆØ¹Ù„Ù‰ Ù…Ù„Ø§Ø¡Ù…Ø© Ø§Ù„Ø®Ø·Ø© Ù„Ù„Ù…Ø±Ø§Ø¬Ø¹.",
    photoUrl: "/media/doctors/maher-alahdab.png",
    coverImageUrl: "/media/doctors/maher-alahdab.png",
    yearsExperience: 20,
    languages: ["Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©", "Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©"],
    education: [
      "Ø§Ø³ØªØ´Ø§Ø±ÙŠ Ø¬Ø±Ø§Ø­Ø© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ ÙˆØ§Ù„ØªØ±Ù…ÙŠÙ…",
      "Ù…Ù…Ø§Ø±Ø³Ø© Ù…ØªÙ‚Ø¯Ù…Ø© ÙÙŠ Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„ØªØ±Ù…ÙŠÙ… ÙˆØ§Ù„ØªØµØ­ÙŠØ­ Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠ",
    ],
    achievements: [
      "ØªØ±ØªÙŠØ¨ Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ§Øª Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© Ù‚Ø¨Ù„ Ø§Ù„ØªÙ†ÙÙŠØ°",
      "Ù…ÙˆØ§Ø¡Ù…Ø© Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© Ù…Ø¹ Ø§Ù„Ø­Ø§Ø¬Ø© Ø§Ù„ÙØ¹Ù„ÙŠØ© Ù„Ù„Ø­Ø§Ù„Ø©",
    ],
    publications: [
      "Ù†Ø¬Ø§Ø­ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„ØªØ¬Ù…ÙŠÙ„ÙŠ ÙŠØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ø­Ø§Ù„Ø© Ø¨Ø¯Ù‚Ø© ÙˆØ§Ø®ØªÙŠØ§Ø± Ù…Ø§ ÙŠØ®Ø¯Ù…Ù‡Ø§ ÙØ¹Ù„Ù‹Ø§ Ø¯ÙˆÙ† Ù…Ø¨Ø§Ù„ØºØ©.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: true,
    serviceSlugs: ["body-contouring"],
  },
  {
    id: "doctor-saham-arfaj",
    slug: "saham-arfaj",
    name: "Ø¯. Ø³Ù‡Ø§Ù… Ø§Ù„Ø¹Ø±ÙØ¬",
    title: "Ø§Ø³ØªØ´Ø§Ø±ÙŠØ© Ø¬Ø±Ø§Ø­Ø© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ ÙˆØ§Ù„ØªØ±Ù…ÙŠÙ…",
    specialty: "Ø¬Ø±Ø§Ø­Ø© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ ÙˆØ§Ù„ØªØ±Ù…ÙŠÙ…",
    summary:
      "ÙƒÙ„ Ù‚Ø±Ø§Ø± Ø¬Ø±Ø§Ø­ÙŠ Ù†Ø§Ø¬Ø­ ÙŠØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ ØªØ´Ø®ÙŠØµ Ù…Ù†Ø¸Ù… ÙˆØ®Ø·Ø© ØªØ±Ø§Ø¹ÙŠ Ø§Ù„ÙˆØ¸ÙŠÙØ© ÙˆØ§Ù„Ø´ÙƒÙ„ Ù…Ø¹Ù‹Ø§.",
    bio: "ØªÙ‚Ø¯Ù… Ø¯. Ø³Ù‡Ø§Ù… Ø§Ù„Ø¹Ø±ÙØ¬ Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© ÙˆØ§Ù„ØªØ±Ù…ÙŠÙ…ÙŠØ© Ø¨Ù…Ù†Ù‡Ø¬ ÙŠØ±ÙƒØ² Ø¹Ù„Ù‰ Ø§Ù„Ø³Ù„Ø§Ù…Ø© ÙˆØ¯Ù‚Ø© Ø§Ù„ØªØ®Ø·ÙŠØ· ÙˆØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ø£Ù†Ø³Ø¨ ÙˆÙÙ‚ Ù…Ø¹Ø·ÙŠØ§Øª Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„ÙØ¹Ù„ÙŠØ©. ØªÙ‡ØªÙ… Ø¨Ø¥ÙŠØ¶Ø§Ø­ Ø§Ù„Ø®Ø·ÙˆØ§Øª ÙˆØ§Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ù…ØªÙˆÙ‚Ø¹Ø© Ù‚Ø¨Ù„ Ø§Ù„Ø¨Ø¯Ø¡.",
    photoUrl: "/media/doctors/saham-arfaj.png",
    coverImageUrl: "/media/doctors/saham-arfaj.png",
    yearsExperience: 15,
    languages: ["Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©", "Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©"],
    education: [
      "Ø§Ø³ØªØ´Ø§Ø±ÙŠØ© Ø¬Ø±Ø§Ø­Ø© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ ÙˆØ§Ù„ØªØ±Ù…ÙŠÙ…",
      "Ø®Ø¨Ø±Ø© ÙÙŠ ØªØ®Ø·ÙŠØ· Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„ØªØ±Ù…ÙŠÙ…ÙŠØ© ÙˆØ§Ù„Ø¬Ù…Ø§Ù„ÙŠØ©",
    ],
    achievements: [
      "ØªØ®Ø·ÙŠØ· Ø¬Ø±Ø§Ø­ÙŠ ÙŠÙˆØ§Ø²Ù† Ø¨ÙŠÙ† Ø§Ù„ÙˆØ¸ÙŠÙØ© ÙˆØ§Ù„Ø´ÙƒÙ„",
      "Ø´Ø±Ø­ ÙˆØ§Ø¶Ø­ Ù„Ù„Ø®Ø·ÙˆØ§Øª ÙˆØ§Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ù…ØªÙˆÙ‚Ø¹Ø©",
    ],
    publications: [
      "ÙƒÙ„ Ù‚Ø±Ø§Ø± Ø¬Ø±Ø§Ø­ÙŠ Ù†Ø§Ø¬Ø­ ÙŠØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ ØªØ´Ø®ÙŠØµ Ù…Ù†Ø¸Ù… ÙˆØ®Ø·Ø© ØªØ±Ø§Ø¹ÙŠ Ø§Ù„ÙˆØ¸ÙŠÙØ© ÙˆØ§Ù„Ø´ÙƒÙ„ Ù…Ø¹Ù‹Ø§.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: false,
    serviceSlugs: ["skin-rejuvenation", "injectable-harmony"],
  },
  {
    id: "doctor-sabah-alrashid",
    slug: "sabah-alrashid",
    name: "Ø¯. ØµØ¨Ø§Ø­ Ø§Ù„Ø±Ø§Ø´Ø¯",
    title: "Ø§Ø³ØªØ´Ø§Ø±ÙŠ Ø¬Ø±Ø§Ø­Ø© Ø§Ù„Ù…Ø® ÙˆØ§Ù„Ø£Ø¹ØµØ§Ø¨ ÙˆØ§Ù„Ø¹Ù…ÙˆØ¯ Ø§Ù„ÙÙ‚Ø±ÙŠ",
    specialty: "Ø¬Ø±Ø§Ø­Ø© Ø§Ù„Ù…Ø® ÙˆØ§Ù„Ø£Ø¹ØµØ§Ø¨ ÙˆØ§Ù„Ø¹Ù…ÙˆØ¯ Ø§Ù„ÙÙ‚Ø±ÙŠ",
    summary:
      "ÙˆØ¶ÙˆØ­ Ø§Ù„ØªØ´Ø®ÙŠØµ Ù‡Ùˆ Ø§Ù„Ø£Ø³Ø§Ø³ ÙÙŠ Ø£ÙŠ Ù‚Ø±Ø§Ø± Ø¬Ø±Ø§Ø­ÙŠØŒ ÙˆÙƒÙ„ Ø®Ø·ÙˆØ© ÙŠØ¬Ø¨ Ø£Ù† ØªØ¨Ù†Ù‰ Ø¹Ù„Ù‰ Ù…Ø¹Ø·ÙŠØ§Øª Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ø§ Ø¹Ù„Ù‰ ØªÙ‚Ø¯ÙŠØ± Ø³Ø±ÙŠØ¹.",
    bio: "ÙŠØ¹ØªÙ…Ø¯ Ø¯. ØµØ¨Ø§Ø­ Ø§Ù„Ø±Ø§Ø´Ø¯ Ø¹Ù„Ù‰ ØªÙ‚ÙŠÙŠÙ… Ø³Ø±ÙŠØ±ÙŠ Ø¯Ù‚ÙŠÙ‚ ÙÙŠ Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© Ø§Ù„Ù…Ø¹Ù‚Ø¯Ø©ØŒ Ù…Ø¹ Ø§Ù‡ØªÙ…Ø§Ù… ÙˆØ§Ø¶Ø­ Ø¨Ø³Ù„Ø§Ù…Ø© Ø§Ù„Ù‚Ø±Ø§Ø± ÙˆØªÙØ³ÙŠØ±Ù‡ Ù„Ù„Ù…Ø±Ø§Ø¬Ø¹ Ø¨ØµÙˆØ±Ø© Ù…Ø¨Ø§Ø´Ø±Ø©. ÙŠØ±ÙƒØ² Ø¹Ù„Ù‰ Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø­Ø§Ù„Ø© Ù‚Ø¨Ù„ Ø§Ù‚ØªØ±Ø§Ø­ Ø£ÙŠ Ù…Ø³Ø§Ø± Ø¹Ù„Ø§Ø¬ÙŠ Ø£Ùˆ ØªØ¯Ø®Ù„ Ø¬Ø±Ø§Ø­ÙŠ.",
    photoUrl: "/media/doctors/sabah-alrashid.png",
    coverImageUrl: "/media/doctors/sabah-alrashid.png",
    yearsExperience: 30,
    languages: ["Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©", "Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©"],
    education: [
      "Ø§Ø³ØªØ´Ø§Ø±ÙŠ Ø¬Ø±Ø§Ø­Ø© Ø§Ù„Ù…Ø® ÙˆØ§Ù„Ø£Ø¹ØµØ§Ø¨ ÙˆØ§Ù„Ø¹Ù…ÙˆØ¯ Ø§Ù„ÙÙ‚Ø±ÙŠ",
      "Ø®Ø¨Ø±Ø© Ø·ÙˆÙŠÙ„Ø© ÙÙŠ ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø©",
    ],
    achievements: [
      "Ù‚Ø±Ø§Ø±Ø§Øª Ø¹Ù„Ø§Ø¬ÙŠØ© Ù…Ø¨Ù†ÙŠØ© Ø¹Ù„Ù‰ ØªÙ‚ÙŠÙŠÙ… Ø¯Ù‚ÙŠÙ‚",
      "Ø´Ø±Ø­ ÙˆØ§Ø¶Ø­ Ù„Ù„Ù…Ø®Ø§Ø·Ø± ÙˆØ§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ù‚Ø¨Ù„ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡",
    ],
    publications: [
      "ÙˆØ¶ÙˆØ­ Ø§Ù„ØªØ´Ø®ÙŠØµ Ù‡Ùˆ Ø§Ù„Ø£Ø³Ø§Ø³ ÙÙŠ Ø£ÙŠ Ù‚Ø±Ø§Ø± Ø¬Ø±Ø§Ø­ÙŠØŒ ÙˆÙƒÙ„ Ø®Ø·ÙˆØ© ÙŠØ¬Ø¨ Ø£Ù† ØªØ¨Ù†Ù‰ Ø¹Ù„Ù‰ Ù…Ø¹Ø·ÙŠØ§Øª Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ø§ Ø¹Ù„Ù‰ ØªÙ‚Ø¯ÙŠØ± Ø³Ø±ÙŠØ¹.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: false,
    serviceSlugs: [],
  },
  {
    id: "doctor-karima-jamjoom",
    slug: "karima-jamjoom",
    name: "Ø¯. ÙƒØ±ÙŠÙ…Ø© Ø¬Ù…Ø¬ÙˆÙ…",
    title: "Ø£Ø®ØµØ§Ø¦ÙŠØ© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ Ø§Ù„Ù†Ø³Ø§Ø¦ÙŠ ÙˆØ·Ø¨ Ø§Ù„Ù†Ø³Ø§Ø¡ ÙˆØ§Ù„ÙˆÙ„Ø§Ø¯Ø©",
    specialty: "Ø§Ù„ØªØ¬Ù…ÙŠÙ„ Ø§Ù„Ù†Ø³Ø§Ø¦ÙŠ ÙˆØ·Ø¨ Ø§Ù„Ù†Ø³Ø§Ø¡ ÙˆØ§Ù„ÙˆÙ„Ø§Ø¯Ø©",
    summary:
      "Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø© Ø§Ù„Ø¬ÙŠØ¯Ø© ØªØ¨Ø¯Ø£ Ø¨Ø§Ù„Ø®ØµÙˆØµÙŠØ© ÙˆØ§Ù„ÙˆØ¶ÙˆØ­ØŒ Ø«Ù… Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø®Ø·Ø© Ø§Ù„ØªÙŠ ØªÙ†Ø§Ø³Ø¨ Ø§Ù„Ø­Ø§Ù„Ø© ÙØ¹Ù„ÙŠÙ‹Ø§.",
    bio: "ØªÙ‚Ø¯Ù… Ø¯. ÙƒØ±ÙŠÙ…Ø© Ø¬Ù…Ø¬ÙˆÙ… Ø®Ø¯Ù…Ø§ØªÙ‡Ø§ ÙÙŠ Ø§Ù„ØªØ¬Ù…ÙŠÙ„ Ø§Ù„Ù†Ø³Ø§Ø¦ÙŠ ÙˆØ·Ø¨ Ø§Ù„Ù†Ø³Ø§Ø¡ ÙˆØ§Ù„ÙˆÙ„Ø§Ø¯Ø© Ø¨Ù…Ù†Ù‡Ø¬ ÙŠØ±ÙƒØ² Ø¹Ù„Ù‰ ÙˆØ¶ÙˆØ­ Ø§Ù„Ø®Ø·Ø© ÙˆØ®ØµÙˆØµÙŠØ© Ø§Ù„Ø­Ø§Ù„Ø© ÙˆØ´Ø±Ø­ Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø© Ø¨ØµÙˆØ±Ø© Ù…Ù†Ø¸Ù…Ø© ÙˆÙ…Ø¨Ø§Ø´Ø±Ø© Ù‚Ø¨Ù„ Ø£ÙŠ Ø¥Ø¬Ø±Ø§Ø¡.",
    photoUrl: "/media/doctors/karima-jamjoom.png",
    coverImageUrl: "/media/doctors/karima-jamjoom.png",
    yearsExperience: 15,
    languages: ["Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©", "Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©"],
    education: [
      "Ø£Ø®ØµØ§Ø¦ÙŠØ© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ Ø§Ù„Ù†Ø³Ø§Ø¦ÙŠ ÙˆØ·Ø¨ Ø§Ù„Ù†Ø³Ø§Ø¡ ÙˆØ§Ù„ÙˆÙ„Ø§Ø¯Ø©",
      "Ø®Ø¨Ø±Ø© ÙÙŠ ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ù†Ø³Ø§Ø¦ÙŠØ© ÙˆØ§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„ØªØ¬Ù…ÙŠÙ„ÙŠØ© Ø§Ù„Ù…Ø±ØªØ¨Ø·Ø© Ø¨Ù‡Ø§",
    ],
    achievements: [
      "Ø´Ø±Ø­ Ù…Ù†Ø¸Ù… Ù„Ù„Ø­Ù„ÙˆÙ„ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø© Ù„ÙƒÙ„ Ø­Ø§Ù„Ø©",
      "Ù…ØªØ§Ø¨Ø¹Ø© ØªØ±Ø§Ø¹ÙŠ Ø§Ù„Ø®ØµÙˆØµÙŠØ© ÙˆØ·Ø¨ÙŠØ¹Ø© Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡",
    ],
    publications: [
      "Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø© Ø§Ù„Ø¬ÙŠØ¯Ø© ØªØ¨Ø¯Ø£ Ø¨Ø§Ù„Ø®ØµÙˆØµÙŠØ© ÙˆØ§Ù„ÙˆØ¶ÙˆØ­ØŒ Ø«Ù… Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø®Ø·Ø© Ø§Ù„ØªÙŠ ØªÙ†Ø§Ø³Ø¨ Ø§Ù„Ø­Ø§Ù„Ø© ÙØ¹Ù„ÙŠÙ‹Ø§.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: false,
    serviceSlugs: [],
  },
  {
    id: "doctor-najwa-batarfi",
    slug: "najwa-batarfi",
    name: "Ø¯. Ù†Ø¬ÙˆÙ‰ Ø¨Ø§Ø·Ø±ÙÙŠ",
    title: "Ø§Ø³ØªØ´Ø§Ø±ÙŠØ© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ Ø§Ù„Ù†Ø³Ø§Ø¦ÙŠ",
    specialty: "Ø§Ù„ØªØ¬Ù…ÙŠÙ„ Ø§Ù„Ù†Ø³Ø§Ø¦ÙŠ",
    summary:
      "Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨ Ù„Ø§ ÙŠÙ†ÙØµÙ„ Ø¹Ù† ÙÙ‡Ù… Ø§Ù„Ø­Ø§Ù„Ø© ÙˆØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© Ø¨Ø¯Ù‚Ø©.",
    bio: "ØªØ¹ØªÙ…Ø¯ Ø¯. Ù†Ø¬ÙˆÙ‰ Ø¨Ø§Ø·Ø±ÙÙŠ Ø¹Ù„Ù‰ ØªÙ‚ÙŠÙŠÙ… ÙˆØ§Ø¶Ø­ ÙˆÙ…Ø¨Ø§Ø´Ø± ÙÙŠ Ø®Ø¯Ù…Ø§Øª Ø§Ù„ØªØ¬Ù…ÙŠÙ„ Ø§Ù„Ù†Ø³Ø§Ø¦ÙŠØŒ Ù…Ø¹ Ø´Ø±Ø­ Ù…Ù†Ø¸Ù… Ù„Ù„Ø®ÙŠØ§Ø±Ø§Øª ÙˆØ§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø© ÙˆØ­Ø¯ÙˆØ¯ ÙƒÙ„ Ø®ÙŠØ§Ø± ÙˆÙÙ‚ Ø­Ø§Ø¬Ø© Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„ÙØ¹Ù„ÙŠØ©.",
    photoUrl: "/media/doctors/najwa-batarfi.png",
    coverImageUrl: "/media/doctors/najwa-batarfi.png",
    yearsExperience: 15,
    languages: ["Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©", "Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©"],
    education: [
      "Ø§Ø³ØªØ´Ø§Ø±ÙŠØ© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ Ø§Ù„Ù†Ø³Ø§Ø¦ÙŠ",
      "Ø®Ø¨Ø±Ø© ÙÙŠ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ù†Ø³Ø§Ø¦ÙŠØ© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ÙŠØ© ØºÙŠØ± Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© ÙˆØ§Ù„Ø¬Ø±Ø§Ø­ÙŠØ©",
    ],
    achievements: [
      "ØªÙ‚ÙŠÙŠÙ… Ø¹Ù„Ø§Ø¬ÙŠ Ù…Ù†Ø¸Ù… Ù‚Ø¨Ù„ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡",
      "ØªØ­Ø¯ÙŠØ¯ ÙˆØ§Ø¶Ø­ Ù„Ù„ØªÙˆÙ‚Ø¹Ø§Øª ÙˆØ§Ù„Ø®Ø·Ø©",
    ],
    publications: [
      "Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨ Ù„Ø§ ÙŠÙ†ÙØµÙ„ Ø¹Ù† ÙÙ‡Ù… Ø§Ù„Ø­Ø§Ù„Ø© ÙˆØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© Ø¨Ø¯Ù‚Ø©.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: false,
    serviceSlugs: [],
  },
  {
    id: "doctor-natali-domloj",
    slug: "natali-domloj",
    name: "Ø¯. Ù†Ø§ØªØ§Ù„ÙŠ Ø¯ÙˆÙ…Ù„ÙˆØ¬",
    title: "Ø§Ø³ØªØ´Ø§Ø±ÙŠØ© Ø§Ù„Ø¬Ù„Ø¯ÙŠØ© ÙˆØ§Ù„ØªØ¬Ù…ÙŠÙ„",
    specialty: "Ø§Ù„Ø¬Ù„Ø¯ÙŠØ© ÙˆØ§Ù„ØªØ¬Ù…ÙŠÙ„",
    summary:
      "Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø§Ù„Ù…ØªÙˆØ§Ø²Ù†Ø© ØªØ£ØªÙŠ Ù…Ù† ØªØ´Ø®ÙŠØµ Ø£Ø¯Ù‚ØŒ ÙˆØ®Ø·Ø© Ù…Ø¯Ø±ÙˆØ³Ø©ØŒ ÙˆØ§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ø¨Ø´Ø±Ø© ÙˆØ§Ù„Ù…Ù„Ø§Ù…Ø­.",
    bio: "ØªØ¹Ù…Ù„ Ø¯. Ù†Ø§ØªØ§Ù„ÙŠ Ø¯ÙˆÙ…Ù„ÙˆØ¬ Ø¹Ù„Ù‰ Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø¬Ù„Ø¯ÙŠØ© ÙˆØ§Ù„ØªØ¬Ù…ÙŠÙ„ÙŠØ© Ø¨Ù…Ù†Ù‡Ø¬ ÙŠØ±ÙƒØ² Ø¹Ù„Ù‰ Ø§Ù„ØªØ´Ø®ÙŠØµ Ø§Ù„ÙˆØ§Ø¶Ø­ØŒ ÙˆØ¶Ø¨Ø· Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© ÙˆÙÙ‚ Ø·Ø¨ÙŠØ¹Ø© Ø§Ù„Ø¨Ø´Ø±Ø©ØŒ ÙˆØªØ­Ø¯ÙŠØ¯ Ù…Ø§ ØªØ­ØªØ§Ø¬Ù‡ Ø§Ù„Ø­Ø§Ù„Ø© Ù…Ù† Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø¬Ù„Ø¯ÙŠØ© Ø£Ùˆ ØªØ¬Ù…ÙŠÙ„ÙŠØ© Ø¨ØµÙˆØ±Ø© Ù…ØªØ¯Ø±Ø¬Ø©.",
    photoUrl: "/media/doctors/natali-domloj.png",
    coverImageUrl: "/media/doctors/natali-domloj.png",
    yearsExperience: 20,
    languages: ["Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©", "Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©", "Ø§Ù„ÙØ±Ù†Ø³ÙŠØ©"],
    education: [
      "Ø§Ø³ØªØ´Ø§Ø±ÙŠØ© Ø§Ù„Ø¬Ù„Ø¯ÙŠØ© ÙˆØ§Ù„ØªØ¬Ù…ÙŠÙ„",
      "Ø®Ø¨Ø±Ø© ÙÙŠ Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ø¬Ù„Ø¯ÙŠØ© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© ÙˆØ§Ù„ØªØ¬Ù…ÙŠÙ„ÙŠØ©",
    ],
    achievements: [
      "Ø±Ø¨Ø· Ø§Ù„ØªØ´Ø®ÙŠØµ Ø¨Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø©",
      "ØªÙ†Ø³ÙŠÙ‚ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ø¬Ù„Ø¯ÙŠØ© ÙˆØ§Ù„ØªØ¬Ù…ÙŠÙ„ÙŠØ© Ø¶Ù…Ù† Ù…Ø³Ø§Ø± ÙˆØ§Ø¶Ø­",
    ],
    publications: [
      "Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø§Ù„Ù…ØªÙˆØ§Ø²Ù†Ø© ØªØ£ØªÙŠ Ù…Ù† ØªØ´Ø®ÙŠØµ Ø£Ø¯Ù‚ØŒ ÙˆØ®Ø·Ø© Ù…Ø¯Ø±ÙˆØ³Ø©ØŒ ÙˆØ§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ø¨Ø´Ø±Ø© ÙˆØ§Ù„Ù…Ù„Ø§Ù…Ø­.",
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
    name: "Ø¯. ÙÙ„ÙˆØ© Ø§Ù„Ø¬Ù†ÙˆØ¨ÙŠ",
    title: "Ø£Ø®ØµØ§Ø¦ÙŠØ© Ø§Ù„Ø¬Ø±Ø§Ø­Ø© Ø§Ù„Ø¹Ø§Ù…Ø©",
    specialty: "Ø§Ù„Ø¬Ø±Ø§Ø­Ø© Ø§Ù„Ø¹Ø§Ù…Ø©",
    summary:
      "Ø§Ù„Ù‚Ø±Ø§Ø± Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠ Ø§Ù„Ø³Ù„ÙŠÙ… ÙŠØ¨Ø¯Ø£ Ù…Ù† ÙÙ‡Ù… Ø§Ù„Ø­Ø§Ø¬Ø© Ø§Ù„ÙØ¹Ù„ÙŠØ© Ù„Ù„Ø­Ø§Ù„Ø© ÙˆØªØ±ØªÙŠØ¨ Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ§Øª Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© Ø¨ÙˆØ¶ÙˆØ­.",
    bio: "ØªÙ‚Ø¯Ù… Ø¯. ÙÙ„ÙˆØ© Ø§Ù„Ø¬Ù†ÙˆØ¨ÙŠ ØªÙ‚ÙŠÙŠÙ…Ù‹Ø§ ÙˆØ§Ø¶Ø­Ù‹Ø§ ÙÙŠ Ø§Ù„Ø¬Ø±Ø§Ø­Ø© Ø§Ù„Ø¹Ø§Ù…Ø©ØŒ Ù…Ø¹ ØªØ±ÙƒÙŠØ² Ø¹Ù„Ù‰ Ø´Ø±Ø­ Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© ÙˆØªØ­Ø¯ÙŠØ¯ Ù…Ø§ Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„ØªØ¯Ø®Ù„ Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠ Ù‡Ùˆ Ø§Ù„Ø®ÙŠØ§Ø± Ø§Ù„Ø£Ù†Ø³Ø¨ ÙˆÙÙ‚ Ù…Ø¹Ø·ÙŠØ§Øª Ø§Ù„Ø­Ø§Ù„Ø©.",
    photoUrl: "/media/doctors/falwah-aljanoubi.png",
    coverImageUrl: "/media/doctors/falwah-aljanoubi.png",
    yearsExperience: 5,
    languages: ["Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©", "Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©"],
    education: [
      "Ø£Ø®ØµØ§Ø¦ÙŠØ© Ø§Ù„Ø¬Ø±Ø§Ø­Ø© Ø§Ù„Ø¹Ø§Ù…Ø©",
      "Ù…Ù…Ø§Ø±Ø³Ø© Ø³Ø±ÙŠØ±ÙŠØ© ÙÙŠ ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© Ø§Ù„Ø¹Ø§Ù…Ø©",
    ],
    achievements: [
      "Ù‚Ø±Ø§Ø¡Ø© Ù…Ù†Ù‡Ø¬ÙŠØ© Ù„Ù„Ø­Ø§Ù„Ø© Ù‚Ø¨Ù„ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡",
      "ØªÙˆØ¶ÙŠØ­ Ø§Ù„Ø®Ø·Ø© Ù„Ù„Ù…Ø±Ø§Ø¬Ø¹ Ø¨Ù„ØºØ© Ù…Ø¨Ø§Ø´Ø±Ø©",
    ],
    publications: [
      "Ø§Ù„Ù‚Ø±Ø§Ø± Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠ Ø§Ù„Ø³Ù„ÙŠÙ… ÙŠØ¨Ø¯Ø£ Ù…Ù† ÙÙ‡Ù… Ø§Ù„Ø­Ø§Ø¬Ø© Ø§Ù„ÙØ¹Ù„ÙŠØ© Ù„Ù„Ø­Ø§Ù„Ø© ÙˆØªØ±ØªÙŠØ¨ Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ§Øª Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© Ø¨ÙˆØ¶ÙˆØ­.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: false,
    serviceSlugs: [],
  },
  {
    id: "doctor-bandar-alharthi",
    slug: "bandar-alharthi",
    name: "Ø§Ù„Ø¨Ø±ÙˆÙÙŠØ³ÙˆØ± Ø¨Ù†Ø¯Ø± Ø§Ù„Ø­Ø§Ø±Ø«ÙŠ",
    title: "Ø§Ø³ØªØ´Ø§Ø±ÙŠ Ø¬Ø±Ø§Ø­Ø© Ø¹Ø§Ù…Ø© ÙˆØ¬Ø±Ø§Ø­Ø© Ø£ÙˆØ±Ø§Ù… Ø§Ù„Ø«Ø¯ÙŠ ÙˆØ§Ù„ØºØ¯Ø¯ Ø§Ù„ØµÙ…Ø§Ø¡",
    specialty: "Ø¬Ø±Ø§Ø­Ø© Ø¹Ø§Ù…Ø© ÙˆØ¬Ø±Ø§Ø­Ø© Ø£ÙˆØ±Ø§Ù… Ø§Ù„Ø«Ø¯ÙŠ ÙˆØ§Ù„ØºØ¯Ø¯ Ø§Ù„ØµÙ…Ø§Ø¡",
    summary:
      "Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© Ø§Ù„Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ø§ ØªØ¨Ù†Ù‰ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø±Ø¹Ø©ØŒ Ø¨Ù„ Ø¹Ù„Ù‰ ØªØ´Ø®ÙŠØµ ÙˆØ§Ø¶Ø­ ÙˆØªØ±ØªÙŠØ¨ Ù…Ø¯Ø±ÙˆØ³ Ù„Ù„Ø®ÙŠØ§Ø±Ø§Øª.",
    bio: "ÙŠØ¹ØªÙ…Ø¯ Ø§Ù„Ø¨Ø±ÙˆÙÙŠØ³ÙˆØ± Ø¨Ù†Ø¯Ø± Ø§Ù„Ø­Ø§Ø±Ø«ÙŠ Ø¹Ù„Ù‰ Ù…Ù†Ù‡Ø¬ Ø³Ø±ÙŠØ±ÙŠ Ø¯Ù‚ÙŠÙ‚ ÙÙŠ ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ©ØŒ Ù…Ø¹ Ø§Ù‡ØªÙ…Ø§Ù… Ø¨ØªØ±ØªÙŠØ¨ Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© ÙˆØ´Ø±Ø­Ù‡Ø§ Ø¨ØµÙˆØ±Ø© ÙˆØ§Ø¶Ø­Ø© ØªØ³Ø§Ø¹Ø¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹ Ø¹Ù„Ù‰ Ø§ØªØ®Ø§Ø° Ø§Ù„Ù‚Ø±Ø§Ø± Ø§Ù„Ù…Ù†Ø§Ø³Ø¨.",
    photoUrl: "/media/doctors/bandar-alharthi.png",
    coverImageUrl: "/media/doctors/bandar-alharthi.png",
    yearsExperience: 21,
    languages: ["Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©", "Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©"],
    education: [
      "Ø§Ø³ØªØ´Ø§Ø±ÙŠ Ø¬Ø±Ø§Ø­Ø© Ø¹Ø§Ù…Ø© ÙˆØ¬Ø±Ø§Ø­Ø© Ø£ÙˆØ±Ø§Ù… Ø§Ù„Ø«Ø¯ÙŠ ÙˆØ§Ù„ØºØ¯Ø¯ Ø§Ù„ØµÙ…Ø§Ø¡",
      "Ø®Ø¨Ø±Ø© Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ© ÙˆØ³Ø±ÙŠØ±ÙŠØ© Ø·ÙˆÙŠÙ„Ø© ÙÙŠ Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© Ø§Ù„ØªØ®ØµØµÙŠØ©",
    ],
    achievements: [
      "ØªÙ‚ÙŠÙŠÙ… ØªØ®ØµØµÙŠ Ù„Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© Ø§Ù„Ù…Ø¹Ù‚Ø¯Ø©",
      "Ø´Ø±Ø­ ØªÙ†Ø¸ÙŠÙ…ÙŠ Ù„Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠ Ù‚Ø¨Ù„ Ø§Ù„ØªØ¯Ø®Ù„",
    ],
    publications: [
      "Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© Ø§Ù„Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ø§ ØªØ¨Ù†Ù‰ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø±Ø¹Ø©ØŒ Ø¨Ù„ Ø¹Ù„Ù‰ ØªØ´Ø®ÙŠØµ ÙˆØ§Ø¶Ø­ ÙˆØªØ±ØªÙŠØ¨ Ù…Ø¯Ø±ÙˆØ³ Ù„Ù„Ø®ÙŠØ§Ø±Ø§Øª.",
    ],
    status: ContentStatus.PUBLISHED,
    featured: false,
    serviceSlugs: [],
  },
  {
    id: "doctor-ahmed-eldesouki",
    slug: "ahmed-eldesouki",
    name: "Ø¯. Ø£Ø­Ù…Ø¯ Ø§Ù„Ø¯Ø³ÙˆÙ‚ÙŠ",
    title: "Ù†Ø§Ø¦Ø¨ Ø£ÙˆÙ„ Ø¬Ø±Ø§Ø­Ø© Ø§Ù„ØªØ¬Ù…ÙŠÙ„",
    specialty: "Ø¬Ø±Ø§Ø­Ø© Ø§Ù„ØªØ¬Ù…ÙŠÙ„",
    summary:
      "Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø§Ù„Ø¬ÙŠØ¯Ø© ØªØ£ØªÙŠ Ø­ÙŠÙ† ØªÙƒÙˆÙ† Ø§Ù„Ø®Ø·Ø© Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù„Ø­Ø§Ù„Ø© ÙˆÙ…Ø¨Ù†ÙŠØ© Ø¹Ù„Ù‰ Ø´Ø±Ø­ ÙˆØ§Ø¶Ø­ Ù‚Ø¨Ù„ Ø§Ù„ØªÙ†ÙÙŠØ°.",
    bio: "ÙŠÙ‚Ø¯Ù… Ø¯. Ø£Ø­Ù…Ø¯ Ø§Ù„Ø¯Ø³ÙˆÙ‚ÙŠ Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø¬Ø±Ø§Ø­Ø© Ø§Ù„ØªØ¬Ù…ÙŠÙ„ Ø¨Ù…Ù†Ù‡Ø¬ Ø¹Ù…Ù„ÙŠ ÙŠØ±ÙƒØ² Ø¹Ù„Ù‰ ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø­Ø§Ù„Ø© ÙˆØªØ­Ø¯ÙŠØ¯ Ù…Ø§ ÙŠÙ†Ø§Ø³Ø¨Ù‡Ø§ Ù…Ù† Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª ÙˆØ´Ø±Ø­ Ø§Ù„Ø®Ø·ÙˆØ§Øª Ø§Ù„Ù…ØªÙˆÙ‚Ø¹Ø© Ø¨ØµÙˆØ±Ø© Ù…Ø¨Ø§Ø´Ø±Ø© ÙˆÙ…Ù†Ø¸Ù…Ø© Ù‚Ø¨Ù„ Ø§Ù„Ø¨Ø¯Ø¡.",
    photoUrl: "/media/doctors/ahmed-eldesouki.png",
    coverImageUrl: "/media/doctors/ahmed-eldesouki.png",
    yearsExperience: 7,
    languages: ["Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©", "Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©"],
    education: [
      "Ù†Ø§Ø¦Ø¨ Ø£ÙˆÙ„ Ø¬Ø±Ø§Ø­Ø© Ø§Ù„ØªØ¬Ù…ÙŠÙ„",
      "Ø®Ø¨Ø±Ø© Ø³Ø±ÙŠØ±ÙŠØ© ÙÙŠ ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„ØªØ¬Ù…ÙŠÙ„ÙŠØ© ÙˆØ§Ù„Ø¬Ø±Ø§Ø­ÙŠØ©",
    ],
    achievements: [
      "Ø´Ø±Ø­ Ø¹Ù…Ù„ÙŠ Ù„Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠ Ù‚Ø¨Ù„ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡",
      "ØªØ­Ø¯ÙŠØ¯ ÙˆØ§Ù‚Ø¹ÙŠ Ù„Ø£Ù‡Ø¯Ø§Ù Ø§Ù„Ø¹Ù„Ø§Ø¬ ÙˆØ§Ù„Ù†ØªÙŠØ¬Ø©",
    ],
    publications: [
      "Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø§Ù„Ø¬ÙŠØ¯Ø© ØªØ£ØªÙŠ Ø­ÙŠÙ† ØªÙƒÙˆÙ† Ø§Ù„Ø®Ø·Ø© Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù„Ø­Ø§Ù„Ø© ÙˆÙ…Ø¨Ù†ÙŠØ© Ø¹Ù„Ù‰ Ø´Ø±Ø­ ÙˆØ§Ø¶Ø­ Ù‚Ø¨Ù„ Ø§Ù„ØªÙ†ÙÙŠØ°.",
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
    name: "ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø¨Ø´Ø±Ø© Ø§Ù„Ù…ØªÙ‚Ø¯Ù…",
    category: "Ø§Ù„Ø¬Ù„Ø¯ÙŠØ© Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø©",
    excerpt:
      "Ø®Ø·Ø© Ù…ØªØ¯Ø±Ø¬Ø© Ù„ØªØ­Ø³ÙŠÙ† Ù†Ø¶Ø§Ø±Ø© Ø§Ù„Ø¨Ø´Ø±Ø©ØŒ ØªÙˆØ­ÙŠØ¯ Ø§Ù„Ù„ÙˆÙ†ØŒ ÙˆØ§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ø¥Ø´Ø±Ø§Ù‚ Ø¨Ù‚Ø±Ø§Ø¡Ø© Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ø§Ø­ØªÙŠØ§Ø¬ Ø§Ù„Ø­Ø§Ù„Ø©.",
    description:
      "ØªØ¬Ù…Ø¹ Ù‡Ø°Ù‡ Ø§Ù„Ø®Ø¯Ù…Ø© Ø¨ÙŠÙ† Ø§Ù„ØªØ´Ø®ÙŠØµ Ø§Ù„Ø¯Ù‚ÙŠÙ‚ ÙˆØ§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¬Ù„Ø³Ø§Øª Ø£Ùˆ Ø§Ù„ÙˆØ³Ø§Ø¦Ù„ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø© Ø¨Ø­Ø³Ø¨ Ø­Ø§Ù„Ø© Ø§Ù„Ø¨Ø´Ø±Ø© ÙˆØ¯Ø±Ø¬Ø© Ø§Ù„Ø­Ø³Ø§Ø³ÙŠØ© ÙˆØ§Ù„ØªØµØ¨ØºØ§Øª ÙˆØ¢Ø«Ø§Ø± Ø§Ù„Ø¥Ø±Ù‡Ø§Ù‚. Ø§Ù„Ù‡Ø¯Ù Ù‡Ùˆ Ø¥Ø¹Ø¯Ø§Ø¯ Ø®Ø·Ø© ØªÙ…Ù†Ø­ Ø§Ù„Ø¨Ø´Ø±Ø© Ù…Ø¸Ù‡Ø±Ù‹Ø§ Ø£ÙƒØ«Ø± ØµÙØ§Ø¡Ù‹ Ù…Ø¹ Ù…ØªØ§Ø¨Ø¹Ø© Ù…Ù†Ø¸Ù…Ø© Ø¨Ø­Ø³Ø¨ Ø§Ù„Ø­Ø§Ø¬Ø©.",
    coverImageUrl: "/media/curated/service-skin-rejuvenation.jpg",
    benefits: [
      "Ù‚Ø±Ø§Ø¡Ø© Ø£Ø¯Ù‚ Ù„Ø§Ø­ØªÙŠØ§Ø¬ Ø§Ù„Ø¨Ø´Ø±Ø©",
      "Ø®Ø·Ø© Ø¹Ù„Ø§Ø¬ÙŠØ© Ù…ØªØ¯Ø±Ø¬Ø© Ø­Ø³Ø¨ Ø§Ù„Ø­Ø§Ù„Ø©",
      "Ø¥Ø´Ø±Ø§Ù‚Ø© Ø·Ø¨ÙŠØ¹ÙŠØ© ÙˆÙ…Ø¸Ù‡Ø± Ø£ÙƒØ«Ø± ØµÙØ§Ø¡Ù‹",
    ],
    doctorSlugs: ["natali-domloj", "saham-arfaj"],
    deviceSlugs: ["fractional-laser-platform"],
    status: ContentStatus.PUBLISHED,
    featured: true,
  },
  {
    id: "service-laser-hair-removal",
    slug: "laser-hair-removal",
    name: "Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø´Ø¹Ø± Ø¨Ø§Ù„Ù„ÙŠØ²Ø±",
    category: "Ø§Ù„Ù„ÙŠØ²Ø± ÙˆØ§Ù„ØªÙ‚Ù†ÙŠØ§Øª",
    excerpt:
      "Ø¬Ù„Ø³Ø§Øª Ù…Ø±ÙŠØ­Ø© ÙˆÙ…Ø¯Ø±ÙˆØ³Ø© ØªÙ‡Ø¯Ù Ø¥Ù„Ù‰ ØªÙ‚Ù„ÙŠÙ„ Ø§Ù„Ø´Ø¹Ø± ØºÙŠØ± Ø§Ù„Ù…Ø±ØºÙˆØ¨ ÙÙŠÙ‡ ÙˆÙÙ‚ Ù†ÙˆØ¹ Ø§Ù„Ø¨Ø´Ø±Ø© ÙˆÙƒØ«Ø§ÙØ© Ø§Ù„Ø´Ø¹Ø± ÙˆØ§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ù…Ø³ØªÙ‡Ø¯ÙØ©.",
    description:
      "ØªØ¨Ø¯Ø£ Ù‡Ø°Ù‡ Ø§Ù„Ø®Ø¯Ù…Ø© Ø¨ØªØ­Ø¯ÙŠØ¯ Ø·Ø¨ÙŠØ¹Ø© Ø§Ù„Ø´Ø¹Ø± ÙˆÙ†ÙˆØ¹ Ø§Ù„Ø¨Ø´Ø±Ø© Ø«Ù… Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ù…Ù„Ø§Ø¦Ù…Ø© Ù„Ø¹Ø¯Ø¯ Ø§Ù„Ø¬Ù„Ø³Ø§Øª ÙˆØ§Ù„ÙÙˆØ§ØµÙ„ Ø§Ù„Ø²Ù…Ù†ÙŠØ© ÙˆØ§Ù„ØªØ¹Ù„ÙŠÙ…Ø§Øª Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© Ù‚Ø¨Ù„ Ø§Ù„Ø¬Ù„Ø³Ø© ÙˆØ¨Ø¹Ø¯Ù‡Ø§. Ù…Ø§ ÙŠÙ…ÙŠØ² Ø§Ù„ØªØ¬Ø±Ø¨Ø© Ù‡Ù†Ø§ Ù‡Ùˆ Ø§Ù„ÙˆØ¶ÙˆØ­ ÙÙŠ Ø§Ù„Ø´Ø±Ø­ØŒ ÙˆÙ‡Ø¯ÙˆØ¡ Ø§Ù„ØªÙ†ÙÙŠØ°ØŒ ÙˆØ§Ù„Ø§Ù‡ØªÙ…Ø§Ù… Ø¨Ø£Ù† ØªÙƒÙˆÙ† Ø§Ù„ØªÙˆÙ‚Ø¹Ø§Øª ÙˆØ§Ù‚Ø¹ÙŠØ© ÙˆØ§Ù„Ù†ØªÙŠØ¬Ø© Ù…Ø±ÙŠØ­Ø© Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø¯Ù‰ Ø§Ù„Ø·ÙˆÙŠÙ„.",
    coverImageUrl: "/media/curated/service-laser-hair-removal.jpg",
    benefits: [
      "Ø®Ø·Ø© Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù†ÙˆØ¹ Ø§Ù„Ø¨Ø´Ø±Ø© ÙˆØ§Ù„Ø´Ø¹Ø±",
      "ØªØ¹Ù„ÙŠÙ…Ø§Øª ÙˆØ§Ø¶Ø­Ø© Ù‚Ø¨Ù„ Ø§Ù„Ø¬Ù„Ø³Ø© ÙˆØ¨Ø¹Ø¯Ù‡Ø§",
      "ØªØ¬Ø±Ø¨Ø© Ø£ÙƒØ«Ø± Ø±Ø§Ø­Ø© ÙˆØ«Ø¨Ø§ØªÙ‹Ø§ Ø¹Ø¨Ø± Ø§Ù„Ø¬Ù„Ø³Ø§Øª",
    ],
    doctorSlugs: ["natali-domloj"],
    deviceSlugs: ["diode-laser-suite"],
    status: ContentStatus.PUBLISHED,
    featured: true,
  },
  {
    id: "service-injectable-harmony",
    slug: "injectable-harmony",
    name: "ØªÙ†Ø§ØºÙ… Ø§Ù„ÙˆØ¬Ù‡ Ø¨Ø§Ù„Ø­Ù‚Ù†",
    category: "Ø§Ù„ØªØ¬Ù…ÙŠÙ„ ØºÙŠØ± Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠ",
    excerpt:
      "Ù†Ù‡Ø¬ ØªØ¬Ù…ÙŠÙ„ÙŠ ÙŠØ±ÙƒØ² Ø¹Ù„Ù‰ Ø¥Ø¨Ø±Ø§Ø² Ø§Ù„ØªÙˆØ§Ø²Ù† ÙÙŠ Ø§Ù„Ù…Ù„Ø§Ù…Ø­ ÙˆØ§Ù„Ø­ÙØ§Ø¸ Ø¹Ù„Ù‰ ØªØ¹Ø¨ÙŠØ± Ø§Ù„ÙˆØ¬Ù‡ Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠ Ø¯ÙˆÙ† Ù…Ø¨Ø§Ù„ØºØ©.",
    description:
      "ØªØ¹ØªÙ…Ø¯ Ù‡Ø°Ù‡ Ø§Ù„Ø®Ø¯Ù…Ø© Ø¹Ù„Ù‰ ØªÙ‚ÙŠÙŠÙ… ØªÙØ§ØµÙŠÙ„ Ø§Ù„ÙˆØ¬Ù‡ØŒ ÙˆÙ†Ù‚Ø§Ø· Ø§Ù„Ø­Ø§Ø¬Ø© Ø§Ù„ÙØ¹Ù„ÙŠØ©ØŒ ÙˆÙ…Ø§ Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ ØªØ¹Ø²ÙŠØ² Ø§Ù„Ø§Ù…ØªÙ„Ø§Ø¡ Ø£Ùˆ ØªØ®ÙÙŠÙ Ø§Ù„Ø®Ø·ÙˆØ· Ø£Ùˆ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„ØªÙˆØ§Ø²Ù† Ø§Ù„Ø¹Ø§Ù… Ù„Ù„Ù…Ù„Ø§Ù…Ø­. Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø§Ù„Ù…Ø³ØªÙ‡Ø¯ÙØ© Ù‡Ù†Ø§ Ù„ÙŠØ³Øª Ø§Ù„ØªØºÙŠÙŠØ± Ø§Ù„Ø¬Ø°Ø±ÙŠØŒ Ø¨Ù„ ØªØ­Ø³ÙŠÙ† Ù…Ø­Ø³ÙˆØ¨ ÙŠØ¬Ø¹Ù„ Ø§Ù„Ù…Ø¸Ù‡Ø± Ø£ÙƒØ«Ø± Ù†Ø¶Ø§Ø±Ø© ÙˆØ§ØªØ²Ø§Ù†Ù‹Ø§ ÙˆØ«Ù‚Ø©.",
    coverImageUrl: "/media/curated/service-prp.jpg",
    benefits: [
      "Ù†ØªØ§Ø¦Ø¬ Ù…ØªØ²Ù†Ø© ØªØ­Ø§ÙØ¸ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù„Ø§Ù…Ø­",
      "ØªØ®Ø·ÙŠØ· Ù‡Ø§Ø¯Ø¦ Ù‚Ø¨Ù„ Ø£ÙŠ Ø¥Ø¬Ø±Ø§Ø¡",
      "Ø´Ø±Ø­ Ø£ÙˆØ¶Ø­ Ù„Ù„ØªÙˆÙ‚Ø¹Ø§Øª ÙˆØ§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø©",
    ],
    doctorSlugs: ["natali-domloj", "saham-arfaj"],
    deviceSlugs: [],
    status: ContentStatus.PUBLISHED,
    featured: true,
  },
  {
    id: "service-body-contouring",
    slug: "body-contouring",
    name: "Ù†Ø­Øª Ø§Ù„Ù‚ÙˆØ§Ù… ØºÙŠØ± Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠ",
    category: "Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© ÙˆØ§Ù„ØªÙ‚Ù†ÙŠØ§Øª",
    excerpt:
      "Ø®Ø¯Ù…Ø© ØªÙ‡Ø¯Ù Ø¥Ù„Ù‰ ØªØ­Ø³ÙŠÙ† Ø§Ù„ØªÙ†Ø§Ø³Ù‚ Ø§Ù„Ø¹Ø§Ù… Ù„Ù„Ø¬Ø³Ù… Ø¨Ø·Ø±Ù‚ ØºÙŠØ± Ø¬Ø±Ø§Ø­ÙŠØ© ÙˆØ®Ø·Ø© ØªÙ†Ø§Ø³Ø¨ Ø·Ø¨ÙŠØ¹Ø© Ø§Ù„Ù‡Ø¯Ù Ø§Ù„Ù…Ø·Ù„ÙˆØ¨.",
    description:
      "ØªØ®Ø¯Ù… Ù‡Ø°Ù‡ Ø§Ù„Ø¬Ù„Ø³Ø§Øª Ù…Ù† ÙŠØ¨Ø­Ø« Ø¹Ù† ØªØ­Ø³ÙŠÙ†Ø§Øª Ù…Ø¯Ø±ÙˆØ³Ø© ÙÙŠ ØªÙ†Ø§Ø³Ù‚ Ø§Ù„Ù‚ÙˆØ§Ù… Ø¹Ø¨Ø± ÙˆØ³Ø§Ø¦Ù„ ØºÙŠØ± Ø¬Ø±Ø§Ø­ÙŠØ© ÙˆØ¨ØªÙˆÙ‚Ø¹Ø§Øª ÙˆØ§Ù‚Ø¹ÙŠØ©. ØªØ¨Ø¯Ø£ Ø§Ù„Ø®Ø·Ø© Ø¨ÙÙ‡Ù… Ø§Ù„Ù‡Ø¯Ù Ù…Ù† Ø§Ù„Ø¹Ù„Ø§Ø¬ØŒ ÙˆØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…Ù†Ø§Ø·Ù‚ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù„Ø¹Ù…Ù„ØŒ Ø«Ù… Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ø°ÙŠ ÙŠØ®Ø¯Ù… Ø§Ù„Ø­Ø§Ù„Ø© Ø¨ØµÙˆØ±Ø© Ø¹Ù…Ù„ÙŠØ©.",
    coverImageUrl: "/media/curated/device-emface.jpg",
    benefits: [
      "ØªØ­Ø³ÙŠÙ† Ø§Ù„ØªÙ†Ø§Ø³Ù‚ Ø§Ù„Ø¹Ø§Ù… Ù„Ù„Ø¬Ø³Ù…",
      "ØªÙ‚Ù†ÙŠØ§Øª ØºÙŠØ± Ø¬Ø±Ø§Ø­ÙŠØ© Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©",
      "Ø®Ø·Ø© Ø£ÙƒØ«Ø± ÙˆØ¶ÙˆØ­Ù‹Ø§ Ù‚Ø¨Ù„ Ø§Ù„Ø¨Ø¯Ø¡",
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
    name: "Ù…Ù†ØµØ© Ø§Ù„ÙØ±Ø§ÙƒØ´Ù†Ø§Ù„ Ù„ÙŠØ²Ø±",
    excerpt:
      "ØªÙ‚Ù†ÙŠØ© ØªØ³Ø§Ø¹Ø¯ Ø¹Ù„Ù‰ ØªØ­Ø³ÙŠÙ† Ù…Ù„Ù…Ø³ Ø§Ù„Ø¨Ø´Ø±Ø© ÙˆØªÙ‚Ù„ÙŠÙ„ Ø¢Ø«Ø§Ø± Ø§Ù„Ù†Ø¯Ø¨Ø§Øª ÙˆØ§Ù„Ù…Ø³Ø§Ù… ÙˆØªÙØ§ÙˆØª Ø§Ù„Ù„ÙˆÙ† ÙˆÙÙ‚ ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø­Ø§Ù„Ø©.",
    description:
      "ØªØ³ØªØ®Ø¯Ù… Ù‡Ø°Ù‡ Ø§Ù„ØªÙ‚Ù†ÙŠØ© ÙÙŠ Ø®Ø·Ø· ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø¨Ø´Ø±Ø© Ø§Ù„ØªÙŠ ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ ØªØ­ÙÙŠØ² Ø£Ø¹Ù…Ù‚ ÙˆØªØ­Ø³ÙŠÙ† ØªØ¯Ø±ÙŠØ¬ÙŠ ÙÙŠ Ø§Ù„Ù…Ù„Ù…Ø³ ÙˆØ§Ù„Ù…Ø¸Ù‡Ø± Ø§Ù„Ø¹Ø§Ù…. Ø§Ø®ØªÙŠØ§Ø±Ù‡Ø§ Ù„Ø§ ÙŠÙƒÙˆÙ† Ù„Ù…Ø¬Ø±Ø¯ Ø§Ù„Ø§Ø³Ù…ØŒ Ø¨Ù„ Ø­ÙŠÙ† ØªÙƒÙˆÙ† Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù†ÙˆØ¹ Ø§Ù„Ø¨Ø´Ø±Ø© ÙˆØ§Ù„Ù‡Ø¯Ù Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨.",
    imageUrl: "/media/curated/device-laser-platform.png",
    certifications: ["Ø§Ø¹ØªÙ…Ø§Ø¯ Ø·Ø¨ÙŠ Ù…Ø¹ØªÙ…Ø¯", "Ù…Ù„Ø§Ø¦Ù… Ù„Ø®Ø·Ø· ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø¨Ø´Ø±Ø©"],
    serviceSlugs: ["skin-rejuvenation"],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: "device-diode-laser-suite",
    slug: "diode-laser-suite",
    name: "Ø¬Ù‡Ø§Ø² Ø§Ù„Ø¯Ø§ÙŠÙˆØ¯ Ù„ÙŠØ²Ø±",
    excerpt:
      "ØªÙ‚Ù†ÙŠØ© Ø´Ø§Ø¦Ø¹Ø© ÙˆÙØ¹Ø§Ù„Ø© Ù„Ø¬Ù„Ø³Ø§Øª Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø´Ø¹Ø±ØŒ Ù…Ø¹ Ù‚Ø¯Ø±Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø¹Ù…Ù„ ÙˆÙÙ‚ Ø§Ø­ØªÙŠØ§Ø¬ Ù…Ù†Ø§Ø·Ù‚ Ù…Ø®ØªÙ„ÙØ© ÙˆÙ†ÙˆØ¹ Ø§Ù„Ø¨Ø´Ø±Ø©.",
    description:
      "ÙŠØ¯Ø¹Ù… Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø² Ø¬Ù„Ø³Ø§Øª Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø´Ø¹Ø± Ø§Ù„ØªÙŠ ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ ØªÙˆØ§Ø²Ù† Ø¨ÙŠÙ† Ø§Ù„Ø±Ø§Ø­Ø© ÙˆØ§Ù„ÙØ¹Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø§Ø³ØªÙ…Ø±Ø§Ø±ÙŠØ©ØŒ ÙˆÙŠØªÙ… Ø§Ø¹ØªÙ…Ø§Ø¯Ù‡ Ø¶Ù…Ù† Ø®Ø·Ø© ÙŠØ´Ø±Ø­ ÙÙŠÙ‡Ø§ Ø§Ù„Ø·Ø¨ÙŠØ¨ Ø¹Ø¯Ø¯ Ø§Ù„Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ ÙˆØ§Ù„ØªØ¹Ù„ÙŠÙ…Ø§Øª Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø© Ù„ÙƒÙ„ Ø­Ø§Ù„Ø©.",
    imageUrl: "/media/curated/service-laser-hair-removal.jpg",
    certifications: ["Ù…Ù†Ø§Ø³Ø¨ Ù„Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ù„ÙŠØ²Ø±", "Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ù…Ø¨Ù†ÙŠØ© Ø¹Ù„Ù‰ ØªÙ‚ÙŠÙŠÙ… Ù…Ø³Ø¨Ù‚"],
    serviceSlugs: ["laser-hair-removal"],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: "device-body-contour-station",
    slug: "body-contour-station",
    name: "ØªÙ‚Ù†ÙŠØ© Ù†Ø­Øª Ø§Ù„Ù‚ÙˆØ§Ù…",
    excerpt:
      "ØªÙ‚Ù†ÙŠØ© Ø¯Ø§Ø¹Ù…Ø© Ù„ØªØ­Ø³ÙŠÙ† ØªÙ†Ø§Ø³Ù‚ Ø§Ù„Ù‚ÙˆØ§Ù… ÙÙŠ Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„ØªÙŠ ØªÙ†Ø§Ø³Ø¨ Ø§Ù„Ø­Ù„ÙˆÙ„ ØºÙŠØ± Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© Ø§Ù„Ù…ØªØ¯Ø±Ø¬Ø©.",
    description:
      "ØªØ£ØªÙŠ Ù‡Ø°Ù‡ Ø§Ù„ØªÙ‚Ù†ÙŠØ© Ø¶Ù…Ù† Ù…Ø³Ø§Ø±Ø§Øª ØªÙ‡Ø¯Ù Ø¥Ù„Ù‰ Ø¯Ø¹Ù… Ù…Ø¸Ù‡Ø± Ø£ÙƒØ«Ø± ØªÙ†Ø§Ø³Ù‚Ù‹Ø§ ÙÙŠ Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ù†Ø§Ø·Ù‚ Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©ØŒ Ù…Ø¹ Ø£Ù‡Ù…ÙŠØ© Ø§Ù„ØªÙ‚ÙŠÙŠÙ… Ø§Ù„ÙˆØ§Ù‚Ø¹ÙŠ Ù„Ù„Ø­Ø§Ù„Ø© ÙˆØªØ­Ø¯ÙŠØ¯ Ù…Ø§ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ø®Ø¯Ù…Ø© Ù…Ù†Ø§Ø³Ø¨Ø© Ø¨Ø§Ù„ÙØ¹Ù„ Ù„Ù„Ù‡Ø¯Ù Ø§Ù„Ù…Ø·Ù„ÙˆØ¨.",
    imageUrl: "/media/curated/device-emface.jpg",
    certifications: [
      "Ø§Ø®ØªÙŠØ§Ø± Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©",
      "Ø®Ø·Ø© ØªØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ø§Ù„ØªÙ‚ÙŠÙŠÙ… Ø§Ù„ÙˆØ§Ù‚Ø¹ÙŠ",
    ],
    serviceSlugs: ["body-contouring"],
    status: ContentStatus.PUBLISHED,
  },
];

const seedGallery: GalleryRecord[] = [
  {
    id: "gallery-reference-01",
    slug: "reference-01",
    title: "Ù…Ø±Ø¬Ø¹ Ø¨ØµØ±ÙŠ ÙˆØ§Ø¶Ø­",
    category: "Ø£Ø¬ÙˆØ§Ø¡ Ø§Ù„Ù…ÙƒØ§Ù†",
    description:
      "Ù…Ø±Ø¬Ø¹ Ø¨ØµØ±ÙŠ ÙŠØ³Ø§Ø¹Ø¯ Ø¹Ù„Ù‰ Ø¨Ù†Ø§Ø¡ ÙˆØ§Ø¬Ù‡Ø© Ø£ÙƒØ«Ø± Ø§ØªØ²Ø§Ù†Ù‹Ø§ØŒ ÙˆÙŠØ¹ÙƒØ³ Ù†ÙˆØ¹ Ø§Ù„Ø£Ø¬ÙˆØ§Ø¡ Ø§Ù„ØªÙŠ Ù†Ø±ÙŠØ¯ Ø¥ÙŠØµØ§Ù„Ù‡Ø§ Ù„Ù„Ø²Ø§Ø¦Ø± Ù…Ù† Ø§Ù„Ù„Ø­Ø¸Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰.",
    beforeImageUrl: "/media/reference/legacy/15.png",
    afterImageUrl: "/media/reference/legacy/16.png",
    beforeImageAlt: "Ù…Ø±Ø¬Ø¹ Ø¨ØµØ±ÙŠ ÙˆØ§Ø¶Ø­ - Ù‚Ø¨Ù„",
    afterImageAlt: "Ù…Ø±Ø¬Ø¹ Ø¨ØµØ±ÙŠ ÙˆØ§Ø¶Ø­ - Ø¨Ø¹Ø¯",
    initialSplitPercent: 50,
  },
  {
    id: "gallery-reference-02",
    slug: "reference-02",
    title: "ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø®Ø¯Ù…Ø©",
    category: "Ø§Ù„ÙˆØ§Ø¬Ù‡Ø© ÙˆØ§Ù„Ø®Ø¯Ù…Ø§Øª",
    description:
      "ØµÙˆØ±Ø© Ù…Ø±Ø¬Ø¹ÙŠØ© ØªØ¯Ø¹Ù… Ø¨Ù†Ø§Ø¡ Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø¨Ø£Ø³Ù„ÙˆØ¨ Ø£ÙƒØ«Ø± Ø£Ù†Ø§Ù‚Ø© ÙˆØªÙˆØ§Ø²Ù†Ù‹Ø§ Ø¨ÙŠÙ† Ø§Ù„ØµÙˆØ±Ø© ÙˆØ§Ù„Ù†Øµ ÙˆØ§Ù„Ù…Ø³Ø§Ø­Ø© Ø§Ù„Ø¨ÙŠØ¶Ø§Ø¡.",
    beforeImageUrl: "/media/reference/legacy/13.png",
    afterImageUrl: "/media/reference/legacy/18.png",
    beforeImageAlt: "ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø®Ø¯Ù…Ø© - Ù‚Ø¨Ù„",
    afterImageAlt: "ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø®Ø¯Ù…Ø© - Ø¨Ø¹Ø¯",
    initialSplitPercent: 50,
  },
  {
    id: "gallery-reference-03",
    slug: "reference-03",
    title: "Ù‡ÙˆÙŠØ© Ø£ÙƒØ«Ø± Ø­Ø¶ÙˆØ±Ù‹Ø§",
    category: "Ø§Ù„Ù‡ÙˆÙŠØ© Ø§Ù„Ø¨ØµØ±ÙŠØ©",
    description:
      "Ù…Ø±Ø¬Ø¹ Ø¨ØµØ±ÙŠ ÙŠØ³Ø§Ø¹Ø¯ ÙÙŠ Ø§Ø³ØªÙ„Ù‡Ø§Ù… Ø­Ø¶ÙˆØ± Ø§Ù„Ø¹Ù„Ø§Ù…Ø© Ø¨Ø´ÙƒÙ„ Ø£ÙƒØ«Ø± Ù†Ø¶Ø¬Ù‹Ø§ ÙˆÙ‡Ø¯ÙˆØ¡Ù‹Ø§ Ù…Ù† Ø§Ù„Ù†Ø³Ø® Ø§Ù„ØªÙ‚Ù„ÙŠØ¯ÙŠØ© Ø§Ù„Ù…Ø¹ØªØ§Ø¯Ø©.",
    beforeImageUrl: "/media/reference/legacy/56549.png",
    afterImageUrl: "/media/reference/legacy/88985959.png",
    beforeImageAlt: "Ù‡ÙˆÙŠØ© Ø£ÙƒØ«Ø± Ø­Ø¶ÙˆØ±Ù‹Ø§ - Ù‚Ø¨Ù„",
    afterImageAlt: "Ù‡ÙˆÙŠØ© Ø£ÙƒØ«Ø± Ø­Ø¶ÙˆØ±Ù‹Ø§ - Ø¨Ø¹Ø¯",
    initialSplitPercent: 50,
  },
];

const seedJournalPosts: JournalPostRecord[] = [
  {
    id: "journal-skin-timing",
    slug: "skin-renewal-timing",
    title:
      "Ù…ØªÙ‰ ÙŠØµØ¨Ø­ ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø¨Ø´Ø±Ø© Ù‚Ø±Ø§Ø±Ù‹Ø§ Ø¹Ù„Ø§Ø¬ÙŠÙ‹Ø§ ØµØ­ÙŠØ­Ù‹Ø§ ÙˆÙ„ÙŠØ³ Ù…Ø¬Ø±Ø¯ Ø±ØºØ¨Ø© ØªØ¬Ù…ÙŠÙ„ÙŠØ©ØŸ",
    excerpt:
      "Ù…Ù‚Ø§Ù„ ÙŠÙˆØ¶Ø­ Ù…ØªÙ‰ ØªØ¨Ø¯Ø£ Ø§Ù„Ø­Ø§Ø¬Ø© Ø§Ù„Ø·Ø¨ÙŠØ© Ø£Ùˆ Ø§Ù„ØªØ¬Ù…ÙŠÙ„ÙŠØ© Ù„ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø¨Ø´Ø±Ø©ØŒ ÙˆÙƒÙŠÙ ÙŠØªÙ… ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø­Ø§Ù„Ø© Ù‚Ø¨Ù„ Ø§Ø¹ØªÙ…Ø§Ø¯ Ø£ÙŠ Ø®Ø·Ø© Ø¹Ù„Ø§Ø¬ÙŠØ©.",
    body: [
      "Ø§Ù„Ù‚Ø±Ø§Ø± Ø§Ù„ØµØ­ÙŠØ­ Ù„Ø§ ÙŠØ¨Ø¯Ø£ Ù…Ù† Ø§Ø³Ù… Ø§Ù„Ø¬Ù‡Ø§Ø² Ø£Ùˆ Ø§Ù„Ø¹Ø±Ø¶ Ø§Ù„Ø³Ø¹Ø±ÙŠØŒ Ø¨Ù„ Ù…Ù† Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ø¬Ù„Ø¯ Ù†ÙØ³Ù‡Ø§: Ø§Ù„ØªØµØ¨ØºØŒ Ø§Ù„Ù…Ø³Ø§Ù…ØŒ Ø§Ù„Ù†Ø¯Ø¨Ø§ØªØŒ Ù†Ù…Ø· Ø§Ù„Ø§Ù„ØªÙ‡Ø§Ø¨ØŒ ÙˆØ¯Ø±Ø¬Ø© Ø­Ø³Ø§Ø³ÙŠØ© Ø§Ù„Ø¨Ø´Ø±Ø©. Ù„Ù‡Ø°Ø§ Ø§Ù„Ø³Ø¨Ø¨ ÙŠØ¬Ø¨ Ø£Ù† ÙŠØ¨Ø¯Ø£ Ø£ÙŠ Ù…Ø³Ø§Ø± Ù„ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø¨Ø´Ø±Ø© Ø¨ØªÙ‚ÙŠÙŠÙ… Ø³Ø±ÙŠØ±ÙŠ ÙˆØ§Ø¶Ø­ ÙŠØ­Ø¯Ø¯ Ù‡Ù„ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ ØªØ­ÙÙŠØ²ØŒ ØªÙ‚Ø´ÙŠØ±ØŒ Ù„ÙŠØ²Ø±ØŒ Ø£Ù… ÙÙ‚Ø· ØªØ¹Ø¯ÙŠÙ„ Ø±ÙˆØªÙŠÙ† Ø¹Ù„Ø§Ø¬ÙŠ.",
      "Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹ÙŠÙ† ØºØ§Ù„Ø¨Ù‹Ø§ ÙŠØ£ØªÙˆÙ† Ø¨Ø·Ù„Ø¨ Ø¹Ø§Ù…: Ø£Ø±ÙŠØ¯ Ù†Ø¶Ø§Ø±Ø© Ø£Ùˆ Ø£Ø±ÙŠØ¯ ØªØ¬Ø¯ÙŠØ¯Ù‹Ø§. Ù„ÙƒÙ† Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø·Ø¨ÙŠ ÙŠØ­ØªØ§Ø¬ ØªØ±Ø¬Ù…Ø© Ù‡Ø°Ø§ Ø§Ù„Ø·Ù„Ø¨ Ø¥Ù„Ù‰ Ø®Ø·Ø© Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„ØªÙ†ÙÙŠØ°. Ø£Ø­ÙŠØ§Ù†Ù‹Ø§ ÙŠÙƒÙˆÙ† Ø§Ù„Ø­Ù„ ÙÙŠ Ø¬Ù„Ø³Ø§Øª Ø®ÙÙŠÙØ© Ù…ØªØ¯Ø±Ø¬Ø©ØŒ ÙˆØ£Ø­ÙŠØ§Ù†Ù‹Ø§ ÙÙŠ Ø±Ø¨Ø· Ø§Ù„Ø®Ø¯Ù…Ø© Ø¨Ø¬Ù‡Ø§Ø² Ø£Ø¯Ù‚ Ø£Ùˆ ÙØªØ±Ø© Ù…ØªØ§Ø¨Ø¹Ø© Ø£Ø·ÙˆÙ„. Ù„Ø°Ù„Ùƒ ÙØ§Ù„ØªØ´Ø®ÙŠØµ Ø§Ù„Ù‡Ø§Ø¯Ø¦ Ù‡Ùˆ Ù…Ø§ ÙŠØµÙ†Ø¹ Ø§Ù„ÙØ±Ù‚ Ø¨ÙŠÙ† Ù†ØªÙŠØ¬Ø© Ø¬Ù…ÙŠÙ„Ø© Ù…Ø¤Ù‚ØªØ© ÙˆØ®Ø·Ø© ØªØ¹ÙŠØ¯ Ù„Ù„Ø¨Ø´Ø±Ø© ØªÙˆØ§Ø²Ù†Ù‡Ø§ Ø¨ØµÙˆØ±Ø© Ø£ÙƒØ«Ø± Ø«Ø¨Ø§ØªÙ‹Ø§.",
      "Ø­ÙŠÙ† ØªÙØ¹Ø±Ø¶ Ù‡Ø°Ù‡ Ø§Ù„ÙÙƒØ±Ø© Ø¨ÙˆØ¶ÙˆØ­ØŒ ÙŠØ¯Ø±Ùƒ Ø§Ù„Ø²Ø§Ø¦Ø± Ø£Ù† Ø§Ù„Ø¹Ù†Ø§ÙŠØ© Ù‡Ù†Ø§ ØªØ¨Ø¯Ø£ Ù…Ù† ÙÙ‡Ù… Ø§Ù„Ø­Ø§Ù„Ø© Ù„Ø§ Ù…Ù† Ø§Ù„ØªØ±ÙˆÙŠØ¬. ÙˆÙ‡Ø°Ø§ Ù…Ø§ ÙŠØ¬Ø¹Ù„ Ø§Ù„Ù‚Ø±Ø§Ø± Ø£ÙƒØ«Ø± Ø§Ø³ØªÙ‚Ø±Ø§Ø±Ù‹Ø§ Ù‚Ø¨Ù„ Ø§Ù„Ø²ÙŠØ§Ø±Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰.",
    ],
    coverImageUrl: "/media/curated/service-skin-rejuvenation.jpg",
    category: "ØªØ«Ù‚ÙŠÙ Ø·Ø¨ÙŠ",
    publishedAt: "2026-05-12T09:00:00.000Z",
    readingTime: "4 Ø¯Ù‚Ø§Ø¦Ù‚",
    relatedServiceSlugs: ["skin-rejuvenation"],
    relatedDoctorSlugs: ["natali-domloj"],
  },
  {
    id: "journal-laser-readiness",
    slug: "laser-readiness-checklist",
    title: "ÙƒÙŠÙ Ù†Ù‡ÙŠØ¦ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹ Ù„Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ù„ÙŠØ²Ø± Ø¨Ø´ÙƒÙ„ ÙŠÙ‚Ù„Ù„ Ø§Ù„Ø£Ø³Ø¦Ù„Ø© ÙˆÙŠØ±ÙØ¹ Ø§Ù„Ø«Ù‚Ø©ØŸ",
    excerpt:
      "Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø§Ø¯Ø© ØªØ´Ø±Ø­ Ù…Ø§ ÙŠØ¬Ø¨ Ù…Ø¹Ø±ÙØªÙ‡ Ù‚Ø¨Ù„ Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ù„ÙŠØ²Ø±: Ø§Ù„ØªÙˆÙ‚Ø¹Ø§ØªØŒ Ø§Ù„ØªØ¹Ù„ÙŠÙ…Ø§Øª Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©ØŒ ÙˆÙ…Ø§ Ø§Ù„Ø°ÙŠ ÙŠØ¬Ø¨ ØªÙ‚ÙŠÙŠÙ…Ù‡ Ù‚Ø¨Ù„ Ø§Ù„Ø¨Ø¯Ø¡.",
    body: [
      "Ø£Ø­Ø¯ Ø£ÙƒØ¨Ø± Ø£Ø³Ø¨Ø§Ø¨ Ø§Ù„ØªØ±Ø¯Ø¯ Ù‚Ø¨Ù„ Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ù„ÙŠØ²Ø± Ù‡Ùˆ ØºÙŠØ§Ø¨ Ø§Ù„ØªÙ‡ÙŠØ¦Ø© Ø§Ù„ØµØ­ÙŠØ­Ø©. Ø¹Ù†Ø¯Ù…Ø§ ØªÙƒÙˆÙ† Ø§Ù„ØµÙØ­Ø© Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠØ© ÙˆØ§Ø¶Ø­Ø©ØŒ ØªØµØ¨Ø­ Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ù…ØªÙƒØ±Ø±Ø© Ø£Ù‚Ù„ØŒ ÙˆÙŠØµÙ„ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹ Ø¥Ù„Ù‰ Ù…Ø³Ø§Ø± Ø§Ù„ØªÙˆØ§ØµÙ„ ÙˆÙ‡Ùˆ ÙŠÙÙ‡Ù… Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ Ù…Ù†Ù‡ ÙˆÙ…Ø§ ÙŠÙ…ÙƒÙ† ØªÙˆÙ‚Ø¹Ù‡ Ù…Ù† Ø§Ù„Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ø£ÙˆÙ„Ù‰.",
      "Ø§Ù„ØªÙ‡ÙŠØ¦Ø© Ø§Ù„Ø¬ÙŠØ¯Ø© Ù„Ø§ ØªØ¹Ù†ÙŠ ÙÙ‚Ø· Ø´Ø±Ø­ Ø§Ù„ØªØ¹Ù„ÙŠÙ…Ø§ØªØŒ Ø¨Ù„ Ø£ÙŠØ¶Ù‹Ø§ ØªÙˆØ¶ÙŠØ­ Ø§Ù„ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„ÙˆØ§Ù‚Ø¹ÙŠØ© ÙˆØ¹Ø¯Ø¯ Ø§Ù„Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ù…Ø­ØªÙ…Ù„ ÙˆÙ…Ø§ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ø­Ø§Ù„Ø© ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ ØªØ¹Ø¯ÙŠÙ„ ÙÙŠ Ø§Ù„Ø¹Ù†Ø§ÙŠØ© Ø§Ù„Ù…Ù†Ø²Ù„ÙŠØ© Ø£Ùˆ ÙÙŠ ØªÙˆÙ‚ÙŠØª Ø¨Ø¹Ø¶ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ø£Ø®Ø±Ù‰. Ù‡Ø°Ù‡ Ø§Ù„ØªÙØ§ØµÙŠÙ„ ØªØµÙ†Ø¹ ÙØ±Ù‚Ù‹Ø§ ÙƒØ¨ÙŠØ±Ù‹Ø§ ÙÙŠ Ø±Ø§Ø­Ø© Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹ ÙˆØ«Ù‚ØªÙ‡.",
      "ÙˆØ­ÙŠÙ† ÙŠØ¬Ø¯ Ø§Ù„Ø²Ø§Ø¦Ø± Ù‡Ø°Ø§ Ø§Ù„Ù…Ø³ØªÙˆÙ‰ Ù…Ù† Ø§Ù„Ø´Ø±Ø­ Ù‚Ø¨Ù„ Ø§Ù„Ø­Ø¬Ø²ØŒ ÙŠØµØ¨Ø­ Ø§Ù„Ù‚Ø±Ø§Ø± Ø£Ø³Ù‡Ù„ Ù„Ø£Ù† Ø§Ù„Ù…Ø­ØªÙˆÙ‰ ÙŠÙ‚Ø¯Ù… Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø·Ø¨ÙŠØ© Ù…Ø¨Ø§Ø´Ø±Ø© Ù„Ø§ Ø¹Ø¨Ø§Ø±Ø§Øª Ø¯Ø¹Ø§Ø¦ÙŠØ©.",
    ],
    coverImageUrl: "/media/curated/service-injectables.png",
    category: "Ø¯Ù„ÙŠÙ„ Ø§Ù„Ù„ÙŠØ²Ø±",
    publishedAt: "2026-05-10T13:30:00.000Z",
    readingTime: "5 Ø¯Ù‚Ø§Ø¦Ù‚",
    relatedServiceSlugs: ["laser-hair-removal"],
    relatedDoctorSlugs: ["natali-domloj"],
  },
  {
    id: "journal-injectables-trust",
    slug: "injectables-trust-framework",
    title: "Ø¨Ù†Ø§Ø¡ Ø§Ù„Ø«Ù‚Ø© ÙÙŠ ØµÙØ­Ø§Øª Ø§Ù„Ø­Ù‚Ù† ÙŠØ¨Ø¯Ø£ Ø¨Ø§Ù„Ù„ØºØ© ÙˆØ§Ù„Ø®Ø·Ø© Ù„Ø§ Ø¨Ø§Ù„ØµÙˆØ± ÙˆØ­Ø¯Ù‡Ø§",
    excerpt:
      "Ø·Ø±Ø­ Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø­Ù‚Ù† ÙŠØ­ØªØ§Ø¬ Ù„ØºØ© Ø¯Ù‚ÙŠÙ‚Ø© ÙˆØ®Ø·Ø© ÙˆØ§Ø¶Ø­Ø© ØªØ´Ø±Ø­ Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø§Ù„Ù…ØªÙˆÙ‚Ø¹Ø© Ø¯ÙˆÙ† Ù…Ø¨Ø§Ù„ØºØ© Ø£Ùˆ ÙˆØ¹ÙˆØ¯ ØºÙŠØ± Ù…Ù†Ø¶Ø¨Ø·Ø©.",
    body: [
      "ÙÙŠ ØµÙØ­Ø§Øª Ø§Ù„Ø­Ù‚Ù† ØªØ­Ø¯ÙŠØ¯Ù‹Ø§ØŒ Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ù„ÙŠØ³Øª Ù†Ù‚Øµ Ø§Ù„ØµÙˆØ± ÙÙ‚Ø·ØŒ Ø¨Ù„ Ø¶Ø¹Ù Ø§Ù„Ù„ØºØ© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…Ø© ÙÙŠ Ø§Ù„Ø¹Ø±Ø¶. ÙƒÙ„Ù…Ø§ Ø²Ø§Ø¯Øª Ø§Ù„ÙˆØ¹ÙˆØ¯ Ø£Ùˆ Ø§Ù†Ø®ÙØ¶Øª Ø¯Ù‚Ø© Ø§Ù„Ø´Ø±Ø­ØŒ ØªØ±Ø§Ø¬Ø¹Øª Ø§Ù„Ø«Ù‚Ø© Ø­ØªÙ‰ Ù„Ùˆ ÙƒØ§Ù† Ø§Ù„ØªØµÙ…ÙŠÙ… Ø¬ÙŠØ¯Ù‹Ø§. Ù„Ù‡Ø°Ø§ Ø§Ù„Ø³Ø¨Ø¨ Ù†Ø­ØªØ§Ø¬ Ù…Ø­ØªÙˆÙ‰ ÙŠØ´Ø±Ø­ Ø§Ù„ØªÙˆØ§Ø²Ù†ØŒ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø©ØŒ ÙˆØ­Ø¯ÙˆØ¯ Ù…Ø§ ÙŠÙ…ÙƒÙ† ØªØ­Ù‚ÙŠÙ‚Ù‡.",
      "Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹ Ø§Ù„Ø°ÙŠ ÙŠÙÙƒØ± ÙÙŠ Ø§Ù„Ø­Ù‚Ù† Ù„Ø§ ÙŠØ¨Ø­Ø« ÙÙ‚Ø· Ø¹Ù† ØµÙˆØ±Ø© Ù†ØªÙŠØ¬Ø©ØŒ Ø¨Ù„ Ø¹Ù† Ø·Ø¨ÙŠØ¨ ÙŠÙÙ‡Ù… Ø§Ù„ØªÙ†Ø§Ø³Ù‚ØŒ ÙˆØ®Ø·Ø© ÙˆØ§Ø¶Ø­Ø©ØŒ ÙˆØ­Ø¯ÙˆØ¯Ù‹Ø§ Ø¢Ù…Ù†Ø© ÙˆÙ…Ù‚Ù†Ø¹Ø© Ù„Ù…Ø§ ÙŠÙ…ÙƒÙ† ØªØ­Ø³ÙŠÙ†Ù‡. Ù„Ø°Ù„Ùƒ ÙØ¥Ù† Ø§Ù„Ù„ØºØ© Ø§Ù„ØªÙŠ ØªÙØ¹Ø±Ø¶ Ø¨Ù‡Ø§ Ø§Ù„Ø®Ø¯Ù…Ø© Ù„Ø§ ØªÙ‚Ù„ Ø£Ù‡Ù…ÙŠØ© Ø¹Ù† Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø°Ø§ØªÙ‡.",
      "ÙƒÙ„Ù…Ø§ ÙƒØ§Ù†Øª Ø§Ù„ØµÙØ­Ø© Ø£ÙƒØ«Ø± Ø§ØªØ²Ø§Ù†Ù‹Ø§ ÙÙŠ Ø§Ù„Ø´Ø±Ø­ ÙˆØ£Ù‚Ø±Ø¨ Ø¥Ù„Ù‰ Ø§Ù„Ø­Ø³ Ø§Ù„Ø·Ø¨ÙŠ Ø§Ù„Ø¯Ù‚ÙŠÙ‚ØŒ Ø´Ø¹Ø± Ø§Ù„Ø²Ø§Ø¦Ø± Ø£Ù† Ø§Ù„Ù‚Ø±Ø§Ø± Ù‡Ù†Ø§ Ù…Ø¨Ù†ÙŠ Ø¹Ù„Ù‰ Ø®Ø¨Ø±Ø© Ø­Ù‚ÙŠÙ‚ÙŠØ© Ù„Ø§ Ø¹Ù„Ù‰ Ø§Ù†Ø·Ø¨Ø§Ø¹ Ø³Ø±ÙŠØ¹. ÙˆÙ‡Ø°Ù‡ Ù‡ÙŠ Ø§Ù„Ø«Ù‚Ø© Ø§Ù„ØªÙŠ ØªØµÙ†Ø¹ Ø§Ù„ÙØ±Ù‚ Ù‚Ø¨Ù„ Ø£ÙŠ Ø¬Ù„Ø³Ø©.",
    ],
    coverImageUrl: "/media/curated/service-laser-hair-removal.jpg",
    category: "Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ§Øª Ø§Ù„Ø­Ù‚Ù†",
    publishedAt: "2026-05-08T11:00:00.000Z",
    readingTime: "4 Ø¯Ù‚Ø§Ø¦Ù‚",
    relatedServiceSlugs: ["injectable-harmony"],
    relatedDoctorSlugs: ["saham-arfaj", "natali-domloj"],
  },
];

const seedCrmRecords: CrmRecord[] = [
  {
    id: "crm-01",
    fullName: "Ø³Ø§Ø±Ø© Ø§Ù„Ø¬Ù‡Ù†ÙŠ",
    phone: "+966500000001",
    email: "sarah@example.com",
    serviceLabel: "ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø¨Ø´Ø±Ø© Ø§Ù„Ù…ØªÙ‚Ø¯Ù…",
    status: SubmissionStatus.NEW,
    source: "Home contact form",
    createdAt: "2026-05-10T10:30:00.000Z",
    notes: "ØªØ­ØªØ§Ø¬ Ù…ØªØ§Ø¨Ø¹Ø© Ø®Ù„Ø§Ù„ 12 Ø³Ø§Ø¹Ø©.",
  },
  {
    id: "crm-02",
    fullName: "Ø±Ù‡Ù Ø³Ø§Ù„Ù…",
    phone: "+966500000002",
    serviceLabel: "Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø´Ø¹Ø± Ø¨Ø§Ù„Ù„ÙŠØ²Ø±",
    status: SubmissionStatus.CONTACTED,
    source: "WhatsApp CTA",
    createdAt: "2026-05-09T13:15:00.000Z",
    notes: "ØªÙ… Ø§Ù„Ø±Ø¯ ÙˆØ¥Ø±Ø³Ø§Ù„ Ù…ÙˆØ§Ø¹ÙŠØ¯ Ù…Ø¨Ø¯Ø¦ÙŠØ©.",
  },
  {
    id: "crm-03",
    fullName: "Ù…Ù‡Ø§ Ø£Ù†ÙˆØ±",
    phone: "+966500000003",
    serviceLabel: "ØªÙ†Ø§ØºÙ… Ø§Ù„ÙˆØ¬Ù‡ Ø¨Ø§Ù„Ø­Ù‚Ù†",
    status: SubmissionStatus.BOOKED,
    source: "Doctor page",
    createdAt: "2026-05-08T08:45:00.000Z",
    notes: "ØªÙ… ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ù…ÙˆØ¹Ø¯ Ø§Ù„Ø£ÙˆÙ„.",
  },
];

const seedSettings: SettingsGroup[] = [
  {
    key: "contact",
    title: "Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªÙˆØ§ØµÙ„",
    description:
      "Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰ Ø§Ù„ØªØ´ØºÙŠÙ„ÙŠ Ø§Ù„Ø°ÙŠ ÙŠØ¸Ù‡Ø± ÙÙŠ Ø§Ù„Ù€ CTA ÙˆØ§Ù„Ù†Ù…Ø§Ø°Ø¬ ÙˆØ§Ù„ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ø¹Ø§Ù…Ø©.",
    fields: [
      { key: "phone", label: "Ø§Ù„Ø±Ù‚Ù… Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ", value: "0114999959" },
      {
        key: "phoneSecondary",
        label: "Ø§Ù„Ø±Ù‚Ù… Ø§Ù„Ù…ÙˆØ­Ø¯",
        value: "9200 17403",
      },
      {
        key: "email",
        label: "Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø±Ø³Ù…ÙŠ",
        value: "info@rejuveracenter.sa",
      },
      {
        key: "emailSecondary",
        label: "Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¨Ø¯ÙŠÙ„",
        value: "info@rejuveracenter.com.sa",
      },
      { key: "whatsapp", label: "ÙˆØ§ØªØ³Ø§Ø¨", value: "0114999959" },
      { key: "domain", label: "Ø§Ù„Ù†Ø·Ø§Ù‚ Ø§Ù„Ø±Ø³Ù…ÙŠ", value: "rejuveracenter.sa" },
      // hours block - subagent #3
      {
        key: "hoursWeekdays",
        label: "Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ø¹Ù…Ù„ (Ø§Ù„Ø³Ø¨Øª â€” Ø§Ù„Ø®Ù…ÙŠØ³)",
        value: "Ø§Ù„Ø³Ø¨Øª â€” Ø§Ù„Ø®Ù…ÙŠØ³ Â· 2:00 Ù… â€” 10:00 Ù…",
      },
      {
        key: "hoursWeekend",
        label: "Ø§Ù„ÙŠÙˆÙ… Ø§Ù„Ù…ØºÙ„Ù‚",
        value: "Ø§Ù„Ø¬Ù…Ø¹Ø© Ù…ØºÙ„Ù‚",
      },
      {
        key: "hoursWeekdaysEn",
        label: "Working hours (Sat â€“ Thu, English)",
        value: "Sat â€“ Thu Â· 2:00 PM â€“ 10:00 PM",
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
    title: "Ø§Ù„Ø¹Ù„Ø§Ù…Ø© ÙˆØ§Ù„Ø±Ø³Ø§Ø¦Ù„",
    description:
      "Ù†ØµÙˆØµ Ø§Ù„ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ© ÙˆØ§Ù„Ù€ announcement bar ÙˆØ§Ù„Ù€ CTA Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ.",
    fields: [
      {
        key: "siteName",
        label: "Ø§Ø³Ù… Ø§Ù„Ø¹Ù„Ø§Ù…Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ",
        value: "Rejuvira Center",
      },
      {
        key: "shortName",
        label: "Ø§Ù„Ø§Ø³Ù… Ø§Ù„Ù…Ø®ØªØµØ±",
        value: "Rejuvira",
      },
      {
        key: "tagline",
        label: "Ø§Ù„Ø¬Ù…Ù„Ø© Ø§Ù„Ø§ÙØªØªØ§Ø­ÙŠØ©",
        value: "Ø±Ø¹Ø§ÙŠØ© Ø¬Ù„Ø¯ÙŠØ© ÙˆØªØ¬Ù…ÙŠÙ„ÙŠØ© Ù…Ø¨Ù†ÙŠØ© Ø¹Ù„Ù‰ ØªØ´Ø®ÙŠØµ ÙˆØ§Ø¶Ø­ ÙˆØ®Ø·Ø© Ù…Ù†Ø§Ø³Ø¨Ø© Ù„ÙƒÙ„ Ø­Ø§Ù„Ø©",
      },
      {
        key: "announcement",
        label: "Ø´Ø±ÙŠØ· Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†",
        value: "Ø­Ø¬Ø² Ù…Ù†Ø¸Ù… ÙˆØ§Ø³ØªØ¬Ø§Ø¨Ø© Ø³Ø±ÙŠØ¹Ø© ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ø¯Ù‚ÙŠÙ‚Ø© Ø¹Ø¨Ø± Ø¬Ù…ÙŠØ¹ Ù‚Ù†ÙˆØ§Øª Ø§Ù„ØªÙˆØ§ØµÙ„",
      },
      {
        key: "seoDescription",
        label: "Ø§Ù„ÙˆØµÙ Ø§Ù„ØªØ¹Ø±ÙŠÙÙŠ Ù„Ù„Ù…ÙˆÙ‚Ø¹",
        value:
          "Ù…Ø±ÙƒØ² Ù…ØªØ®ØµØµ ÙÙŠ Ø§Ù„Ø¬Ù„Ø¯ÙŠØ© ÙˆØ§Ù„ØªØ¬Ù…ÙŠÙ„ Ø§Ù„Ø·Ø¨ÙŠ ÙŠÙ‚Ø¯Ù… Ø®Ø¯Ù…Ø§Øª Ù…Ø¯Ø±ÙˆØ³Ø©ØŒ Ø£Ø·Ø¨Ø§Ø¡ Ù…ØªØ®ØµØµÙŠÙ†ØŒ ÙˆØªØ¬Ø±Ø¨Ø© Ø¹Ù„Ø§Ø¬ÙŠØ© ÙˆØ§Ø¶Ø­Ø© Ù…Ù† Ø£ÙˆÙ„ ØªÙˆØ§ØµÙ„ Ø­ØªÙ‰ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©.",
      },
      {
        key: "logoAlt",
        label: "Ø§Ù„Ù†Øµ Ø§Ù„Ø¨Ø¯ÙŠÙ„ Ù„Ù„Ø´Ø¹Ø§Ø±",
        value: "Ø´Ø¹Ø§Ø± Rejuvira Center Ù„Ù„Ø¬Ù„Ø¯ÙŠØ© ÙˆØ§Ù„ØªØ¬Ù…ÙŠÙ„ Ø§Ù„Ø·Ø¨ÙŠ",
      },
    ],
  },
  {
    key: "ops",
    title: "Ø§Ù„ØªØ´ØºÙŠÙ„ ÙˆØ§Ù„Ø¥Ø¯Ø§Ø±Ø©",
    description:
      "Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø£ÙˆÙ„ÙŠØ© ØªØªØ¹Ù„Ù‚ Ø¨Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª ÙˆØ§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø¯Ø§Ø®Ù„ Ø§Ù„Ù€ CRM.",
    fields: [
      { key: "sla", label: "Ø²Ù…Ù† Ø§Ù„Ø±Ø¯ Ø§Ù„Ù…Ø³ØªÙ‡Ø¯Ù", value: "Ø®Ù„Ø§Ù„ 2 Ø³Ø§Ø¹Ø©" },
      { key: "owner", label: "Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©", value: "Front Desk" },
    ],
  },
  {
    key: "media",
    title: "Ø§Ù„ØµÙˆØ± Ø§Ù„Ù…Ù…ÙŠØ²Ø© Ù„Ù„Ø£Ù‚Ø³Ø§Ù…",
    description:
      "Ù…Ø³Ø§Ø±Ø§Øª Ø§Ù„ØµÙˆØ± Ø§Ù„Ù…Ø­Ù„ÙŠØ© Ø§Ù„ØªÙŠ ØªØªØ­ÙƒÙ… ÙÙŠ Ø§Ù„Ù…Ø´Ø§Ù‡Ø¯ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ø¯Ø§Ø®Ù„ Ø§Ù„ØµÙØ­Ø§Øª Ø§Ù„Ø¹Ø§Ù…Ø©.",
    fields: [
      {
        key: "brandLogo",
        label: "Ø§Ù„Ø´Ø¹Ø§Ø± Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ",
        value: "/media/curated/brand-logo.jpg",
      },
      {
        key: "brandMark",
        label: "Ø£ÙŠÙ‚ÙˆÙ†Ø© Ø§Ù„Ù‡ÙˆÙŠØ© Ø§Ù„Ù…Ø±Ø¨Ø¹Ø©",
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
        label: "ØµÙˆØ±Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ© Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ÙŠØ©",
        value: "/media/curated/brand-logo.jpg",
      },
      {
        key: "homeHero",
        label: "ØµÙˆØ±Ø© Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©",
        value: "/media/curated/service-skin-rejuvenation.jpg",
      },
      {
        key: "doctorsHero",
        label: "ØµÙˆØ±Ø© Ù‚Ø³Ù… Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡",
        value: "/media/doctors/loai-alsalmi.png",
      },
      {
        key: "servicesHero",
        label: "ØµÙˆØ±Ø© Ù‚Ø³Ù… Ø§Ù„Ø®Ø¯Ù…Ø§Øª",
        value: "/media/curated/service-laser-hair-removal.jpg",
      },
      {
        key: "aboutHero",
        label: "ØµÙˆØ±Ø© ØµÙØ­Ø© Ù…Ù† Ù†Ø­Ù†",
        value: "/media/curated/device-emface.jpg",
      },
      {
        key: "journalHero",
        label: "ØµÙˆØ±Ø© Ø§Ù„Ù…Ø¬Ù„Ø© Ø§Ù„Ø·Ø¨ÙŠØ©",
        value: "/media/curated/service-injectables.png",
      },
    ],
  },
  {
    key: "homepage",
    title: "Ø³ÙƒØ§Ø´Ù† Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©",
    description:
      "Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ù…ØªØ­Ø±ÙƒØ© ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ù…Ù† Ø¹Ù†Ø§ÙˆÙŠÙ† ÙˆÙ†ØµÙˆØµ ÙˆØµÙˆØ± Ù…Ø­Ù„ÙŠØ©.",
    fields: [
      {
        key: "heroTitle",
        label: "Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù‡ÙŠØ±Ùˆ",
        value: "Ø®Ø¯Ù…Ø§Øª Ø¬Ù„Ø¯ÙŠØ© ÙˆØªØ¬Ù…ÙŠÙ„ÙŠØ© Ø¨Ø¥Ø´Ø±Ø§Ù Ø·Ø¨ÙŠ ÙˆØ®ÙŠØ§Ø±Ø§Øª Ø£ÙˆØ¶Ø­ Ù…Ù† Ø£ÙˆÙ„ Ø²ÙŠØ§Ø±Ø©.",
      },
      {
        key: "heroTitleAccent",
        label: "Ø§Ù„Ø¹Ø¨Ø§Ø±Ø© Ø§Ù„Ù…Ù…ÙŠØ²Ø© ÙÙŠ Ø§Ù„Ù‡ÙŠØ±Ùˆ",
        value: "Ø¨Ø®Ø·Ø© Ø·Ø¨ÙŠØ© ÙˆØ§Ø¶Ø­Ø©",
      },
      {
        key: "heroDescription",
        label: "ÙˆØµÙ Ø§Ù„Ù‡ÙŠØ±Ùˆ",
        value:
          "ÙŠØ¹Ø±Ø¶ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø®Ø¯Ù…Ø§ØªØŒ Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡ØŒ ÙˆØ§Ù„Ø£Ø¬Ù‡Ø²Ø© Ø¨ØµÙˆØ±Ø© Ù…Ù†Ø¸Ù…Ø© ØªØ³Ø§Ø¹Ø¯ Ø¹Ù„Ù‰ ÙÙ‡Ù… Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø© Ù‚Ø¨Ù„ Ø·Ù„Ø¨ Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø©.",
      },
      {
        key: "heroPillLabel",
        label: "Ø´Ø§Ø±Ø© Ø§Ù„Ù‡ÙŠØ±Ùˆ Ø§Ù„Ø¹Ù„ÙˆÙŠØ©",
        value: "Ù…Ø±ÙƒØ² Ø±ÙŠØ¬ÙˆÙÙŠØ±Ø§ Ø§Ù„Ø·Ø¨ÙŠ",
      },
      {
        key: "heroCtaPrimary",
        label: "Ø²Ø± Ø§Ù„Ù‡ÙŠØ±Ùˆ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ",
        value: "Ø§Ø­Ø¬Ø²ÙŠ Ø§Ø³ØªØ´Ø§Ø±ØªÙƒ Ø§Ù„Ù…Ø¬Ø§Ù†ÙŠØ©",
      },
      {
        key: "heroCtaSecondary",
        label: "Ø²Ø± Ø§Ù„Ù‡ÙŠØ±Ùˆ Ø§Ù„Ø«Ø§Ù†ÙˆÙŠ",
        value: "Ø´Ø§Ù‡Ø¯ÙŠ Ù‚ØµØµ Ø§Ù„Ù†Ø¬Ø§Ø­",
      },
      {
        key: "stripEyebrow",
        label: "Ø¹Ù†ÙˆØ§Ù† ÙØ±Ø¹ÙŠ Ù„Ø´Ø±ÙŠØ· Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø³Ø±ÙŠØ¹",
        value: "Ù…Ø®ØªØ§Ø±Ø§Øª Ù…Ù† Ø§Ù„Ø®Ø¯Ù…Ø§Øª",
      },
      {
        key: "stripTitle",
        label: "Ø¹Ù†ÙˆØ§Ù† Ø´Ø±ÙŠØ· Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø³Ø±ÙŠØ¹",
        value: "Ø§Ø³ØªØ¹Ø±Ø¶ÙŠ Ø®Ø¯Ù…Ø§Øª Ù…Ø±ØªØ¨Ø·Ø© Ø¨Ø­Ø§Ù„ØªÙƒ",
      },
      {
        key: "stripDescription",
        label: "ÙˆØµÙ Ø´Ø±ÙŠØ· Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø³Ø±ÙŠØ¹",
        value: "Ø´Ø±ÙŠØ· Ø³Ø±ÙŠØ¹ Ù„ØªØµÙØ­ Ø§Ù„Ø®Ø¯Ù…Ø§Øª ÙˆÙØªØ­ Ù…Ø§ ÙŠÙ‡Ù…Ùƒ Ø¨Ù†Ù‚Ø±Ø© ÙˆØ§Ø­Ø¯Ø©.",
      },
      {
        key: "trustEyebrow",
        label: "Ø¹Ù†ÙˆØ§Ù† ÙØ±Ø¹ÙŠ Ù„Ù‚Ø³Ù… Ø§Ù„Ø«Ù‚Ø© ÙˆØ§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯Ø§Øª",
        value: "Ù…Ø¹ØªÙ…Ø¯ÙˆÙ† Ø¯ÙˆÙ„ÙŠØ§ ÙˆÙ…Ø­Ù„ÙŠØ§",
      },
      {
        key: "trustTitle",
        label: "Ø¹Ù†ÙˆØ§Ù† Ù‚Ø³Ù… Ø§Ù„Ø«Ù‚Ø© ÙˆØ§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯Ø§Øª",
        value: "Ø«Ù‚Ø© Ø·Ø¨ÙŠØ© ÙˆÙ…Ø¹Ø§ÙŠÙŠØ± ÙˆØ§Ø¶Ø­Ø©",
      },
      {
        key: "trustDescription",
        label: "ÙˆØµÙ Ù‚Ø³Ù… Ø§Ù„Ø«Ù‚Ø© ÙˆØ§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯Ø§Øª",
        value:
          "Ø§Ø¹ØªÙ…Ø§Ø¯Ø§Øª Ù…Ø¹Ù„Ù†Ø©ØŒ ØªÙ‚Ù†ÙŠØ§Øª Ù…ÙˆØ«ÙˆÙ‚Ø©ØŒ ÙˆØ®ØµÙˆØµÙŠØ© Ø¹Ø§Ù„ÙŠØ© ØªÙ…Ù†Ø­Ùƒ Ù‚Ø±Ø§Ø±Ù‹Ø§ Ø£ÙƒØ«Ø± Ø§Ø·Ù…Ø¦Ù†Ø§Ù†Ù‹Ø§.",
      },
      {
        key: "galleryEyebrow",
        label: "Ø¹Ù†ÙˆØ§Ù† ÙØ±Ø¹ÙŠ Ù„Ù‚Ø³Ù… Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ù…ØªØºÙŠØ±Ø©",
        value: "Ù…Ù† Ù…Ø¹Ø±Ø¶ Ø§Ù„ÙˆØ§Ø¬Ù‡Ø©",
      },
      {
        key: "galleryTitle",
        label: "Ø¹Ù†ÙˆØ§Ù† Ù‚Ø³Ù… Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ù…ØªØºÙŠØ±Ø©",
        value: "Ù…Ø´Ø§Ù‡Ø¯ Ù…Ù†ØªÙ‚Ø§Ø© ØªØ´Ø±Ø­ Ø¨ÙˆØ¶ÙˆØ­ Ù…Ø§ ØªØ¹ÙƒØ³Ù‡ ÙƒÙ„ ØµÙˆØ±Ø© Ù…Ù† Ø®Ø¯Ù…Ø© Ø£Ùˆ Ù†ØªÙŠØ¬Ø©.",
      },
      {
        key: "galleryDescription",
        label: "ÙˆØµÙ Ù‚Ø³Ù… Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ù…ØªØºÙŠØ±Ø©",
        value:
          "ÙŠØ¹Ø±Ø¶ Ù‡Ø°Ø§ Ø§Ù„Ù‚Ø³Ù… ØµÙˆØ±Ù‹Ø§ Ø­Ù‚ÙŠÙ‚ÙŠØ© Ù…Ø±ØªØ¨Ø·Ø© Ø¨Ø§Ù„Ø®Ø¯Ù…Ø§Øª ÙˆØ§Ù„Ø£Ø¬Ù‡Ø²Ø© Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ø±ÙƒØ²ØŒ Ù…Ø¹ ÙˆØµÙ Ù…Ù‡Ù†ÙŠ ÙŠÙˆØ¶Ø­ Ø¯Ù„Ø§Ù„Ø© ÙƒÙ„ Ù„Ù‚Ø·Ø© ÙÙŠ Ø³ÙŠØ§Ù‚ Ø§Ù„ØªØ¬Ø±Ø¨Ø© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ©.",
      },
      {
        key: "galleryItem1Image",
        label: "ØµÙˆØ±Ø© Ø§Ù„Ø¹Ù†ØµØ± Ø§Ù„Ø£ÙˆÙ„",
        value: "/media/curated/service-skin-rejuvenation.jpg",
      },
      {
        key: "galleryItem1Title",
        label: "Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø¹Ù†ØµØ± Ø§Ù„Ø£ÙˆÙ„",
        value: "Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø¨Ø´Ø±Ø©",
      },
      {
        key: "galleryItem1Description",
        label: "ÙˆØµÙ Ø§Ù„Ø¹Ù†ØµØ± Ø§Ù„Ø£ÙˆÙ„",
        value:
          "ØµÙˆØ±Ø© Ù…Ø®ØµØµØ© Ù„Ù…Ø³Ø§Ø±Ø§Øª ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø¨Ø´Ø±Ø© ÙˆØ§Ù„Ø¹Ù†Ø§ÙŠØ© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© Ø§Ù„Ù…Ø±ØªØ¨Ø·Ø© Ø¨ØªØ­Ø³ÙŠÙ† Ø§Ù„Ù…Ù„Ù…Ø³ ÙˆØ§Ù„ØµÙØ§Ø¡.",
      },
      {
        key: "galleryItem2Image",
        label: "ØµÙˆØ±Ø© Ø§Ù„Ø¹Ù†ØµØ± Ø§Ù„Ø«Ø§Ù†ÙŠ",
        value: "/media/curated/service-laser-hair-removal.jpg",
      },
      {
        key: "galleryItem2Title",
        label: "Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø¹Ù†ØµØ± Ø§Ù„Ø«Ø§Ù†ÙŠ",
        value: "Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ù„ÙŠØ²Ø±",
      },
      {
        key: "galleryItem2Description",
        label: "ÙˆØµÙ Ø§Ù„Ø¹Ù†ØµØ± Ø§Ù„Ø«Ø§Ù†ÙŠ",
        value:
          "ÙˆØ§Ø¬Ù‡Ø© Ø¨ØµØ±ÙŠØ© Ù…Ø±ØªØ¨Ø·Ø© Ø¨Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù„ÙŠØ²Ø± ÙˆØ¥Ø²Ø§Ù„Ø© Ø§Ù„Ø´Ø¹Ø± ÙˆØ§Ù„ØªÙ‚Ù†ÙŠØ§Øª Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø·Ø§Ù‚Ø© Ø§Ù„Ø¶ÙˆØ¦ÙŠØ©.",
      },
      {
        key: "galleryItem3Image",
        label: "ØµÙˆØ±Ø© Ø§Ù„Ø¹Ù†ØµØ± Ø§Ù„Ø«Ø§Ù„Ø«",
        value: "/media/curated/device-emface.jpg",
      },
      {
        key: "galleryItem3Title",
        label: "Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø¹Ù†ØµØ± Ø§Ù„Ø«Ø§Ù„Ø«",
        value: "Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© ÙˆØ§Ù„ØªÙ‚Ù†ÙŠØ§Øª",
      },
      {
        key: "galleryItem3Description",
        label: "ÙˆØµÙ Ø§Ù„Ø¹Ù†ØµØ± Ø§Ù„Ø«Ø§Ù„Ø«",
        value:
          "Ù…Ø´Ù‡Ø¯ ÙŠÙˆØ¶Ø­ Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…Ø© Ø¶Ù…Ù† Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© ÙˆÙƒÙŠÙ ÙŠØ¸Ù‡Ø± Ø¯ÙˆØ±Ù‡Ø§ Ø¯Ø§Ø®Ù„ Ø§Ù„ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ø¹Ø§Ù…Ø©.",
      },
      {
        key: "quotesEyebrow",
        label: "Ø¹Ù†ÙˆØ§Ù† ÙØ±Ø¹ÙŠ Ù„Ù‚Ø³Ù… Ù…Ù‚ÙˆÙ„Ø§Øª Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡",
        value: "Ù…Ù† Ø£Ø·Ø¨Ø§Ø¡ Ø§Ù„Ù…Ø±ÙƒØ²",
      },
      {
        key: "quotesTitle",
        label: "Ø¹Ù†ÙˆØ§Ù† Ù‚Ø³Ù… Ù…Ù‚ÙˆÙ„Ø§Øª Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡",
        value: "Ø±Ø¤ÙŠØ© Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡ ÙÙŠ Ø§Ù„ØªØ´Ø®ÙŠØµ ÙˆØµÙŠØ§ØºØ© Ø§Ù„Ù‚Ø±Ø§Ø± Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠ.",
      },
      {
        key: "quotesDescription",
        label: "ÙˆØµÙ Ù‚Ø³Ù… Ù…Ù‚ÙˆÙ„Ø§Øª Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡",
        value:
          "Ø§Ù‚ØªØ¨Ø§Ø³Ø§Øª Ù…Ø®ØªØ§Ø±Ø© Ù…Ù† Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡ ØªØ¹ÙƒØ³ Ù…Ù†Ù‡Ø¬Ù‡Ù… Ø§Ù„Ø³Ø±ÙŠØ±ÙŠ ÙˆØ·Ø±ÙŠÙ‚ØªÙ‡Ù… ÙÙŠ ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø­Ø§Ù„Ø© ÙˆØ¨Ù†Ø§Ø¡ Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø©.",
      },
    ],
  },
  {
    key: "social",
    title: "Ù‚Ù†ÙˆØ§Øª Ø§Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ÙŠ",
    description: "Ø±ÙˆØ§Ø¨Ø· Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ø±Ø³Ù…ÙŠØ© Ø§Ù„ØªÙŠ ØªØ¸Ù‡Ø± ÙÙŠ ØªØ°ÙŠÙŠÙ„ Ø§Ù„ØµÙØ­Ø©.",
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
    name: "Ù…Ø¯ÙŠØ± Ø§Ù„Ù…Ù†ØµØ©",
    email: "admin@rejuveracenter.sa",
    role: UserRole.SUPER_ADMIN,
    leadCount: 12,
    lastLoginAt: "2026-05-12T08:00:00.000Z",
    createdAt: "2026-04-28T09:00:00.000Z",
  },
  {
    id: "user-operations-admin",
    name: "Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„ØªØ´ØºÙŠÙ„",
    email: "operations@rejuveracenter.sa",
    role: UserRole.ADMIN,
    leadCount: 31,
    lastLoginAt: "2026-05-11T14:40:00.000Z",
    createdAt: "2026-04-29T08:30:00.000Z",
  },
  {
    id: "user-content-editor",
    name: "Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„Ù…Ø­ØªÙˆÙ‰",
    email: "content@rejuveracenter.sa",
    role: UserRole.EDITOR,
    leadCount: 0,
    createdAt: "2026-05-01T10:15:00.000Z",
  },
];

const defaultMediaSelections: MediaSelections = {
  brandLogo: "/media/curated/brand-logo.jpg",
  brandMark: "/media/curated/brand-logo.jpg",
  favicon: "/media/curated/brand-logo.jpg",
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
    title: "ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø¨Ø´Ø±Ø© Ø§Ù„Ù…ØªÙ‚Ø¯Ù…",
    description:
      "Ù…Ø´Ù‡Ø¯ Ù…Ø®ØµØµ Ù„Ø®Ø¯Ù…Ø§Øª ØªØ­Ø³ÙŠÙ† Ù†Ø¶Ø§Ø±Ø© Ø§Ù„Ø¨Ø´Ø±Ø©ØŒ Ø§Ù„Ù…Ù„Ù…Ø³ØŒ ÙˆØªÙˆØ­ÙŠØ¯ Ø§Ù„Ù„ÙˆÙ† Ø¶Ù…Ù† Ø®Ø·Ø© Ù…ØªØ¯Ø±Ø¬Ø©.",
  },
  {
    image: "/media/curated/service-laser-hair-removal.jpg",
    title: "Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ù„ÙŠØ²Ø±",
    description:
      "ØµÙˆØ±Ø© ØªÙˆØ¶ÙŠØ­ÙŠØ© Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù„ÙŠØ²Ø± Ø§Ù„Ù…Ø±ØªØ¨Ø·Ø© Ø¨Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø´Ø¹Ø± ÙˆØ¨Ø¹Ø¶ Ø§Ù„Ù…Ø³Ø§Ø±Ø§Øª Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø¬Ù‡Ø²Ø©.",
  },
  {
    image: "/media/curated/device-emface.jpg",
    title: "Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©",
    description:
      "ÙˆØ§Ø¬Ù‡Ø© ØªÙˆØ¶Ø­ Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…Ø© Ø¯Ø§Ø®Ù„ Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© ÙˆØ±Ø¨Ø·Ù‡Ø§ Ø¨Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø©.",
  },
];

const seedErrorLogs: ErrorLogRecord[] = [
  {
    id: "log-01",
    route: "/contact",
    message: "Ù„Ù… ØªÙƒØªÙ…Ù„ Ø¨Ø¹Ø¯ ØªÙ‡ÙŠØ¦Ø© Ø®Ø¯Ù…Ø© ØªØµØ¯ÙŠØ± Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø¯Ø§Ø®Ù„ Ø¨ÙŠØ¦Ø© Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„Ø­Ø§Ù„ÙŠØ©.",
    statusCode: 503,
    isResolved: true,
    createdAt: "2026-05-10T07:15:00.000Z",
  },
  {
    id: "log-02",
    route: "/admin/crm",
    message:
      "ØªØ¹Ø°Ø± Ø§Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ù…ØµØ¯Ø± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØŒ Ù„Ø°Ù„Ùƒ ØªÙ… Ø¹Ø±Ø¶ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø±Ø¬Ø¹ÙŠØ© Ø§Ù„Ù…Ø¤Ù‚ØªØ© Ø¯Ø§Ø®Ù„ ÙˆØ­Ø¯Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©.",
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
      readingTime: post.readingTimeLabel ?? "4 Ø¯Ù‚Ø§Ø¦Ù‚",
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
      source: submission.source ?? "Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ",
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
          description: "Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª ØªØ´ØºÙŠÙ„ÙŠØ© Ù…Ø­ÙÙˆØ¸Ø©",
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
        process.env.CONTACT_EMAIL_SECONDARY || "info@rejuveracenter.com.sa",
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
        "Ø§Ù„Ø±ÙŠØ§Ø¶ØŒ Ø§Ù„Ù…Ù…Ù„ÙƒØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©",
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
        "Ø§Ù„Ø³Ø¨Øª â€” Ø§Ù„Ø®Ù…ÙŠØ³ Â· 2:00 Ù… â€” 10:00 Ù…",
      ),
      hoursWeekend: getValue(
        "contact",
        "hoursWeekend",
        "Ø§Ù„Ø¬Ù…Ø¹Ø© Ù…ØºÙ„Ù‚",
      ),
      hoursWeekdaysEn: getValue(
        "contact",
        "hoursWeekdaysEn",
        "Sat â€“ Thu Â· 2:00 PM â€“ 10:00 PM",
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
        "Ø±Ø¹Ø§ÙŠØ© Ø¬Ù„Ø¯ÙŠØ© ÙˆØªØ¬Ù…ÙŠÙ„ÙŠØ© Ù…Ø¨Ù†ÙŠØ© Ø¹Ù„Ù‰ ØªØ´Ø®ÙŠØµ ÙˆØ§Ø¶Ø­ ÙˆØ®Ø·Ø© Ù…Ù†Ø§Ø³Ø¨Ø© Ù„ÙƒÙ„ Ø­Ø§Ù„Ø©",
      ),
      announcement: getValue(
        "brand",
        "announcement",
        "Ø­Ø¬Ø² Ù…Ù†Ø¸Ù… ÙˆØ§Ø³ØªØ¬Ø§Ø¨Ø© Ø³Ø±ÙŠØ¹Ø© ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ø¯Ù‚ÙŠÙ‚Ø© Ø¹Ø¨Ø± Ø¬Ù…ÙŠØ¹ Ù‚Ù†ÙˆØ§Øª Ø§Ù„ØªÙˆØ§ØµÙ„",
      ),
      seoDescription: getValue(
        "brand",
        "seoDescription",
        "Ù…Ø±ÙƒØ² Ù…ØªØ®ØµØµ ÙÙŠ Ø§Ù„Ø¬Ù„Ø¯ÙŠØ© ÙˆØ§Ù„ØªØ¬Ù…ÙŠÙ„ Ø§Ù„Ø·Ø¨ÙŠ ÙŠÙ‚Ø¯Ù… Ø®Ø¯Ù…Ø§Øª Ù…Ø¯Ø±ÙˆØ³Ø©ØŒ Ø£Ø·Ø¨Ø§Ø¡ Ù…ØªØ®ØµØµÙŠÙ†ØŒ ÙˆØªØ¬Ø±Ø¨Ø© Ø¹Ù„Ø§Ø¬ÙŠØ© ÙˆØ§Ø¶Ø­Ø© Ù…Ù† Ø£ÙˆÙ„ ØªÙˆØ§ØµÙ„ Ø­ØªÙ‰ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©.",
      ),
      logoAlt: getValue(
        "brand",
        "logoAlt",
        "Ø´Ø¹Ø§Ø± Rejuvira Center Ù„Ù„Ø¬Ù„Ø¯ÙŠØ© ÙˆØ§Ù„ØªØ¬Ù…ÙŠÙ„ Ø§Ù„Ø·Ø¨ÙŠ",
      ),
    },
    ops: {
      sla: getValue("ops", "sla", "Ø®Ù„Ø§Ù„ Ø³Ø§Ø¹ØªÙŠÙ†"),
      owner: getValue("ops", "owner", "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø§Ø³ØªÙ‚Ø¨Ø§Ù„"),
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
        "Ø®Ø¯Ù…Ø§Øª Ø¬Ù„Ø¯ÙŠØ© ÙˆØªØ¬Ù…ÙŠÙ„ÙŠØ© Ø¨Ø¥Ø´Ø±Ø§Ù Ø·Ø¨ÙŠ ÙˆØ®ÙŠØ§Ø±Ø§Øª Ø£ÙˆØ¶Ø­ Ù…Ù† Ø£ÙˆÙ„ Ø²ÙŠØ§Ø±Ø©.",
      ),
      heroTitleAccent: getValue(
        "homepage",
        "heroTitleAccent",
        "Ø¨Ø®Ø·Ø© Ø·Ø¨ÙŠØ© ÙˆØ§Ø¶Ø­Ø©",
      ),
      heroDescription: getValue(
        "homepage",
        "heroDescription",
        "ÙŠØ¹Ø±Ø¶ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø®Ø¯Ù…Ø§ØªØŒ Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡ØŒ ÙˆØ§Ù„Ø£Ø¬Ù‡Ø²Ø© Ø¨ØµÙˆØ±Ø© Ù…Ù†Ø¸Ù…Ø© ØªØ³Ø§Ø¹Ø¯ Ø¹Ù„Ù‰ ÙÙ‡Ù… Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø© Ù‚Ø¨Ù„ Ø·Ù„Ø¨ Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø©.",
      ),
      heroPillLabel: getValue(
        "homepage",
        "heroPillLabel",
        "Ù…Ø±ÙƒØ² Ø±ÙŠØ¬ÙˆÙÙŠØ±Ø§ Ø§Ù„Ø·Ø¨ÙŠ",
      ),
      heroCtaPrimary: getValue(
        "homepage",
        "heroCtaPrimary",
        "Ø§Ø­Ø¬Ø²ÙŠ Ø§Ø³ØªØ´Ø§Ø±ØªÙƒ Ø§Ù„Ù…Ø¬Ø§Ù†ÙŠØ©",
      ),
      heroCtaSecondary: getValue(
        "homepage",
        "heroCtaSecondary",
        "Ø´Ø§Ù‡Ø¯ÙŠ Ù‚ØµØµ Ø§Ù„Ù†Ø¬Ø§Ø­",
      ),
      heroTitleEn: getValue(
        "homepage",
        "heroTitleEn",
        "Medical-grade dermatology and aesthetics â€” clear guidance from your first visit.",
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
        "Ù…Ø®ØªØ§Ø±Ø§Øª Ù…Ù† Ø§Ù„Ø®Ø¯Ù…Ø§Øª",
      ),
      stripTitle: getValue(
        "homepage",
        "stripTitle",
        "Ø§Ø³ØªØ¹Ø±Ø¶ÙŠ Ø®Ø¯Ù…Ø§Øª Ù…Ø±ØªØ¨Ø·Ø© Ø¨Ø­Ø§Ù„ØªÙƒ",
      ),
      stripDescription: getValue(
        "homepage",
        "stripDescription",
        "Ø´Ø±ÙŠØ· Ø³Ø±ÙŠØ¹ Ù„ØªØµÙØ­ Ø§Ù„Ø®Ø¯Ù…Ø§Øª ÙˆÙØªØ­ Ù…Ø§ ÙŠÙ‡Ù…Ùƒ Ø¨Ù†Ù‚Ø±Ø© ÙˆØ§Ø­Ø¯Ø©.",
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
        "A fast-moving strip â€” open any card in one tap.",
      ),
      trustEyebrow: getValue(
        "homepage",
        "trustEyebrow",
        "Ù…Ø¹ØªÙ…Ø¯ÙˆÙ† Ø¯ÙˆÙ„ÙŠØ§ ÙˆÙ…Ø­Ù„ÙŠØ§",
      ),
      trustTitle: getValue("homepage", "trustTitle", "Ø«Ù‚Ø© Ø·Ø¨ÙŠØ© ÙˆÙ…Ø¹Ø§ÙŠÙŠØ± ÙˆØ§Ø¶Ø­Ø©"),
      trustDescription: getValue(
        "homepage",
        "trustDescription",
        "Ø§Ø¹ØªÙ…Ø§Ø¯Ø§Øª Ù…Ø¹Ù„Ù†Ø©ØŒ ØªÙ‚Ù†ÙŠØ§Øª Ù…ÙˆØ«ÙˆÙ‚Ø©ØŒ ÙˆØ®ØµÙˆØµÙŠØ© Ø¹Ø§Ù„ÙŠØ© ØªÙ…Ù†Ø­Ùƒ Ù‚Ø±Ø§Ø±Ù‹Ø§ Ø£ÙƒØ«Ø± Ø§Ø·Ù…Ø¦Ù†Ø§Ù†Ù‹Ø§.",
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
      galleryEyebrow: getValue("homepage", "galleryEyebrow", "Ù…Ù† Ù…Ø¹Ø±Ø¶ Ø§Ù„ÙˆØ§Ø¬Ù‡Ø©"),
      galleryTitle: getValue(
        "homepage",
        "galleryTitle",
        "Ù…Ø´Ø§Ù‡Ø¯ Ù…Ù†ØªÙ‚Ø§Ø© ØªØ´Ø±Ø­ Ø¨ÙˆØ¶ÙˆØ­ Ù…Ø§ ØªØ¹ÙƒØ³Ù‡ ÙƒÙ„ ØµÙˆØ±Ø© Ù…Ù† Ø®Ø¯Ù…Ø© Ø£Ùˆ Ù†ØªÙŠØ¬Ø©.",
      ),
      galleryDescription: getValue(
        "homepage",
        "galleryDescription",
        "ÙŠØ¹Ø±Ø¶ Ù‡Ø°Ø§ Ø§Ù„Ù‚Ø³Ù… ØµÙˆØ±Ù‹Ø§ Ø­Ù‚ÙŠÙ‚ÙŠØ© Ù…Ø±ØªØ¨Ø·Ø© Ø¨Ø§Ù„Ø®Ø¯Ù…Ø§Øª ÙˆØ§Ù„Ø£Ø¬Ù‡Ø²Ø© Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ø±ÙƒØ²ØŒ Ù…Ø¹ ÙˆØµÙ Ù…Ù‡Ù†ÙŠ ÙŠÙˆØ¶Ø­ Ø¯Ù„Ø§Ù„Ø© ÙƒÙ„ Ù„Ù‚Ø·Ø© ÙÙŠ Ø³ÙŠØ§Ù‚ Ø§Ù„ØªØ¬Ø±Ø¨Ø© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ©.",
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
            title: "Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø¨Ø´Ø±Ø©",
            description:
              "ØµÙˆØ±Ø© Ù…Ø®ØµØµØ© Ù„Ù…Ø³Ø§Ø±Ø§Øª ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø¨Ø´Ø±Ø© ÙˆØ§Ù„Ø¹Ù†Ø§ÙŠØ© Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© Ø§Ù„Ù…Ø±ØªØ¨Ø·Ø© Ø¨ØªØ­Ø³ÙŠÙ† Ø§Ù„Ù…Ù„Ù…Ø³ ÙˆØ§Ù„ØµÙØ§Ø¡.",
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
      quotesEyebrow: getValue("homepage", "quotesEyebrow", "Ù…Ù† Ø£Ø·Ø¨Ø§Ø¡ Ø§Ù„Ù…Ø±ÙƒØ²"),
      quotesTitle: getValue(
        "homepage",
        "quotesTitle",
        "Ø±Ø¤ÙŠØ© Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡ ÙÙŠ Ø§Ù„ØªØ´Ø®ÙŠØµ ÙˆØµÙŠØ§ØºØ© Ø§Ù„Ù‚Ø±Ø§Ø± Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠ.",
      ),
      quotesDescription: getValue(
        "homepage",
        "quotesDescription",
        "Ø§Ù‚ØªØ¨Ø§Ø³Ø§Øª Ù…Ø®ØªØ§Ø±Ø© Ù…Ù† Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡ ØªØ¹ÙƒØ³ Ù…Ù†Ù‡Ø¬Ù‡Ù… Ø§Ù„Ø³Ø±ÙŠØ±ÙŠ ÙˆØ·Ø±ÙŠÙ‚ØªÙ‡Ù… ÙÙŠ ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø­Ø§Ù„Ø© ÙˆØ¨Ù†Ø§Ø¡ Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø©.",
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
      titleAr: "Rejuvira Center â€” Ø±Ø¹Ø§ÙŠØ© Ø¬Ù„Ø¯ÙŠØ© ÙˆØªØ¬Ù…ÙŠÙ„ Ø·Ø¨ÙŠ ÙÙŠ Ø§Ù„Ø±ÙŠØ§Ø¶",
      titleEn: "Rejuvira Center â€” Dermatology & Aesthetic Care in Riyadh",
      descriptionAr:
        "Ù…Ø±ÙƒØ² Ø±ÙŠØ¬ÙˆÙÙŠØ±Ø§ Ø§Ù„Ø·Ø¨ÙŠ ÙÙŠ Ø§Ù„Ø±ÙŠØ§Ø¶: Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø¬Ù„Ø¯ÙŠØ©ØŒ Ø®Ø¯Ù…Ø§Øª ØªØ¬Ù…ÙŠÙ„ØŒ Ø£Ø¬Ù‡Ø²Ø© Ù…Ø¹ØªÙ…Ø¯Ø© ÙˆØ£Ø·Ø¨Ø§Ø¡ Ù…ØªØ®ØµØµÙˆÙ†. Ø®Ø·Ø© Ø¹Ù„Ø§Ø¬ÙŠØ© ÙˆØ§Ø¶Ø­Ø© Ù…Ù† Ø£ÙˆÙ„ Ø²ÙŠØ§Ø±Ø©.",
      descriptionEn:
        "Rejuvira Center in Riyadh: dermatology consultations, aesthetic services, certified devices, and board-specialised doctors. A clear treatment plan from your first visit.",
      keywordsAr:
        "Ø±ÙŠØ¬ÙˆÙÙŠØ±Ø§ØŒ Ø¹ÙŠØ§Ø¯Ø© Ø¬Ù„Ø¯ÙŠØ©ØŒ ØªØ¬Ù…ÙŠÙ„ Ø·Ø¨ÙŠØŒ Ø§Ù„Ø±ÙŠØ§Ø¶ØŒ Ø¹Ù„Ø§Ø¬ Ø§Ù„Ø¨Ø´Ø±Ø©ØŒ Ø­Ù‚Ù†ØŒ Ù„ÙŠØ²Ø±ØŒ Ø§Ø³ØªØ´Ø§Ø±Ø© Ø¬Ù„Ø¯ÙŠØ©",
      keywordsEn:
        "Rejuvira, dermatology Riyadh, aesthetic clinic, medical aesthetics, laser, injectables, skin treatments",
    },
    services: {
      titleAr: "Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù…Ø±ÙƒØ² Ø§Ù„Ø·Ø¨ÙŠØ© ÙˆØ§Ù„ØªØ¬Ù…ÙŠÙ„ÙŠØ©",
      titleEn: "Medical & Aesthetic Services",
      descriptionAr:
        "Ø§Ø·Ù„Ø¹ÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© ÙÙŠ Rejuvira Center: Ø¬Ù„Ø³Ø§Øª Ø¨Ø´Ø±Ø©ØŒ Ø­Ù‚Ù†ØŒ Ù„ÙŠØ²Ø±ØŒ ÙˆØ¹Ù†Ø§ÙŠØ© Ù…ØªØ®ØµØµØ© Ø¨Ø¥Ø´Ø±Ø§Ù Ø£Ø·Ø¨Ø§Ø¡.",
      descriptionEn:
        "Explore Rejuvira Center's approved services: skin care, injectables, laser, and specialised treatments under medical supervision.",
      keywordsAr: "Ø®Ø¯Ù…Ø§Øª ØªØ¬Ù…ÙŠÙ„ØŒ Ø¹Ù†Ø§ÙŠØ© Ø¨Ø§Ù„Ø¨Ø´Ø±Ø©ØŒ Ø­Ù‚Ù†ØŒ Ù„ÙŠØ²Ø±ØŒ Ø§Ù„Ø±ÙŠØ§Ø¶",
      keywordsEn: "aesthetic services, skin care, injectables, laser, Riyadh",
    },
    doctors: {
      titleAr: "Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡ â€” ØªØ®ØµØµØ§Øª ÙˆØ®Ø¨Ø±Ø§Øª Ù…Ø¹ØªÙ…Ø¯Ø©",
      titleEn: "Our Doctors â€” Certified Specialists",
      descriptionAr:
        "ØªØ¹Ø±Ù‘ÙÙŠ Ø¹Ù„Ù‰ ÙØ±ÙŠÙ‚ Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡ ÙÙŠ Rejuvira Center: ØªØ®ØµØµØ§Øª ÙˆØ§Ø¶Ø­Ø©ØŒ Ø´Ù‡Ø§Ø¯Ø§Øª Ù…Ø¹ØªÙ…Ø¯Ø©ØŒ ÙˆØ®Ø¨Ø±Ø© ÙÙŠ Ø§Ù„Ø¬Ù„Ø¯ÙŠØ© ÙˆØ§Ù„ØªØ¬Ù…ÙŠÙ„ Ø§Ù„Ø·Ø¨ÙŠ.",
      descriptionEn:
        "Meet the medical team at Rejuvira Center â€” board-specialised dermatologists and aesthetic physicians with verified credentials.",
      keywordsAr: "Ø£Ø·Ø¨Ø§Ø¡ Ø¬Ù„Ø¯ÙŠØ©ØŒ Ø§Ø³ØªØ´Ø§Ø±ÙŠØŒ ØªØ¬Ù…ÙŠÙ„ØŒ Ø§Ù„Ø±ÙŠØ§Ø¶",
      keywordsEn: "dermatologists, aesthetic physicians, Riyadh",
    },
    devices: {
      titleAr: "Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© Ø§Ù„Ø·Ø¨ÙŠØ© ÙˆØ§Ù„ØªÙ‚Ù†ÙŠØ§Øª Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©",
      titleEn: "Approved Medical Devices & Technologies",
      descriptionAr:
        "Ø£Ø¬Ù‡Ø²Ø© Ù…Ø¹ØªÙ…Ø¯Ø© Ø¯ÙˆÙ„ÙŠÙ‹Ø§ ØªØ³ØªØ®Ø¯Ù… ÙÙŠ Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠØ© Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ø±ÙƒØ²ØŒ Ù…Ø¹ ØªÙˆØ¶ÙŠØ­ Ù„ÙƒÙ„ ØªÙ‚Ù†ÙŠØ© ÙˆØ¯ÙˆØ±Ù‡Ø§.",
      descriptionEn:
        "FDA/CE-cleared devices used in treatments at Rejuvira Center, with a clear explanation of each technology.",
      keywordsAr: "Ø£Ø¬Ù‡Ø²Ø© Ø·Ø¨ÙŠØ©ØŒ Ù„ÙŠØ²Ø±ØŒ ØªÙ‚Ù†ÙŠØ§Øª ØªØ¬Ù…ÙŠÙ„ØŒ Ø§Ù„Ø±ÙŠØ§Ø¶",
      keywordsEn: "medical devices, laser, aesthetic technologies",
    },
    gallery: {
      titleAr: "Ù†ØªØ§Ø¦Ø¬ ÙˆÙ‚ØµØµ Ø§Ù„Ø¹Ù†Ø§ÙŠØ© â€” Ø§Ù„Ù…Ø¹Ø±Ø¶",
      titleEn: "Results & Care Stories â€” Gallery",
      descriptionAr:
        "Ù…Ø´Ø§Ù‡Ø¯ Ù…Ù† Ø§Ù„Ø®Ø¯Ù…Ø§Øª ÙˆØ§Ù„Ù†ØªØ§Ø¦Ø¬ Ø¯Ø§Ø®Ù„ Rejuvira CenterØŒ Ø¨ØªÙˆØ¶ÙŠØ­ Ø§Ù„Ø­Ø§Ù„Ø© Ù‚Ø¨Ù„ ÙˆØ¨Ø¹Ø¯ Ø¶Ù…Ù† Ø®Ø·Ø© Ø¹Ù„Ø§Ø¬ÙŠØ© ÙˆØ§Ø¶Ø­Ø©.",
      descriptionEn:
        "Curated before-and-after visuals from Rejuvira Center's treatments, presented within a transparent clinical plan.",
      keywordsAr: "Ù†ØªØ§Ø¦Ø¬ ØªØ¬Ù…ÙŠÙ„ØŒ Ù‚Ø¨Ù„ ÙˆØ¨Ø¹Ø¯ØŒ Ø¹Ù†Ø§ÙŠØ© Ø¨Ø§Ù„Ø¨Ø´Ø±Ø©",
      keywordsEn: "before after, aesthetic results, skin care",
    },
    journal: {
      titleAr: "Ø§Ù„Ù…Ø¬Ù„Ø© Ø§Ù„Ø·Ø¨ÙŠØ© â€” Ù…Ù‚Ø§Ù„Ø§Øª ÙˆØ¥Ø±Ø´Ø§Ø¯Ø§Øª",
      titleEn: "Medical Journal â€” Articles & Guidance",
      descriptionAr:
        "Ù…Ù‚Ø§Ù„Ø§Øª Ø·Ø¨ÙŠØ© Ù…ÙˆØ¬Ø²Ø© ØªØ³Ø§Ø¹Ø¯Ùƒ Ø¹Ù„Ù‰ ÙÙ‡Ù… Ø§Ù„Ø®Ø¯Ù…Ø§Øª ÙˆØ§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ù‚Ø¨Ù„ Ø§ØªØ®Ø§Ø° Ø§Ù„Ù‚Ø±Ø§Ø± Ø§Ù„Ø¹Ù„Ø§Ø¬ÙŠ.",
      descriptionEn:
        "Concise medical articles to help you understand procedures before deciding on a treatment plan.",
      keywordsAr: "Ù…Ù‚Ø§Ù„Ø§Øª Ø·Ø¨ÙŠØ©ØŒ Ø¥Ø±Ø´Ø§Ø¯Ø§ØªØŒ ØªØ¬Ù…ÙŠÙ„ØŒ Ø¬Ù„Ø¯ÙŠØ©",
      keywordsEn: "medical articles, aesthetics, dermatology",
    },
    about: {
      titleAr: "Ø¹Ù† Rejuvira Center",
      titleEn: "About Rejuvira Center",
      descriptionAr:
        "ØªØ¹Ø±Ù‘ÙÙŠ Ø¹Ù„Ù‰ Ø±Ø¤ÙŠØ© Ø§Ù„Ù…Ø±ÙƒØ² ÙˆÙÙ„Ø³ÙØªÙ‡ ÙÙŠ ØªÙ‚Ø¯ÙŠÙ… Ø±Ø¹Ø§ÙŠØ© Ø¬Ù„Ø¯ÙŠØ© ÙˆØªØ¬Ù…ÙŠÙ„ÙŠØ© Ù…Ø¨Ù†ÙŠØ© Ø¹Ù„Ù‰ ØªØ´Ø®ÙŠØµ ÙˆØ§Ø¶Ø­ ÙˆØ®Ø·Ø© Ø¹Ù„Ø§Ø¬ÙŠØ© Ù…Ø¯Ø±ÙˆØ³Ø©.",
      descriptionEn:
        "Learn about Rejuvira Center's philosophy: dermatology and aesthetic care guided by clear diagnosis and thoughtful planning.",
      keywordsAr: "Ø¹Ù† Ø§Ù„Ù…Ø±ÙƒØ²ØŒ ÙØ±ÙŠÙ‚ Ø·Ø¨ÙŠØŒ Ø±Ø¤ÙŠØ©",
      keywordsEn: "about the clinic, medical team, philosophy",
    },
    contact: {
      titleAr: "Ø§Ù„ØªÙˆØ§ØµÙ„ ÙˆØ§Ù„Ø­Ø¬Ø² â€” Rejuvira Center",
      titleEn: "Contact & Booking â€” Rejuvira Center",
      descriptionAr:
        "Ø§Ø­Ø¬Ø²ÙŠ Ø§Ø³ØªØ´Ø§Ø±ØªÙƒ ÙÙŠ Rejuvira Center Ø§Ù„Ø±ÙŠØ§Ø¶. ÙˆØ§ØªØ³Ø§Ø¨ØŒ Ù‡Ø§ØªÙØŒ Ø¨Ø±ÙŠØ¯ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØŒ ÙˆØ®Ø±Ø§Ø¦Ø· Ø§Ù„Ù…ÙˆÙ‚Ø¹.",
      descriptionEn:
        "Book your consultation at Rejuvira Center in Riyadh. WhatsApp, phone, email, and map.",
      keywordsAr: "ØªÙˆØ§ØµÙ„ØŒ Ø­Ø¬Ø²ØŒ Ø§Ù„Ø±ÙŠØ§Ø¶ØŒ Ø§Ø³ØªØ´Ø§Ø±Ø©",
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

/* â”€â”€ Gallery CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export type CreateGalleryItemInput = {
  slug: string;
  title: string;
  category: string;
  description: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeImageAlt: string;
  afterImageAlt: string;
  /** 0â€“100, default 50. Backwards compatible. */
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
