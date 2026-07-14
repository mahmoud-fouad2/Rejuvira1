"use client";

import { useEffect, useState } from "react";

/** Live countdown to the upcoming procedure, hydration-safe. */
export function ProcedureCountdown({ targetIso }: { targetIso: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (now === null) return null;

  const diff = new Date(targetIso).getTime() - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  return (
    <div
      className="flex items-center gap-3 text-center"
      role="timer"
      aria-label="الوقت المتبقي للعملية"
    >
      {[
        { value: days, label: "يوم", labelEn: "days" },
        { value: hours, label: "ساعة", labelEn: "hrs" },
        { value: minutes, label: "دقيقة", labelEn: "min" },
      ].map((unit) => (
        <div
          key={unit.label}
          className="border-border min-w-[64px] rounded-2xl border px-3 py-2"
        >
          <div className="text-xl font-bold tabular-nums" dir="ltr">
            {unit.value}
          </div>
          <div className="text-xs opacity-70">
            <span className="lang-ar">{unit.label}</span>
            <span className="lang-en">{unit.labelEn}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
