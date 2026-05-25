"use client";

import { ContentStatus } from "@/lib/prisma-enums";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { ImagePicker } from "@/components/admin/ImagePicker";
import {
  MultiSelectChips,
  type ChipOption,
} from "@/components/admin/MultiSelectChips";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { JournalPostRecord } from "@/lib/content-repository";

type JournalActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialState: JournalActionState = {
  status: "idle",
  message: "",
};

type JournalEditorFormProps = {
  post: JournalPostRecord;
  categoryOptions?: string[];
  serviceOptions?: ChipOption[];
  doctorOptions?: ChipOption[];
};

export function JournalEditorForm({
  post,
  categoryOptions = [],
  serviceOptions = [],
  doctorOptions = [],
}: JournalEditorFormProps) {
  const router = useRouter();
  const [state, setState] = useState<JournalActionState>(initialState);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setState(initialState);

    try {
      const response = await fetch("/api/admin/journal", {
        method: "PUT",
        body: new FormData(event.currentTarget),
      });
      const data = (await response.json()) as JournalActionState;
      setState(data);
      if (response.ok && data.status === "success") {
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
    <form onSubmit={handleSubmit} className="admin-editor-form">
      <input type="hidden" name="id" value={post.id} />

      <div className="admin-form-section">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="admin-field-label">العنوان</span>
            <input
              name="title"
              required
              className="admin-input"
              defaultValue={post.title}
            />
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">Slug</span>
            <input
              name="slug"
              required
              dir="ltr"
              className="admin-input font-mono"
              defaultValue={post.slug}
            />
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">Title (English)</span>
            <input
              name="titleEn"
              dir="ltr"
              className="admin-input"
              defaultValue={post.titleEn ?? ""}
            />
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">التصنيف</span>
            <input
              name="category"
              required
              className="admin-input"
              defaultValue={post.category}
              list={`journal-categories-${post.id}`}
            />
            <datalist id={`journal-categories-${post.id}`}>
              {categoryOptions.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">زمن القراءة</span>
            <input
              name="readingTime"
              required
              className="admin-input"
              defaultValue={post.readingTime}
            />
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">حالة النشر</span>
            <select
              name="status"
              className="admin-input"
              defaultValue={post.status ?? ContentStatus.PUBLISHED}
            >
              <option value={ContentStatus.DRAFT}>مسودة</option>
              <option value={ContentStatus.REVIEW}>مراجعة</option>
              <option value={ContentStatus.APPROVED}>معتمد</option>
              <option value={ContentStatus.PUBLISHED}>منشور</option>
              <option value={ContentStatus.ARCHIVED}>مؤرشف</option>
            </select>
          </label>
        </div>
      </div>

      <ImagePicker
        name="coverImageUrl"
        namespace="journal"
        label="صورة الغلاف"
        defaultValue={post.coverImageUrl}
        aspect={16 / 9}
      />

      <label className="grid gap-1">
        <span className="admin-field-label">المقدمة</span>
        <textarea
          name="excerpt"
          rows={3}
          required
          className="admin-input"
          defaultValue={post.excerpt}
        />
      </label>

      <label className="grid gap-1">
        <span className="admin-field-label">Excerpt (English)</span>
        <textarea
          name="excerptEn"
          rows={3}
          dir="ltr"
          className="admin-input"
          defaultValue={post.excerptEn ?? ""}
        />
      </label>

      <RichTextEditor
        name="body"
        label="المتن"
        helper="استخدم العناوين والقوائم والصور الداخلية لتنظيم المقال."
        required
        imageNamespace="journal"
        minHeight="22rem"
        defaultValue={post.body.join("\n")}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <MultiSelectChips
          name="relatedServiceSlugs"
          label="الخدمات المرتبطة"
          options={serviceOptions}
          defaultSelected={post.relatedServiceSlugs}
        />
        <MultiSelectChips
          name="relatedDoctorSlugs"
          label="الأطباء المرتبطون"
          options={doctorOptions}
          defaultSelected={post.relatedDoctorSlugs}
        />
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

      <button type="submit" disabled={isPending} className="admin-btn-primary">
        {isPending ? "جار الحفظ..." : "حفظ التعديلات"}
      </button>
    </form>
  );
}
