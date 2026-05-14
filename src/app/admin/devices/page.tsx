import Image from "next/image";

import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { DeviceCreateForm } from "@/components/forms/DeviceCreateForm";
import { getDevices } from "@/lib/content-repository";

export default async function AdminDevicesPage() {
  const devices = await getDevices();

  return (
    <>
      <section className="surface-panel rounded-[2rem] p-6 lg:p-8">
        <p className="eyebrow">Devices Module</p>
        <h1 className="text-ink mt-4 font-serif text-5xl tracking-[-0.05em]">
          إدارة طبقة الأجهزة
        </h1>
        <p className="text-ink-soft mt-4 max-w-3xl text-base leading-8">
          تعرض هذه الوحدة الأجهزة المعتمدة وتدعم إضافة أجهزة جديدة وربطها
          بالخدمات ذات الصلة.
        </p>
      </section>
      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="surface-panel rounded-[2rem] p-6">
          <h2 className="text-ink font-serif text-3xl tracking-[-0.04em]">
            إضافة مسودة جهاز
          </h2>
          <div className="mt-6">
            <DeviceCreateForm />
          </div>
        </article>
        <div className="grid gap-5 md:grid-cols-2">
          {devices.map((device) => (
            <article
              key={device.id}
              className="surface-panel overflow-hidden rounded-[1.85rem]"
            >
              <div className="relative h-56">
                <Image
                  src={device.imageUrl}
                  alt={device.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-ink text-lg font-semibold">
                    {device.name}
                  </p>
                  <AdminStatusBadge status={device.status} />
                </div>
                <p className="text-ink-soft mt-3 text-sm leading-7">
                  {device.excerpt}
                </p>
                <p className="text-ink-faint mt-3 text-xs">
                  {device.certifications.join(" • ")}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
