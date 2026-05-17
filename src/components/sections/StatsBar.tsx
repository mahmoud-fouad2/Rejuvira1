"use client";

import { AnimatedCounter } from "@/components/ui/new/AnimatedCounter";

/**
 * Stats Bar — premium glass treatment with animated counters
 * Horizontal bar with gold dividers between stats
 */
const stats = [
  {
    value: 30000,
    suffix: "+",
    labelAr: "جلسة علاجية",
    labelEn: "Treatment Sessions",
  },
  {
    value: 10,
    suffix: "+",
    labelAr: "سنوات خبرة",
    labelEn: "Years of Experience",
  },
  {
    value: 98,
    suffix: "%",
    labelAr: "رضا العملاء",
    labelEn: "Client Satisfaction",
  },
  {
    value: 50,
    suffix: "+",
    labelAr: "تقنية عالمية",
    labelEn: "Global Technologies",
  },
];

export function StatsBar({ className = "" }: { className?: string }) {
  return (
    <section
      className={`relative z-20 -mt-8 px-6 lg:-mt-12 lg:px-10 ${className}`}
    >
      <div className="mx-auto max-w-[var(--max-width)]">
        <div className="stats-bar-panel overflow-hidden rounded-[2.5rem]">
          <div className="grid gap-px sm:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.labelAr}
                className="relative px-8 py-10 text-center"
              >
                {i > 0 && (
                  <span className="bg-gold/20 absolute top-1/4 right-0 hidden h-1/2 w-px sm:block" />
                )}

                <div className="stats-counter-typography">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-3 text-sm text-white/60">
                  <span className="lang-ar">{stat.labelAr}</span>
                  <span className="lang-en">{stat.labelEn}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
