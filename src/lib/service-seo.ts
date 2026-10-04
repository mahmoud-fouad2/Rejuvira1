type ServiceSeoInput = {
  slug: string;
  name: string;
  nameEn?: string | null;
  excerpt: string;
  excerptEn?: string | null;
  descriptionEn?: string | null;
  seoTitleAr?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionAr?: string | null;
  seoDescriptionEn?: string | null;
};

type CoreSeoInput = {
  slug: string;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
};

export function hasEnglishServiceContent(service: ServiceSeoInput) {
  return Boolean(
    service.nameEn?.trim() &&
    service.excerptEn?.trim() &&
    service.descriptionEn?.trim(),
  );
}

/** Alias matching can supply the same core SEO to distinct service pages.
 * Keep deliberate custom copy; use the page's own content for inherited copy.
 */
export function resolveServiceSeo(
  service: ServiceSeoInput,
  core: CoreSeoInput | null,
) {
  const exactCore = core?.slug === service.slug;
  const choose = (
    custom: string | null | undefined,
    inherited: string | undefined,
    fallback: string,
  ) => {
    if (custom?.trim() && (exactCore || custom.trim() !== inherited?.trim()))
      return custom;
    return exactCore && inherited ? inherited : fallback;
  };
  return {
    titleAr: choose(
      service.seoTitleAr,
      core?.seoTitleAr,
      `${service.name} | ريجوفيرا بالرياض`,
    ),
    titleEn: choose(
      service.seoTitleEn,
      core?.seoTitleEn,
      `${service.nameEn ?? "Rejuvera Medical Center"} | Rejuvera Riyadh`,
    ),
    descriptionAr: choose(
      service.seoDescriptionAr,
      core?.seoDescriptionAr,
      service.excerpt,
    ),
    descriptionEn: choose(
      service.seoDescriptionEn,
      core?.seoDescriptionEn,
      service.excerptEn ?? "",
    ),
  };
}
