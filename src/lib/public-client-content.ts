import type {
  DeviceRecord,
  DoctorRecord,
  HomePageSettings,
  JournalPostRecord,
  ServiceRecord,
} from "./content-repository";

export type BookingServiceOption = Pick<ServiceRecord, "id" | "slug" | "name">;

/** Project on the server, before records cross a client component boundary. */
export function bookingServiceOptions(
  services: readonly BookingServiceOption[],
) {
  return services.map(({ id, slug, name }) => ({ id, slug, name }));
}

export type MegaMenuContent = {
  services: readonly Pick<
    ServiceRecord,
    "slug" | "name" | "category" | "coverImageUrl"
  >[];
  doctors: readonly Pick<
    DoctorRecord,
    "slug" | "name" | "specialty" | "photoUrl" | "coverImageUrl"
  >[];
  devices: readonly Pick<
    DeviceRecord,
    "name" | "certifications" | "imageUrl"
  >[];
};

/** The menu renders four items per column; do not serialize the whole catalog. */
export function megaMenuContent(content: MegaMenuContent): MegaMenuContent {
  return {
    services: content.services
      .slice(0, 4)
      .map(({ slug, name, category, coverImageUrl }) => ({
        slug,
        name,
        category,
        coverImageUrl,
      })),
    doctors: content.doctors
      .slice(0, 4)
      .map(({ slug, name, specialty, photoUrl, coverImageUrl }) => ({
        slug,
        name,
        specialty,
        photoUrl,
        coverImageUrl,
      })),
    devices: content.devices
      .slice(0, 4)
      .map(({ name, certifications, imageUrl }) => ({
        name,
        certifications: certifications.slice(0, 1),
        imageUrl,
      })),
  };
}

export type ServiceCardContent = Pick<
  ServiceRecord,
  "id" | "slug" | "name" | "category" | "coverImageUrl"
>;
export function serviceCardContent(services: readonly ServiceCardContent[]) {
  return services.map(({ id, slug, name, category, coverImageUrl }) => ({
    id,
    slug,
    name,
    category,
    coverImageUrl,
  }));
}

export type DoctorCardContent = Pick<
  DoctorRecord,
  | "id"
  | "slug"
  | "name"
  | "title"
  | "specialty"
  | "photoUrl"
  | "coverImageUrl"
  | "yearsExperience"
  | "languages"
  | "featured"
>;
export function doctorCardContent(doctors: readonly DoctorCardContent[]) {
  return doctors.map(
    ({
      id,
      slug,
      name,
      title,
      specialty,
      photoUrl,
      coverImageUrl,
      yearsExperience,
      languages,
      featured,
    }) => ({
      id,
      slug,
      name,
      title,
      specialty,
      photoUrl,
      coverImageUrl,
      yearsExperience,
      languages,
      featured,
    }),
  );
}

export type DoctorQuoteContent = Pick<
  DoctorRecord,
  "id" | "slug" | "name" | "title" | "summary" | "photoUrl" | "coverImageUrl"
>;
export function doctorQuoteContent(doctors: readonly DoctorQuoteContent[]) {
  return doctors.map(
    ({ id, slug, name, title, summary, photoUrl, coverImageUrl }) => ({
      id,
      slug,
      name,
      title,
      summary,
      photoUrl,
      coverImageUrl,
    }),
  );
}

export type QuoteHeadingContent = Pick<
  HomePageSettings,
  | "quotesEyebrow"
  | "quotesEyebrowEn"
  | "quotesTitle"
  | "quotesTitleEn"
  | "quotesDescription"
  | "quotesDescriptionEn"
>;
export function quoteHeadingContent({
  quotesEyebrow,
  quotesEyebrowEn,
  quotesTitle,
  quotesTitleEn,
  quotesDescription,
  quotesDescriptionEn,
}: QuoteHeadingContent) {
  return {
    quotesEyebrow,
    quotesEyebrowEn,
    quotesTitle,
    quotesTitleEn,
    quotesDescription,
    quotesDescriptionEn,
  };
}

export type JournalCardContent = Pick<
  JournalPostRecord,
  | "id"
  | "slug"
  | "title"
  | "titleEn"
  | "excerpt"
  | "excerptEn"
  | "coverImageUrl"
  | "category"
>;
export function journalCardContent(posts: readonly JournalCardContent[]) {
  return posts.map(
    ({
      id,
      slug,
      title,
      titleEn,
      excerpt,
      excerptEn,
      coverImageUrl,
      category,
    }) => ({
      id,
      slug,
      title,
      titleEn: titleEn ?? null,
      excerpt,
      excerptEn: excerptEn ?? null,
      coverImageUrl,
      category,
    }),
  );
}
