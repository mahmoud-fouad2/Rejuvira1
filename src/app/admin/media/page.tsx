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
    { key: "brandLogo", labelAr: "الشعار الرئيسي", labelEn: "Main logo", value: mediaSelections.brandLogo },
    { key: "brandMark", labelAr: "أيقونة الهوية", labelEn: "Brand mark", value: mediaSelections.brandMark },
    { key: "favicon", labelAr: "Favicon", labelEn: "Favicon", value: mediaSelections.favicon },
    { key: "appleIcon", labelAr: "Apple Touch Icon", labelEn: "Apple Touch Icon", value: mediaSelections.appleIcon },
    { key: "ogImage", labelAr: "صورة المشاركة", labelEn: "Social sharing image", value: mediaSelections.ogImage },
    { key: "homeHero", labelAr: "الصفحة الرئيسية", labelEn: "Homepage", value: mediaSelections.homeHero },
    { key: "doctorsHero", labelAr: "قسم الأطباء", labelEn: "Doctors page", value: mediaSelections.doctorsHero },
    { key: "servicesHero", labelAr: "قسم الخدمات", labelEn: "Services page", value: mediaSelections.servicesHero },
    { key: "aboutHero", labelAr: "من نحن", labelEn: "About page", value: mediaSelections.aboutHero },
    { key: "journalHero", labelAr: "المجلة", labelEn: "Journal page", value: mediaSelections.journalHero },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">الصور والأصول</span>
            <span className="lang-en">Media & assets</span>
          </h1>
          <p>
            <span className="lang-ar">{referenceAssets.length} ملف · {categories.length} تصنيف</span>
            <span className="lang-en">{referenceAssets.length} files · {categories.length} categories</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Upload</div>
              <div className="admin-card__title">
                <span className="lang-ar">رفع صورة</span>
                <span className="lang-en">Upload image</span>
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <ImageUploader
              name="mediaUploadPreview"
              namespace="media/uploads"
              label="Upload"
              placeholder="—"
              helper="—"
            />
            <div className="mt-4 grid gap-2 text-xs text-[color:var(--admin-text-soft)]">
              <a href="/admin/settings" className="admin-data-row !rounded-lg">
                <span className="admin-data-row__title">
                  <span className="lang-ar">صور الصفحات (الإعدادات)</span>
                  <span className="lang-en">Page images (Settings)</span>
                </span>
                <span className="admin-data-row__value">→</span>
              </a>
              <a href="/admin/gallery" className="admin-data-row !rounded-lg">
                <span className="admin-data-row__title">
                  <span className="lang-ar">المعرض (إضافة/تعديل/حذف)</span>
                  <span className="lang-en">Gallery (CRUD)</span>
                </span>
                <span className="admin-data-row__value">→</span>
              </a>
              <a href="/admin/doctors" className="admin-data-row !rounded-lg">
                <span className="admin-data-row__title">
                  <span className="lang-ar">صور الأطباء</span>
                  <span className="lang-en">Doctor images</span>
                </span>
                <span className="admin-data-row__value">→</span>
              </a>
            </div>
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Slots</div>
              <div className="admin-card__title">
                <span className="lang-ar">الصور الحالية</span>
                <span className="lang-en">Current slots</span>
              </div>
            </div>
          </div>
          <div className="admin-card__body grid gap-3 sm:grid-cols-2">
            {curatedSlots.map((slot) => (
              <div
                key={slot.key}
                className="rounded-xl border p-2"
                style={{ borderColor: "var(--admin-border)", background: "var(--admin-panel-soft)" }}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image src={slot.value} alt={slot.labelAr} fill className="object-cover" sizes="240px" />
                </div>
                <p className="mt-2 text-sm font-semibold text-[color:var(--admin-text)]">
                  <span className="lang-ar">{slot.labelAr}</span>
                  <span className="lang-en">{slot.labelEn}</span>
                </p>
                <p className="mt-1 truncate text-[11px] text-[color:var(--admin-text-faint)]" dir="ltr">
                  {slot.value}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">Library</div>
            <div className="admin-card__title">
              <span className="lang-ar">مكتبة الصور المرجعية</span>
              <span className="lang-en">Reference library</span>
            </div>
          </div>
        </div>
        <div className="admin-card__body grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          {referenceAssets.map((asset) => (
            <div
              key={asset.fileName}
              className="rounded-xl border p-2"
              style={{ borderColor: "var(--admin-border)", background: "var(--admin-panel-soft)" }}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image src={asset.path} alt={asset.label} fill className="object-cover" sizes="200px" />
              </div>
              <p className="mt-2 truncate text-xs font-semibold text-[color:var(--admin-text)]">
                {asset.label}
              </p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--admin-text-faint)]">
                {asset.category}
              </p>
            </div>
          ))}
        </div>
      </article>
    </>
  );
}
