"use client";

import { useActionState } from "react";
import { ContentStatus } from "@prisma/client";

import {
  updateServiceAction,
  type ServiceActionState,
} from "@/app/admin/services/actions";

const initial: ServiceActionState = { status: "idle", message: "" };

type Props = {
  service: {
    id: string;
    slug: string;
    name: string;
    category: string;
    excerpt: string;
    description: string;
    coverImageUrl: string;
    status: ContentStatus;
    featured: boolean;
  };
};

export function ServiceEditorForm({ service }: Props) {
  const [state, action, pending] = useActionState(updateServiceAction, initial);

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={service.id} />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">الاسم</span>
          <input
            name="name"
            defaultValue={service.name}
            required
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">المعرف (slug)</span>
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
          <input
            name="category"
            defaultValue={service.category}
            required
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">رابط صورة الغلاف</span>
          <input
            name="coverImageUrl"
            defaultValue={service.coverImageUrl}
            dir="ltr"
            className="admin-input"
          />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="admin-field-label">ملخص</span>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={service.excerpt}
          required
          className="admin-input"
        />
      </label>
      <label className="grid gap-1">
        <span className="admin-field-label">الوصف</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={service.description}
          required
          className="admin-input"
        />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">الحالة</span>
          <select
            name="status"
            defaultValue={service.status}
            className="admin-input"
          >
            <option value={ContentStatus.DRAFT}>مسودة</option>
            <option value={ContentStatus.REVIEW}>قيد المراجعة</option>
            <option value={ContentStatus.PUBLISHED}>منشور</option>
            <option value={ContentStatus.ARCHIVED}>مؤرشف</option>
          </select>
        </label>
        <label className="admin-input flex items-center gap-3">
          <input
            type="checkbox"
            name="featured"
            value="true"
            defaultChecked={service.featured}
          />
          <span className="text-sm text-ink-soft">عرض ضمن الخدمات المميزة</span>
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
          {pending ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}
