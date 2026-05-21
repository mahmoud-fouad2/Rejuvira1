"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { ImagePicker } from "@/components/admin/ImagePicker";
import {
  MultiSelectChips,
  type ChipOption,
} from "@/components/admin/MultiSelectChips";

type DoctorActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialState: DoctorActionState = {
  status: "idle",
  message: "",
};

export function DoctorCreateForm({
  serviceOptions = [],
}: {
  serviceOptions?: ChipOption[];
}) {
  const router = useRouter();
  const [state, setState] = useState<DoctorActionState>(initialState);
  const [isPending, setIsPending] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setState(initialState);

    try {
      const response = await fetch("/api/admin/doctors", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const data = (await response.json()) as DoctorActionState;
      setState(data);
      if (response.ok && data.status === "success") {
        setFormKey((key) => key + 1);
        router.refresh();
      }
    } catch {
      setState({
        status: "error",
        message: "تعذر الاتصال بالخادم. راجع البيانات ثم حاول مرة أخرى.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form key={formKey} onSubmit={handleSubmit} className="grid gap-3">
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
          <option value="DRAFT">مسودة / Draft</option>
          <option value="REVIEW">مراجعة / Review</option>
          <option value="PUBLISHED">منشور / Published</option>
          <option value="ARCHIVED">مؤرشف / Archived</option>
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
