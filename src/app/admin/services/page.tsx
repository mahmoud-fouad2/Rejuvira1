import Image from "next/image";
import { ContentStatus } from "@prisma/client";

import {
  deleteServiceAction,
  setServiceStatusAction,
} from "@/app/admin/services/actions";
import { AdminAddModal } from "@/components/admin/AdminAddModal";
import { AdminListControls } from "@/components/admin/AdminListControls";
import { ServiceCreateForm } from "@/components/forms/ServiceCreateForm";
import { ServiceEditorForm } from "@/components/forms/ServiceEditorForm";
import {
  getDevices,
  getDoctors,
  getServiceCategories,
  getServices,
} from "@/lib/content-repository";

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
  const [services, doctors, devices, categories] = await Promise.all([
    getServices(),
    getDoctors(),
    getDevices(),
    getServiceCategories(),
  ]);
  const doctorOptions = doctors.map((doctor) => ({
    value: doctor.slug,
    label: doctor.name,
    hint: doctor.specialty,
  }));
  const deviceOptions = devices.map((device) => ({
    value: device.slug,
    label: device.name,
    hint: device.certifications.join(" · "),
  }));
  const categoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
    nameEn: category.nameEn ?? null,
  }));
  const tabs = [
    { value: "all", labelAr: "الكل", labelEn: "All", count: services.length },
    {
      value: ContentStatus.PUBLISHED,
      labelAr: "منشور",
      labelEn: "Published",
      count: services.filter((service) => service.status === ContentStatus.PUBLISHED).length,
    },
    {
      value: ContentStatus.REVIEW,
      labelAr: "مراجعة",
      labelEn: "Review",
      count: services.filter((service) => service.status === ContentStatus.REVIEW).length,
    },
    {
      value: ContentStatus.DRAFT,
      labelAr: "مسودة",
      labelEn: "Draft",
      count: services.filter((service) => service.status === ContentStatus.DRAFT).length,
    },
  ];

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
        <div className="admin-page-header__actions">
          <AdminAddModal
            triggerArabic="إضافة خدمة"
            triggerEnglish="Add service"
            titleArabic="إضافة خدمة جديدة"
            titleEnglish="New service"
          >
            <ServiceCreateForm categories={categoryOptions} />
          </AdminAddModal>
        </div>
      </div>

      <div className="grid gap-4">
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
          <AdminListControls targetId="admin-services-list" tabs={tabs} />
          <div className="admin-data-list" data-admin-list="admin-services-list">
            {services.map((service) => {
              const meta = statusMeta(service.status);
              return (
                <details
                  key={service.id}
                  className="admin-data-row !block"
                  data-admin-row
                  data-admin-status={service.status}
                  data-admin-search={[
                    service.name,
                    service.nameEn,
                    service.slug,
                    service.category,
                    service.excerpt,
                    service.doctorSlugs.join(" "),
                    service.deviceSlugs.join(" "),
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
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
                        nameEn: service.nameEn ?? null,
                        categoryId: service.categoryId ?? null,
                        category: service.category,
                        excerpt: service.excerpt,
                        excerptEn: service.excerptEn ?? null,
                        description: service.description,
                        descriptionEn: service.descriptionEn ?? null,
                        coverImageUrl: service.coverImageUrl,
                        status: service.status,
                        featured: service.featured ?? false,
                        doctorSlugs: service.doctorSlugs,
                        deviceSlugs: service.deviceSlugs,
                      }}
                      doctorOptions={doctorOptions}
                      deviceOptions={deviceOptions}
                      categories={categoryOptions}
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
