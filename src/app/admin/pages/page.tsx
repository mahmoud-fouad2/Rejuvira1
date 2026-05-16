import { ContentStatus } from "@prisma/client";

import { deleteCustomPageAction } from "@/app/admin/pages/actions";
import { CustomPageEditorForm } from "@/components/forms/CustomPageEditorForm";
import { getCustomPages } from "@/lib/content-repository";

function statusMeta(status: ContentStatus) {
  switch (status) {
    case ContentStatus.PUBLISHED:
      return {
        className: "is-published",
        labelAr: "منشورة",
        labelEn: "Published",
      };
    case ContentStatus.REVIEW:
      return { className: "is-review", labelAr: "مراجعة", labelEn: "Review" };
    case ContentStatus.APPROVED:
      return {
        className: "is-approved",
        labelAr: "معتمدة",
        labelEn: "Approved",
      };
    case ContentStatus.ARCHIVED:
      return {
        className: "is-archived",
        labelAr: "مؤرشفة",
        labelEn: "Archived",
      };
    default:
      return { className: "is-draft", labelAr: "مسودة", labelEn: "Draft" };
  }
}

export default async function AdminCustomPagesPage() {
  const pages = await getCustomPages();
  const published = pages.filter((p) => p.status === ContentStatus.PUBLISHED).length;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">صفحات مخصصة</span>
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
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">New</div>
              <div className="admin-card__title">
                <span className="lang-ar">إضافة صفحة</span>
                <span className="lang-en">Add page</span>
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <CustomPageEditorForm mode="create" />
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Library</div>
              <div className="admin-card__title">
                <span className="lang-ar">الصفحات المنشورة وغير المنشورة</span>
                <span className="lang-en">All custom pages</span>
              </div>
            </div>
          </div>
          <div className="admin-data-list">
            {pages.length === 0 ? (
              <p className="px-2 py-6 text-sm text-muted-foreground">
                <span className="lang-ar">
                  لا توجد صفحات بعد. أضِف صفحة جديدة من اليسار.
                </span>
                <span className="lang-en">
                  No pages yet. Add one from the left.
                </span>
              </p>
            ) : null}

            {pages.map((page) => {
              const meta = statusMeta(page.status);
              return (
                <details key={page.id} className="admin-data-row !block">
                  <summary className="grid cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-3">
                    <div className="min-w-0">
                      <p className="admin-data-row__title truncate">
                        {page.titleAr}
                        {page.titleEn ? (
                          <span className="ms-2 text-xs text-muted-foreground">
                            {page.titleEn}
                          </span>
                        ) : null}
                      </p>
                      <p className="admin-data-row__meta truncate font-mono">
                        /p/{page.slug}
                      </p>
                    </div>
                    <a
                      href={`/p/${page.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn-secondary text-xs"
                    >
                      <span className="lang-ar">معاينة</span>
                      <span className="lang-en">Preview</span>
                    </a>
                    <span className={`admin-status-badge ${meta.className}`}>
                      <span className="lang-ar">{meta.labelAr}</span>
                      <span className="lang-en">{meta.labelEn}</span>
                    </span>
                  </summary>

                  <div
                    className="mt-4 grid gap-4 border-t pt-4"
                    style={{ borderColor: "var(--admin-border)" }}
                  >
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
                        <span className="lang-ar">حذف الصفحة</span>
                        <span className="lang-en">Delete page</span>
                      </button>
                    </form>
                  </div>
                </details>
              );
            })}
          </div>
        </article>
      </div>
    </>
  );
}
