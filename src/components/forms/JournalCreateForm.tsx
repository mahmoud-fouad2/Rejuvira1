"use client";

import { useActionState } from "react";

import {
  createJournalPostAction,
  type JournalActionState,
} from "@/app/admin/journal/actions";

const initialState: JournalActionState = {
  status: "idle",
  message: "",
};

export function JournalCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createJournalPostAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">العنوان</span>
            <span className="lang-en">Title</span>
          </span>
          <input name="title" required className="admin-input" />
        </label>
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
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">زمن القراءة</span>
            <span className="lang-en">Reading time</span>
          </span>
          <input name="readingTime" defaultValue="4 دقائق" required className="admin-input" />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="admin-field-label">
          <span className="lang-ar">رابط صورة الغلاف</span>
          <span className="lang-en">Cover URL</span>
        </span>
        <input name="coverImageUrl" dir="ltr" className="admin-input" />
      </label>
      <label className="grid gap-1">
        <span className="admin-field-label">
          <span className="lang-ar">المقدمة</span>
          <span className="lang-en">Excerpt</span>
        </span>
        <textarea name="excerpt" rows={2} required className="admin-input" />
      </label>
      <label className="grid gap-1">
        <span className="admin-field-label">
          <span className="lang-ar">المتن (فقرة في كل سطر)</span>
          <span className="lang-en">Body (paragraph per line)</span>
        </span>
        <textarea name="body" rows={7} required className="admin-input" />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">خدمات مرتبطة (slugs)</span>
            <span className="lang-en">Related services</span>
          </span>
          <input name="relatedServiceSlugs" dir="ltr" className="admin-input" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">أطباء مرتبطون (slugs)</span>
            <span className="lang-en">Related doctors</span>
          </span>
          <input name="relatedDoctorSlugs" dir="ltr" className="admin-input" />
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
