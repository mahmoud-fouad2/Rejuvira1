"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { saveSettingsGroup } from "@/lib/content-repository";

export type ExtraSettingsState = {
  status: "idle" | "success" | "error";
  message: string;
};

const opsSchema = z.object({
  defaultTheme: z.enum(["light", "dark", "system"]).default("system"),
  themeToggleEnabled: z.string().optional(),
  recaptchaEnabled: z.string().optional(),
  maintenanceMode: z.string().optional(),
});

export async function saveOperationsAction(
  _prev: ExtraSettingsState,
  formData: FormData,
): Promise<ExtraSettingsState> {
  const parsed = opsSchema.safeParse({
    defaultTheme: formData.get("defaultTheme") ?? "system",
    themeToggleEnabled: formData.get("themeToggleEnabled"),
    recaptchaEnabled: formData.get("recaptchaEnabled"),
    maintenanceMode: formData.get("maintenanceMode"),
  });
  if (!parsed.success) {
    return { status: "error", message: "البيانات غير صحيحة." };
  }
  await saveSettingsGroup("ops", {
    defaultTheme: parsed.data.defaultTheme,
    themeToggleEnabled: parsed.data.themeToggleEnabled === "on" ? "true" : "false",
    recaptchaEnabled: parsed.data.recaptchaEnabled === "on" ? "true" : "false",
    maintenanceMode: parsed.data.maintenanceMode === "on" ? "true" : "false",
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { status: "success", message: "تم حفظ تفضيلات التشغيل." };
}

const integrationsSchema = z.object({
  chatbaseEnabled: z.string().optional(),
  chatbaseWidgetId: z.string().optional().or(z.literal("")),
  customHeadCode: z.string().optional().or(z.literal("")),
  customBodyCode: z.string().optional().or(z.literal("")),
  formWebhookEnabled: z.string().optional(),
  formWebhookUrl: z.string().url().optional().or(z.literal("")),
  formWebhookSecret: z.string().optional().or(z.literal("")),
});

export async function saveIntegrationsAction(
  _prev: ExtraSettingsState,
  formData: FormData,
): Promise<ExtraSettingsState> {
  const parsed = integrationsSchema.safeParse({
    chatbaseEnabled: formData.get("chatbaseEnabled"),
    chatbaseWidgetId: formData.get("chatbaseWidgetId") ?? "",
    customHeadCode: formData.get("customHeadCode") ?? "",
    customBodyCode: formData.get("customBodyCode") ?? "",
    formWebhookEnabled: formData.get("formWebhookEnabled"),
    formWebhookUrl: formData.get("formWebhookUrl") ?? "",
    formWebhookSecret: formData.get("formWebhookSecret") ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "تأكد من صحة رابط الويب هوك وبيانات التكامل.",
    };
  }
  await saveSettingsGroup("integrations", {
    chatbaseEnabled: parsed.data.chatbaseEnabled === "on" ? "true" : "false",
    chatbaseWidgetId: parsed.data.chatbaseWidgetId ?? "",
    customHeadCode: parsed.data.customHeadCode ?? "",
    customBodyCode: parsed.data.customBodyCode ?? "",
    formWebhookEnabled: parsed.data.formWebhookEnabled === "on" ? "true" : "false",
    formWebhookUrl: parsed.data.formWebhookUrl ?? "",
    formWebhookSecret: parsed.data.formWebhookSecret ?? "",
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { status: "success", message: "تم حفظ التكاملات والأكواد المؤقتة." };
}

const seoSchema = z.object({
  page: z.enum([
    "home",
    "services",
    "doctors",
    "devices",
    "gallery",
    "journal",
    "about",
    "contact",
  ]),
  titleAr: z.string().min(2),
  titleEn: z.string().min(2),
  descriptionAr: z.string().min(20),
  descriptionEn: z.string().min(20),
  keywordsAr: z.string().optional().or(z.literal("")),
  keywordsEn: z.string().optional().or(z.literal("")),
});

export async function saveSeoPageAction(
  _prev: ExtraSettingsState,
  formData: FormData,
): Promise<ExtraSettingsState> {
  const parsed = seoSchema.safeParse({
    page: formData.get("page"),
    titleAr: formData.get("titleAr"),
    titleEn: formData.get("titleEn"),
    descriptionAr: formData.get("descriptionAr"),
    descriptionEn: formData.get("descriptionEn"),
    keywordsAr: formData.get("keywordsAr") ?? "",
    keywordsEn: formData.get("keywordsEn") ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: "بيانات SEO غير مكتملة." };
  }
  const { page } = parsed.data;
  await saveSettingsGroup("seo", {
    [`${page}TitleAr`]: parsed.data.titleAr,
    [`${page}TitleEn`]: parsed.data.titleEn,
    [`${page}DescriptionAr`]: parsed.data.descriptionAr,
    [`${page}DescriptionEn`]: parsed.data.descriptionEn,
    [`${page}KeywordsAr`]: parsed.data.keywordsAr ?? "",
    [`${page}KeywordsEn`]: parsed.data.keywordsEn ?? "",
  });
  revalidatePath("/", "layout");
  revalidatePath(`/${page === "home" ? "" : page}`);
  return {
    status: "success",
    message: `تم حفظ SEO للصفحة (${page}).`,
  };
}

const contactExtraSchema = z.object({
  mapsEmbedUrl: z.string().url().or(z.literal("")),
  mapsShape: z.enum(["square", "rounded"]).default("rounded"),
  addressAr: z.string().min(3),
  addressEn: z.string().min(3),
});

export async function saveContactExtraAction(
  _prev: ExtraSettingsState,
  formData: FormData,
): Promise<ExtraSettingsState> {
  const parsed = contactExtraSchema.safeParse({
    mapsEmbedUrl: formData.get("mapsEmbedUrl") ?? "",
    mapsShape: formData.get("mapsShape") ?? "rounded",
    addressAr: formData.get("addressAr"),
    addressEn: formData.get("addressEn"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "تأكد من صحة رابط الخرائط والعنوان قبل الحفظ.",
    };
  }
  await saveSettingsGroup("contact", {
    mapsEmbedUrl: parsed.data.mapsEmbedUrl,
    mapsShape: parsed.data.mapsShape,
    addressAr: parsed.data.addressAr,
    addressEn: parsed.data.addressEn,
  });
  revalidatePath("/contact");
  revalidatePath("/");
  return { status: "success", message: "تم حفظ بيانات الخريطة والعنوان." };
}

const SOCIAL_KEYS = [
  "instagram",
  "twitter",
  "x",
  "snapchat",
  "tiktok",
  "youtube",
  "linkedin",
  "facebook",
  "whatsappBusiness",
  "threads",
] as const;

export async function saveSocialChannelsAction(
  _prev: ExtraSettingsState,
  formData: FormData,
): Promise<ExtraSettingsState> {
  const social: Record<string, string> = {};
  const visibility: Record<string, string> = {};
  for (const key of SOCIAL_KEYS) {
    social[key] = String(formData.get(`social_${key}`) ?? "");
    visibility[key] = formData.get(`visibility_${key}`) === "on" ? "true" : "false";
  }
  await Promise.all([
    saveSettingsGroup("social", social),
    saveSettingsGroup("socialVisibility", visibility),
  ]);
  revalidatePath("/", "layout");
  return { status: "success", message: "تم حفظ قنوات التواصل الاجتماعي." };
}
