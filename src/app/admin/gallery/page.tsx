import { ContentStatus } from "@prisma/client";
import Image from "next/image";

import { setGalleryItemStatusAction } from "@/app/admin/gallery/actions";
import { AdminAddModal } from "@/components/admin/AdminAddModal";
import { getGalleryItems } from "@/lib/content-repository";
import { DeleteGalleryItemButton, GalleryItemForm } from "./GalleryAdminForms";

export const metadata = { title: "إدارة المعرض — Rejuvira Admin" };

const STATUS_AR: Record<ContentStatus, string> = {
  DRAFT: "مسودة",
  REVIEW: "مراجعة",
  APPROVED: "معتمد",
  PUBLISHED: "منشور",
  ARCHIVED: "مؤرشف",
};
const STATUS_EN: Record<ContentStatus, string> = {
  DRAFT: "Draft",
  REVIEW: "Review",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};
function statusClass(status: ContentStatus) {
  if (status === ContentStatus.PUBLISHED || status === ContentStatus.APPROVED)
    return "is-published";
  if (status === ContentStatus.REVIEW) return "is-review";
  if (status === ContentStatus.ARCHIVED) return "is-archived";
  return "is-draft";
}

const STATUS_OPTIONS: ContentStatus[] = [
  ContentStatus.DRAFT,
  ContentStatus.REVIEW,
  ContentStatus.APPROVED,
  ContentStatus.PUBLISHED,
  ContentStatus.ARCHIVED,
];

export default async function AdminGalleryPage() {
  const items = await getGalleryItems();
  const publishedCount = items.filter(
    (item) => item.status === ContentStatus.PUBLISHED,
  ).length;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">المعرض</span>
            <span className="lang-en">Gallery</span>
          </h1>
          <p>
            <span className="lang-ar">
              {items.length} حالة · {publishedCount} منشورة
            </span>
            <span className="lang-en">
              {items.length} cases · {publishedCount} published
            </span>
          </p>
        </div>
        <div className="admin-page-header__actions">
          <AdminAddModal
            triggerArabic="إضافة حالة"
            triggerEnglish="Add case"
            titleArabic="إضافة حالة جديدة"
            titleEnglish="New gallery case"
          >
            <GalleryItemForm />
          </AdminAddModal>
        </div>
      </div>

      {items.length === 0 ? (
        <article className="admin-card">
          <div className="admin-card__body text-center text-sm text-[color:var(--admin-text-faint)]">
            <span className="lang-ar">لا توجد حالات بعد.</span>
            <span className="lang-en">No cases yet.</span>
          </div>
        </article>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const currentStatus = item.status ?? ContentStatus.PUBLISHED;
            return (
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
                    <span className={`admin-status-badge ${statusClass(currentStatus)}`}>
                      <span className="lang-ar">{STATUS_AR[currentStatus]}</span>
                      <span className="lang-en">{STATUS_EN[currentStatus]}</span>
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {STATUS_OPTIONS.map((status) => {
                      const isCurrent = currentStatus === status;
                      return (
                        <form
                          key={`${item.id}-${status}`}
                          action={setGalleryItemStatusAction}
                        >
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="status" value={status} />
                          <button
                            type="submit"
                            className="admin-btn-secondary text-[11px]"
                            disabled={isCurrent}
                            style={
                              isCurrent
                                ? {
                                    borderColor: "var(--admin-accent)",
                                    color: "var(--admin-accent)",
                                  }
                                : undefined
                            }
                          >
                            {STATUS_EN[status]}
                          </button>
                        </form>
                      );
                    })}
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
            );
          })}
        </div>
      )}
    </>
  );
}
