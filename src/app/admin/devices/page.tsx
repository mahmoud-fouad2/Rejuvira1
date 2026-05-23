import Image from "next/image";
import Link from "next/link";
import { ContentStatus } from "@prisma/client";
import type { Route } from "next";

import {
  deleteDeviceAction,
  setDeviceStatusAction,
} from "@/app/admin/devices/actions";
import { AdminAddModal } from "@/components/admin/AdminAddModal";
import { AdminListControls } from "@/components/admin/AdminListControls";
import { DeviceCreateForm } from "@/components/forms/DeviceCreateForm";
import { DeviceEditorForm } from "@/components/forms/DeviceEditorForm";
import { getDevices, getServices } from "@/lib/content-repository";

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

export default async function AdminDevicesPage() {
  const [devices, services] = await Promise.all([getDevices(), getServices()]);
  const serviceOptions = services.map((service) => ({
    value: service.slug,
    label: service.name,
    hint: service.category,
  }));
  const serviceBySlug = new Map(
    services.map((service) => [service.slug, service]),
  );
  const publishedCount = devices.filter(
    (device) => device.status === ContentStatus.PUBLISHED,
  ).length;
  const featuredCount = devices.filter((device) => device.featured).length;
  const linkedServicesCount = devices.filter(
    (device) => device.serviceSlugs.length > 0,
  ).length;
  const tabs = [
    { value: "all", labelAr: "الكل", labelEn: "All", count: devices.length },
    {
      value: ContentStatus.PUBLISHED,
      labelAr: "منشور",
      labelEn: "Published",
      count: devices.filter(
        (device) => device.status === ContentStatus.PUBLISHED,
      ).length,
    },
    {
      value: ContentStatus.REVIEW,
      labelAr: "مراجعة",
      labelEn: "Review",
      count: devices.filter((device) => device.status === ContentStatus.REVIEW)
        .length,
    },
    {
      value: ContentStatus.DRAFT,
      labelAr: "مسودة",
      labelEn: "Draft",
      count: devices.filter((device) => device.status === ContentStatus.DRAFT)
        .length,
    },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">الأجهزة</span>
            <span className="lang-en">Devices</span>
          </h1>
          <p>
            <span className="lang-ar">{devices.length} جهاز</span>
            <span className="lang-en">{devices.length} devices</span>
          </p>
        </div>
        <div className="admin-page-header__actions">
          <AdminAddModal
            triggerArabic="إضافة جهاز"
            triggerEnglish="Add device"
            titleArabic="إضافة جهاز جديد"
            titleEnglish="New device"
          >
            <DeviceCreateForm serviceOptions={serviceOptions} />
          </AdminAddModal>
        </div>
      </div>

      <div className="grid gap-4">
        <section className="admin-kpi-grid--compact">
          <div className="admin-kpi-card">
            <span className="admin-kpi-card__label">منشور</span>
            <strong>{publishedCount}</strong>
          </div>
          <div className="admin-kpi-card">
            <span className="admin-kpi-card__label">مميز</span>
            <strong>{featuredCount}</strong>
          </div>
          <div className="admin-kpi-card">
            <span className="admin-kpi-card__label">مرتبط بخدمات</span>
            <strong>
              {linkedServicesCount}/{devices.length}
            </strong>
          </div>
          <div className="admin-kpi-card">
            <span className="admin-kpi-card__label">إجمالي الخدمات</span>
            <strong>{services.length}</strong>
          </div>
        </section>

        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Library</div>
              <div className="admin-card__title">
                <span className="lang-ar">الأجهزة الحالية</span>
                <span className="lang-en">Current devices</span>
              </div>
            </div>
          </div>
          <p className="admin-empty-note mx-4 mb-4">
            تظهر هنا الأجهزة الفعلية المسجلة في لوحة التحكم فقط. لا يتم إنشاء
            أجهزة تلقائية من سكربتات الـ seed.
          </p>
          <AdminListControls targetId="admin-devices-list" tabs={tabs} />
          <div
            className="admin-resource-grid"
            data-admin-list="admin-devices-list"
          >
            {devices.map((device) => {
              const meta = statusMeta(device.status);
              const linkedServices = device.serviceSlugs.flatMap((slug) => {
                const service = serviceBySlug.get(slug);
                return service ? [service] : [];
              });
              return (
                <details
                  key={device.id}
                  className="admin-resource-card"
                  data-admin-row
                  data-admin-status={device.status}
                  data-admin-search={[
                    device.name,
                    device.slug,
                    device.excerpt,
                    device.certifications.join(" "),
                    device.serviceSlugs.join(" "),
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <summary className="admin-resource-card__summary">
                    <div className="admin-resource-card__media">
                      <Image
                        src={device.imageUrl}
                        alt={device.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="admin-resource-card__body">
                      <p className="admin-data-row__title truncate">
                        {device.name}
                      </p>
                      <p className="admin-data-row__meta truncate">
                        {device.excerpt || device.certifications.join(" • ")}
                      </p>
                      <div className="admin-resource-card__chips">
                        <span>{device.serviceSlugs.length} خدمات</span>
                        {device.featured ? <span>مميز</span> : null}
                        {device.certifications.slice(0, 1).map((cert) => (
                          <span key={cert}>{cert}</span>
                        ))}
                      </div>
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
                    <DeviceEditorForm
                      device={{
                        id: device.id,
                        slug: device.slug,
                        name: device.name,
                        nameEn: device.nameEn ?? null,
                        excerpt: device.excerpt,
                        excerptEn: device.excerptEn ?? null,
                        description: device.description,
                        descriptionEn: device.descriptionEn ?? null,
                        certifications: [...device.certifications],
                        serviceSlugs: [...device.serviceSlugs],
                        imageUrl: device.imageUrl,
                        status: device.status,
                        featured: device.featured ?? false,
                      }}
                      serviceOptions={serviceOptions}
                    />

                    <div className="admin-linked-strip">
                      {linkedServices.length ? (
                        linkedServices.map((service) => (
                          <Link
                            key={service.slug}
                            href={
                              `/admin/services?service=${service.slug}` as Route
                            }
                            className="admin-linked-strip__item"
                          >
                            <strong>{service.name}</strong>
                            <span>{service.category}</span>
                          </Link>
                        ))
                      ) : (
                        <p className="admin-empty-note">
                          لم يُربط بخدمات بعد — ربطه يُظهره في صفحة الخدمة
                          المناسبة للزائر.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        ContentStatus.DRAFT,
                        ContentStatus.REVIEW,
                        ContentStatus.PUBLISHED,
                        ContentStatus.ARCHIVED,
                      ].map((status) => {
                        const m = statusMeta(status);
                        return (
                          <form key={status} action={setDeviceStatusAction}>
                            <input type="hidden" name="id" value={device.id} />
                            <input type="hidden" name="status" value={status} />
                            <button
                              type="submit"
                              className={`admin-btn-secondary ${device.status === status ? "border-[color:var(--admin-accent)] text-[color:var(--admin-accent)]" : ""}`}
                            >
                              <span className="lang-ar">{m.labelAr}</span>
                              <span className="lang-en">{m.labelEn}</span>
                            </button>
                          </form>
                        );
                      })}
                      <form action={deleteDeviceAction}>
                        <input type="hidden" name="id" value={device.id} />
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
