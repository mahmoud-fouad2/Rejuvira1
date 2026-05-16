"use client";

import { useActionState } from "react";
import { ContentStatus } from "@prisma/client";

import {
  updateServiceAction,
  type ServiceActionState,
} from "@/app/admin/services/actions";
import { ImagePicker } from "@/components/admin/ImagePicker";
import {
  MultiSelectChips,
  type ChipOption,
} from "@/components/admin/MultiSelectChips";
import type { ServiceCategoryOption } from "@/components/forms/ServiceCreateForm";

const initial: ServiceActionState = { status: "idle", message: "" };

type Props = {
  service: {
    id: string;
    slug: string;
    name: string;
    nameEn?: string | null;
    categoryId?: string | null;
    category: string;
    excerpt: string;
    excerptEn?: string | null;
    description: string;
    descriptionEn?: string | null;
    coverImageUrl: string;
    status: ContentStatus;
    featured: boolean;
    doctorSlugs?: readonly string[];
  };
  doctorOptions?: ChipOption[];
  categories?: ServiceCategoryOption[];
};

export function ServiceEditorForm({ service, doctorOptions = [], categories = [] }: Props) {
  const [state, action, pending] = useActionState(updateServiceAction, initial);

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={service.id} />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الاسم (عربي)</span>
            <span className="lang-en">Name (Arabic)</span>
          </span>
          <input
            name="name"
            defaultValue={service.name}
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
            defaultValue={service.nameEn ?? ""}
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
            defaultValue={service.slug}
            required
            dir="ltr"
            className="admin-input font-mono"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">التصنيف</span>
            <span className="lang-en">Category</span>
          </span>
          {categories.length ? (
            <>
              <select
                name="categoryId"
                defaultValue={service.categoryId ?? ""}
                className="admin-input"
              >
                <option value="">Manual category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nameEn ? `${category.name} / ${category.nameEn}` : category.name}
                  </option>
                ))}
              </select>
              <input
                name="category"
                defaultValue={service.category}
                required
                className="admin-input"
              />
            </>
          ) : (
            <input
              name="category"
              defaultValue={service.category}
              required
              className="admin-input"
            />
          )}
        </label>
      </div>
      <ImagePicker
        name="coverImageUrl"
        defaultValue={service.coverImageUrl}
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
          <textarea
            name="excerpt"
            rows={2}
            defaultValue={service.excerpt}
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
            defaultValue={service.excerptEn ?? ""}
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
            defaultValue={service.description}
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
            defaultValue={service.descriptionEn ?? ""}
            dir="ltr"
            className="admin-input"
          />
        </label>
      </div>
      <MultiSelectChips
        name="doctorSlugs"
        label="الأطباء المرتبطون / Linked doctors"
        options={doctorOptions}
        defaultSelected={service.doctorSlugs ?? []}
        helper="ربط الأطباء الذين يقدمون هذه الخدمة — يظهرون في صفحة الخدمة العامة."
      />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الحالة</span>
            <span className="lang-en">Status</span>
          </span>
          <select
            name="status"
            defaultValue={service.status}
            className="admin-input"
          >
            <option value={ContentStatus.DRAFT}>Draft</option>
            <option value={ContentStatus.REVIEW}>Review</option>
            <option value={ContentStatus.PUBLISHED}>Published</option>
            <option value={ContentStatus.ARCHIVED}>Archived</option>
          </select>
        </label>
        <label className="admin-input flex items-center gap-3">
          <input
            type="checkbox"
            name="featured"
            value="true"
            defaultChecked={service.featured}
          />
          <span className="text-sm">
            <span className="lang-ar">عرض ضمن الخدمات المميزة</span>
            <span className="lang-en">Show in featured services</span>
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
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="admin-btn-primary"
        >
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
      </div>
    </form>
  );
}
