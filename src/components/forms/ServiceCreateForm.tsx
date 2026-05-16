"use client";

import { useActionState } from "react";

import {
  createServiceAction,
  type ServiceActionState,
} from "@/app/admin/services/actions";
import { ImagePicker } from "@/components/admin/ImagePicker";

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
            <span className="lang-ar">الاسم (عربي)</span>
            <span className="lang-en">Name (Arabic)</span>
          </span>
          <input name="name" required className="admin-input" dir="rtl" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الاسم (إنجليزي)</span>
            <span className="lang-en">Name (English)</span>
          </span>
          <input name="nameEn" className="admin-input" dir="ltr" />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">Slug</span>
          <input name="slug" required dir="ltr" className="admin-input font-mono" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">التصنيف</span>
            <span className="lang-en">Category</span>
          </span>
          <input name="category" required className="admin-input" />
        </label>
      </div>
      <ImagePicker
        name="coverImageUrl"
        namespace="services"
        label="صورة الغلاف / Cover image"
        aspect={16 / 9}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">ملخص (عربي)</span>
            <span className="lang-en">Excerpt (Arabic)</span>
          </span>
          <textarea name="excerpt" rows={2} required className="admin-input" dir="rtl" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">ملخص (إنجليزي)</span>
            <span className="lang-en">Excerpt (English)</span>
          </span>
          <textarea name="excerptEn" rows={2} className="admin-input" dir="ltr" />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الوصف (عربي)</span>
            <span className="lang-en">Description (Arabic)</span>
          </span>
          <textarea name="description" rows={4} required className="admin-input" dir="rtl" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الوصف (إنجليزي)</span>
            <span className="lang-en">Description (English)</span>
          </span>
          <textarea name="descriptionEn" rows={4} className="admin-input" dir="ltr" />
        </label>
      </div>
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
