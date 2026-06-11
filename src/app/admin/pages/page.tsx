import { ContentStatus } from "@prisma/client";
import Link from "next/link";
import type { Route } from "next";

import { generateServiceLandingPagesAction } from "@/app/admin/pages/actions";
import { CustomPagesManager } from "@/components/admin/CustomPagesManager";
import { getCustomPages } from "@/lib/content-repository";

function countBlocks(htmlContent: string) {
  return (htmlContent.match(/rv-builder-section/g) ?? []).length;
}

export default async function AdminCustomPagesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    generated?: string;
    count?: string;
    eligible?: string;
  }>;
}) {
  const query = searchParams ? await searchParams : {};
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
  const pageItems = pages.map((page) => ({
    id: page.id,
    slug: page.slug,
    titleAr: page.titleAr,
    titleEn: page.titleEn ?? "",
    status: page.status,
    description:
      page.seoDescription ||
      page.metaDescription ||
      page.seoTitle ||
      page.metaTitle ||
      "صفحة مخصصة قابلة للبناء والتعديل من PageCraft.",
    searchText: [
      page.titleAr,
      page.titleEn,
      page.slug,
      page.seoSlug,
      page.seoTitle,
      page.seoDescription,
      page.metaTitle,
      page.metaDescription,
      page.ogTitle,
      page.keywords.join(" "),
      page.hashtags.join(" "),
    ]
      .filter(Boolean)
      .join(" "),
    updatedAt: String(page.updatedAt),
    noindex: page.noindex,
    blockCount: countBlocks(page.htmlContent),
  }));

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
          <form action={generateServiceLandingPagesAction}>
            <button type="submit" className="admin-btn-secondary">
              توليد صفحات الخدمات
            </button>
          </form>
          <Link
            href={"/admin/pages/new" as Route}
            className="admin-btn-primary"
          >
            إنشاء صفحة جديدة
          </Link>
        </div>
      </div>

      {query.generated === "service-pages" && query.count === "0" ? (
        <div className="admin-inline-notice is-warning">
          لم تُنشأ صفحات جديدة — تأكد من وجود خدمات منشورة أولاً.
        </div>
      ) : query.generated === "service-pages" ? (
        <div className="admin-inline-notice">
          تم توليد أو تحديث {query.count ?? "0"} صفحة إعلان من أصل{" "}
          {query.eligible ?? query.count ?? "0"} خدمة منشورة/معتمدة داخل الصفحات
          المخصصة.
        </div>
      ) : null}

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

      <CustomPagesManager pages={pageItems} tabs={tabs} />
    </>
  );
}
