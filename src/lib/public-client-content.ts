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
    "slug" | "name" | "nameEn" | "category" | "categoryEn" | "coverImageUrl"
  >[];
  doctors: readonly Pick<
    DoctorRecord,
    "slug" | "name" | "nameEn" | "specialty" | "specialtyEn" | "photoUrl" | "coverImageUrl"
  >[];
  devices: readonly Pick<
    DeviceRecord,
    "name" | "nameEn" | "certifications" | "imageUrl"
  >[];
};

/** The menu renders four items per column; do not serialize the whole catalog. */
export function megaMenuContent(content: MegaMenuContent): MegaMenuContent {
  return {
    services: content.services
      .slice(0, 4)
      .map(({ slug, name, nameEn, category, categoryEn, coverImageUrl }) => ({
        slug,
        name,
        nameEn: nameEn ?? null,
        category,
        categoryEn: categoryEn ?? null,
        coverImageUrl,
      })),
    doctors: content.doctors
      .slice(0, 4)
      .map(({ slug, name, nameEn, specialty, specialtyEn, photoUrl, coverImageUrl }) => ({
        slug,
        name,
        nameEn: nameEn ?? null,
        specialty,
        specialtyEn: specialtyEn ?? null,
        photoUrl,
        coverImageUrl,
      })),
    devices: content.devices
      .slice(0, 4)
      .map(({ name, nameEn, certifications, imageUrl }) => ({
        name,
        nameEn: nameEn ?? null,
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
