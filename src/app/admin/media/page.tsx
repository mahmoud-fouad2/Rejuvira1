import Image from "next/image";

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
      <section className="surface-panel rounded-[2rem] p-6 lg:p-8">
        <p className="eyebrow">المكتبة المرجعية</p>
        <h1 className="text-ink mt-4 font-serif text-5xl tracking-[-0.05em]">
          الأصول المرجعية المحلية
        </h1>
        <p className="text-ink-soft mt-4 max-w-3xl text-base leading-8">
          تجمع هذه الصفحة المشاهد المعتمدة للواجهة والملفات المرجعية المستخدمة
          في العرض والتحرير، مع إظهار الصورة الحالية لكل موضع رئيسي.
        </p>
        <div className="text-ink-soft mt-6 flex flex-wrap gap-3 text-sm">
          <span className="border-line bg-surface rounded-full border px-4 py-2">
            عدد الملفات: {referenceAssets.length}
          </span>
          <span className="border-line bg-surface rounded-full border px-4 py-2">
            التصنيفات: {categories.length}
          </span>
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {curatedSlots.map((slot) => (
          <article
            key={slot.key}
            className="surface-panel overflow-hidden rounded-[1.85rem] p-4"
          >
            <div className="relative h-52 overflow-hidden rounded-[1.4rem]">
              <Image
                src={slot.value}
                alt={slot.label}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-ink-faint mt-4 text-xs tracking-[0.18em] uppercase">
              الموضع الحالي
            </p>
            <p className="text-ink mt-3 text-lg font-semibold">{slot.label}</p>
            <p className="text-ink-soft mt-2 text-sm">{slot.value}</p>
            <p className="text-ink-faint mt-2 text-xs">
              يتم تحديث هذا الموضع من الإعدادات ليظهر مباشرة في الواجهة العامة.
            </p>
          </article>
        ))}
      </section>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {referenceAssets.map((asset) => (
          <article
            key={asset.fileName}
            className="surface-panel overflow-hidden rounded-[1.85rem] p-4"
          >
            <div className="relative h-52 overflow-hidden rounded-[1.4rem]">
              <Image
                src={asset.path}
                alt={asset.label}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-ink-faint mt-4 text-xs tracking-[0.18em] uppercase">
              {asset.category}
            </p>
            <p className="text-ink mt-4 text-lg font-semibold">{asset.label}</p>
            <p className="text-ink-soft mt-2 text-sm">{asset.fileName}</p>
            <p className="text-ink-faint mt-1 text-xs">{asset.path}</p>
          </article>
        ))}
      </section>
    </>
  );
}
