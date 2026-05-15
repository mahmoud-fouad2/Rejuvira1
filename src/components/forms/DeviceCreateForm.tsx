"use client";

import { useActionState } from "react";

import {
  createDeviceAction,
  type DeviceActionState,
} from "@/app/admin/devices/actions";

const initialState: DeviceActionState = {
  status: "idle",
  message: "",
};

export function DeviceCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createDeviceAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الاسم</span>
            <span className="lang-en">Name</span>
          </span>
          <input name="name" required className="admin-input" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">Slug</span>
          <input name="slug" required dir="ltr" className="admin-input font-mono" />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="admin-field-label">
          <span className="lang-ar">ملخص</span>
          <span className="lang-en">Excerpt</span>
        </span>
        <input name="excerpt" required className="admin-input" />
      </label>
      <label className="grid gap-1">
        <span className="admin-field-label">
          <span className="lang-ar">الوصف</span>
          <span className="lang-en">Description</span>
        </span>
        <textarea name="description" rows={4} required className="admin-input" />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الاعتمادات</span>
            <span className="lang-en">Certifications</span>
          </span>
          <input name="certifications" required className="admin-input" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الخدمات المرتبطة (slugs)</span>
            <span className="lang-en">Related services (slugs)</span>
          </span>
          <input name="serviceSlugs" dir="ltr" className="admin-input" />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="admin-field-label">
          <span className="lang-ar">رابط صورة الجهاز</span>
          <span className="lang-en">Image URL</span>
        </span>
        <input name="imageUrl" dir="ltr" className="admin-input" />
      </label>
      {state.message ? (
        <p className={`text-xs font-medium ${state.status === "error" ? "text-burgundy" : "text-emerald"}`}>
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={isPending} className="admin-btn-primary">
        {isPending ? (
          <>
            <span className="lang-ar">جاري الحفظ...</span>
            <span className="lang-en">Saving...</span>
          </>
        ) : (
          <>
            <span className="lang-ar">حفظ</span>
            <span className="lang-en">Save</span>
          </>
        )}
      </button>
    </form>
  );
}
