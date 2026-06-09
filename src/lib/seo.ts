import type { Metadata } from "next";

import { getCanonicalOrigin } from "@/lib/canonical-host";
import {
  getRuntimeSettings,
  type SeoPageDefaults,
  type SeoSettings,
} from "@/lib/content-repository";

type SeoPageKey = keyof SeoSettings;

export function getSiteUrl(): string {
  return getCanonicalOrigin();
}

function getCanonicalPath(path: string): string {
  if (!path || path === "/") return getSiteUrl() + "/";
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildAlternates(path: string) {
  const url = getCanonicalPath(path);
  const enUrl = path === "/" ? `${url}?lang=en` : `${url}?lang=en`;
  const arUrl = url;
  return {
    canonical: arUrl,
    languages: {
      ar: arUrl,
      "ar-SA": arUrl,
      en: enUrl,
      "en-US": enUrl,
      "x-default": arUrl,
    },
  };
}

export type BuildMetadataInput = {
  page: SeoPageKey;
  path: string;
  ogImage?: string;
  overrideTitleAr?: string;
  overrideTitleEn?: string;
  overrideDescriptionAr?: string;
  overrideDescriptionEn?: string;
  overrideKeywords?: string;
};

export async function buildPageMetadata(
  input: BuildMetadataInput,
): Promise<Metadata> {
  const settings = await getRuntimeSettings();
  const pageSeo: SeoPageDefaults = settings.seo[input.page];
  const titleAr = input.overrideTitleAr ?? pageSeo.titleAr;
  const titleEn = input.overrideTitleEn ?? pageSeo.titleEn;
  const descAr = input.overrideDescriptionAr ?? pageSeo.descriptionAr;
  const descEn = input.overrideDescriptionEn ?? pageSeo.descriptionEn;
  const keywords =
    input.overrideKeywords ??
    [pageSeo.keywordsAr, pageSeo.keywordsEn].filter(Boolean).join(", ");
  const title = `${titleAr} — ${titleEn}`;
  const description = `${descAr} ${descEn}`.trim();
  const canonicalUrl = getCanonicalPath(input.path);
  const ogImage =
    input.ogImage ?? settings.media.ogImage ?? "/media/og/og-default.png";

  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    keywords,
    alternates: buildAlternates(input.path),
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: settings.brand.siteName,
      locale: "ar_SA",
      alternateLocale: "en_US",
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: settings.brand.logoAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    other: {
      "format-detection": "telephone=no",
      "geo.region": "SA-01",
      "geo.placename": "Riyadh",
      "geo.position": "24.7225835;46.6527524",
      ICBM: "24.7225835, 46.6527524",
    },
  };
}

export function buildLocalBusinessJsonLd(settings: {
  brand: { siteName: string; seoDescription: string; logoAlt: string };
  contact: {
    phone: string;
    phoneSecondary: string;
    email: string;
    emailSecondary: string;
    domain: string;
    addressAr?: string;
    addressEn?: string;
  };
  media: { ogImage: string; brandLogo: string };
  social?: Record<string, string>;
}) {
  const baseUrl = getSiteUrl();
  const sameAs = settings.social
    ? Object.values(settings.social).filter(
        (url) => url && /^https?:\/\//.test(url),
      )
    : [];
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${baseUrl}#organization`,
    name: settings.brand.siteName,
    alternateName: "Rejuvera",
    description: settings.brand.seoDescription,
    url: baseUrl,
    telephone: [settings.contact.phone, settings.contact.phoneSecondary].filter(
      Boolean,
    ),
    email: settings.contact.email,
    image: settings.media.ogImage?.startsWith("http")
      ? settings.media.ogImage
      : `${baseUrl}${settings.media.ogImage}`,
    logo: settings.media.brandLogo?.startsWith("http")
      ? settings.media.brandLogo
      : `${baseUrl}${settings.media.brandLogo}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Riyadh",
      addressCountry: "SA",
      addressRegion: "Riyadh Region",
      streetAddress:
        settings.contact.addressEn ??
        settings.contact.addressAr ??
        "Riyadh, Saudi Arabia",
    },
    areaServed: ["SA", { "@type": "City", name: "Riyadh" }],
    medicalSpecialty: ["Dermatology", "PlasticSurgery", "Aesthetic Medicine"],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Saturday",
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
        ],
        opens: "14:00",
        closes: "22:00",
      },
    ],
    inLanguage: ["ar", "en"],
    ...(sameAs.length ? { sameAs } : {}),
  } as const;
}

export function buildSiteCreatorJsonLd(settings: {
  brand: { siteName: string };
}) {
  const baseUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}#website`,
    name: settings.brand.siteName,
    url: baseUrl,
    inLanguage: ["ar", "en"],
    publisher: { "@id": `${baseUrl}#organization` },
    creator: {
      "@type": "Person",
      "@id": "https://ma-fo.info/#person",
      name: "Mahmoud Fouad",
      jobTitle: "Website Developer and Creator",
      url: "https://ma-fo.info",
      sameAs: ["https://www.linkedin.com/in/mahmoud-fouad"],
    },
  } as const;
}

export function buildCollectionPageJsonLd(input: {
  path: string;
  name: string;
  description: string;
}) {
  const baseUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${baseUrl}${input.path}`,
    name: input.name,
    description: input.description,
    isPartOf: { "@id": `${baseUrl}#website` },
    inLanguage: ["ar", "en"],
  } as const;
}
