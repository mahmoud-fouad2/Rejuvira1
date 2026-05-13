"use client";

import { useActionState } from "react";
import { SubmissionStatus } from "@prisma/client";

import {
  updateCrmSubmissionAction,
  type CrmActionState,
} from "@/app/admin/crm/actions";
import type { CrmRecord } from "@/lib/content-repository";

const initialState: CrmActionState = {
  status: "idle",
  message: "",
};

const statusOptions = [
  { value: SubmissionStatus.NEW, label: "جديد" },
  { value: SubmissionStatus.CONTACTED, label: "تم التواصل" },
  { value: SubmissionStatus.FOLLOW_UP, label: "متابعة" },
  { value: SubmissionStatus.BOOKED, label: "محجوز" },
  { value: SubmissionStatus.CLOSED, label: "مغلق" },
] as const;

export function CrmSubmissionEditor({ submission }: { submission: CrmRecord }) {
  const [state, formAction, isPending] = useActionState(
    updateCrmSubmissionAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="border-line bg-surface mt-5 grid gap-3 rounded-[1.4rem] border px-4 py-4"
    >
      <input type="hidden" name="id" value={submission.id} />
      <div className="grid gap-3 md:grid-cols-[12rem_1fr]">
        <select
          name="status"
          defaultValue={submission.status}
          className="border-line bg-canvas text-ink focus:border-gold rounded-[1rem] border px-3 py-3 text-sm outline-none"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <textarea
          name="notes"
          defaultValue={submission.notes ?? ""}
          rows={3}
          placeholder="ملاحظات المتابعة الداخلية"
          className="border-line bg-canvas text-ink focus:border-gold rounded-[1rem] border px-3 py-3 text-sm leading-7 outline-none"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {state.message ? (
          <p className="text-emerald text-sm">{state.message}</p>
        ) : (
          <span className="text-ink-faint text-xs">
            تحديث الحالة والملاحظات من نفس البطاقة.
          </span>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="bg-ink text-canvas rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {isPending ? "جاري الحفظ..." : "حفظ المتابعة"}
        </button>
      </div>
    </form>
  );
}
