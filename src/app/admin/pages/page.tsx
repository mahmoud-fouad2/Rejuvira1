import { ContentStatus } from "@prisma/client";
import Link from "next/link";
import type { Route } from "next";

import { deleteCustomPageAction } from "@/app/admin/pages/actions";
import { AdminListControls } from "@/components/admin/AdminListControls";
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
        className: "is-published",
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

function countBlocks(htmlContent: string) {
  return (htmlContent.match(/rv-builder-section/g) ?? []).length;
}

export default async function AdminCustomPagesPage() {
  const pages = await getCustomPages();
  const published = pages.filter(
    (page) => page.status === ContentStatus.PUBLISHED,
  ).length;
  const draft = pages.filter(
    (page) => page.status === ContentStatus.DRAFT,
  ).length;
  const totalBlocks = pages.reduce(
    (sum, page) => sum + countBlocks(page.htmlContent),
    0,
  );
  const tabs = [
    { value: "all", labelAr: "الكل", labelEn: "All", count: pages.length },
    {
      value: ContentStatus.PUBLISHED,
      labelAr: "منشور",
      labelEn: "Published",
      count: published,
    },
    {
      value: ContentStatus.APPROVED,
      labelAr: "معتمد",
      labelEn: "Approved",
      count: pages.filter((page) => page.status === ContentStatus.APPROVED)
        .length,
    },
    {
      value: ContentStatus.REVIEW,
      labelAr: "مراجعة",
      labelEn: "Review",
      count: pages.filter((page) => page.status === ContentStatus.REVIEW)
        .length,
    },
    {
      value: ContentStatus.DRAFT,
      labelAr: "مسودة",
      labelEn: "Draft",
      count: draft,
    },
  ];

  return (
    <>
      <div className="admin-page-header admin-page-header--hero">
        <div>
          <span className="admin-page-header__eyebrow">PageCraft CMS</span>
          <h1>
            <span className="lang-ar">الصفحات المخصصة والـ Landing Pages</span>
            <span className="lang-en">Custom pages and landing pages</span>
          </h1>
          <p>
            <span className="lang-ar">
              إدارة صفحات مستقلة للحملات والـ leads مع تعديل كامل في صفحة عمل
              مخصصة.
            </span>
            <span className="lang-en">
              Manage campaign pages and lead pages in a dedicated editing
              workspace.
            </span>
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link
            href={"/admin/pages/new" as Route}
            className="admin-btn-primary"
          >
            إنشاء صفحة جديدة
          </Link>
        </div>
      </div>

      <section className="admin-kpi-grid admin-kpi-grid--compact">
        <article className="admin-kpi-card">
          <span className="admin-kpi-card__label">الصفحات</span>
          <strong>{pages.length}</strong>
        </article>
        <article className="admin-kpi-card">
          <span className="admin-kpi-card__label">منشورة</span>
          <strong>{published}</strong>
        </article>
        <article className="admin-kpi-card">
          <span className="admin-kpi-card__label">مسودات</span>
          <strong>{draft}</strong>
        </article>
        <article className="admin-kpi-card">
          <span className="admin-kpi-card__label">مكونات مبنية</span>
          <strong>{totalBlocks}</strong>
        </article>
      </section>

      <AdminListControls targetId="admin-pages-list" tabs={tabs} />
      <section className="custom-pages-list" data-admin-list="admin-pages-list">
        {pages.length === 0 ? (
          <article className="admin-card">
            <div className="admin-card__body text-sm text-[color:var(--admin-text-faint)]">
              لا توجد صفحات بعد. ابدئي من زر إنشاء صفحة جديدة لبناء Landing Page
              كاملة.
            </div>
          </article>
        ) : null}

        {pages.map((page) => {
          const meta = statusMeta(page.status);
          const blockCount = countBlocks(page.htmlContent);

          return (
            <article
              key={page.id}
              className="custom-page-list-card"
              data-admin-row
              data-admin-status={page.status}
              data-admin-search={[
                page.titleAr,
                page.titleEn,
                page.slug,
                page.seoTitle,
                page.seoDescription,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="custom-page-list-card__preview">
                <span>{blockCount || "HTML"}</span>
                <small>{blockCount ? "مكون" : "محتوى"}</small>
              </div>
              <div className="custom-page-list-card__body">
                <div className="custom-page-list-card__title-row">
                  <div>
                    <p className="custom-page-list-card__path">
                      /p/{page.slug}
                    </p>
                    <h2>{page.titleAr}</h2>
                  </div>
                  <span className={`admin-status-badge ${meta.className}`}>
                    <span className="lang-ar">{meta.labelAr}</span>
                    <span className="lang-en">{meta.labelEn}</span>
                  </span>
                </div>
                <p className="custom-page-list-card__excerpt">
                  {page.seoDescription ||
                    page.seoTitle ||
                    "صفحة مخصصة قابلة للبناء والتعديل من PageCraft."}
                </p>
                <div className="custom-page-list-card__meta">
                  <span>
                    آخر تعديل:{" "}
                    {new Date(page.updatedAt).toLocaleDateString("ar-SA")}
                  </span>
                  {page.noindex ? <span>Noindex</span> : null}
                </div>
                <div className="custom-page-list-card__actions">
                  <Link
                    href={`/admin/pages/${page.id}` as Route}
                    className="admin-btn-primary"
                  >
                    تعديل الصفحة
                  </Link>
                  <a
                    href={`/p/${page.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn-secondary"
                  >
                    معاينة
                  </a>
                  <form action={deleteCustomPageAction}>
                    <input type="hidden" name="id" value={page.id} />
                    <input type="hidden" name="slug" value={page.slug} />
                    <button type="submit" className="admin-btn-danger">
                      حذف
                    </button>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
