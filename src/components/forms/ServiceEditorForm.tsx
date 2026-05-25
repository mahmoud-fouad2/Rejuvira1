"use client";

import { ContentStatus } from "@/lib/prisma-enums";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { ImagePicker } from "@/components/admin/ImagePicker";
import {
  MultiSelectChips,
  type ChipOption,
} from "@/components/admin/MultiSelectChips";
import type { ServiceCategoryOption } from "@/components/forms/ServiceCreateForm";

type ServiceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

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
    deviceSlugs?: readonly string[];
  };
  doctorOptions?: ChipOption[];
  deviceOptions?: ChipOption[];
  categories?: ServiceCategoryOption[];
};

export function ServiceEditorForm({
  service,
  doctorOptions = [],
  deviceOptions = [],
  categories = [],
}: Props) {
  const router = useRouter();
  const [state, setState] = useState<ServiceActionState>(initial);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState(initial);

    try {
      const response = await fetch("/api/admin/services", {
        method: "PUT",
        body: new FormData(event.currentTarget),
      });
      const data = (await response.json()) as ServiceActionState;
      setState(data);
      if (response.ok && data.status === "success") {
        router.refresh();
      }
    } catch {
      setState({
        status: "error",
        message: "تعذّر الاتصال بالخادم. راجع البيانات ثم حاول مرة أخرى.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <input type="hidden" name="id" value={service.id} />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">الاسم (عربي)</span>
          <input
            name="name"
            defaultValue={service.name}
            required
            dir="rtl"
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">Name (English)</span>
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
          <span className="admin-field-label">التصنيف</span>
          {categories.length ? (
            <>
              <select
                name="categoryId"
                defaultValue={service.categoryId ?? ""}
                className="admin-input"
              >
                <option value="">تصنيف يدوي</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nameEn
                      ? `${category.name} / ${category.nameEn}`
                      : category.name}
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
        label="صورة الغلاف"
        aspect={16 / 9}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">ملخص عربي</span>
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
          <span className="admin-field-label">Excerpt English</span>
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
          <span className="admin-field-label">الوصف العربي</span>
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
          <span className="admin-field-label">Description English</span>
          <textarea
            name="descriptionEn"
            rows={4}
            defaultValue={service.descriptionEn ?? ""}
            dir="ltr"
            className="admin-input"
          />
        </label>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <MultiSelectChips
          name="doctorSlugs"
          label="الأطباء المرتبطون / Linked doctors"
          options={doctorOptions}
          defaultSelected={service.doctorSlugs ?? []}
          helper="ربط الأطباء الذين يقدمون هذه الخدمة."
        />
        <MultiSelectChips
          name="deviceSlugs"
          label="الأجهزة المرتبطة / Linked devices"
          options={deviceOptions}
          defaultSelected={service.deviceSlugs ?? []}
          helper="ربط الأجهزة المستخدمة أو الداعمة لهذه الخدمة."
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">الحالة</span>
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
          <span className="text-sm">عرض ضمن الخدمات المميزة</span>
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
        <button type="submit" disabled={pending} className="admin-btn-primary">
          {pending ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}
