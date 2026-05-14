import Image from "next/image";

import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { ServiceCreateForm } from "@/components/forms/ServiceCreateForm";
import { getServices } from "@/lib/content-repository";

export default async function AdminServicesPage() {
  const services = await getServices();

  return (
    <>
      <section className="surface-panel rounded-[2rem] p-6 lg:p-8">
        <p className="eyebrow">Services Module</p>
        <h1 className="text-ink mt-4 font-serif text-5xl tracking-[-0.05em]">
          مكتبة الخدمات
        </h1>
        <p className="text-ink-soft mt-4 max-w-3xl text-base leading-8">
          تجمع هذه الوحدة الخدمات الحالية وتدعم إضافة خدمات جديدة بصياغة موحدة
          وصورة معتمدة لكل خدمة.
        </p>
      </section>
      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="surface-panel rounded-[2rem] p-6">
          <h2 className="text-ink font-serif text-3xl tracking-[-0.04em]">
            إضافة مسودة خدمة
          </h2>
          <div className="mt-6">
            <ServiceCreateForm />
          </div>
        </article>
        <div className="grid gap-4">
          {services.map((service) => (
            <article
              key={service.id}
              className="surface-panel overflow-hidden rounded-[1.85rem] md:grid md:grid-cols-[9rem_1fr]"
            >
              <div className="relative min-h-40">
                <Image
                  src={service.coverImageUrl}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-ink text-lg font-semibold">
                      {service.name}
                    </p>
                    <p className="text-ink-soft mt-1 text-sm">
                      {service.category}
                    </p>
                  </div>
                  <AdminStatusBadge status={service.status} />
                </div>
                <p className="text-ink-soft mt-3 text-sm leading-7">
                  {service.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
