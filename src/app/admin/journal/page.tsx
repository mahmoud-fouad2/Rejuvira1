import { ContentStatus } from "@prisma/client";
import Image from "next/image";

import {
  deleteJournalPostAction,
  updateJournalPostStatusAction,
} from "@/app/admin/journal/actions";
import { AdminAddModal } from "@/components/admin/AdminAddModal";
import { JournalCreateForm } from "@/components/forms/JournalCreateForm";
import {
  getDoctors,
  getJournalPosts,
  getServices,
} from "@/lib/content-repository";

const publishableStatuses = [
  ContentStatus.DRAFT,
  ContentStatus.REVIEW,
  ContentStatus.APPROVED,
  ContentStatus.PUBLISHED,
  ContentStatus.ARCHIVED,
] as const;

const statusLabelsAr: Record<ContentStatus, string> = {
  DRAFT: "مسودة",
  REVIEW: "مراجعة",
  APPROVED: "معتمد",
  PUBLISHED: "منشور",
  ARCHIVED: "مؤرشف",
};
const statusLabelsEn: Record<ContentStatus, string> = {
  DRAFT: "Draft",
  REVIEW: "Review",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

function statusClass(status: ContentStatus) {
  if (status === ContentStatus.PUBLISHED) return "is-published";
  if (status === ContentStatus.APPROVED) return "is-published";
  if (status === ContentStatus.REVIEW) return "is-review";
  if (status === ContentStatus.ARCHIVED) return "is-archived";
  return "is-draft";
}

export default async function AdminJournalPage() {
  const [posts, services, doctors] = await Promise.all([
    getJournalPosts(),
    getServices(),
    getDoctors(),
  ]);
  const publishedCount = posts.filter(
    (post) => post.status === ContentStatus.PUBLISHED,
  ).length;
  const serviceOptions = services.map((service) => ({
    value: service.slug,
    label: service.name,
    hint: service.category,
  }));
  const doctorOptions = doctors.map((doctor) => ({
    value: doctor.slug,
    label: doctor.name,
    hint: doctor.specialty,
  }));

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">المجلة</span>
            <span className="lang-en">Journal</span>
          </h1>
          <p>
            <span className="lang-ar">
              {posts.length} مقال · {publishedCount} منشور
            </span>
            <span className="lang-en">
              {posts.length} articles · {publishedCount} published
            </span>
          </p>
        </div>
        <div className="admin-page-header__actions">
          <AdminAddModal
            triggerArabic="إضافة مقال"
            triggerEnglish="Add article"
            titleArabic="إضافة مقال جديد"
            titleEnglish="New article"
          >
            <JournalCreateForm
              serviceOptions={serviceOptions}
              doctorOptions={doctorOptions}
            />
          </AdminAddModal>
        </div>
      </div>

      <div className="grid gap-4">
        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Articles</div>
              <div className="admin-card__title">
                <span className="lang-ar">المقالات</span>
                <span className="lang-en">Articles</span>
              </div>
            </div>
          </div>
          <div className="admin-data-list">
            {posts.map((post) => {
              const currentStatus = post.status ?? ContentStatus.PUBLISHED;
              return (
                <div key={post.id} className="admin-data-row !block">
                  <div className="grid grid-cols-[3.4rem_1fr_auto] items-center gap-3">
                    <div className="relative h-12 w-14 overflow-hidden rounded-lg" style={{ background: "var(--admin-panel-soft)" }}>
                      <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="min-w-0">
                      <p className="admin-data-row__title truncate">{post.title}</p>
                      <p className="admin-data-row__meta truncate">
                        {post.category} · {post.readingTime}
                      </p>
                    </div>
                    <span className={`admin-status-badge ${statusClass(currentStatus)}`}>
                      <span className="lang-ar">{statusLabelsAr[currentStatus]}</span>
                      <span className="lang-en">{statusLabelsEn[currentStatus]}</span>
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {publishableStatuses.map((status) => {
                      const isCurrent = currentStatus === status;
                      return (
                        <form
                          key={`${post.slug}-${status}`}
                          action={updateJournalPostStatusAction}
                        >
                          <input type="hidden" name="slug" value={post.slug} />
                          <input type="hidden" name="status" value={status} />
                          <button
                            type="submit"
                            className="admin-btn-secondary"
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
                            <span className="lang-ar">{statusLabelsAr[status]}</span>
                            <span className="lang-en">{statusLabelsEn[status]}</span>
                          </button>
                        </form>
                      );
                    })}
                    <form action={deleteJournalPostAction}>
                      <input type="hidden" name="slug" value={post.slug} />
                      <button type="submit" className="admin-btn-danger">
                        <span className="lang-ar">حذف</span>
                        <span className="lang-en">Delete</span>
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </>
  );
}
