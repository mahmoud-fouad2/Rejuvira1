"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { ImagePicker } from "@/components/admin/ImagePicker";
import {
  MultiSelectChips,
  type ChipOption,
} from "@/components/admin/MultiSelectChips";

type DeviceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialState: DeviceActionState = {
  status: "idle",
  message: "",
};

export function DeviceCreateForm({
  serviceOptions = [],
}: {
  serviceOptions?: ChipOption[];
}) {
  const router = useRouter();
  const [state, setState] = useState<DeviceActionState>(initialState);
  const [isPending, setIsPending] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setState(initialState);

    try {
      const response = await fetch("/api/admin/devices", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const data = (await response.json()) as DeviceActionState;
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
        <ImagePicker
          name="imageUrl"
          namespace="devices"
          label="صورة الجهاز / Device image"
          aspect={4 / 3}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">ملخص (عربي)</span>
            <span className="lang-en">Excerpt (Arabic)</span>
          </span>
          <input name="excerpt" required dir="rtl" className="admin-input" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">ملخص (إنجليزي)</span>
            <span className="lang-en">Excerpt (English)</span>
          </span>
          <input name="excerptEn" dir="ltr" className="admin-input" />
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
            dir="ltr"
            className="admin-input"
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الاعتمادات</span>
            <span className="lang-en">Certifications</span>
          </span>
          <input name="certifications" required className="admin-input" />
        </label>
        <MultiSelectChips
          name="serviceSlugs"
          label="الخدمات المرتبطة / Linked services"
          options={serviceOptions}
        />
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
