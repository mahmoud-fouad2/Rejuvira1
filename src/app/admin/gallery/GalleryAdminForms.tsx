"use client";

import { useActionState, useState } from "react";
import { saveGalleryItemAction, deleteGalleryItemAction } from "./actions";
import type { GalleryRecord } from "@/lib/content-repository";

type State = { success: boolean; message: string };
const initial: State = { success: false, message: "" };

function clampSplit(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/* ─────────────────────── Create/Edit Form ─────────────────────── */
export function GalleryItemForm({
  item,
  onClose,
}: {
  item?: GalleryRecord;
  onClose?: () => void;
}) {
  const [state, action, pending] = useActionState(saveGalleryItemAction, initial);
  const [splitPercent, setSplitPercent] = useState<number>(
    clampSplit(item?.initialSplitPercent ?? 50),
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      {item && <input type="hidden" name="id" value={item.id} />}

      {/* State feedback */}
      {state.message && (
        <div
          className="rounded-[1rem] px-4 py-3 text-sm font-medium"
          style={{
            background: state.success
              ? "rgba(26,122,94,0.1)"
              : "rgba(92,45,62,0.1)",
            border: `1px solid ${state.success ? "rgba(26,122,94,0.25)" : "rgba(92,45,62,0.25)"}`,
            color: state.success ? "#1a7a5e" : "#5c2d3e",
          }}
        >
          {state.message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Title */}
        <label className="flex flex-col gap-1.5">
          <span className="text-ink-soft text-xs font-medium">العنوان *</span>
          <input
            name="title"
            defaultValue={item?.title ?? ""}
            placeholder="مثال: علاج تصبغات الوجه"
            required
            className="border-line bg-canvas text-ink rounded-[1rem] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "rgba(30,13,78,0.3)" } as React.CSSProperties}
          />
        </label>

        {/* Slug */}
        <label className="flex flex-col gap-1.5">
          <span className="text-ink-soft text-xs font-medium">الرابط (slug) *</span>
          <input
            name="slug"
            defaultValue={item?.slug ?? ""}
            placeholder="facial-pigmentation"
            required
            dir="ltr"
            className="border-line bg-canvas text-ink rounded-[1rem] border px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "rgba(30,13,78,0.3)" } as React.CSSProperties}
          />
        </label>

        {/* Category */}
        <label className="flex flex-col gap-1.5">
          <span className="text-ink-soft text-xs font-medium">التصنيف *</span>
          <input
            name="category"
            defaultValue={item?.category ?? ""}
            placeholder="مثال: تجديد البشرة"
            required
            className="border-line bg-canvas text-ink rounded-[1rem] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "rgba(30,13,78,0.3)" } as React.CSSProperties}
          />
        </label>

        {/* Description */}
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-ink-soft text-xs font-medium">الوصف *</span>
          <textarea
            name="description"
            defaultValue={item?.description ?? ""}
            placeholder="وصف مختصر للحالة والنتيجة..."
            required
            rows={3}
            className="border-line bg-canvas text-ink rounded-[1rem] border px-4 py-2.5 text-sm leading-7 resize-none focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "rgba(30,13,78,0.3)" } as React.CSSProperties}
          />
        </label>
      </div>

      {/* Images section */}
      <div
        className="rounded-[1.4rem] p-4"
        style={{
          background: "rgba(30,13,78,0.03)",
          border: "1px solid rgba(30,13,78,0.08)",
        }}
      >
        <p className="text-ink-soft mb-3 text-xs font-semibold uppercase tracking-widest">
          صورة قبل
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-ink-faint text-xs">مسار الصورة *</span>
            <input
              name="beforeImageUrl"
              defaultValue={item?.beforeImageUrl ?? ""}
              placeholder="/media/gallery/before-1.jpg"
              required
              dir="ltr"
              className="border-line bg-canvas text-ink rounded-[1rem] border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "rgba(30,13,78,0.3)" } as React.CSSProperties}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-ink-faint text-xs">النص البديل (alt) — لمحركات البحث *</span>
            <input
              name="beforeImageAlt"
              defaultValue={item?.beforeImageAlt ?? ""}
              placeholder="قبل علاج تصبغات الوجه - مريضة"
              required
              className="border-line bg-canvas text-ink rounded-[1rem] border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "rgba(30,13,78,0.3)" } as React.CSSProperties}
            />
          </label>
        </div>
      </div>

      <div
        className="rounded-[1.4rem] p-4"
        style={{
          background: "rgba(26,122,94,0.03)",
          border: "1px solid rgba(26,122,94,0.1)",
        }}
      >
        <p className="text-ink-soft mb-3 text-xs font-semibold uppercase tracking-widest">
          صورة بعد
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-ink-faint text-xs">مسار الصورة *</span>
            <input
              name="afterImageUrl"
              defaultValue={item?.afterImageUrl ?? ""}
              placeholder="/media/gallery/after-1.jpg"
              required
              dir="ltr"
              className="border-line bg-canvas text-ink rounded-[1rem] border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "rgba(30,13,78,0.3)" } as React.CSSProperties}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-ink-faint text-xs">النص البديل (alt) — لمحركات البحث *</span>
            <input
              name="afterImageAlt"
              defaultValue={item?.afterImageAlt ?? ""}
              placeholder="بعد علاج تصبغات الوجه - نتيجة واضحة"
              required
              className="border-line bg-canvas text-ink rounded-[1rem] border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "rgba(30,13,78,0.3)" } as React.CSSProperties}
            />
          </label>
        </div>
      </div>

      {/* Split position slider (subagent #3) — controls initial Before/After position. */}
      <div
        className="rounded-[1.4rem] p-4"
        style={{
          background: "rgba(74,36,118,0.04)",
          border: "1px solid rgba(74,36,118,0.12)",
        }}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor="initialSplitPercent"
            className="text-ink-soft text-xs font-semibold uppercase tracking-widest"
          >
            موضع المقارنة الافتراضي
          </label>
          <span
            dir="ltr"
            className="text-ink rounded-full border px-3 py-1 text-xs font-mono"
            style={{
              borderColor: "rgba(74,36,118,0.18)",
              background: "rgba(255,255,255,0.7)",
            }}
          >
            {splitPercent}%
          </span>
        </div>
        <input
          id="initialSplitPercent"
          type="range"
          name="initialSplitPercent"
          min={0}
          max={100}
          step={1}
          value={splitPercent}
          onChange={(e) => setSplitPercent(clampSplit(Number(e.target.value)))}
          className="w-full"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={splitPercent}
          aria-label="موضع المقارنة الافتراضي بين 0 و 100"
        />
        <p className="text-ink-faint mt-2 text-[11px] leading-5">
          يحدد موضع شريط المقارنة عند فتح الصورة لأول مرة. القيمة الافتراضية ٥٠٪.
          يُقصَر العرض على النطاق ٥٪ — ٩٥٪ تلقائيًا عند العرض.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary disabled:opacity-60"
        >
          {pending ? "جاري الحفظ..." : item ? "حفظ التعديلات" : "إضافة صورة"}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}

/* ─────────────────────── Delete Button ─────────────────────────── */
export function DeleteGalleryItemButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteGalleryItemAction, initial);

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {state.message && !state.success && (
        <p className="text-[11px] text-[#5c2d3e] mb-1">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-200 disabled:opacity-50"
        style={{
          background: "rgba(92,45,62,0.08)",
          color: "#5c2d3e",
          border: "1px solid rgba(92,45,62,0.18)",
        }}
        onClick={(e) => {
          if (!confirm("هل أنت متأكد من الحذف؟")) e.preventDefault();
        }}
      >
        {pending ? "..." : "حذف"}
      </button>
    </form>
  );
}
