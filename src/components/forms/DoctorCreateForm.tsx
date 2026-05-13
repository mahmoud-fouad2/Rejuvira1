"use client";

import { useActionState } from "react";

import {
  createDoctorAction,
  type DoctorActionState,
} from "@/app/admin/doctors/actions";

const initialState: DoctorActionState = {
  status: "idle",
  message: "",
};

export function DoctorCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createDoctorAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="name"
          placeholder="اسم الطبيب"
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
          name="title"
          placeholder="المسمى الوظيفي"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="specialty"
          placeholder="التخصص"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="yearsExperience"
          type="number"
          min="0"
          placeholder="سنوات الخبرة"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="languages"
          placeholder="العربية، الإنجليزية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <input
        name="photoUrl"
        placeholder="رابط صورة الطبيب"
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
      />
      <input
        name="coverImageUrl"
        placeholder="رابط صورة الغلاف"
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
      />
      <textarea
        name="summary"
        rows={3}
        placeholder="اقتباس الطبيب المختصر"
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        required
      />
      <textarea
        name="bio"
        rows={5}
        placeholder="نبذة الطبيب"
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        required
      />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="border-line bg-surface text-ink-soft flex items-center gap-3 rounded-[1.15rem] border px-4 py-3 text-sm">
          <input type="checkbox" name="featured" value="true" />
          عرض الطبيب ضمن الملفات المميزة
        </label>
        <select
          name="status"
          defaultValue="DRAFT"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        >
          <option value="DRAFT">مسودة</option>
          <option value="PUBLISHED">منشور</option>
        </select>
      </div>
      {state.message ? (
        <p className="text-emerald text-sm">{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-canvas rounded-[1.15rem] px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {isPending ? "جاري الحفظ..." : "حفظ مسودة طبيب"}
      </button>
    </form>
  );
}
