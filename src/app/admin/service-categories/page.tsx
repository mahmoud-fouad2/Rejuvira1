import { ContentStatus } from "@prisma/client";
import Link from "next/link";
import type { Route } from "next";

import { deleteServiceCategoryAction } from "@/app/admin/service-categories/actions";
import { AdminAddModal } from "@/components/admin/AdminAddModal";
import { AdminListControls } from "@/components/admin/AdminListControls";
import { ServiceCategoryForm } from "@/components/forms/ServiceCategoryForm";
import { getServiceCategories, getServices } from "@/lib/content-repository";

function statusMeta(status: ContentStatus) {
  switch (status) {
    case ContentStatus.PUBLISHED:
      return {
        className: "is-published",
        labelAr: "منشور",
        labelEn: "Published",
      };
    case ContentStatus.ARCHIVED:
      return {
        className: "is-archived",
        labelAr: "مؤرشف",
        labelEn: "Archived",
      };
    default:
      return { className: "is-draft", labelAr: "مسودة", labelEn: "Draft" };
  }
}

export default async function AdminServiceCategoriesPage() {
  const [categories, services] = await Promise.all([
    getServiceCategories(),
    getServices(),
  ]);
  const tabs = [
    { value: "all", labelAr: "الكل", labelEn: "All", count: categories.length },
    {
      value: ContentStatus.PUBLISHED,
      labelAr: "منشور",
      labelEn: "Published",
      count: categories.filter(
        (category) => category.status === ContentStatus.PUBLISHED,
      ).length,
    },
    {
      value: ContentStatus.DRAFT,
      labelAr: "مسودة",
      labelEn: "Draft",
      count: categories.filter(
        (category) => category.status === ContentStatus.DRAFT,
      ).length,
    },
    {
      value: ContentStatus.ARCHIVED,
      labelAr: "مؤرشف",
      labelEn: "Archived",
      count: categories.filter(
        (category) => category.status === ContentStatus.ARCHIVED,
      ).length,
    },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">أقسام الخدمات</span>
            <span className="lang-en">Service categories</span>
          </h1>
          <p>
            <span className="lang-ar">
              تنظيم حقيقي للخدمات داخل أقسام تظهر في الموقع ولوحة التحكم.
            </span>
            <span className="lang-en">
              Real service taxonomy used by the website and admin panel.
            </span>
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link
            href={"/admin/content" as Route}
            className="admin-btn-secondary"
          >
            مركز العلاقات
          </Link>
          <AdminAddModal
            triggerArabic="إضافة قسم"
            triggerEnglish="Add category"
            titleArabic="إضافة قسم خدمات"
            titleEnglish="New service category"
          >
            <ServiceCategoryForm />
          </AdminAddModal>
        </div>
      </div>

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">Taxonomy</div>
            <div className="admin-card__title">
              <span className="lang-ar">الأقسام وما بداخلها من خدمات</span>
              <span className="lang-en">Categories and their services</span>
            </div>
          </div>
        </div>
        <AdminListControls targetId="admin-categories-list" tabs={tabs} />
        <div
          className="admin-data-list"
          data-admin-list="admin-categories-list"
        >
          {categories.map((category) => {
            const meta = statusMeta(category.status);
            const categoryServices = services.filter(
              (service) =>
                service.categoryId === category.id ||
                service.categorySlug === category.slug ||
                service.category === category.name,
            );
            return (
              <details
                key={category.id}
                className="admin-data-row !block"
                data-admin-row
                data-admin-status={category.status}
                data-admin-search={[
                  category.name,
                  category.nameEn,
                  category.slug,
                  category.description,
                  categoryServices.map((service) => service.name).join(" "),
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <summary className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="admin-data-row__title truncate">
                      {category.name}
                    </p>
                    <p className="admin-data-row__meta truncate">
                      {category.slug} · {categoryServices.length} خدمة
                    </p>
                  </div>
                  <span className={`admin-status-badge ${meta.className}`}>
                    <span className="lang-ar">{meta.labelAr}</span>
                    <span className="lang-en">{meta.labelEn}</span>
                  </span>
                </summary>

                <div
                  className="mt-4 grid gap-4 border-t pt-4"
                  style={{ borderColor: "var(--admin-border)" }}
                >
                  {categoryServices.length ? (
                    <div className="admin-linked-strip">
                      {categoryServices.map((service) => (
                        <Link
                          key={service.id}
                          href={"/admin/services" as Route}
                          className="admin-linked-strip__item"
                        >
                          <strong>{service.name}</strong>
                          <span>
                            {service.doctorSlugs.length} أطباء مرتبطون
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="admin-empty-note">
                      لا توجد خدمات داخل هذا القسم حتى الآن.
                    </p>
                  )}

                  <ServiceCategoryForm category={category} />
                  <form action={deleteServiceCategoryAction}>
                    <input type="hidden" name="id" value={category.id} />
                    <button
                      type="submit"
                      className="admin-btn-danger"
                      disabled={categoryServices.length > 0}
                    >
                      حذف القسم
                    </button>
                    {categoryServices.length > 0 ? (
                      <p className="mt-2 text-xs text-[color:var(--admin-text-faint)]">
                        انقل الخدمات إلى قسم آخر قبل حذف هذا القسم.
                      </p>
                    ) : null}
                  </form>
                </div>
              </details>
            );
          })}
        </div>
      </article>
    </>
  );
}
