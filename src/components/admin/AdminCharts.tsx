import type { ReactNode } from "react";

type DailyPoint = { day: string; count: number };

function bucketByDay(
  isoDates: ReadonlyArray<string>,
  windowDays = 14,
): DailyPoint[] {
  const out: DailyPoint[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const map = new Map<string, number>();
  for (const iso of isoDates) {
    const d = new Date(iso);
    if (Number.isNaN(d.valueOf())) continue;
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  for (let i = windowDays - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    out.push({ day: key, count: map.get(key) ?? 0 });
  }
  return out;
}

export function LineChart({
  isoDates,
  windowDays = 14,
  height = 80,
  ariaLabel,
}: {
  isoDates: ReadonlyArray<string>;
  windowDays?: number;
  height?: number;
  ariaLabel: string;
}) {
  const points = bucketByDay(isoDates, windowDays);
  const max = Math.max(1, ...points.map((p) => p.count));
  const width = 100;
  const stepX = width / Math.max(1, points.length - 1);
  const path = points
    .map((point, index) => {
      const x = index * stepX;
      const y = height - (point.count / max) * (height - 6) - 3;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const area = `${path} L${(points.length - 1) * stepX},${height} L0,${height} Z`;

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      className="admin-mini-chart"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="rv-line-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(201,168,124,0.45)" />
          <stop offset="100%" stopColor="rgba(201,168,124,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#rv-line-grad)" stroke="none" />
      <path
        d={path}
        fill="none"
        stroke="rgb(201,168,124)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function BarChart({
  data,
  height = 120,
  ariaLabel,
}: {
  data: ReadonlyArray<{ label: string; value: number; color?: string }>;
  height?: number;
  ariaLabel: string;
}) {
  const max = Math.max(1, ...data.map((entry) => entry.value));
  const width = 100;
  const gap = 2;
  const barWidth = (width - gap * (data.length - 1)) / Math.max(1, data.length);

  return (
    <div className="grid gap-2">
      <svg
        role="img"
        aria-label={ariaLabel}
        className="admin-mini-chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {data.map((entry, index) => {
          const h = Math.max(2, (entry.value / max) * (height - 6));
          const x = index * (barWidth + gap);
          const y = height - h;
          return (
            <rect
              key={`${entry.label}-${index}`}
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={1.5}
              fill={entry.color ?? "rgba(201,168,124,0.7)"}
            />
          );
        })}
      </svg>
      <div className="text-muted-foreground grid grid-cols-[repeat(auto-fit,minmax(48px,1fr))] gap-1 text-[10px]">
        {data.map((entry) => (
          <span
            key={entry.label}
            className="truncate text-center"
            title={`${entry.label}: ${entry.value}`}
          >
            {entry.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <article className="admin-card">
      <div className="admin-card__header">
        <div>
          {subtitle ? (
            <div className="admin-card__subtitle">{subtitle}</div>
          ) : null}
          <div className="admin-card__title">{title}</div>
        </div>
      </div>
      <div className="admin-card__body" style={{ minHeight: 140 }}>
        {children}
      </div>
    </article>
  );
}
