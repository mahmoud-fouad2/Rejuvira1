/** Only verified legacy links; do not lowercase or rewrite arbitrary slugs. */
const LEGACY_SERVICE_SLUGS: Record<string, string> = {
  "عملية شد الصدر": "breast-lift",
};

export function publicServiceSlug(slug: string) {
  return LEGACY_SERVICE_SLUGS[slug] ?? slug;
}
