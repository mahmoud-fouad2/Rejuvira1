"use client";

import { useActionState, useState } from "react";
import { SubmissionStatus } from "@/lib/prisma-enums";

import {
  createWebhookAction,
  updateWebhookAction,
  type WebhookActionState,
} from "@/app/admin/webhooks/actions";

const initialState: WebhookActionState = { status: "idle", message: "" };

const STATUS_OPTIONS: Array<{
  value: SubmissionStatus;
  ar: string;
  en: string;
}> = [
  { value: SubmissionStatus.NEW, ar: "جديد", en: "New" },
  { value: SubmissionStatus.CONTACTED, ar: "تم التواصل", en: "Contacted" },
  { value: SubmissionStatus.FOLLOW_UP, ar: "متابعة", en: "Follow-up" },
  { value: SubmissionStatus.BOOKED, ar: "محجوز", en: "Booked" },
  { value: SubmissionStatus.CLOSED, ar: "مغلق", en: "Closed" },
];

export type WebhookEditorProps = {
  mode: "create" | "edit";
  services: ReadonlyArray<{ slug: string; name: string }>;
  initial?: {
    id: string;
    name: string;
    isActive: boolean;
    defaultStatus: SubmissionStatus;
    defaultTags: readonly string[];
    defaultSource?: string | null;
    serviceId?: string | null;
    serviceLabel?: string | null;
  };
  initialServiceSlug?: string;
};

export function WebhookEditor({
  mode,
  services,
  initial,
  initialServiceSlug,
}: WebhookEditorProps) {
  const [state, formAction, pending] = useActionState(
    mode === "create" ? createWebhookAction : updateWebhookAction,
    initialState,
  );
  const [tagsRaw, setTagsRaw] = useState<string>(
    initial?.defaultTags?.join(", ") ?? "",
  );

  return (
    <form action={formAction} className="grid gap-3">
      {mode === "edit" && initial ? (
        <input type="hidden" name="id" value={initial.id} />
      ) : null}
      <label className="grid gap-1">
        <span className="admin-field-label">
          <span className="lang-ar">اسم المصدر</span>
          <span className="lang-en">Source name</span>
        </span>
        <input
          name="name"
          required
          defaultValue={initial?.name ?? ""}
          placeholder="حملة سناب شات — خدمات الجلدية"
          className="admin-input"
        />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الحالة الافتراضية</span>
            <span className="lang-en">Default status</span>
          </span>
          <select
            name="defaultStatus"
            defaultValue={initial?.defaultStatus ?? SubmissionStatus.NEW}
            className="admin-input"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.ar}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">اسم القناة</span>
            <span className="lang-en">Channel name</span>
          </span>
          <input
            name="defaultSource"
            defaultValue={initial?.defaultSource ?? ""}
            placeholder="سناب شات / جوجل / انستغرام"
            className="admin-input"
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الخدمة المرتبطة</span>
            <span className="lang-en">Linked service</span>
          </span>
          <select
            name="serviceSlug"
            defaultValue={initialServiceSlug ?? ""}
            className="admin-input"
          >
            <option value="">—</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">وسوم الطلبات</span>
            <span className="lang-en">Lead labels</span>
          </span>
          <input
            name="defaultTags"
            value={tagsRaw}
            onChange={(event) => setTagsRaw(event.target.value)}
            placeholder="حملة مدفوعة، جلدية"
            className="admin-input"
          />
        </label>
      </div>
      {mode === "edit" ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            value="true"
            defaultChecked={initial?.isActive ?? true}
            className="h-4 w-4"
          />
          <span>
            <span className="lang-ar">مُفعّل</span>
            <span className="lang-en">Active</span>
          </span>
        </label>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <button type="submit" className="admin-btn-primary" disabled={pending}>
          <span className="lang-ar">
            {mode === "create" ? "إنشاء المصدر" : "حفظ التغييرات"}
          </span>
          <span className="lang-en">
            {mode === "create" ? "Create source" : "Save"}
          </span>
        </button>
        {state.message ? (
          <span
            className={`text-sm ${state.status === "error" ? "text-red-500" : "text-emerald-500"}`}
          >
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
