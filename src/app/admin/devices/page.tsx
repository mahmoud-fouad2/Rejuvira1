import Image from "next/image";
import { ContentStatus } from "@prisma/client";

import {
  deleteDeviceAction,
  setDeviceStatusAction,
} from "@/app/admin/devices/actions";
import { DeviceCreateForm } from "@/components/forms/DeviceCreateForm";
import { DeviceEditorForm } from "@/components/forms/DeviceEditorForm";
import { getDevices } from "@/lib/content-repository";

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

export default async function AdminDevicesPage() {
  const devices = await getDevices();

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
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">New</div>
              <div className="admin-card__title">
                <span className="lang-ar">إضافة جهاز</span>
                <span className="lang-en">Add device</span>
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <DeviceCreateForm />
          </div>
        </article>

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
          <div className="admin-data-list">
            {devices.map((device) => {
              const meta = statusMeta(device.status);
              return (
                <details key={device.id} className="admin-data-row !block">
                  <summary className="grid cursor-pointer grid-cols-[3.4rem_1fr_auto] items-center gap-3">
                    <div className="relative h-12 w-14 overflow-hidden rounded-lg" style={{ background: "var(--admin-panel-soft)" }}>
                      <Image src={device.imageUrl} alt={device.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="min-w-0">
                      <p className="admin-data-row__title truncate">{device.name}</p>
                      <p className="admin-data-row__meta truncate">
                        {device.certifications.join(" • ")}
                      </p>
                    </div>
                    <span className={`admin-status-badge ${meta.className}`}>
                      <span className="lang-ar">{meta.labelAr}</span>
                      <span className="lang-en">{meta.labelEn}</span>
                    </span>
                  </summary>

                  <div className="mt-4 grid gap-4 border-t pt-4" style={{ borderColor: "var(--admin-border)" }}>
                    <DeviceEditorForm
                      device={{
                        id: device.id,
                        slug: device.slug,
                        name: device.name,
                        excerpt: device.excerpt,
                        description: device.description,
                        certifications: [...device.certifications],
                        serviceSlugs: [...device.serviceSlugs],
                        imageUrl: device.imageUrl,
                        status: device.status,
                      }}
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
