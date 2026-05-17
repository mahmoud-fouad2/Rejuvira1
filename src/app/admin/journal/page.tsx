import { ContentStatus } from "@prisma/client";
import Image from "next/image";

import {
  deleteJournalPostAction,
  updateJournalPostStatusAction,
} from "@/app/admin/journal/actions";
import { AdminAddModal } from "@/components/admin/AdminAddModal";
import { AdminListControls } from "@/components/admin/AdminListControls";
import { JournalCreateForm } from "@/components/forms/JournalCreateForm";
import { JournalEditorForm } from "@/components/forms/JournalEditorForm";
import {
  getDoctors,
  getJournalPosts,
  getServiceCategories,
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
  const [posts, services, doctors, categories] = await Promise.all([
    getJournalPosts(),
    getServices(),
    getDoctors(),
    getServiceCategories(),
  ]);
  const publishedCount = posts.filter(
    (post) => post.status === ContentStatus.PUBLISHED,
  ).length;
  const tabs = [
    { value: "all", labelAr: "الكل", labelEn: "All", count: posts.length },
    {
      value: ContentStatus.PUBLISHED,
      labelAr: "منشور",
      labelEn: "Published",
      count: posts.filter((post) => post.status === ContentStatus.PUBLISHED)
        .length,
    },
    {
      value: ContentStatus.APPROVED,
      labelAr: "معتمد",
      labelEn: "Approved",
      count: posts.filter((post) => post.status === ContentStatus.APPROVED)
        .length,
    },
    {
      value: ContentStatus.REVIEW,
      labelAr: "مراجعة",
      labelEn: "Review",
      count: posts.filter((post) => post.status === ContentStatus.REVIEW)
        .length,
    },
    {
      value: ContentStatus.DRAFT,
      labelAr: "مسودة",
      labelEn: "Draft",
      count: posts.filter((post) => post.status === ContentStatus.DRAFT).length,
    },
  ];
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
  const categoryOptions = Array.from(
    new Set([
      ...categories.map((category) => category.name),
      ...services.map((service) => service.category),
      ...posts.map((post) => post.category),
    ]),
  ).filter(Boolean);

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
              categoryOptions={categoryOptions}
              serviceOptions={serviceOptions}
              doctorOptions={doctorOptions}
            />
          </AdminAddModal>
        </div>
      </div>

      <AdminListControls targetId="admin-journal-list" tabs={tabs} />
      <section
        className="admin-editor-grid"
        data-admin-list="admin-journal-list"
      >
        {posts.map((post) => {
          const currentStatus = post.status ?? ContentStatus.PUBLISHED;
          const relatedServiceNames = services
            .filter((service) =>
              post.relatedServiceSlugs.includes(service.slug),
            )
            .map((service) => service.name);

          return (
            <details
              key={post.id}
              className="admin-editor-card"
              data-admin-row
              data-admin-status={currentStatus}
              data-admin-search={[
                post.title,
                post.slug,
                post.category,
                post.excerpt,
                post.relatedServiceSlugs.join(" "),
                relatedServiceNames.join(" "),
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <summary className="admin-editor-card__summary">
                <span className="admin-editor-card__media">
                  <Image
                    src={post.coverImageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 260px"
                  />
                </span>
                <span className="admin-editor-card__content">
                  <span className="admin-editor-card__kicker">
                    {post.category} · {post.readingTime}
                  </span>
                  <span className="admin-editor-card__title">{post.title}</span>
                  <span className="admin-editor-card__excerpt">
                    {post.excerpt}
                  </span>
                  <span className="admin-editor-card__chips">
                    {(relatedServiceNames.length
                      ? relatedServiceNames
                      : ["بدون خدمة مرتبطة"]
                    ).map((label) => (
                      <span key={label} className="admin-chip">
                        {label}
                      </span>
                    ))}
                  </span>
                </span>
                <span
                  className={`admin-status-badge ${statusClass(currentStatus)}`}
                >
                  <span className="lang-ar">
                    {statusLabelsAr[currentStatus]}
                  </span>
                  <span className="lang-en">
                    {statusLabelsEn[currentStatus]}
                  </span>
                </span>
              </summary>

              <div className="admin-editor-card__body">
                <div className="admin-editor-card__statusbar">
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
                        >
                          <span className="lang-ar">
                            {statusLabelsAr[status]}
                          </span>
                          <span className="lang-en">
                            {statusLabelsEn[status]}
                          </span>
                        </button>
                      </form>
                    );
                  })}
                  <form action={deleteJournalPostAction}>
                    <input type="hidden" name="slug" value={post.slug} />
                    <button type="submit" className="admin-btn-danger">
                      حذف
                    </button>
                  </form>
                </div>

                <JournalEditorForm
                  post={post}
                  categoryOptions={categoryOptions}
                  serviceOptions={serviceOptions}
                  doctorOptions={doctorOptions}
                />
              </div>
            </details>
          );
        })}
      </section>
    </>
  );
}
