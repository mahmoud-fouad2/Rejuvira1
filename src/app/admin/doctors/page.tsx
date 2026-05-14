import Image from "next/image";

import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { DoctorCreateForm } from "@/components/forms/DoctorCreateForm";
import { DoctorEditorForm } from "@/components/forms/DoctorEditorForm";
import { getDoctors } from "@/lib/content-repository";

export default async function AdminDoctorsPage() {
  const doctors = await getDoctors();

  return (
    <>
      <section className="surface-panel rounded-[2rem] p-6 lg:p-8">
        <p className="eyebrow">Doctors Module</p>
        <h1 className="text-ink mt-4 font-serif text-5xl tracking-[-0.05em]">
          إدارة ملفات الأطباء
        </h1>
        <p className="text-ink-soft mt-4 max-w-3xl text-base leading-8">
          تتيح هذه الوحدة مراجعة ملفات الأطباء الحالية وإضافة ملفات جديدة ضمن
          سير عمل التحرير المعتمد.
        </p>
      </section>
      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="surface-panel rounded-[2rem] p-6">
          <h2 className="text-ink font-serif text-3xl tracking-[-0.04em]">
            إضافة مسودة طبيب
          </h2>
          <div className="mt-6">
            <DoctorCreateForm />
          </div>
        </article>
        <div className="grid gap-4">
          {doctors.map((doctor) => (
            <details
              key={doctor.id}
              className="surface-panel overflow-hidden rounded-[1.85rem]"
            >
              <summary className="grid cursor-pointer gap-0 md:grid-cols-[9rem_1fr]">
                <div className="relative min-h-40">
                  <Image
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    fill
                    className="bg-[radial-gradient(circle_at_top,rgba(201,162,106,0.18),rgba(255,255,255,0.98))] object-contain p-3"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-ink text-lg font-semibold">
                        {doctor.name}
                      </p>
                      <p className="text-ink-soft mt-1 text-sm">
                        {doctor.specialty}
                      </p>
                    </div>
                    <AdminStatusBadge status={doctor.status} />
                  </div>
                  <p className="text-ink-soft mt-3 text-sm leading-7">
                    {doctor.summary}
                  </p>
                </div>
              </summary>
              <div className="border-line border-t p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-ink text-lg font-semibold">
                      تحرير الملف الطبي
                    </p>
                    <p className="text-ink-soft mt-1 text-sm">
                      الصور المحلية والاقتباس والنصوص هنا مرتبطة مباشرة بواجهة
                      الموقع.
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <DoctorEditorForm doctor={doctor} />
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
