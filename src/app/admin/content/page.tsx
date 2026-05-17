import { ContentStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import {
  getDevices,
  getDoctors,
  getJournalPosts,
  getServiceCategories,
  getServices,
} from "@/lib/content-repository";

function statusClass(status?: ContentStatus) {
  if (status === ContentStatus.PUBLISHED) return "is-published";
  if (status === ContentStatus.REVIEW || status === ContentStatus.APPROVED) {
    return "is-review";
  }
  if (status === ContentStatus.ARCHIVED) return "is-archived";
  return "is-draft";
}

function statusLabel(status?: ContentStatus) {
  if (status === ContentStatus.PUBLISHED) return "منشور";
  if (status === ContentStatus.REVIEW) return "مراجعة";
  if (status === ContentStatus.APPROVED) return "معتمد";
  if (status === ContentStatus.ARCHIVED) return "مؤرشف";
  return "مسودة";
}

export default async function AdminContentHubPage() {
  const [categories, services, doctors, devices, posts] = await Promise.all([
    getServiceCategories(),
    getServices(),
    getDoctors(),
    getDevices(),
    getJournalPosts(),
  ]);

  const categoriesWithFallback = categories.length
    ? categories
    : Array.from(new Set(services.map((service) => service.category))).map(
        (name, index) => ({
          id: `fallback-${index}`,
          slug: name,
          name,
          nameEn: null,
          description: null,
          descriptionEn: null,
          status: ContentStatus.PUBLISHED,
          sortOrder: index,
          serviceCount: services.filter((service) => service.category === name)
            .length,
        }),
      );

  const linkedServiceCount = services.filter(
    (service) =>
      service.categoryId &&
      service.doctorSlugs.length > 0 &&
      service.deviceSlugs.length > 0,
  ).length;
  const servicesNeedingAttention = services.filter(
    (service) => !service.categoryId || service.doctorSlugs.length === 0,
  );

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>مركز المحتوى والعلاقات</h1>
          <p>
            لوحة واحدة لمراجعة ربط الأقسام بالخدمات، والخدمات بالأطباء والأجهزة
            والمقالات. البيانات المعروضة هنا تأتي من قاعدة البيانات مباشرة عند
            توفرها.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link href={"/admin/services" as Route} className="admin-btn-primary">
            إدارة الخدمات
          </Link>
          <Link
            href={"/admin/service-categories" as Route}
            className="admin-btn-secondary"
          >
            إدارة الأقسام
          </Link>
        </div>
      </div>

      <section className="admin-grid-4">
        <div className="admin-kpi">
          <span className="admin-kpi__icon">C</span>
          <span>
            <strong className="admin-kpi__value">
              {categoriesWithFallback.length}
            </strong>
            <span className="admin-kpi__label">قسم خدمات</span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-success">S</span>
          <span>
            <strong className="admin-kpi__value">{services.length}</strong>
            <span className="admin-kpi__label">خدمة</span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-gold">✓</span>
          <span>
            <strong className="admin-kpi__value">{linkedServiceCount}</strong>
            <span className="admin-kpi__label">خدمة مربوطة جيدًا</span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-danger">!</span>
          <span>
            <strong className="admin-kpi__value">
              {servicesNeedingAttention.length}
            </strong>
            <span className="admin-kpi__label">تحتاج مراجعة</span>
          </span>
        </div>
      </section>

      <section className="admin-relationship-grid">
        {categoriesWithFallback.map((category) => {
          const categoryServices = services.filter(
            (service) =>
              service.categoryId === category.id ||
              service.categorySlug === category.slug ||
              service.category === category.name,
          );
          const serviceSlugs = new Set(
            categoryServices.map((service) => service.slug),
          );
          const linkedDoctors = doctors.filter((doctor) =>
            doctor.serviceSlugs.some((slug) => serviceSlugs.has(slug)),
          );
          const linkedDevices = devices.filter((device) =>
            device.serviceSlugs.some((slug) => serviceSlugs.has(slug)),
          );
          const linkedPosts = posts.filter((post) =>
            post.relatedServiceSlugs.some((slug) => serviceSlugs.has(slug)),
          );
          const coverServices = categoryServices
            .filter((service) => service.coverImageUrl)
            .slice(0, 3);

          return (
            <article key={category.id} className="admin-relationship-card">
              <header>
                <div>
                  <span className="admin-card__subtitle">{category.slug}</span>
                  <h2>{category.name}</h2>
                  {category.description ? (
                    <p className="admin-relationship-card__description">
                      {category.description}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`admin-status-badge ${statusClass(category.status)}`}
                >
                  {statusLabel(category.status)}
                </span>
              </header>

              <div className="admin-relationship-card__media">
                {coverServices.length ? (
                  coverServices.map((service) => (
                    <div key={service.id} className="admin-relation-cover">
                      <Image
                        src={service.coverImageUrl}
                        alt={service.name}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="admin-relation-cover is-empty">
                    لا توجد صور خدمات
                  </div>
                )}
              </div>

              <div className="admin-relation-summary">
                <span>{categoryServices.length} خدمة</span>
                <span>{linkedDoctors.length} طبيب</span>
                <span>{linkedDevices.length} جهاز</span>
                <span>{linkedPosts.length} مقال</span>
              </div>

              <div className="admin-relationship-card__body">
                {categoryServices.length === 0 ? (
                  <p className="admin-empty-note">
                    لا توجد خدمات داخل هذا القسم. أضف خدمة أو انقل خدمة قائمة
                    لهذا القسم من صفحة الخدمات.
                  </p>
                ) : null}

                {categoryServices.map((service) => {
                  const serviceDoctors = doctors.filter((doctor) =>
                    service.doctorSlugs.includes(doctor.slug),
                  );
                  const serviceDevices = devices.filter((device) =>
                    service.deviceSlugs.includes(device.slug),
                  );
                  const servicePosts = posts.filter((post) =>
                    post.relatedServiceSlugs.includes(service.slug),
                  );
                  const needsLink =
                    serviceDoctors.length === 0 || !service.categoryId;

                  return (
                    <details key={service.id} className="admin-relation-item">
                      <summary>
                        <span>
                          <strong>{service.name}</strong>
                          <small>
                            {service.slug} · {serviceDoctors.length} أطباء ·{" "}
                            {serviceDevices.length} أجهزة
                          </small>
                        </span>
                        <span
                          className={`admin-status-badge ${
                            needsLink ? "is-draft" : statusClass(service.status)
                          }`}
                        >
                          {needsLink
                            ? "يحتاج ربط"
                            : statusLabel(service.status)}
                        </span>
                      </summary>
                      <div className="admin-relation-item__detail">
                        <div>
                          <b>الأطباء مقدمو الخدمة</b>
                          <div className="admin-relation-chips">
                            {serviceDoctors.length ? (
                              serviceDoctors.map((doctor) => (
                                <span key={doctor.id} className="admin-chip">
                                  {doctor.name}
                                </span>
                              ))
                            ) : (
                              <span className="admin-chip is-warning">
                                غير مرتبط بطبيب
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <b>الأجهزة الداعمة</b>
                          <div className="admin-relation-chips">
                            {serviceDevices.length ? (
                              serviceDevices.map((device) => (
                                <span key={device.id} className="admin-chip">
                                  {device.name}
                                </span>
                              ))
                            ) : (
                              <span className="admin-chip is-warning">
                                لا يوجد جهاز مرتبط
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <b>المقالات المرتبطة</b>
                          <div className="admin-relation-chips">
                            {servicePosts.length ? (
                              servicePosts.slice(0, 4).map((post) => (
                                <span key={post.id} className="admin-chip">
                                  {post.title}
                                </span>
                              ))
                            ) : (
                              <span className="admin-chip is-warning">
                                لا يوجد مقال مرتبط
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={"/admin/services" as Route}
                            className="admin-btn-secondary"
                          >
                            تعديل الخدمة والربط
                          </Link>
                          <Link
                            href={`/services/${service.slug}` as Route}
                            className="admin-btn-secondary"
                          >
                            عرض في الموقع
                          </Link>
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
