import { ContentStatus } from "@prisma/client";

import { deleteCustomPageAction } from "@/app/admin/pages/actions";
import { AdminAddModal } from "@/components/admin/AdminAddModal";
import { CustomPageEditorForm } from "@/components/forms/CustomPageEditorForm";
import { getCustomPages } from "@/lib/content-repository";

function statusMeta(status: ContentStatus) {
  switch (status) {
    case ContentStatus.PUBLISHED:
      return { className: "is-published", labelAr: "منشورة", labelEn: "Published" };
    case ContentStatus.REVIEW:
      return { className: "is-review", labelAr: "مراجعة", labelEn: "Review" };
    case ContentStatus.APPROVED:
      return { className: "is-published", labelAr: "معتمدة", labelEn: "Approved" };
    case ContentStatus.ARCHIVED:
      return { className: "is-archived", labelAr: "مؤرشفة", labelEn: "Archived" };
    default:
      return { className: "is-draft", labelAr: "مسودة", labelEn: "Draft" };
  }
}

export default async function AdminCustomPagesPage() {
  const pages = await getCustomPages();
  const published = pages.filter(
    (page) => page.status === ContentStatus.PUBLISHED,
  ).length;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">الصفحات المخصصة</span>
            <span className="lang-en">Custom pages</span>
          </h1>
          <p>
            <span className="lang-ar">
              {pages.length} صفحة · {published} منشورة
            </span>
            <span className="lang-en">
              {pages.length} pages · {published} published
            </span>
          </p>
        </div>
        <div className="admin-page-header__actions">
          <AdminAddModal
            triggerArabic="إنشاء صفحة"
            triggerEnglish="Create page"
            titleArabic="منشئ صفحة مخصصة"
            titleEnglish="Custom page builder"
          >
            <CustomPageEditorForm mode="create" />
          </AdminAddModal>
        </div>
      </div>

      <section className="admin-editor-grid">
        {pages.length === 0 ? (
          <article className="admin-card">
            <div className="admin-card__body text-sm text-[color:var(--admin-text-faint)]">
              لا توجد صفحات بعد. أنشئ أول صفحة من زر إنشاء صفحة.
            </div>
          </article>
        ) : null}

        {pages.map((page) => {
          const meta = statusMeta(page.status);
          const blockCount = (page.htmlContent.match(/rv-builder-section/g) ?? [])
            .length;

          return (
            <details key={page.id} className="admin-editor-card">
              <summary className="admin-editor-card__summary">
                <span className="admin-page-preview">
                  <span>{blockCount || "HTML"}</span>
                  <small>{blockCount ? "بلوك" : "محتوى"}</small>
                </span>
                <span className="admin-editor-card__content">
                  <span className="admin-editor-card__kicker">
                    /p/{page.slug}
                  </span>
                  <span className="admin-editor-card__title">
                    {page.titleAr}
                  </span>
                  <span className="admin-editor-card__excerpt">
                    {page.seoDescription ||
                      page.seoTitle ||
                      "صفحة مخصصة قابلة للبناء والتعديل من لوحة التحكم."}
                  </span>
                  <span className="admin-editor-card__chips">
                    <a
                      href={`/p/${page.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-chip"
                    >
                      معاينة الصفحة
                    </a>
                    {page.noindex ? (
                      <span className="admin-chip">Noindex</span>
                    ) : null}
                  </span>
                </span>
                <span className={`admin-status-badge ${meta.className}`}>
                  <span className="lang-ar">{meta.labelAr}</span>
                  <span className="lang-en">{meta.labelEn}</span>
                </span>
              </summary>

              <div className="admin-editor-card__body">
                <CustomPageEditorForm
                  mode="edit"
                  initial={{
                    id: page.id,
                    slug: page.slug,
                    titleAr: page.titleAr,
                    titleEn: page.titleEn ?? "",
                    htmlContent: page.htmlContent,
                    seoTitle: page.seoTitle ?? "",
                    seoDescription: page.seoDescription ?? "",
                    status: page.status,
                    noindex: page.noindex,
                  }}
                />
                <form action={deleteCustomPageAction} className="flex">
                  <input type="hidden" name="id" value={page.id} />
                  <input type="hidden" name="slug" value={page.slug} />
                  <button type="submit" className="admin-btn-danger">
                    حذف الصفحة
                  </button>
                </form>
              </div>
            </details>
          );
        })}
      </section>
    </>
  );
}
