"use client";

import { useActionState } from "react";

import {
  createJournalPostAction,
  type JournalActionState,
} from "@/app/admin/journal/actions";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  MultiSelectChips,
  type ChipOption,
} from "@/components/admin/MultiSelectChips";

const initialState: JournalActionState = {
  status: "idle",
  message: "",
};

export function JournalCreateForm({
  categoryOptions = [],
  serviceOptions = [],
  doctorOptions = [],
}: {
  categoryOptions?: string[];
  serviceOptions?: ChipOption[];
  doctorOptions?: ChipOption[];
}) {
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
          <input
            name="category"
            required
            className="admin-input"
            list="journal-create-categories"
          />
          <datalist id="journal-create-categories">
            {categoryOptions.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">زمن القراءة</span>
            <span className="lang-en">Reading time</span>
          </span>
          <input name="readingTime" defaultValue="4 دقائق" required className="admin-input" />
        </label>
      </div>
      <ImagePicker
        name="coverImageUrl"
        namespace="journal"
        label="صورة الغلاف / Cover image"
        aspect={16 / 9}
      />
      <label className="grid gap-1">
        <span className="admin-field-label">
          <span className="lang-ar">المقدمة</span>
          <span className="lang-en">Excerpt</span>
        </span>
        <textarea name="excerpt" rows={2} required className="admin-input" />
      </label>
      <RichTextEditor
        name="body"
        label="المتن / Body"
        helper="استخدم العناوين والقوائم والاقتباسات لتنظيم المقال. يمكنك إدراج صور مباشرة من الجهاز."
        required
        imageNamespace="journal"
      />
      <div className="grid gap-3 md:grid-cols-2">
        <MultiSelectChips
          name="relatedServiceSlugs"
          label="خدمات مرتبطة / Related services"
          options={serviceOptions}
        />
        <MultiSelectChips
          name="relatedDoctorSlugs"
          label="أطباء مرتبطون / Related doctors"
          options={doctorOptions}
        />
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
