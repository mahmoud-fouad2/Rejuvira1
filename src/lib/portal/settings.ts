import { cache } from "react";

import { prisma } from "@/lib/prisma";

/**
 * Patient-portal settings stored in the existing `SiteSetting` key/value
 * table under the `patientPortal` group, so the portal reuses the same
 * managed-settings infrastructure as the rest of the site.
 */

const GROUP = "patientPortal";
const KEY_PREFIX = "patientPortal.";

export type PortalSettings = {
  /** Hours before an activation/recovery link expires. */
  activationLinkHours: number;
  /** Patient session lifetime in hours. */
  sessionHours: number;
  /** Minimum patient password length. */
  passwordMinLength: number;
  /** Failed logins before a temporary lock. */
  maxFailedLogins: number;
  /** Minutes an account stays locked after repeated failures. */
  lockMinutes: number;
  /** Current privacy-policy version patients consent to. */
  privacyPolicyVersion: string;
  /** Footer text printed on instruction PDFs. */
  pdfFooterText: string;
  /** Google review URL shown after internal feedback (empty = hidden). */
  googleReviewUrl: string;
  /** Default print language: ar | en | both. */
  defaultPrintLanguage: string;
  /** Clinic working hours line shown to patients. */
  workingHours: string;
  /** Notifications enabled master switch (queueing only). */
  notificationsEnabled: boolean;
  /** Patient portal shared promotional banner controls. */
  portalBannerEnabled: boolean;
  portalBannerTitle: string;
  portalBannerBody: string;
  portalBannerImageUrl: string;
  portalBannerCtaLabel: string;
  portalBannerCtaHref: string;
};

export const DEFAULT_PORTAL_SETTINGS: PortalSettings = {
  activationLinkHours: 72,
  sessionHours: 24 * 7,
  passwordMinLength: 8,
  maxFailedLogins: 5,
  lockMinutes: 15,
  privacyPolicyVersion: "1.0",
  pdfFooterText:
    "هذا المستند خاص بالمريض المذكور ولا يجوز مشاركته. المعلومات الواردة فيه إرشادية ولا تغني عن استشارة الطبيب.",
  googleReviewUrl: "",
  defaultPrintLanguage: "ar",
  workingHours: "",
  notificationsEnabled: true,
  portalBannerEnabled: true,
  portalBannerTitle: "عناية Rejuvera تبدأ من هنا",
  portalBannerBody:
    "تابع تعليماتك ومواعيدك ورسائلك من مكان واحد، وستظهر هنا أي عروض أو تنبيهات مهمة من المركز.",
  portalBannerImageUrl: "/media/portal/patient-portal-banner.png",
  portalBannerCtaLabel: "تواصل مع الفريق",
  portalBannerCtaHref: "/portal/messages",
};

function parseNumber(value: unknown, fallback: number) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
}

function parseString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function parseBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export const getPortalSettings = cache(async (): Promise<PortalSettings> => {
  if (!process.env.DATABASE_URL) return { ...DEFAULT_PORTAL_SETTINGS };
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { groupName: GROUP },
    });
    const map = new Map<string, unknown>();
    for (const row of rows) {
      map.set(
        row.key.startsWith(KEY_PREFIX)
          ? row.key.slice(KEY_PREFIX.length)
          : row.key,
        row.value,
      );
    }
    const d = DEFAULT_PORTAL_SETTINGS;
    return {
      activationLinkHours: parseNumber(
        map.get("activationLinkHours"),
        d.activationLinkHours,
      ),
      sessionHours: parseNumber(map.get("sessionHours"), d.sessionHours),
      passwordMinLength: parseNumber(
        map.get("passwordMinLength"),
        d.passwordMinLength,
      ),
      maxFailedLogins: parseNumber(
        map.get("maxFailedLogins"),
        d.maxFailedLogins,
      ),
      lockMinutes: parseNumber(map.get("lockMinutes"), d.lockMinutes),
      privacyPolicyVersion: parseString(
        map.get("privacyPolicyVersion"),
        d.privacyPolicyVersion,
      ),
      pdfFooterText: parseString(map.get("pdfFooterText"), d.pdfFooterText),
      googleReviewUrl: parseString(
        map.get("googleReviewUrl"),
        d.googleReviewUrl,
      ),
      defaultPrintLanguage: parseString(
        map.get("defaultPrintLanguage"),
        d.defaultPrintLanguage,
      ),
      workingHours: parseString(map.get("workingHours"), d.workingHours),
      notificationsEnabled: parseBoolean(
        map.get("notificationsEnabled"),
        d.notificationsEnabled,
      ),
      portalBannerEnabled: parseBoolean(
        map.get("portalBannerEnabled"),
        d.portalBannerEnabled,
      ),
      portalBannerTitle: parseString(
        map.get("portalBannerTitle"),
        d.portalBannerTitle,
      ),
      portalBannerBody: parseString(
        map.get("portalBannerBody"),
        d.portalBannerBody,
      ),
      portalBannerImageUrl: parseString(
        map.get("portalBannerImageUrl"),
        d.portalBannerImageUrl,
      ),
      portalBannerCtaLabel: parseString(
        map.get("portalBannerCtaLabel"),
        d.portalBannerCtaLabel,
      ),
      portalBannerCtaHref: parseString(
        map.get("portalBannerCtaHref"),
        d.portalBannerCtaHref,
      ),
    };
  } catch {
    return { ...DEFAULT_PORTAL_SETTINGS };
  }
});

export async function updatePortalSettings(
  values: Partial<Record<keyof PortalSettings, string | number | boolean>>,
) {
  const entries = Object.entries(values).filter(
    ([key]) => key in DEFAULT_PORTAL_SETTINGS,
  );
  for (const [key, value] of entries) {
    await prisma.siteSetting.upsert({
      where: { key: `${KEY_PREFIX}${key}` },
      update: { value: value as never },
      create: {
        key: `${KEY_PREFIX}${key}`,
        value: value as never,
        groupName: GROUP,
      },
    });
  }
}
