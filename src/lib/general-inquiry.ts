export const GENERAL_INQUIRY_SERVICE_VALUE = "general-inquiry";
export const GENERAL_INQUIRY_SERVICE_AR = "استفسار عام";
export const GENERAL_INQUIRY_SERVICE_EN = "General inquiry";

const generalInquiryAliases = new Set(
  [
    GENERAL_INQUIRY_SERVICE_VALUE,
    GENERAL_INQUIRY_SERVICE_AR,
    GENERAL_INQUIRY_SERVICE_EN,
    "general",
    "general inquiry",
    "استشارة عامة",
    "استفسار",
  ].map((value) => value.toLowerCase()),
);

export function isGeneralInquiryService(value?: string | null) {
  const normalized = value?.trim().toLowerCase();
  return normalized ? generalInquiryAliases.has(normalized) : false;
}

export function hasGeneralInquiryTag(tags: readonly string[] | undefined) {
  return tags?.some((tag) => isGeneralInquiryService(tag)) ?? false;
}
