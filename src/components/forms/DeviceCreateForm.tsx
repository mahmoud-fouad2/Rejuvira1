"use client";

import { useActionState } from "react";

import {
  createDeviceAction,
  type DeviceActionState,
} from "@/app/admin/devices/actions";

const initialState: DeviceActionState = {
  status: "idle",
  message: "",
};

export function DeviceCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createDeviceAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="name"
          placeholder="اسم الجهاز"
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
      <input
        name="excerpt"
        placeholder="ملخص مختصر للجهاز"
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        required
      />
      <textarea
        name="description"
        rows={4}
        placeholder="وصف الجهاز"
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        required
      />
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="certifications"
          placeholder="الاعتمادات أو المزايا الرئيسية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="serviceSlugs"
          placeholder="الخدمات المرتبطة"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
      </div>
      <input
        name="imageUrl"
        placeholder="رابط صورة الجهاز"
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
      />
      {state.message ? (
        <p className="text-emerald text-sm">{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-canvas rounded-[1.15rem] px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {isPending ? "جاري الحفظ..." : "حفظ مسودة جهاز"}
      </button>
    </form>
  );
}
