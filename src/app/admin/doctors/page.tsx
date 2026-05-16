import Image from "next/image";
import { ContentStatus } from "@prisma/client";

import {
  deleteDoctorAction,
  setDoctorStatusAction,
} from "@/app/admin/doctors/actions";
import { AdminAddModal } from "@/components/admin/AdminAddModal";
import { DoctorCreateForm } from "@/components/forms/DoctorCreateForm";
import { DoctorEditorForm } from "@/components/forms/DoctorEditorForm";
import { getDoctors, getServices } from "@/lib/content-repository";

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

export default async function AdminDoctorsPage() {
  const [doctors, services] = await Promise.all([getDoctors(), getServices()]);
  const serviceOptions = services.map((service) => ({
    value: service.slug,
    label: service.name,
    hint: service.category,
  }));

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
          <div className="admin-data-list">
            {doctors.map((doctor) => {
              const meta = statusMeta(doctor.status);
              return (
                <details key={doctor.id} className="admin-data-row !block">
                  <summary className="grid cursor-pointer grid-cols-[3.4rem_1fr_auto] items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full" style={{ background: "var(--admin-panel-soft)" }}>
                      <Image src={doctor.photoUrl} alt={doctor.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="min-w-0">
                      <p className="admin-data-row__title truncate">{doctor.name}</p>
                      <p className="admin-data-row__meta truncate">{doctor.specialty}</p>
                    </div>
                    <span className={`admin-status-badge ${meta.className}`}>
                      <span className="lang-ar">{meta.labelAr}</span>
                      <span className="lang-en">{meta.labelEn}</span>
                    </span>
                  </summary>

                  <div className="mt-4 grid gap-4 border-t pt-4" style={{ borderColor: "var(--admin-border)" }}>
                    <DoctorEditorForm doctor={doctor} serviceOptions={serviceOptions} />

                    <div className="flex flex-wrap gap-2">
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
