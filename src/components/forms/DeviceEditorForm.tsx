"use client";

import { useActionState } from "react";
import { ContentStatus } from "@prisma/client";

import {
  updateDeviceAction,
  type DeviceActionState,
} from "@/app/admin/devices/actions";

const initial: DeviceActionState = { status: "idle", message: "" };

type Props = {
  device: {
    id: string;
    slug: string;
    name: string;
    nameEn?: string | null;
    excerpt: string;
    excerptEn?: string | null;
    description: string;
    descriptionEn?: string | null;
    certifications: string[];
    serviceSlugs: string[];
    imageUrl: string;
    status: ContentStatus;
  };
};

export function DeviceEditorForm({ device }: Props) {
  const [state, action, pending] = useActionState(updateDeviceAction, initial);

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={device.id} />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الاسم (عربي)</span>
            <span className="lang-en">Name (Arabic)</span>
          </span>
          <input
            name="name"
            defaultValue={device.name}
            required
            dir="rtl"
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الاسم (إنجليزي)</span>
            <span className="lang-en">Name (English)</span>
          </span>
          <input
            name="nameEn"
            defaultValue={device.nameEn ?? ""}
            dir="ltr"
            className="admin-input"
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">Slug</span>
          <input
            name="slug"
            defaultValue={device.slug}
            required
            dir="ltr"
            className="admin-input font-mono"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">رابط صورة الجهاز</span>
            <span className="lang-en">Image URL</span>
          </span>
          <input
            name="imageUrl"
            defaultValue={device.imageUrl}
            dir="ltr"
            className="admin-input"
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">ملخص (عربي)</span>
            <span className="lang-en">Excerpt (Arabic)</span>
          </span>
          <textarea
            name="excerpt"
            rows={2}
            defaultValue={device.excerpt}
            required
            dir="rtl"
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">ملخص (إنجليزي)</span>
            <span className="lang-en">Excerpt (English)</span>
          </span>
          <textarea
            name="excerptEn"
            rows={2}
            defaultValue={device.excerptEn ?? ""}
            dir="ltr"
            className="admin-input"
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الوصف (عربي)</span>
            <span className="lang-en">Description (Arabic)</span>
          </span>
          <textarea
            name="description"
            rows={4}
            defaultValue={device.description}
            required
            dir="rtl"
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الوصف (إنجليزي)</span>
            <span className="lang-en">Description (English)</span>
          </span>
          <textarea
            name="descriptionEn"
            rows={4}
            defaultValue={device.descriptionEn ?? ""}
            dir="ltr"
            className="admin-input"
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الاعتمادات (مفصولة بفاصلة)</span>
            <span className="lang-en">Certifications (comma-separated)</span>
          </span>
          <input
            name="certifications"
            defaultValue={device.certifications.join(", ")}
            required
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الخدمات المرتبطة (slugs)</span>
            <span className="lang-en">Related services (slugs)</span>
          </span>
          <input
            name="serviceSlugs"
            defaultValue={device.serviceSlugs.join(", ")}
            dir="ltr"
            className="admin-input"
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الحالة</span>
            <span className="lang-en">Status</span>
          </span>
          <select
            name="status"
            defaultValue={device.status}
            className="admin-input"
          >
            <option value={ContentStatus.DRAFT}>Draft</option>
            <option value={ContentStatus.REVIEW}>Review</option>
            <option value={ContentStatus.PUBLISHED}>Published</option>
            <option value={ContentStatus.ARCHIVED}>Archived</option>
          </select>
        </label>
        <label className="admin-input flex items-center gap-3">
          <input type="checkbox" name="featured" value="true" />
          <span className="text-sm">
            <span className="lang-ar">جهاز مميز</span>
            <span className="lang-en">Featured device</span>
          </span>
        </label>
      </div>
      {state.message ? (
        <p
          className={`text-xs font-medium ${
            state.status === "error" ? "text-burgundy" : "text-emerald"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="admin-btn-primary">
        {pending ? (
          <>
            <span className="lang-ar">جاري الحفظ...</span>
            <span className="lang-en">Saving...</span>
          </>
        ) : (
          <>
            <span className="lang-ar">حفظ التعديلات</span>
            <span className="lang-en">Save changes</span>
          </>
        )}
      </button>
    </form>
  );
}
