"use client";

import { useActionState } from "react";

import {
  updateDoctorAction,
  type DoctorActionState,
} from "@/app/admin/doctors/actions";
import type { DoctorRecord } from "@/lib/content-repository";
import { ImagePicker } from "@/components/admin/ImagePicker";
import {
  MultiSelectChips,
  type ChipOption,
} from "@/components/admin/MultiSelectChips";

const initialState: DoctorActionState = {
  status: "idle",
  message: "",
};

export function DoctorEditorForm({
  doctor,
  serviceOptions = [],
}: {
  doctor: DoctorRecord;
  serviceOptions?: ChipOption[];
}) {
  const [state, formAction, isPending] = useActionState(
    updateDoctorAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="id" value={doctor.id} />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الاسم</span>
            <span className="lang-en">Name</span>
          </span>
          <input name="name" defaultValue={doctor.name} required className="admin-input" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">Slug</span>
          <input name="slug" defaultValue={doctor.slug} required dir="ltr" className="admin-input font-mono" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">المسمى</span>
            <span className="lang-en">Title</span>
          </span>
          <input name="title" defaultValue={doctor.title} required className="admin-input" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">التخصص</span>
            <span className="lang-en">Specialty</span>
          </span>
          <input name="specialty" defaultValue={doctor.specialty} required className="admin-input" />
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
            defaultValue={doctor.yearsExperience}
            required
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">اللغات (CSV)</span>
            <span className="lang-en">Languages (CSV)</span>
          </span>
          <input name="languages" defaultValue={doctor.languages.join(", ")} required className="admin-input" />
        </label>
        <ImagePicker
          name="photoUrl"
          defaultValue={doctor.photoUrl}
          namespace="doctors"
          label="صورة الطبيب / Doctor photo"
          aspect={3 / 4}
        />
        <ImagePicker
          name="coverImageUrl"
          defaultValue={doctor.coverImageUrl}
          namespace="doctors"
          label="صورة الغلاف / Cover image"
          aspect={16 / 9}
        />
      </div>
      <MultiSelectChips
        name="serviceSlugs"
        label="الخدمات المرتبطة / Linked services"
        options={serviceOptions}
        defaultSelected={doctor.serviceSlugs}
        helper="إضافة/إزالة هذا الطبيب من قائمة مقدمي كل خدمة."
      />
      <label className="grid gap-1">
        <span className="admin-field-label">
          <span className="lang-ar">ملخص</span>
          <span className="lang-en">Summary</span>
        </span>
        <textarea name="summary" defaultValue={doctor.summary} rows={2} required className="admin-input" />
      </label>
      <label className="grid gap-1">
        <span className="admin-field-label">
          <span className="lang-ar">السيرة</span>
          <span className="lang-en">Bio</span>
        </span>
        <textarea name="bio" defaultValue={doctor.bio} rows={4} required className="admin-input" />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="admin-input flex items-center gap-3">
          <input type="checkbox" name="featured" value="true" defaultChecked={doctor.featured} />
          <span className="text-sm text-[color:var(--admin-text-soft)]">
            <span className="lang-ar">طبيب مميز</span>
            <span className="lang-en">Featured</span>
          </span>
        </label>
        <select name="status" defaultValue={doctor.status} className="admin-input">
          <option value="DRAFT">DRAFT</option>
          <option value="REVIEW">REVIEW</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>
      {state.message ? (
        <p className={`text-xs font-medium ${state.status === "success" ? "text-emerald" : "text-burgundy"}`}>
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={isPending} className="admin-btn-primary">
        {isPending ? (
          <>
            <span className="lang-ar">جاري التحديث...</span>
            <span className="lang-en">Updating...</span>
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
