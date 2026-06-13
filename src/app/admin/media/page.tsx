import Image from "next/image";

import { AdminListControls } from "@/components/admin/AdminListControls";
import { AdminMediaLibrary } from "@/components/admin/AdminMediaLibrary";
import { MediaSlotEditor } from "@/components/admin/MediaSlotEditor";
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
  const referenceTabs = [
    {
      value: "all",
      labelAr: "الكل",
      labelEn: "All",
      count: referenceAssets.length,
    },
    ...categories.map((category) => ({
      value: category,
      labelAr: category,
      labelEn: category,
      count: referenceAssets.filter((asset) => asset.category === category)
        .length,
    })),
  ];

  const curatedSlots = [
    {
      key: "brandLogo",
      labelAr: "الشعار الرئيسي",
      labelEn: "Main logo",
      value: mediaSelections.brandLogo,
      namespace: "brand",
    },
    {
      key: "brandMark",
      labelAr: "أيقونة الهوية",
      labelEn: "Brand mark",
      value: mediaSelections.brandMark,
      namespace: "brand",
    },
    {
      key: "favicon",
      labelAr: "Favicon",
      labelEn: "Favicon",
      value: mediaSelections.favicon,
      namespace: "brand",
      accept: "image/png,image/svg+xml,image/x-icon,.ico",
    },
    {
      key: "appleIcon",
      labelAr: "Apple Touch Icon",
      labelEn: "Apple Touch Icon",
      value: mediaSelections.appleIcon,
      namespace: "brand",
    },
    {
      key: "ogImage",
      labelAr: "صورة المشاركة",
      labelEn: "Social sharing image",
      value: mediaSelections.ogImage,
    },
    {
      key: "homeHero",
      labelAr: "الصفحة الرئيسية",
      labelEn: "Homepage",
      value: mediaSelections.homeHero,
    },
    {
      key: "heroCard1",
      labelAr: "بطاقة 1",
      labelEn: "Card 1",
      value: mediaSelections.heroCard1,
    },
    {
      key: "heroCard2",
      labelAr: "بطاقة 2",
      labelEn: "Card 2",
      value: mediaSelections.heroCard2,
    },
    {
      key: "heroCard3",
      labelAr: "بطاقة 3",
      labelEn: "Card 3",
      value: mediaSelections.heroCard3,
    },
    {
      key: "heroCard4",
      labelAr: "بطاقة 4",
      labelEn: "Card 4",
      value: mediaSelections.heroCard4,
    },
    {
      key: "doctorsHero",
      labelAr: "قسم الأطباء",
      labelEn: "Doctors page",
      value: mediaSelections.doctorsHero,
    },
    {
      key: "servicesHero",
      labelAr: "قسم الخدمات",
      labelEn: "Services page",
      value: mediaSelections.servicesHero,
    },
    {
      key: "aboutHero",
      labelAr: "من نحن",
      labelEn: "About page",
      value: mediaSelections.aboutHero,
    },
    {
      key: "journalHero",
      labelAr: "المجلة",
      labelEn: "Journal page",
      value: mediaSelections.journalHero,
    },
  ] as const;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">الصور والأصول</span>
            <span className="lang-en">Media & assets</span>
          </h1>
          <p>
            <span className="lang-ar">
              {curatedSlots.length} موضع · {referenceAssets.length} ملف مرجعي ·{" "}
              {categories.length} تصنيف
            </span>
            <span className="lang-en">
              {curatedSlots.length} slots · {referenceAssets.length} reference
              files · {categories.length} categories
            </span>
          </p>
        </div>
      </div>

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">Slots</div>
            <div className="admin-card__title">
              <span className="lang-ar">صور الموقع — قابلة للتعديل</span>
              <span className="lang-en">Site images — editable</span>
            </div>
          </div>
        </div>
        <div className="admin-card__body grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {curatedSlots.map((slot) => (
            <MediaSlotEditor
              key={slot.key}
              slot={slot.key}
              labelAr={slot.labelAr}
              labelEn={slot.labelEn}
              value={slot.value}
              namespace={"namespace" in slot ? slot.namespace : undefined}
              accept={"accept" in slot ? slot.accept : undefined}
            />
          ))}
        </div>
      </article>

      <AdminMediaLibrary />

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">Library</div>
            <div className="admin-card__title">
              <span className="lang-ar">مكتبة الصور المرجعية</span>
              <span className="lang-en">Reference library</span>
            </div>
          </div>
          <p className="text-[11px] text-[color:var(--admin-text-faint)]">
            <span className="lang-ar">للقراءة فقط — صور النموذج المرجعي.</span>
            <span className="lang-en">Read-only reference set.</span>
          </p>
        </div>
        <AdminListControls
          targetId="admin-reference-assets-list"
          tabs={referenceTabs}
          searchArabic="بحث في الصور"
          searchEnglish="Search images"
        />
        <div
          className="admin-card__body grid gap-3 md:grid-cols-3 xl:grid-cols-4"
          data-admin-list="admin-reference-assets-list"
        >
          {referenceAssets.map((asset) => (
            <div
              key={asset.fileName}
              className="rounded-xl border p-2"
              data-admin-row
              data-admin-status={asset.category}
              data-admin-search={`${asset.label} ${asset.fileName} ${asset.category}`}
              style={{
                borderColor: "var(--admin-border)",
                background: "var(--admin-panel-soft)",
              }}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={asset.path}
                  alt={asset.label}
                  fill
                  className="object-cover"
                  sizes="200px"
                  unoptimized
                />
              </div>
              <p className="mt-2 truncate text-xs font-semibold text-[color:var(--admin-text)]">
                {asset.label}
              </p>
              <p className="text-[10px] tracking-[0.12em] text-[color:var(--admin-text-faint)] uppercase">
                {asset.category}
              </p>
            </div>
          ))}
        </div>
      </article>
    </>
  );
}
