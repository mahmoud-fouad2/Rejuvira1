import Image from "next/image";
import Link from "next/link";
import { ContentStatus } from "@prisma/client";
import type { Route } from "next";

import {
  deleteServiceAction,
  setServiceStatusAction,
} from "@/app/admin/services/actions";
import { AdminAddModal } from "@/components/admin/AdminAddModal";
import { AdminListControls } from "@/components/admin/AdminListControls";
import { ReconcileCoreContentButton } from "@/components/admin/ReconcileCoreContentButton";
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
      return {
        className: "is-published",
        labelAr: "منشور",
        labelEn: "Published",
      };
    case ContentStatus.REVIEW:
      return { className: "is-review", labelAr: "مراجعة", labelEn: "Review" };
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
  const categoryGroups = categories
    .map((category) => ({
      category,
      services: services.filter(
        (service) =>
          service.categoryId === category.id ||
          service.categorySlug === category.slug ||
          service.category === category.name,
      ),
    }))
    .filter((group) => group.services.length > 0);
  const uncategorizedServices = services.filter(
    (service) =>
      !service.categoryId &&
      !categories.some((category) => category.name === service.category),
  );
  const tabs = [
    { value: "all", labelAr: "الكل", labelEn: "All", count: services.length },
    {
      value: ContentStatus.PUBLISHED,
      labelAr: "منشور",
      labelEn: "Published",
      count: services.filter(
        (service) => service.status === ContentStatus.PUBLISHED,
      ).length,
    },
    {
      value: ContentStatus.REVIEW,
      labelAr: "مراجعة",
      labelEn: "Review",
      count: services.filter(
        (service) => service.status === ContentStatus.REVIEW,
      ).length,
    },
    {
      value: ContentStatus.DRAFT,
      labelAr: "مسودة",
      labelEn: "Draft",
      count: services.filter(
        (service) => service.status === ContentStatus.DRAFT,
      ).length,
    },
  ];

  const renderServiceRow = (service: (typeof services)[number]) => {
    const meta = statusMeta(service.status);
    const linkedDoctors = doctors.filter((doctor) =>
      service.doctorSlugs.includes(doctor.slug),
    );
    const linkedDevices = devices.filter((device) =>
      service.deviceSlugs.includes(device.slug),
    );

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
        <summary className="grid cursor-pointer grid-cols-[4rem_1fr_auto] items-center gap-3">
          <div
            className="relative h-14 w-16 overflow-hidden rounded-xl"
            style={{ background: "var(--admin-panel-soft)" }}
          >
            <Image
              src={service.coverImageUrl}
              alt={service.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="min-w-0">
            <p className="admin-data-row__title truncate">{service.name}</p>
            <p className="admin-data-row__meta truncate">
              {service.category} · {linkedDoctors.length} أطباء ·{" "}
              {linkedDevices.length} أجهزة
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
          <div className="admin-edit-context">
            <span>القسم: {service.category}</span>
            <span>{linkedDoctors.length || "لا يوجد"} طبيب مرتبط</span>
            <span>{linkedDevices.length || "لا يوجد"} جهاز مرتبط</span>
          </div>
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
                    className={`admin-btn-secondary ${
                      service.status === status
                        ? "border-[color:var(--admin-accent)] text-[color:var(--admin-accent)]"
                        : ""
                    }`}
                  >
                    <span className="lang-ar">{m.labelAr}</span>
                    <span className="lang-en">{m.labelEn}</span>
                  </button>
                </form>
              );
            })}
            <Link
              href={`/services/${service.slug}` as Route}
              className="admin-btn-secondary"
            >
              عرض الخدمة
            </Link>
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
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">الخدمات</span>
            <span className="lang-en">Services</span>
          </h1>
          <p>
            <span className="lang-ar">
              إدارة الخدمات داخل أقسامها وربط كل خدمة بالأطباء والأجهزة من نفس
              المكان.
            </span>
            <span className="lang-en">
              Manage services by category and link doctors/devices in one place.
            </span>
          </p>
        </div>
        <div className="admin-page-header__actions">
          <ReconcileCoreContentButton />
          <Link
            href={"/admin/content" as Route}
            className="admin-btn-secondary"
          >
            مركز العلاقات
          </Link>
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
                <span className="lang-ar">الخدمات منظمة حسب القسم</span>
                <span className="lang-en">Services grouped by category</span>
              </div>
            </div>
          </div>
          <AdminListControls targetId="admin-services-list" tabs={tabs} />
          <div
            className="admin-data-list admin-service-groups"
            data-admin-list="admin-services-list"
          >
            {categoryGroups.map(({ category, services: categoryServices }) => (
              <section key={category.id} className="admin-service-group">
                <header className="admin-service-group__header">
                  <div>
                    <strong>{category.name}</strong>
                    <span>{categoryServices.length} خدمة داخل القسم</span>
                  </div>
                  <Link
                    href={"/admin/service-categories" as Route}
                    className="admin-btn-secondary"
                  >
                    تعديل القسم
                  </Link>
                </header>
                <div className="admin-service-group__rows admin-cards-grid">
                  {categoryServices.map(renderServiceRow)}
                </div>
              </section>
            ))}

            {uncategorizedServices.length ? (
              <section className="admin-service-group is-warning">
                <header className="admin-service-group__header">
                  <div>
                    <strong>خدمات بدون قسم واضح</strong>
                    <span>{uncategorizedServices.length} تحتاج تصنيف</span>
                  </div>
                </header>
                <div className="admin-service-group__rows admin-cards-grid">
                  {uncategorizedServices.map(renderServiceRow)}
                </div>
              </section>
            ) : null}
          </div>
        </article>
      </div>
    </>
  );
}
