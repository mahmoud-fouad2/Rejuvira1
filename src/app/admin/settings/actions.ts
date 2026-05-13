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
  email: z.string().email(),
  whatsapp: z.string().min(5),
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
  heroDescription: z.string().min(20),
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
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp"),
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
    heroDescription: formData.get("heroDescription"),
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
        email: parsed.data.email,
        whatsapp: parsed.data.whatsapp,
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
        heroDescription: parsed.data.heroDescription,
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
  revalidatePath("/journal");
  revalidatePath("/gallery");

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
