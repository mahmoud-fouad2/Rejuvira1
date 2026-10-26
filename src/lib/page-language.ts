import {
  getDoctorBySlug,
  getServiceBySlug,
  getJournalPostBySlug,
} from "@/lib/content-repository";
import {
  hasEnglishDoctorContent,
  seoLanguageFromUrl,
} from "@/lib/seo-localization";
import { hasEnglishServiceContent } from "@/lib/service-seo";
import { hasEnglishJournalContent } from "@/lib/journal-content";

/** Resolve the language of the actual page content, never a visitor cookie. */
export async function pageLanguage(pathname: string, url: string | null) {
  let hasEnglish = !pathname.startsWith("/p/") && pathname !== "/journal";
  const match = /^\/(services|doctors|journal)\/([^/]+)$/.exec(pathname);
  if (match) {
    let slug: string;
    try {
      slug = decodeURIComponent(match[2]!);
    } catch {
      return { language: "ar" as const, hasEnglish: false };
    }
    if (match[1] === "services") {
      const service = await getServiceBySlug(slug);
      hasEnglish = Boolean(service && hasEnglishServiceContent(service));
    } else if (match[1] === "doctors") {
      const doctor = await getDoctorBySlug(slug);
      hasEnglish = Boolean(doctor && hasEnglishDoctorContent(doctor));
    } else {
      const post = await getJournalPostBySlug(slug);
      hasEnglish = Boolean(post && hasEnglishJournalContent(post));
    }
  }
  return {
    language: hasEnglish ? seoLanguageFromUrl(url) : ("ar" as const),
    hasEnglish,
  };
}
