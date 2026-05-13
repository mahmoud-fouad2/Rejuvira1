"use client";

import { useActionState } from "react";

import {
  createJournalPostAction,
  type JournalActionState,
} from "@/app/admin/journal/actions";

const initialState: JournalActionState = {
  status: "idle",
  message: "",
};

export function JournalCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createJournalPostAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="title"
          placeholder="عنوان المقال"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="slug"
          placeholder="المعرف المختصر للرابط"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="category"
          placeholder="التصنيف"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="readingTime"
          placeholder="زمن القراءة"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          defaultValue="4 دقائق"
          required
        />
      </div>
      <input
        name="coverImageUrl"
        placeholder="رابط صورة الغلاف"
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
      />
      <textarea
        name="excerpt"
        placeholder="مقدمة مختصرة للمقال"
        rows={3}
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm leading-7 outline-none"
        required
      />
      <textarea
        name="body"
        placeholder="متن المقال، فقرة في كل سطر مستقل"
        rows={8}
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm leading-7 outline-none"
        required
      />
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="relatedServiceSlugs"
          placeholder="معرفات الخدمات المرتبطة"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
        <input
          name="relatedDoctorSlugs"
          placeholder="معرفات الأطباء المرتبطين"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
      </div>
      {state.message ? (
        <p className="text-emerald text-sm">{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-canvas rounded-[1.15rem] px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {isPending ? "جاري الحفظ..." : "إنشاء مسودة مقال"}
      </button>
    </form>
  );
}
