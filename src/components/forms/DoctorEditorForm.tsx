"use client";

import { useActionState } from "react";

import {
  updateDoctorAction,
  type DoctorActionState,
} from "@/app/admin/doctors/actions";
import type { DoctorRecord } from "@/lib/content-repository";

const initialState: DoctorActionState = {
  status: "idle",
  message: "",
};

export function DoctorEditorForm({ doctor }: { doctor: DoctorRecord }) {
  const [state, formAction, isPending] = useActionState(
    updateDoctorAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={doctor.id} />
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="name"
          defaultValue={doctor.name}
          placeholder="اسم الطبيب"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="slug"
          defaultValue={doctor.slug}
          placeholder="المعرف المختصر"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="title"
          defaultValue={doctor.title}
          placeholder="المسمى الوظيفي"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="specialty"
          defaultValue={doctor.specialty}
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
          defaultValue={doctor.yearsExperience}
          placeholder="سنوات الخبرة"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="languages"
          defaultValue={doctor.languages.join(", ")}
          placeholder="العربية، الإنجليزية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="photoUrl"
          defaultValue={doctor.photoUrl}
          placeholder="صورة الطبيب"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
        <input
          name="coverImageUrl"
          defaultValue={doctor.coverImageUrl}
          placeholder="صورة الغلاف"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
      </div>
      <textarea
        name="summary"
        defaultValue={doctor.summary}
        rows={3}
        placeholder="اقتباس الطبيب المختصر"
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        required
      />
      <textarea
        name="bio"
        defaultValue={doctor.bio}
        rows={5}
        placeholder="نبذة الطبيب"
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        required
      />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="border-line bg-surface text-ink-soft flex items-center gap-3 rounded-[1.15rem] border px-4 py-3 text-sm">
          <input
            type="checkbox"
            name="featured"
            value="true"
            defaultChecked={doctor.featured}
          />
          عرض الطبيب ضمن الملفات المميزة
        </label>
        <select
          name="status"
          defaultValue={doctor.status}
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        >
          <option value="DRAFT">مسودة</option>
          <option value="PUBLISHED">منشور</option>
          <option value="ARCHIVED">مؤرشف</option>
        </select>
      </div>
      {state.message ? (
        <p
          className={`text-sm ${state.status === "success" ? "text-emerald" : "text-burgundy"}`}
        >
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-canvas rounded-[1.15rem] px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {isPending ? "جاري التحديث..." : "تحديث ملف الطبيب"}
      </button>
    </form>
  );
}
