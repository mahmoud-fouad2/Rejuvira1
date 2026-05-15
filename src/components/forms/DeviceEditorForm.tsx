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
    excerpt: string;
    description: string;
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
          <span className="admin-field-label">الاسم</span>
          <input
            name="name"
            defaultValue={device.name}
            required
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">المعرف (slug)</span>
          <input
            name="slug"
            defaultValue={device.slug}
            required
            dir="ltr"
            className="admin-input font-mono"
          />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="admin-field-label">ملخص</span>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={device.excerpt}
          required
          className="admin-input"
        />
      </label>
      <label className="grid gap-1">
        <span className="admin-field-label">الوصف</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={device.description}
          required
          className="admin-input"
        />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">الاعتمادات (مفصولة بفاصلة)</span>
          <input
            name="certifications"
            defaultValue={device.certifications.join(", ")}
            required
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">الخدمات المرتبطة (slugs)</span>
          <input
            name="serviceSlugs"
            defaultValue={device.serviceSlugs.join(", ")}
            dir="ltr"
            className="admin-input"
          />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="admin-field-label">رابط صورة الجهاز</span>
        <input
          name="imageUrl"
          defaultValue={device.imageUrl}
          dir="ltr"
          className="admin-input"
        />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">الحالة</span>
          <select
            name="status"
            defaultValue={device.status}
            className="admin-input"
          >
            <option value={ContentStatus.DRAFT}>مسودة</option>
            <option value={ContentStatus.REVIEW}>قيد المراجعة</option>
            <option value={ContentStatus.PUBLISHED}>منشور</option>
            <option value={ContentStatus.ARCHIVED}>مؤرشف</option>
          </select>
        </label>
        <label className="admin-input flex items-center gap-3">
          <input type="checkbox" name="featured" value="true" />
          <span className="text-sm text-ink-soft">جهاز مميز</span>
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
        {pending ? "جاري الحفظ..." : "حفظ التعديلات"}
      </button>
    </form>
  );
}
