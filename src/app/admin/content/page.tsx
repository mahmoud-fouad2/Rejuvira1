import { ContentStatus } from "@prisma/client";
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

  const unlinkedServices = services.filter(
    (service) =>
      service.doctorSlugs.length === 0 || service.deviceSlugs.length === 0,
  );

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>مركز المحتوى</h1>
          <p>
            ربط الأقسام بالخدمات، والخدمات بالأطباء والأجهزة والمقالات من مكان
            واحد.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link href={"/admin/services" as Route} className="admin-btn-primary">
            تعديل الخدمات
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
          <span className="admin-kpi__icon">S</span>
          <span>
            <strong className="admin-kpi__value">{services.length}</strong>
            <span className="admin-kpi__label">خدمة</span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-success">D</span>
          <span>
            <strong className="admin-kpi__value">{doctors.length}</strong>
            <span className="admin-kpi__label">طبيب</span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-gold">M</span>
          <span>
            <strong className="admin-kpi__value">{devices.length}</strong>
            <span className="admin-kpi__label">جهاز</span>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi__icon is-danger">!</span>
          <span>
            <strong className="admin-kpi__value">
              {unlinkedServices.length}
            </strong>
            <span className="admin-kpi__label">خدمات تحتاج ربط</span>
          </span>
        </div>
      </section>

      <section className="admin-relationship-grid">
        {categoriesWithFallback.map((category) => {
          const categoryServices = services.filter(
            (service) =>
              service.categoryId === category.id ||
              service.category === category.name,
          );

          return (
            <article key={category.id} className="admin-relationship-card">
              <header>
                <div>
                  <span className="admin-card__subtitle">Category</span>
                  <h2>{category.name}</h2>
                </div>
                <span
                  className={`admin-status-badge ${statusClass(category.status)}`}
                >
                  {statusLabel(category.status)}
                </span>
              </header>

              <div className="admin-relationship-card__body">
                {categoryServices.length === 0 ? (
                  <p className="admin-empty-note">
                    لا توجد خدمات داخل هذا القسم.
                  </p>
                ) : null}

                {categoryServices.map((service) => {
                  const linkedDoctors = doctors.filter((doctor) =>
                    service.doctorSlugs.includes(doctor.slug),
                  );
                  const linkedDevices = devices.filter((device) =>
                    service.deviceSlugs.includes(device.slug),
                  );
                  const linkedPosts = posts.filter((post) =>
                    post.relatedServiceSlugs.includes(service.slug),
                  );
                  const needsLink =
                    linkedDoctors.length === 0 || linkedDevices.length === 0;

                  return (
                    <details key={service.id} className="admin-relation-item">
                      <summary>
                        <span>
                          <strong>{service.name}</strong>
                          <small>{service.slug}</small>
                        </span>
                        <span
                          className={`admin-status-badge ${needsLink ? "is-draft" : statusClass(service.status)}`}
                        >
                          {needsLink
                            ? "يحتاج ربط"
                            : statusLabel(service.status)}
                        </span>
                      </summary>
                      <div className="admin-relation-item__detail">
                        <div>
                          <b>الأطباء</b>
                          <div className="admin-relation-chips">
                            {linkedDoctors.length ? (
                              linkedDoctors.map((doctor) => (
                                <span key={doctor.id} className="admin-chip">
                                  {doctor.name}
                                </span>
                              ))
                            ) : (
                              <span className="admin-chip is-warning">
                                غير مرتبط
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <b>الأجهزة</b>
                          <div className="admin-relation-chips">
                            {linkedDevices.length ? (
                              linkedDevices.map((device) => (
                                <span key={device.id} className="admin-chip">
                                  {device.name}
                                </span>
                              ))
                            ) : (
                              <span className="admin-chip is-warning">
                                غير مرتبط
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <b>المقالات</b>
                          <div className="admin-relation-chips">
                            {linkedPosts.length ? (
                              linkedPosts.slice(0, 4).map((post) => (
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
                        <Link
                          href={"/admin/services" as Route}
                          className="admin-btn-secondary"
                        >
                          تعديل الربط من الخدمة
                        </Link>
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
