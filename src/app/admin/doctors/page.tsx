import Image from "next/image";
import Link from "next/link";
import { ContentStatus } from "@prisma/client";
import type { Route } from "next";

import {
  deleteDoctorAction,
  setDoctorStatusAction,
} from "@/app/admin/doctors/actions";
import { AdminAddModal } from "@/components/admin/AdminAddModal";
import { AdminListControls } from "@/components/admin/AdminListControls";
import { DoctorCreateForm } from "@/components/forms/DoctorCreateForm";
import { DoctorEditorForm } from "@/components/forms/DoctorEditorForm";
import { getDoctors, getServices } from "@/lib/content-repository";

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

export default async function AdminDoctorsPage() {
  const [doctors, services] = await Promise.all([getDoctors(), getServices()]);
  const serviceOptions = services.map((service) => ({
    value: service.slug,
    label: service.name,
    hint: service.category,
  }));
  const serviceBySlug = new Map(
    services.map((service) => [service.slug, service]),
  );
  const publishedCount = doctors.filter(
    (doctor) => doctor.status === ContentStatus.PUBLISHED,
  ).length;
  const reviewCount = doctors.filter(
    (doctor) => doctor.status === ContentStatus.REVIEW,
  ).length;
  const featuredCount = doctors.filter((doctor) => doctor.featured).length;
  const linkedToServicesCount = doctors.filter(
    (doctor) => doctor.serviceSlugs.length > 0,
  ).length;
  const tabs = [
    { value: "all", labelAr: "الكل", labelEn: "All", count: doctors.length },
    {
      value: ContentStatus.PUBLISHED,
      labelAr: "منشور",
      labelEn: "Published",
      count: doctors.filter(
        (doctor) => doctor.status === ContentStatus.PUBLISHED,
      ).length,
    },
    {
      value: ContentStatus.REVIEW,
      labelAr: "مراجعة",
      labelEn: "Review",
      count: doctors.filter((doctor) => doctor.status === ContentStatus.REVIEW)
        .length,
    },
    {
      value: ContentStatus.DRAFT,
      labelAr: "مسودة",
      labelEn: "Draft",
      count: doctors.filter((doctor) => doctor.status === ContentStatus.DRAFT)
        .length,
    },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">الأطباء</span>
            <span className="lang-en">Doctors</span>
          </h1>
          <p>
            <span className="lang-ar">{doctors.length} طبيب</span>
            <span className="lang-en">{doctors.length} doctors</span>
          </p>
        </div>
        <div className="admin-page-header__actions">
          <AdminAddModal
            triggerArabic="إضافة طبيب"
            triggerEnglish="Add doctor"
            titleArabic="إضافة طبيب جديد"
            titleEnglish="New doctor"
          >
            <DoctorCreateForm serviceOptions={serviceOptions} />
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
            <span className="admin-kpi-card__label">قيد المراجعة</span>
            <strong>{reviewCount}</strong>
          </div>
          <div className="admin-kpi-card">
            <span className="admin-kpi-card__label">مميز في الموقع</span>
            <strong>{featuredCount}</strong>
          </div>
          <div className="admin-kpi-card">
            <span className="admin-kpi-card__label">مرتبط بخدمات</span>
            <strong>
              {linkedToServicesCount}/{doctors.length}
            </strong>
          </div>
        </section>

        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Library</div>
              <div className="admin-card__title">
                <span className="lang-ar">الأطباء الحاليون</span>
                <span className="lang-en">Current doctors</span>
              </div>
            </div>
          </div>
          <AdminListControls targetId="admin-doctors-list" tabs={tabs} />
          <div
            className="admin-resource-grid admin-doctors-grid"
            data-admin-list="admin-doctors-list"
          >
            {doctors.map((doctor) => {
              const meta = statusMeta(doctor.status);
              const linkedServices = doctor.serviceSlugs.flatMap((slug) => {
                const service = serviceBySlug.get(slug);
                return service ? [service] : [];
              });
              const servicePreview = linkedServices.slice(0, 3);
              const remainingServices =
                linkedServices.length - servicePreview.length;
              const languagePreview = doctor.languages.slice(0, 3);
              const linkedCategories = Array.from(
                new Set(
                  linkedServices
                    .map((service) => service.category)
                    .filter(Boolean),
                ),
              );
              return (
                <details
                  key={doctor.id}
                  className="admin-resource-card admin-doctor-card"
                  data-admin-row
                  data-admin-status={doctor.status}
                  data-admin-search={[
                    doctor.name,
                    doctor.slug,
                    doctor.title,
                    doctor.specialty,
                    doctor.languages.join(" "),
                    doctor.serviceSlugs.join(" "),
                    linkedServices
                      .map((service) => `${service.name} ${service.category}`)
                      .join(" "),
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <summary className="admin-resource-card__summary admin-doctor-card__summary">
                    <div className="admin-doctor-card__photo">
                      <Image
                        src={doctor.photoUrl}
                        alt={doctor.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 720px) 100vw, 360px"
                      />
                      <span className={`admin-status-badge ${meta.className}`}>
                        <span className="lang-ar">{meta.labelAr}</span>
                        <span className="lang-en">{meta.labelEn}</span>
                      </span>
                    </div>
                    <div className="admin-doctor-card__content">
                      <div className="admin-doctor-card__identity">
                        <span>{doctor.specialty}</span>
                        <h2>{doctor.name}</h2>
                        <p>{doctor.title}</p>
                      </div>

                      <p className="admin-doctor-card__summary-text">
                        {doctor.summary}
                      </p>

                      <div className="admin-doctor-card__metrics">
                        <span>
                          <strong>{doctor.yearsExperience}</strong>
                          <span>سنوات خبرة</span>
                        </span>
                        <span>
                          <strong>{linkedServices.length}</strong>
                          <span>خدمات</span>
                        </span>
                        <span>
                          <strong>{linkedCategories.length}</strong>
                          <span>أقسام</span>
                        </span>
                      </div>

                      <div className="admin-doctor-card__chips">
                        {languagePreview.map((language) => (
                          <span key={language}>{language}</span>
                        ))}
                        {doctor.languages.length > languagePreview.length ? (
                          <span>
                            +{doctor.languages.length - languagePreview.length}
                          </span>
                        ) : null}
                        {doctor.featured ? <span>مميز</span> : null}
                      </div>

                      <div className="admin-doctor-card__services">
                        {servicePreview.length ? (
                          servicePreview.map((service) => (
                            <span key={service.slug}>{service.name}</span>
                          ))
                        ) : (
                          <span className="is-muted">غير مرتبط بخدمات</span>
                        )}
                        {remainingServices > 0 ? (
                          <span>+{remainingServices}</span>
                        ) : null}
                      </div>
                    </div>
                    <span className="admin-doctor-card__expand">
                      <span className="lang-ar">إدارة</span>
                      <span className="lang-en">Manage</span>
                    </span>
                  </summary>

                  <div
                    className="admin-doctor-card__drawer grid gap-4 border-t pt-4"
                    style={{ borderColor: "var(--admin-border)" }}
                  >
                    <DoctorEditorForm
                      doctor={doctor}
                      serviceOptions={serviceOptions}
                    />
                    <div className="admin-linked-strip">
                      {doctor.serviceSlugs.length ? (
                        doctor.serviceSlugs.map((slug) => {
                          const service = serviceBySlug.get(slug);
                          return (
                            <Link
                              key={slug}
                              href={`/admin/services?service=${slug}` as Route}
                              className="admin-linked-strip__item"
                            >
                              <strong>{service?.name ?? slug}</strong>
                              <span>{service?.category ?? "خدمة مرتبطة"}</span>
                            </Link>
                          );
                        })
                      ) : (
                        <p className="admin-empty-note">
                          لم يتم ربط هذا الطبيب بخدمة بعد. الربط يحسّن صفحات
                          الخدمات وتجربة الحجز.
                        </p>
                      )}
                    </div>
                    {linkedServices.length ? (
                      <div className="admin-edit-context">
                        <span>خدمات مرتبطة: {linkedServices.length}</span>
                        <span>{linkedCategories.slice(0, 3).join(" · ")}</span>
                      </div>
                    ) : null}

                    <div className="admin-doctor-card__status-actions">
                      {[
                        ContentStatus.DRAFT,
                        ContentStatus.REVIEW,
                        ContentStatus.PUBLISHED,
                        ContentStatus.ARCHIVED,
                      ].map((status) => {
                        const m = statusMeta(status);
                        return (
                          <form key={status} action={setDoctorStatusAction}>
                            <input type="hidden" name="id" value={doctor.id} />
                            <input type="hidden" name="status" value={status} />
                            <button
                              type="submit"
                              className={`admin-btn-secondary ${doctor.status === status ? "border-[color:var(--admin-accent)] text-[color:var(--admin-accent)]" : ""}`}
                            >
                              <span className="lang-ar">{m.labelAr}</span>
                              <span className="lang-en">{m.labelEn}</span>
                            </button>
                          </form>
                        );
                      })}
                      <form action={deleteDoctorAction}>
                        <input type="hidden" name="id" value={doctor.id} />
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
