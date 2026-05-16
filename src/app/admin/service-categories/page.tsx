import { ContentStatus } from "@prisma/client";

import { deleteServiceCategoryAction } from "@/app/admin/service-categories/actions";
import { AdminAddModal } from "@/components/admin/AdminAddModal";
import { ServiceCategoryForm } from "@/components/forms/ServiceCategoryForm";
import { getServiceCategories } from "@/lib/content-repository";

function statusMeta(status: ContentStatus) {
  switch (status) {
    case ContentStatus.PUBLISHED:
      return { className: "is-published", label: "Published" };
    case ContentStatus.ARCHIVED:
      return { className: "is-archived", label: "Archived" };
    default:
      return { className: "is-draft", label: "Draft" };
  }
}

export default async function AdminServiceCategoriesPage() {
  const categories = await getServiceCategories();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">أقسام الخدمات</span>
            <span className="lang-en">Service categories</span>
          </h1>
          <p>
            <span className="lang-ar">{categories.length} قسم</span>
            <span className="lang-en">{categories.length} categories</span>
          </p>
        </div>
        <div className="admin-page-header__actions">
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
              <span className="lang-ar">تنظيم الخدمات داخل أقسام</span>
              <span className="lang-en">Organize services into categories</span>
            </div>
          </div>
        </div>
        <div className="admin-data-list">
          {categories.map((category) => {
            const meta = statusMeta(category.status);
            return (
              <details key={category.id} className="admin-data-row !block">
                <summary className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="admin-data-row__title truncate">{category.name}</p>
                    <p className="admin-data-row__meta truncate">
                      {category.slug} · {category.serviceCount} services
                    </p>
                  </div>
                  <span className={`admin-status-badge ${meta.className}`}>
                    {meta.label}
                  </span>
                </summary>

                <div
                  className="mt-4 grid gap-4 border-t pt-4"
                  style={{ borderColor: "var(--admin-border)" }}
                >
                  <ServiceCategoryForm category={category} />
                  <form action={deleteServiceCategoryAction}>
                    <input type="hidden" name="id" value={category.id} />
                    <button
                      type="submit"
                      className="admin-btn-danger"
                      disabled={category.serviceCount > 0}
                    >
                      Delete category
                    </button>
                    {category.serviceCount > 0 ? (
                      <p className="mt-2 text-xs text-[color:var(--admin-text-faint)]">
                        Move services to another category before deleting.
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
