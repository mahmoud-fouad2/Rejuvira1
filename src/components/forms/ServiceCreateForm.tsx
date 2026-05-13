"use client";

import { useActionState } from "react";

import {
  createServiceAction,
  type ServiceActionState,
} from "@/app/admin/services/actions";

const initialState: ServiceActionState = {
  status: "idle",
  message: "",
};

export function ServiceCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createServiceAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="name"
          placeholder="اسم الخدمة"
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
          name="coverImageUrl"
          placeholder="رابط صورة الغلاف"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
      </div>
      <textarea
        name="excerpt"
        rows={3}
        placeholder="ملخص قصير"
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        required
      />
      <textarea
        name="description"
        rows={5}
        placeholder="وصف تفصيلي"
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        required
      />
      {state.message ? (
        <p className="text-emerald text-sm">{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-canvas rounded-[1.15rem] px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {isPending ? "جاري الحفظ..." : "حفظ مسودة خدمة"}
      </button>
    </form>
  );
}
