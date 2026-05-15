"use client";

import { useActionState } from "react";

import {
  createServiceAction,
  type ServiceActionState,
} from "@/app/admin/services/actions";

const initialState: ServiceActionState = {
  status: "idle",
  message: "",
};

export function ServiceCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createServiceAction,
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
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">التصنيف</span>
            <span className="lang-en">Category</span>
          </span>
          <input name="category" required className="admin-input" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">رابط صورة الغلاف</span>
            <span className="lang-en">Cover image URL</span>
          </span>
          <input name="coverImageUrl" dir="ltr" className="admin-input" />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="admin-field-label">
          <span className="lang-ar">ملخص</span>
          <span className="lang-en">Excerpt</span>
        </span>
        <textarea name="excerpt" rows={2} required className="admin-input" />
      </label>
      <label className="grid gap-1">
        <span className="admin-field-label">
          <span className="lang-ar">الوصف</span>
          <span className="lang-en">Description</span>
        </span>
        <textarea name="description" rows={4} required className="admin-input" />
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
