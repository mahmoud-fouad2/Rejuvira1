export type SeoLanguage = "ar" | "en";

// Search metadata follows the URL, not a visitor's cookies or stored UI choice.
export function seoLanguageFromUrl(url: string | null): SeoLanguage {
  if (!url) return "ar";
  try {
    return new URL(url, "https://rejuvera.sa").searchParams.get("lang") === "en"
      ? "en"
      : "ar";
  } catch {
    return "ar";
  }
}

export function localizedSeoValues(input: {
  language: SeoLanguage;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  url: string;
  hasEnglish?: boolean;
}) {
  const hasEnglish =
    input.hasEnglish !== false &&
    Boolean(input.titleEn.trim() && input.descriptionEn.trim());
  const english = hasEnglish && input.language === "en";
  const arUrl = new URL(input.url);
  arUrl.searchParams.delete("lang");
  const enUrl = new URL(arUrl);
  enUrl.searchParams.set("lang", "en");
  return {
    title: english ? input.titleEn : input.titleAr,
    description: english ? input.descriptionEn : input.descriptionAr,
    canonical: english ? enUrl.href : arUrl.href,
    locale: english ? "en_US" : "ar_SA",
    ...(hasEnglish ? { alternateLocale: english ? "ar_SA" : "en_US" } : {}),
    languages: {
      ar: arUrl.href,
      "ar-SA": arUrl.href,
      ...(hasEnglish ? { en: enUrl.href, "en-US": enUrl.href } : {}),
      "x-default": arUrl.href,
    },
  };
}

export function hasEnglishDoctorContent(doctor: {
  nameEn?: string | null;
  specialtyEn?: string | null;
  bioEn?: string | null;
}) {
  return Boolean(
    doctor.nameEn?.trim() && doctor.specialtyEn?.trim() && doctor.bioEn?.trim(),
  );
}
