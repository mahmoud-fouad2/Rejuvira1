"use client";

import { useActionState } from "react";

import {
  saveSettingsAction,
  type SettingsActionState,
} from "@/app/admin/settings/actions";
import type { SettingsGroup } from "@/lib/content-repository";

const initialState: SettingsActionState = {
  status: "idle",
  message: "",
};

function getFieldValue(
  groups: readonly SettingsGroup[],
  groupKey: string,
  fieldKey: string,
) {
  return (
    groups
      .find((group) => group.key === groupKey)
      ?.fields.find((field) => field.key === fieldKey)?.value ?? ""
  );
}

const homepageFieldGroups = [
  [
    ["heroTitle", "عنوان الهيرو"],
    ["heroDescription", "وصف الهيرو"],
  ],
  [
    ["galleryEyebrow", "عنوان فرعي لقسم الصورة المتغيرة"],
    ["galleryTitle", "عنوان قسم الصورة المتغيرة"],
  ],
  [["galleryDescription", "وصف قسم الصورة المتغيرة"]],
  [
    ["galleryItem1Image", "صورة العنصر الأول"],
    ["galleryItem1Title", "عنوان العنصر الأول"],
  ],
  [["galleryItem1Description", "وصف العنصر الأول"]],
  [
    ["galleryItem2Image", "صورة العنصر الثاني"],
    ["galleryItem2Title", "عنوان العنصر الثاني"],
  ],
  [["galleryItem2Description", "وصف العنصر الثاني"]],
  [
    ["galleryItem3Image", "صورة العنصر الثالث"],
    ["galleryItem3Title", "عنوان العنصر الثالث"],
  ],
  [["galleryItem3Description", "وصف العنصر الثالث"]],
  [
    ["quotesEyebrow", "عنوان فرعي لقسم مقولات الأطباء"],
    ["quotesTitle", "عنوان قسم مقولات الأطباء"],
  ],
  [["quotesDescription", "وصف قسم مقولات الأطباء"]],
] as const;

export function SettingsForm({ groups }: { groups: readonly SettingsGroup[] }) {
  const [state, formAction, isPending] = useActionState(
    saveSettingsAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div className="border-line bg-surface text-ink-soft rounded-[1.45rem] border px-4 py-4 text-sm leading-7">
        أدخل المسارات المعتمدة للصور الرئيسية والبيانات التي يجب أن تعتمدها جميع
        صفحات الموقع بصورة موحدة، بما في ذلك الشعار وfavicon وصور المشاركة.
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="phone"
          defaultValue={getFieldValue(groups, "contact", "phone")}
          placeholder="رقم الهاتف الرئيسي"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="email"
          type="email"
          defaultValue={getFieldValue(groups, "contact", "email")}
          placeholder="البريد الإلكتروني الرسمي"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="siteName"
          defaultValue={getFieldValue(groups, "brand", "siteName")}
          placeholder="اسم العلامة الرئيسي"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="shortName"
          defaultValue={getFieldValue(groups, "brand", "shortName")}
          placeholder="الاسم المختصر"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="whatsapp"
          defaultValue={getFieldValue(groups, "contact", "whatsapp")}
          placeholder="واتساب"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="tagline"
          defaultValue={getFieldValue(groups, "brand", "tagline")}
          placeholder="العبارة التعريفية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="announcement"
          defaultValue={getFieldValue(groups, "brand", "announcement")}
          placeholder="شريط الإعلان"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="logoAlt"
          defaultValue={getFieldValue(groups, "brand", "logoAlt")}
          placeholder="النص البديل للشعار"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4">
        <textarea
          name="seoDescription"
          rows={3}
          defaultValue={getFieldValue(groups, "brand", "seoDescription")}
          placeholder="الوصف التعريفي لمحركات البحث"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="brandLogo"
          defaultValue={getFieldValue(groups, "media", "brandLogo")}
          placeholder="الشعار الرئيسي"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="brandMark"
          defaultValue={getFieldValue(groups, "media", "brandMark")}
          placeholder="أيقونة الهوية المربعة"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="favicon"
          defaultValue={getFieldValue(groups, "media", "favicon")}
          placeholder="Favicon"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="appleIcon"
          defaultValue={getFieldValue(groups, "media", "appleIcon")}
          placeholder="Apple Touch Icon"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="ogImage"
          defaultValue={getFieldValue(groups, "media", "ogImage")}
          placeholder="صورة المشاركة الاجتماعية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="homeHero"
          defaultValue={getFieldValue(groups, "media", "homeHero")}
          placeholder="صورة الصفحة الرئيسية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="doctorsHero"
          defaultValue={getFieldValue(groups, "media", "doctorsHero")}
          placeholder="صورة قسم الأطباء"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="servicesHero"
          defaultValue={getFieldValue(groups, "media", "servicesHero")}
          placeholder="صورة قسم الخدمات"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="aboutHero"
          defaultValue={getFieldValue(groups, "media", "aboutHero")}
          placeholder="صورة صفحة من نحن"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="journalHero"
          defaultValue={getFieldValue(groups, "media", "journalHero")}
          placeholder="صورة المجلة الطبية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="border-line bg-surface rounded-[1.45rem] border p-4">
        <p className="text-ink font-semibold">الصفحة الرئيسية</p>
        <p className="text-ink-soft mt-2 text-sm leading-7">
          هذه الحقول تتحكم في الهيرو الحديث، سكشن الصورة المتغيرة، وقسم مقولات
          الأطباء داخل الصفحة الرئيسية.
        </p>
      </div>
      {homepageFieldGroups.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`grid gap-4 ${row.length > 1 ? "md:grid-cols-2" : ""}`}
        >
          {row.map(([fieldKey, placeholder]) => {
            const isDescription = fieldKey
              .toLowerCase()
              .includes("description");
            const isTitle = fieldKey.toLowerCase().includes("title");

            if (isDescription || fieldKey === "heroDescription") {
              return (
                <textarea
                  key={fieldKey}
                  name={fieldKey}
                  rows={fieldKey === "heroDescription" ? 4 : 3}
                  defaultValue={getFieldValue(groups, "homepage", fieldKey)}
                  placeholder={placeholder}
                  className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
                  required
                />
              );
            }

            return (
              <input
                key={fieldKey}
                name={fieldKey}
                defaultValue={getFieldValue(groups, "homepage", fieldKey)}
                placeholder={placeholder}
                className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
                required={
                  isTitle ||
                  fieldKey.toLowerCase().includes("image") ||
                  fieldKey.toLowerCase().includes("eyebrow")
                }
              />
            );
          })}
        </div>
      ))}
      <div className="border-line bg-surface rounded-[1.45rem] border p-4">
        <p className="text-ink font-semibold">قنوات التواصل الاجتماعي</p>
        <p className="text-ink-soft mt-2 text-sm leading-7">
          الروابط التي تظهر في تذييل الصفحة. اتركها فارغة لإخفاء الأيقونة.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="socialInstagram"
          defaultValue={getFieldValue(groups, "social", "instagram")}
          placeholder="Instagram — رابط الحساب"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
        <input
          name="socialTwitter"
          defaultValue={getFieldValue(groups, "social", "twitter")}
          placeholder="Twitter / X — رابط الحساب"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="socialSnapchat"
          defaultValue={getFieldValue(groups, "social", "snapchat")}
          placeholder="Snapchat — رابط الحساب"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
        <input
          name="socialTiktok"
          defaultValue={getFieldValue(groups, "social", "tiktok")}
          placeholder="TikTok — رابط الحساب"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="socialYoutube"
          defaultValue={getFieldValue(groups, "social", "youtube")}
          placeholder="YouTube — رابط القناة"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
        <input
          name="socialLinkedin"
          defaultValue={getFieldValue(groups, "social", "linkedin")}
          placeholder="LinkedIn — رابط الصفحة"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
      </div>
      {state.message ? (
        <p
          className={`text-sm ${state.status === "success" ? "text-emerald" : "text-burgundy"}`}
        >
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-canvas rounded-[1.15rem] px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </button>
    </form>
  );
}
