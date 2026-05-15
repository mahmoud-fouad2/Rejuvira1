import Image from "next/image";
import { ContentStatus } from "@prisma/client";

import {
  deleteServiceAction,
  setServiceStatusAction,
} from "@/app/admin/services/actions";
import { ServiceCreateForm } from "@/components/forms/ServiceCreateForm";
import { ServiceEditorForm } from "@/components/forms/ServiceEditorForm";
import { getServices } from "@/lib/content-repository";

function statusMeta(status: ContentStatus) {
  switch (status) {
    case ContentStatus.PUBLISHED:
      return { className: "is-published", labelAr: "منشور", labelEn: "Published" };
    case ContentStatus.REVIEW:
      return { className: "is-review", labelAr: "مراجعة", labelEn: "Review" };
    case ContentStatus.ARCHIVED:
      return { className: "is-archived", labelAr: "مؤرشف", labelEn: "Archived" };
    default:
      return { className: "is-draft", labelAr: "مسودة", labelEn: "Draft" };
  }
}

export default async function AdminServicesPage() {
  const services = await getServices();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">الخدمات</span>
            <span className="lang-en">Services</span>
          </h1>
          <p>
            <span className="lang-ar">{services.length} خدمة</span>
            <span className="lang-en">{services.length} services</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">New</div>
              <div className="admin-card__title">
                <span className="lang-ar">إضافة خدمة</span>
                <span className="lang-en">Add service</span>
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <ServiceCreateForm />
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Library</div>
              <div className="admin-card__title">
                <span className="lang-ar">الخدمات الحالية</span>
                <span className="lang-en">Current services</span>
              </div>
            </div>
          </div>
          <div className="admin-data-list">
            {services.map((service) => {
              const meta = statusMeta(service.status);
              return (
                <details key={service.id} className="admin-data-row !block">
                  <summary className="grid cursor-pointer grid-cols-[3.4rem_1fr_auto] items-center gap-3">
                    <div className="relative h-12 w-14 overflow-hidden rounded-lg" style={{ background: "var(--admin-panel-soft)" }}>
                      <Image src={service.coverImageUrl} alt={service.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="min-w-0">
                      <p className="admin-data-row__title truncate">{service.name}</p>
                      <p className="admin-data-row__meta truncate">{service.category}</p>
                    </div>
                    <span className={`admin-status-badge ${meta.className}`}>
                      <span className="lang-ar">{meta.labelAr}</span>
                      <span className="lang-en">{meta.labelEn}</span>
                    </span>
                  </summary>

                  <div className="mt-4 grid gap-4 border-t pt-4" style={{ borderColor: "var(--admin-border)" }}>
                    <ServiceEditorForm
                      service={{
                        id: service.id,
                        slug: service.slug,
                        name: service.name,
                        category: service.category,
                        excerpt: service.excerpt,
                        description: service.description,
                        coverImageUrl: service.coverImageUrl,
                        status: service.status,
                        featured: service.featured ?? false,
                      }}
                    />

                    <div className="flex flex-wrap gap-2">
                      {[
                        ContentStatus.DRAFT,
                        ContentStatus.REVIEW,
                        ContentStatus.PUBLISHED,
                        ContentStatus.ARCHIVED,
                      ].map((status) => {
                        const m = statusMeta(status);
                        return (
                          <form key={status} action={setServiceStatusAction}>
                            <input type="hidden" name="id" value={service.id} />
                            <input type="hidden" name="status" value={status} />
                            <button
                              type="submit"
                              className={`admin-btn-secondary ${service.status === status ? "border-[color:var(--admin-accent)] text-[color:var(--admin-accent)]" : ""}`}
                            >
                              <span className="lang-ar">{m.labelAr}</span>
                              <span className="lang-en">{m.labelEn}</span>
                            </button>
                          </form>
                        );
                      })}
                      <form action={deleteServiceAction}>
                        <input type="hidden" name="id" value={service.id} />
                        <button type="submit" className="admin-btn-danger">
                          <span className="lang-ar">حذف</span>
                          <span className="lang-en">Delete</span>
                        </button>
                      </form>
                    </div>
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
