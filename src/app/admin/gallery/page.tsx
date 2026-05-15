import Image from "next/image";

import { getGalleryItems } from "@/lib/content-repository";
import { DeleteGalleryItemButton, GalleryItemForm } from "./GalleryAdminForms";

export const metadata = { title: "إدارة المعرض — Rejuvira Admin" };

export default async function AdminGalleryPage() {
  const items = await getGalleryItems();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">المعرض</span>
            <span className="lang-en">Gallery</span>
          </h1>
          <p>
            <span className="lang-ar">{items.length} حالة منشورة</span>
            <span className="lang-en">{items.length} published cases</span>
          </p>
        </div>
      </div>

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">New</div>
            <div className="admin-card__title">
              <span className="lang-ar">إضافة حالة</span>
              <span className="lang-en">Add case</span>
            </div>
          </div>
        </div>
        <div className="admin-card__body">
          <GalleryItemForm />
        </div>
      </article>

      {items.length === 0 ? (
        <article className="admin-card">
          <div className="admin-card__body text-center text-sm text-[color:var(--admin-text-faint)]">
            <span className="lang-ar">لا توجد حالات بعد.</span>
            <span className="lang-en">No cases yet.</span>
          </div>
        </article>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="admin-card overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="relative aspect-[3/2]">
                  <Image
                    src={item.beforeImageUrl}
                    alt={item.beforeImageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 240px"
                  />
                  <span className="absolute bottom-1 end-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
                    قبل
                  </span>
                </div>
                <div className="relative aspect-[3/2]">
                  <Image
                    src={item.afterImageUrl}
                    alt={item.afterImageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 240px"
                  />
                  <span className="absolute bottom-1 start-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
                    بعد
                  </span>
                </div>
              </div>
              <div className="admin-card__body">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[color:var(--admin-text)]">
                      {item.title}
                    </p>
                    <p className="truncate text-xs text-[color:var(--admin-text-soft)]">
                      {item.category}
                    </p>
                  </div>
                  <DeleteGalleryItemButton id={item.id} />
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-[color:var(--admin-accent)]">
                    <span className="lang-ar">تعديل البيانات</span>
                    <span className="lang-en">Edit details</span>
                  </summary>
                  <div className="mt-3">
                    <GalleryItemForm item={item} />
                  </div>
                </details>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
