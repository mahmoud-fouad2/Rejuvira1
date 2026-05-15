import Image from "next/image";

import { ImageUploader } from "@/components/admin/ImageUploader";
import { getMediaSelections } from "@/lib/content-repository";
import { getReferenceAssets } from "@/lib/reference-assets";

export default async function AdminMediaPage() {
  const [referenceAssets, mediaSelections] = await Promise.all([
    getReferenceAssets(),
    getMediaSelections(),
  ]);
  const categories = Array.from(
    new Set(referenceAssets.map((asset) => asset.category)),
  );
  const curatedSlots = [
    {
      key: "brandLogo",
      label: "الشعار الرئيسي",
      value: mediaSelections.brandLogo,
    },
    {
      key: "brandMark",
      label: "أيقونة الهوية",
      value: mediaSelections.brandMark,
    },
    {
      key: "favicon",
      label: "Favicon",
      value: mediaSelections.favicon,
    },
    {
      key: "appleIcon",
      label: "Apple Touch Icon",
      value: mediaSelections.appleIcon,
    },
    {
      key: "ogImage",
      label: "صورة المشاركة الاجتماعية",
      value: mediaSelections.ogImage,
    },
    {
      key: "homeHero",
      label: "الصفحة الرئيسية",
      value: mediaSelections.homeHero,
    },
    {
      key: "doctorsHero",
      label: "قسم الأطباء",
      value: mediaSelections.doctorsHero,
    },
    {
      key: "servicesHero",
      label: "قسم الخدمات",
      value: mediaSelections.servicesHero,
    },
    { key: "aboutHero", label: "من نحن", value: mediaSelections.aboutHero },
    {
      key: "journalHero",
      label: "المجلة الطبية",
      value: mediaSelections.journalHero,
    },
  ];

  return (
    <>
      <section className="surface-panel rounded-[1.5rem] p-5 lg:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">
          Media Library
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-strong">
          الصور والأصول
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-soft">
          ارفع صورة جديدة، ثم انسخ الرابط لاستخدامه في الإعدادات أو صفحات الأطباء والخدمات والمعرض.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-ink-soft">
          <span className="rounded-full border border-line bg-surface px-4 py-2">
            عدد الملفات: {referenceAssets.length}
          </span>
          <span className="rounded-full border border-line bg-surface px-4 py-2">
            التصنيفات: {categories.length}
          </span>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="surface-panel rounded-[1.5rem] p-5 lg:p-6">
          <h2 className="text-xl font-semibold tracking-tight text-ink-strong">
            رفع صورة جديدة
          </h2>
          <p className="mt-2 text-sm leading-7 text-ink-soft">
            بعد الرفع سيظهر الرابط في الحقل. انسخه وضعه في إعدادات الصور أو نموذج الطبيب/الخدمة/المعرض.
          </p>
          <div className="mt-5">
            <ImageUploader
              name="mediaUploadPreview"
              namespace="media/uploads"
              label="Upload"
              placeholder="سيظهر رابط الصورة هنا بعد الرفع"
              helper="الرفع يستخدم نفس API الحالي ولا يغيّر أي محتوى حتى تحفظ الرابط في القسم المناسب."
            />
          </div>
        </article>
        <aside className="surface-panel rounded-[1.5rem] p-5">
          <h3 className="text-base font-semibold text-ink-strong">تعديل وحذف الصور</h3>
          <div className="mt-4 grid gap-3">
            <a href="/admin/settings" className="admin-compact-row">
              <span className="text-sm font-semibold text-ink-strong">صور الصفحات</span>
              <span className="text-xs text-ink-soft">الإعدادات ← حقول الصور</span>
            </a>
            <a href="/admin/gallery" className="admin-compact-row">
              <span className="text-sm font-semibold text-ink-strong">المعرض</span>
              <span className="text-xs text-ink-soft">إضافة / تعديل / حذف</span>
            </a>
            <a href="/admin/doctors" className="admin-compact-row">
              <span className="text-sm font-semibold text-ink-strong">صور الأطباء</span>
              <span className="text-xs text-ink-soft">داخل نموذج الطبيب</span>
            </a>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {curatedSlots.map((slot) => (
          <article
            key={slot.key}
            className="surface-panel overflow-hidden rounded-[1.5rem] p-4"
          >
            <div className="relative h-52 overflow-hidden rounded-[1.4rem]">
              <Image
                src={slot.value}
                alt={slot.label}
                fill
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-ink-faint">الموضع الحالي</p>
            <p className="mt-3 text-lg font-semibold text-ink-strong">{slot.label}</p>
            <p className="mt-2 truncate text-sm text-ink-soft" dir="ltr">{slot.value}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {referenceAssets.map((asset) => (
          <article
            key={asset.fileName}
            className="surface-panel overflow-hidden rounded-[1.5rem] p-4"
          >
            <div className="relative h-52 overflow-hidden rounded-[1.4rem]">
              <Image
                src={asset.path}
                alt={asset.label}
                fill
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-ink-faint">
              {asset.category}
            </p>
            <p className="mt-4 text-lg font-semibold text-ink-strong">{asset.label}</p>
            <p className="mt-2 text-sm text-ink-soft">{asset.fileName}</p>
            <p className="mt-1 truncate text-xs text-ink-faint" dir="ltr">{asset.path}</p>
          </article>
        ))}
      </section>
    </>
  );
}
