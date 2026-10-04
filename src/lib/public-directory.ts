import { publicServiceSlug } from "./public-service-slug.ts";

type PublishedItem = { status?: string | null };
type DirectoryItem = {
  slug: string;
  name: string;
  nameEn?: string | null;
} & PublishedItem;
export type PublicDirectoryLink = {
  href: string;
  titleAr: string;
  titleEn?: string | null | undefined;
};

export function isPubliclyPublished(item: PublishedItem): boolean {
  return (item.status ?? "PUBLISHED") === "PUBLISHED";
}

export function buildPublicDirectory(input: {
  services: readonly DirectoryItem[];
  doctors: readonly DirectoryItem[];
  posts: readonly ({ slug: string; title: string } & PublishedItem)[];
  pages: readonly ({
    slug: string;
    seoSlug?: string | null;
    titleAr: string;
    titleEn?: string | null;
    noindex: boolean;
  } & PublishedItem)[];
}) {
  const unique = (items: PublicDirectoryLink[]) =>
    items.filter(
      (item, index) =>
        items.findIndex((link) => link.href === item.href) === index,
    );
  return {
    services: unique(
      input.services
        .filter(isPubliclyPublished)
        .filter((item) => publicServiceSlug(item.slug) === item.slug)
        .map((item) => ({
          href: `/services/${encodeURIComponent(item.slug)}`,
          titleAr: item.name,
          titleEn: item.nameEn,
        })),
    ),
    doctors: unique(
      input.doctors.filter(isPubliclyPublished).map((item) => ({
        href: `/doctors/${encodeURIComponent(item.slug)}`,
        titleAr: item.name,
        titleEn: item.nameEn,
      })),
    ),
    posts: unique(
      input.posts.filter(isPubliclyPublished).map((item) => ({
        href: `/journal/${encodeURIComponent(item.slug)}`,
        titleAr: item.title,
      })),
    ),
    pages: unique(
      input.pages
        .filter((item) => isPubliclyPublished(item) && !item.noindex)
        .map((item) => ({
          href: `/p/${encodeURIComponent(item.seoSlug || item.slug)}`,
          titleAr: item.titleAr,
          titleEn: item.titleEn,
        })),
    ),
  };
}
