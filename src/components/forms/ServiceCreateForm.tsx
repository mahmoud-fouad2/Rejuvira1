"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import { ImagePicker } from "@/components/admin/ImagePicker";

type ServiceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialState: ServiceActionState = {
  status: "idle",
  message: "",
};

export type ServiceCategoryOption = {
  id: string;
  name: string;
  nameEn?: string | null;
};

type Props = {
  categories?: ServiceCategoryOption[];
};

export function ServiceCreateForm({ categories = [] }: Props) {
  const router = useRouter();
  const [state, setState] = useState<ServiceActionState>(initialState);
  const [isPending, setIsPending] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const defaultCategory = categories[0];
  const [categoryId, setCategoryId] = useState(defaultCategory?.id ?? "");
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setState(initialState);

    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const data = (await response.json()) as ServiceActionState;
      setState(data);
      if (response.ok && data.status === "success") {
        setFormKey((key) => key + 1);
        setCategoryId(defaultCategory?.id ?? "");
        router.refresh();
      }
    } catch {
      setState({
        status: "error",
        message: "تعذّر الاتصال بالخادم. راجع البيانات ثم حاول مرة أخرى.",
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
          <input
            name="slug"
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
                required
                className="admin-input"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nameEn
                      ? `${category.name} / ${category.nameEn}`
                      : category.name}
                  </option>
                ))}
              </select>
              <input
                type="hidden"
                name="category"
                value={selectedCategory?.name ?? defaultCategory?.name ?? ""}
              />
            </>
          ) : (
            <input name="category" required className="admin-input" />
          )}
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
          <textarea
            name="excerpt"
            rows={2}
            required
            className="admin-input"
            dir="rtl"
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
            className="admin-input"
            dir="ltr"
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
            required
            className="admin-input"
            dir="rtl"
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
            className="admin-input"
            dir="ltr"
          />
        </label>
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
