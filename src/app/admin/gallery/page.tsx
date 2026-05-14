import Image from "next/image";
import { getGalleryItems } from "@/lib/content-repository";
import { GalleryItemForm, DeleteGalleryItemButton } from "./GalleryAdminForms";

export const metadata = { title: "إدارة المعرض — Rejuvira Admin" };

export default async function AdminGalleryPage() {
  const items = await getGalleryItems();

  const published = items.length;

  return (
    <div className="space-y-10 py-6" dir="rtl">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">لوحة التحكم</p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--violet)" }}>
            معرض النتائج
          </h1>
          <p className="text-ink-soft mt-1 text-sm">
            إضافة وتعديل صور قبل وبعد — بما فيها نصوص alt لمحركات البحث
          </p>
        </div>
        <div className="flex gap-3">
          <div
            className="rounded-[1.4rem] px-5 py-3 text-center"
            style={{
              background: "rgba(30,13,78,0.06)",
              border: "1px solid rgba(30,13,78,0.1)",
            }}
          >
            <p className="text-2xl font-bold" style={{ color: "var(--violet)" }}>
              {published}
            </p>
            <p className="text-ink-soft text-[11px]">حالة منشورة</p>
          </div>
        </div>
      </div>

      {/* ── Add New ── */}
      <section
        className="rounded-[1.8rem] p-6"
        style={{
          background: "rgba(201,162,106,0.06)",
          border: "1px solid rgba(201,162,106,0.2)",
        }}
      >
        <h2
          className="mb-5 text-base font-semibold"
          style={{ color: "var(--gold)" }}
        >
          + إضافة حالة جديدة
        </h2>
        <GalleryItemForm />
      </section>

      {/* ── List ── */}
      {items.length === 0 ? (
        <div
          className="rounded-[1.8rem] px-8 py-16 text-center"
          style={{
            background: "rgba(30,13,78,0.03)",
            border: "1px dashed rgba(30,13,78,0.15)",
          }}
        >
          <p className="text-ink-soft text-base">لا توجد حالات بعد.</p>
          <p className="text-ink-faint mt-1 text-sm">
            استخدم النموذج أعلاه لإضافة أول حالة.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Gallery Item Card ── */
function GalleryCard({
  item,
}: {
  item: Awaited<ReturnType<typeof getGalleryItems>>[number];
}) {
  return (
    <article
      className="group overflow-hidden rounded-[1.8rem]"
      style={{
        background: "rgba(255,255,255,0.7)",
        border: "1px solid rgba(30,13,78,0.1)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Images row */}
      <div className="grid grid-cols-2">
        {/* Before */}
        <div className="relative aspect-[3/2] overflow-hidden">
          <Image
            src={item.beforeImageUrl}
            alt={item.beforeImageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, 200px"
          />
          <div className="absolute bottom-0 right-0 m-2 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-[#5c2d3e] backdrop-blur-sm">
            قبل
          </div>
        </div>
        {/* After */}
        <div className="relative aspect-[3/2] overflow-hidden">
          <Image
            src={item.afterImageUrl}
            alt={item.afterImageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, 200px"
          />
          <div className="absolute bottom-0 left-0 m-2 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-[#1a7a5e] backdrop-blur-sm">
            بعد
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold" style={{ color: "var(--violet)" }}>
              {item.title}
            </p>
            <p className="text-ink-soft mt-0.5 text-[11px] truncate">
              {item.category}
            </p>
          </div>
          <DeleteGalleryItemButton id={item.id} />
        </div>

        {/* Alt text badges */}
        <div className="mt-3 space-y-1">
          <AltBadge label="alt قبل" value={item.beforeImageAlt} color="rose" />
          <AltBadge label="alt بعد" value={item.afterImageAlt} color="emerald" />
        </div>

        {/* Edit form (expandable via details) */}
        <details className="mt-4">
          <summary
            className="cursor-pointer select-none text-xs font-medium transition-colors duration-200"
            style={{ color: "var(--violet-mid)" }}
          >
            تعديل البيانات
          </summary>
          <div className="mt-4">
            <GalleryItemForm item={item} />
          </div>
        </details>
      </div>
    </article>
  );
}

function AltBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "rose" | "emerald";
}) {
  const ok = value && value.length > 3;
  const bg =
    color === "rose"
      ? ok
        ? "rgba(92,45,62,0.07)"
        : "rgba(92,45,62,0.13)"
      : ok
        ? "rgba(26,122,94,0.07)"
        : "rgba(26,122,94,0.13)";
  const textColor =
    color === "rose" ? "#5c2d3e" : "#1a7a5e";

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
      style={{ background: bg }}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: textColor }}>
        {label}
      </span>
      <span
        className="min-w-0 flex-1 truncate text-[11px]"
        style={{ color: ok ? textColor : "#999", fontStyle: ok ? "normal" : "italic" }}
      >
        {ok ? value : "غير محدد"}
      </span>
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: ok ? textColor : "#ccc" }}
      />
    </div>
  );
}
