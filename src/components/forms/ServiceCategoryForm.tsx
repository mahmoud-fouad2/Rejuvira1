"use client";

import { ContentStatus } from "@prisma/client";
import { useActionState } from "react";

import {
  createServiceCategoryAction,
  updateServiceCategoryAction,
  type ServiceCategoryActionState,
} from "@/app/admin/service-categories/actions";

const initial: ServiceCategoryActionState = { status: "idle", message: "" };

type Category = {
  id: string;
  slug: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  status: ContentStatus;
  sortOrder: number;
};

type Props = {
  category?: Category;
};

export function ServiceCategoryForm({ category }: Props) {
  const actionHandler = category
    ? updateServiceCategoryAction
    : createServiceCategoryAction;
  const [state, action, pending] = useActionState(actionHandler, initial);

  return (
    <form action={action} className="grid gap-3">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">Arabic name</span>
          <input
            name="name"
            required
            dir="rtl"
            className="admin-input"
            defaultValue={category?.name ?? ""}
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">English name</span>
          <input
            name="nameEn"
            dir="ltr"
            className="admin-input"
            defaultValue={category?.nameEn ?? ""}
          />
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
            defaultValue={category?.slug ?? ""}
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">Sort order</span>
          <input
            name="sortOrder"
            type="number"
            min={0}
            className="admin-input"
            defaultValue={category?.sortOrder ?? 0}
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">Arabic description</span>
          <textarea
            name="description"
            rows={3}
            dir="rtl"
            className="admin-input"
            defaultValue={category?.description ?? ""}
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">English description</span>
          <textarea
            name="descriptionEn"
            rows={3}
            dir="ltr"
            className="admin-input"
            defaultValue={category?.descriptionEn ?? ""}
          />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="admin-field-label">Status</span>
        <select
          name="status"
          defaultValue={category?.status ?? ContentStatus.PUBLISHED}
          className="admin-input"
        >
          <option value={ContentStatus.PUBLISHED}>Published</option>
          <option value={ContentStatus.DRAFT}>Draft</option>
          <option value={ContentStatus.ARCHIVED}>Archived</option>
        </select>
      </label>
      {state.message ? (
        <p
          className={`text-xs font-medium ${
            state.status === "error" ? "text-burgundy" : "text-emerald"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="admin-btn-primary">
        {pending ? "Saving..." : category ? "Save category" : "Create category"}
      </button>
    </form>
  );
}
