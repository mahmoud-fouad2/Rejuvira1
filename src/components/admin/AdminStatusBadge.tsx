import { ContentStatus } from "@prisma/client";

type AdminStatusBadgeProps = {
  status: ContentStatus | string;
  className?: string;
};

function paletteFor(status: ContentStatus | string) {
  switch (status) {
    case ContentStatus.PUBLISHED:
      return {
        labelAr: "منشور",
        labelEn: "Published",
        tone: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/50",
      };
    case ContentStatus.DRAFT:
      return {
        labelAr: "مسودة",
        labelEn: "Draft",
        tone: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-700/50",
      };
    case ContentStatus.REVIEW:
      return {
        labelAr: "قيد المراجعة",
        labelEn: "In review",
        tone: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-700/50",
      };
    case ContentStatus.ARCHIVED:
      return {
        labelAr: "مؤرشف",
        labelEn: "Archived",
        tone: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-200 dark:border-zinc-700/50",
      };
    default:
      return {
        labelAr: String(status),
        labelEn: String(status),
        tone: "bg-zinc-50 text-zinc-700 border-zinc-200",
      };
  }
}

export function AdminStatusBadge({ status, className = "" }: AdminStatusBadgeProps) {
  const palette = paletteFor(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${palette.tone} ${className}`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${
          status === ContentStatus.PUBLISHED
            ? "bg-emerald-500"
            : status === ContentStatus.DRAFT
              ? "bg-amber-500"
              : status === ContentStatus.REVIEW
                ? "bg-blue-500"
                : "bg-zinc-400"
        }`}
      />
      <span className="lang-ar">{palette.labelAr}</span>
      <span className="lang-en">{palette.labelEn}</span>
    </span>
  );
}
