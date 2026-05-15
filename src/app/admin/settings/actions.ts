"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { saveSettingsGroup } from "@/lib/content-repository";

export type SettingsActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const settingsSchema = z.object({
  phone: z.string().min(5),
  phoneSecondary: z.string().min(5),
  email: z.string().email(),
  emailSecondary: z.string().email(),
  domain: z
    .string()
    .min(4)
    .regex(
      /^[a-z0-9.-]+\.[a-z]{2,}$/i,
      "النطاق غير صالح، يجب أن يكون مثل rejuveracenter.sa",
    ),
  whatsapp: z.string().min(5),
  // hours block - subagent #3
  hoursWeekdays: z.string().min(5, "ساعات العمل الأساسية مطلوبة"),
  hoursWeekend: z.string().min(2, "اليوم المغلق مطلوب"),
  hoursWeekdaysEn: z.string().min(5, "English working hours are required"),
  hoursWeekendEn: z.string().min(2, "English closed-day text is required"),
  siteName: z.string().min(2),
  shortName: z.string().min(2),
  tagline: z.string().min(3),
  announcement: z.string().min(3),
  seoDescription: z.string().min(20),
  logoAlt: z.string().min(5),
  brandLogo: z.string().min(5),
  brandMark: z.string().min(5),
  favicon: z.string().min(5),
  appleIcon: z.string().min(5),
  ogImage: z.string().min(5),
  homeHero: z.string().min(5),
  doctorsHero: z.string().min(5),
  servicesHero: z.string().min(5),
  aboutHero: z.string().min(5),
  journalHero: z.string().min(5),
  heroTitle: z.string().min(10),
  heroTitleAccent: z.string().min(2),
  heroDescription: z.string().min(20),
  heroPillLabel: z.string().min(2),
  heroCtaPrimary: z.string().min(3),
  heroCtaSecondary: z.string().min(3),
  trustEyebrow: z.string().min(2),
  trustTitle: z.string().min(5),
  trustDescription: z.string().min(10),
  stripEyebrow: z.string().min(2),
  stripTitle: z.string().min(5),
  stripDescription: z.string().min(10),
  galleryEyebrow: z.string().min(2),
  galleryTitle: z.string().min(10),
  galleryDescription: z.string().min(20),
  galleryItem1Image: z.string().min(5),
  galleryItem1Title: z.string().min(2),
  galleryItem1Description: z.string().min(10),
  galleryItem2Image: z.string().min(5),
  galleryItem2Title: z.string().min(2),
  galleryItem2Description: z.string().min(10),
  galleryItem3Image: z.string().min(5),
  galleryItem3Title: z.string().min(2),
  galleryItem3Description: z.string().min(10),
  quotesEyebrow: z.string().min(2),
  quotesTitle: z.string().min(10),
  quotesDescription: z.string().min(20),
  testimonial1AuthorAr: z.string().min(2),
  testimonial1AuthorEn: z.string().min(2),
  testimonial1QuoteAr: z.string().min(10),
  testimonial1QuoteEn: z.string().min(10),
  testimonial1Avatar: z.string().min(5),
  testimonial2AuthorAr: z.string().min(2),
  testimonial2AuthorEn: z.string().min(2),
  testimonial2QuoteAr: z.string().min(10),
  testimonial2QuoteEn: z.string().min(10),
  testimonial2Avatar: z.string().min(5),
  testimonial3AuthorAr: z.string().min(2),
  testimonial3AuthorEn: z.string().min(2),
  testimonial3QuoteAr: z.string().min(10),
  testimonial3QuoteEn: z.string().min(10),
  testimonial3Avatar: z.string().min(5),
  socialInstagram: z.string(),
  socialTwitter: z.string(),
  socialSnapchat: z.string(),
  socialTiktok: z.string(),
  socialYoutube: z.string(),
  socialLinkedin: z.string(),
});

export async function saveSettingsAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const parsed = settingsSchema.safeParse({
    phone: formData.get("phone"),
    phoneSecondary: formData.get("phoneSecondary"),
    email: formData.get("email"),
    emailSecondary: formData.get("emailSecondary"),
    domain: formData.get("domain"),
    whatsapp: formData.get("whatsapp"),
    hoursWeekdays: formData.get("hoursWeekdays"),
    hoursWeekend: formData.get("hoursWeekend"),
    hoursWeekdaysEn: formData.get("hoursWeekdaysEn"),
    hoursWeekendEn: formData.get("hoursWeekendEn"),
    siteName: formData.get("siteName"),
    shortName: formData.get("shortName"),
    tagline: formData.get("tagline"),
    announcement: formData.get("announcement"),
    seoDescription: formData.get("seoDescription"),
    logoAlt: formData.get("logoAlt"),
    brandLogo: formData.get("brandLogo"),
    brandMark: formData.get("brandMark"),
    favicon: formData.get("favicon"),
    appleIcon: formData.get("appleIcon"),
    ogImage: formData.get("ogImage"),
    homeHero: formData.get("homeHero"),
    doctorsHero: formData.get("doctorsHero"),
    servicesHero: formData.get("servicesHero"),
    aboutHero: formData.get("aboutHero"),
    journalHero: formData.get("journalHero"),
    heroTitle: formData.get("heroTitle"),
    heroTitleAccent: formData.get("heroTitleAccent"),
    heroDescription: formData.get("heroDescription"),
    heroPillLabel: formData.get("heroPillLabel"),
    heroCtaPrimary: formData.get("heroCtaPrimary"),
    heroCtaSecondary: formData.get("heroCtaSecondary"),
    trustEyebrow: formData.get("trustEyebrow"),
    trustTitle: formData.get("trustTitle"),
    trustDescription: formData.get("trustDescription"),
    stripEyebrow: formData.get("stripEyebrow"),
    stripTitle: formData.get("stripTitle"),
    stripDescription: formData.get("stripDescription"),
    galleryEyebrow: formData.get("galleryEyebrow"),
    galleryTitle: formData.get("galleryTitle"),
    galleryDescription: formData.get("galleryDescription"),
    galleryItem1Image: formData.get("galleryItem1Image"),
    galleryItem1Title: formData.get("galleryItem1Title"),
    galleryItem1Description: formData.get("galleryItem1Description"),
    galleryItem2Image: formData.get("galleryItem2Image"),
    galleryItem2Title: formData.get("galleryItem2Title"),
    galleryItem2Description: formData.get("galleryItem2Description"),
    galleryItem3Image: formData.get("galleryItem3Image"),
    galleryItem3Title: formData.get("galleryItem3Title"),
    galleryItem3Description: formData.get("galleryItem3Description"),
    quotesEyebrow: formData.get("quotesEyebrow"),
    quotesTitle: formData.get("quotesTitle"),
    quotesDescription: formData.get("quotesDescription"),
    testimonial1AuthorAr: formData.get("testimonial1AuthorAr"),
    testimonial1AuthorEn: formData.get("testimonial1AuthorEn"),
    testimonial1QuoteAr: formData.get("testimonial1QuoteAr"),
    testimonial1QuoteEn: formData.get("testimonial1QuoteEn"),
    testimonial1Avatar: formData.get("testimonial1Avatar"),
    testimonial2AuthorAr: formData.get("testimonial2AuthorAr"),
    testimonial2AuthorEn: formData.get("testimonial2AuthorEn"),
    testimonial2QuoteAr: formData.get("testimonial2QuoteAr"),
    testimonial2QuoteEn: formData.get("testimonial2QuoteEn"),
    testimonial2Avatar: formData.get("testimonial2Avatar"),
    testimonial3AuthorAr: formData.get("testimonial3AuthorAr"),
    testimonial3AuthorEn: formData.get("testimonial3AuthorEn"),
    testimonial3QuoteAr: formData.get("testimonial3QuoteAr"),
    testimonial3QuoteEn: formData.get("testimonial3QuoteEn"),
    testimonial3Avatar: formData.get("testimonial3Avatar"),
    socialInstagram: formData.get("socialInstagram") ?? "",
    socialTwitter: formData.get("socialTwitter") ?? "",
    socialSnapchat: formData.get("socialSnapchat") ?? "",
    socialTiktok: formData.get("socialTiktok") ?? "",
    socialYoutube: formData.get("socialYoutube") ?? "",
    socialLinkedin: formData.get("socialLinkedin") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "بيانات الإعدادات غير مكتملة أو غير صحيحة.",
    };
  }

  const [contactResult, brandResult, mediaResult, homepageResult, socialResult] =
    await Promise.all([
      saveSettingsGroup("contact", {
        phone: parsed.data.phone,
        phoneSecondary: parsed.data.phoneSecondary,
        email: parsed.data.email,
        emailSecondary: parsed.data.emailSecondary,
        domain: parsed.data.domain,
        whatsapp: parsed.data.whatsapp,
        // hours block - subagent #3
        hoursWeekdays: parsed.data.hoursWeekdays,
        hoursWeekend: parsed.data.hoursWeekend,
        hoursWeekdaysEn: parsed.data.hoursWeekdaysEn,
        hoursWeekendEn: parsed.data.hoursWeekendEn,
      }),
      saveSettingsGroup("brand", {
        siteName: parsed.data.siteName,
        shortName: parsed.data.shortName,
        tagline: parsed.data.tagline,
        announcement: parsed.data.announcement,
        seoDescription: parsed.data.seoDescription,
        logoAlt: parsed.data.logoAlt,
      }),
      saveSettingsGroup("media", {
        brandLogo: parsed.data.brandLogo,
        brandMark: parsed.data.brandMark,
        favicon: parsed.data.favicon,
        appleIcon: parsed.data.appleIcon,
        ogImage: parsed.data.ogImage,
        homeHero: parsed.data.homeHero,
        doctorsHero: parsed.data.doctorsHero,
        servicesHero: parsed.data.servicesHero,
        aboutHero: parsed.data.aboutHero,
        journalHero: parsed.data.journalHero,
      }),
      saveSettingsGroup("homepage", {
        heroTitle: parsed.data.heroTitle,
        heroTitleAccent: parsed.data.heroTitleAccent,
        heroDescription: parsed.data.heroDescription,
        heroPillLabel: parsed.data.heroPillLabel,
        heroCtaPrimary: parsed.data.heroCtaPrimary,
        heroCtaSecondary: parsed.data.heroCtaSecondary,
        trustEyebrow: parsed.data.trustEyebrow,
        trustTitle: parsed.data.trustTitle,
        trustDescription: parsed.data.trustDescription,
        stripEyebrow: parsed.data.stripEyebrow,
        stripTitle: parsed.data.stripTitle,
        stripDescription: parsed.data.stripDescription,
        galleryEyebrow: parsed.data.galleryEyebrow,
        galleryTitle: parsed.data.galleryTitle,
        galleryDescription: parsed.data.galleryDescription,
        galleryItem1Image: parsed.data.galleryItem1Image,
        galleryItem1Title: parsed.data.galleryItem1Title,
        galleryItem1Description: parsed.data.galleryItem1Description,
        galleryItem2Image: parsed.data.galleryItem2Image,
        galleryItem2Title: parsed.data.galleryItem2Title,
        galleryItem2Description: parsed.data.galleryItem2Description,
        galleryItem3Image: parsed.data.galleryItem3Image,
        galleryItem3Title: parsed.data.galleryItem3Title,
        galleryItem3Description: parsed.data.galleryItem3Description,
        quotesEyebrow: parsed.data.quotesEyebrow,
        quotesTitle: parsed.data.quotesTitle,
        quotesDescription: parsed.data.quotesDescription,
        testimonial1AuthorAr: parsed.data.testimonial1AuthorAr,
        testimonial1AuthorEn: parsed.data.testimonial1AuthorEn,
        testimonial1QuoteAr: parsed.data.testimonial1QuoteAr,
        testimonial1QuoteEn: parsed.data.testimonial1QuoteEn,
        testimonial1Avatar: parsed.data.testimonial1Avatar,
        testimonial2AuthorAr: parsed.data.testimonial2AuthorAr,
        testimonial2AuthorEn: parsed.data.testimonial2AuthorEn,
        testimonial2QuoteAr: parsed.data.testimonial2QuoteAr,
        testimonial2QuoteEn: parsed.data.testimonial2QuoteEn,
        testimonial2Avatar: parsed.data.testimonial2Avatar,
        testimonial3AuthorAr: parsed.data.testimonial3AuthorAr,
        testimonial3AuthorEn: parsed.data.testimonial3AuthorEn,
        testimonial3QuoteAr: parsed.data.testimonial3QuoteAr,
        testimonial3QuoteEn: parsed.data.testimonial3QuoteEn,
        testimonial3Avatar: parsed.data.testimonial3Avatar,
      }),
      saveSettingsGroup("social", {
        instagram: parsed.data.socialInstagram,
        twitter: parsed.data.socialTwitter,
        snapchat: parsed.data.socialSnapchat,
        tiktok: parsed.data.socialTiktok,
        youtube: parsed.data.socialYoutube,
        linkedin: parsed.data.socialLinkedin,
      }),
    ]);

  revalidatePath("/admin/settings");
  revalidatePath("/admin/media");
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidatePath("/doctors");
  revalidatePath("/services");
  revalidatePath("/devices");
  revalidatePath("/journal");
  revalidatePath("/gallery");
  revalidatePath("/", "layout");

  return {
    status: "success",
    message:
      contactResult.mode === "database" &&
      brandResult.mode === "database" &&
      mediaResult.mode === "database" &&
      homepageResult.mode === "database" &&
      socialResult.mode === "database"
        ? "تم حفظ الإعدادات واعتمادها على الواجهة بنجاح."
        : "تم تحديث الإعدادات داخل بيئة العمل الحالية بنجاح.",
  };
}
