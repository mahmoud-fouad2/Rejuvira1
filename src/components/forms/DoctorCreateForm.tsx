"use client";

import { useActionState } from "react";

import {
  createDoctorAction,
  type DoctorActionState,
} from "@/app/admin/doctors/actions";
import { ImagePicker } from "@/components/admin/ImagePicker";
import {
  MultiSelectChips,
  type ChipOption,
} from "@/components/admin/MultiSelectChips";

const initialState: DoctorActionState = {
  status: "idle",
  message: "",
};

export function DoctorCreateForm({
  serviceOptions = [],
}: {
  serviceOptions?: ChipOption[];
}) {
  const [state, formAction, isPending] = useActionState(
    createDoctorAction,
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
          <input name="name" required dir="rtl" className="admin-input" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الاسم (إنجليزي)</span>
            <span className="lang-en">Name (English)</span>
          </span>
          <input name="nameEn" dir="ltr" className="admin-input" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">Slug</span>
          <input
            name="slug"
            required
            dir="ltr"
            className="admin-input font-mono"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">سنوات الخبرة</span>
            <span className="lang-en">Years</span>
          </span>
          <input
            name="yearsExperience"
            type="number"
            min="0"
            required
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">المسمى (عربي)</span>
            <span className="lang-en">Title (Arabic)</span>
          </span>
          <input name="title" required dir="rtl" className="admin-input" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">المسمى (إنجليزي)</span>
            <span className="lang-en">Title (English)</span>
          </span>
          <input name="titleEn" dir="ltr" className="admin-input" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">التخصص (عربي)</span>
            <span className="lang-en">Specialty (Arabic)</span>
          </span>
          <input name="specialty" required dir="rtl" className="admin-input" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">التخصص (إنجليزي)</span>
            <span className="lang-en">Specialty (English)</span>
          </span>
          <input name="specialtyEn" dir="ltr" className="admin-input" />
        </label>
        <label className="grid gap-1 md:col-span-2">
          <span className="admin-field-label">
            <span className="lang-ar">اللغات</span>
            <span className="lang-en">Languages (CSV)</span>
          </span>
          <input
            name="languages"
            placeholder="العربية، الإنجليزية"
            required
            className="admin-input"
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <ImagePicker
          name="photoUrl"
          namespace="doctors"
          label="صورة الطبيب / Doctor photo"
          aspect={3 / 4}
        />
        <ImagePicker
          name="coverImageUrl"
          namespace="doctors"
          label="صورة الغلاف / Cover image"
          aspect={16 / 9}
        />
      </div>
      <MultiSelectChips
        name="serviceSlugs"
        label="الخدمات المرتبطة / Linked services"
        options={serviceOptions}
        helper="اختر الخدمات التي يقدمها هذا الطبيب — تظهر في صفحته العامة وصفحات الخدمات."
      />
      <label className="grid gap-1">
        <span className="admin-field-label">
          <span className="lang-ar">ملخص (عربي)</span>
          <span className="lang-en">Summary (Arabic)</span>
        </span>
        <textarea
          name="summary"
          rows={2}
          required
          dir="rtl"
          className="admin-input"
        />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">السيرة (عربي)</span>
            <span className="lang-en">Bio (Arabic)</span>
          </span>
          <textarea
            name="bio"
            rows={4}
            required
            dir="rtl"
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">السيرة (إنجليزي)</span>
            <span className="lang-en">Bio (English)</span>
          </span>
          <textarea name="bioEn" rows={4} dir="ltr" className="admin-input" />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="admin-input flex items-center gap-3">
          <input type="checkbox" name="featured" value="true" />
          <span className="text-sm text-[color:var(--admin-text-soft)]">
            <span className="lang-ar">طبيب مميز</span>
            <span className="lang-en">Featured</span>
          </span>
        </label>
        <select name="status" defaultValue="DRAFT" className="admin-input">
          <option value="DRAFT">DRAFT</option>
          <option value="REVIEW">REVIEW</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>
      {state.message ? (
        <p
          className={`text-xs font-medium ${state.status === "error" ? "text-burgundy" : "text-emerald"}`}
        >
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
