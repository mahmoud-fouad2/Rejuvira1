import coreServices from "@/data/core-services.json";

export type CoreServiceDefinition = (typeof coreServices)[number];

const RHINO_DEVICE_TERMS = ["rhino", "راينو"] as const;

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase("en");
}

export function getCoreServiceDefinition(service: {
  slug: string;
  name?: string | null;
  nameEn?: string | null;
}) {
  const searchable = [service.slug, service.name, service.nameEn]
    .map(normalize)
    .join(" ");

  return (
    coreServices.find(
      (definition) =>
        definition.slug === service.slug ||
        definition.aliases.some((alias) =>
          searchable.includes(normalize(alias)),
        ),
    ) ?? null
  );
}

export function getCoreServiceRank(service: {
  slug: string;
  name?: string | null;
  nameEn?: string | null;
}) {
  const definition = getCoreServiceDefinition(service);
  return definition
    ? coreServices.findIndex((item) => item.slug === definition.slug)
    : Number.MAX_SAFE_INTEGER;
}

export function sortCoreServicesFirst<
  T extends {
    slug: string;
    name?: string | null;
    nameEn?: string | null;
    featured?: boolean;
  },
>(items: T[]) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const coreRank =
        getCoreServiceRank(left.item) - getCoreServiceRank(right.item);
      if (coreRank !== 0) return coreRank;

      const featuredRank =
        Number(Boolean(right.item.featured)) -
        Number(Boolean(left.item.featured));
      if (featuredRank !== 0) return featuredRank;

      return left.index - right.index;
    })
    .map(({ item }) => item);
}

export function isRhinoDevice(device: {
  slug: string;
  name?: string | null;
  nameEn?: string | null;
}) {
  const searchable = [device.slug, device.name, device.nameEn]
    .map(normalize)
    .join(" ");
  return RHINO_DEVICE_TERMS.some((term) =>
    searchable.includes(normalize(term)),
  );
}

export function sortCoreDevicesFirst<
  T extends {
    slug: string;
    name?: string | null;
    nameEn?: string | null;
    featured?: boolean;
  },
>(items: T[]) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const rhinoRank =
        Number(isRhinoDevice(right.item)) - Number(isRhinoDevice(left.item));
      if (rhinoRank !== 0) return rhinoRank;

      const featuredRank =
        Number(Boolean(right.item.featured)) -
        Number(Boolean(left.item.featured));
      if (featuredRank !== 0) return featuredRank;

      return left.index - right.index;
    })
    .map(({ item }) => item);
}

export function getCoreServiceSeo(service: {
  slug: string;
  name?: string | null;
  nameEn?: string | null;
}) {
  return getCoreServiceDefinition(service);
}

export const coreServiceSeedData = coreServices;

export const coreSearchKeywords = [
  ...coreServices.flatMap((service) => service.keywordsAr),
  ...coreServices.flatMap((service) => service.keywordsEn),
  "جهاز الراينو",
  "Rhino device Riyadh",
  "د. لؤي السالمي",
  "Dr. Loai Al-Salmi",
];
