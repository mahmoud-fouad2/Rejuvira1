"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type DoctorQuoteCard = {
  id: string;
  name: string;
  title: string;
  quote: string;
  photoUrl: string;
  yearsExperience: number;
  slug: string;
};

export function DoctorQuotesRail({
  eyebrow,
  title,
  description,
  doctors,
}: {
  eyebrow: string;
  title: string;
  description: string;
  doctors: readonly DoctorQuoteCard[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (doctors.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % doctors.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [doctors.length]);

  const activeDoctor = doctors[activeIndex];

  if (!activeDoctor) {
    return null;
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
      {/* Left: active quote panel */}
      <article className="surface-panel flex flex-col justify-between rounded-[2.4rem] p-7 lg:p-10">
        <div>
          <p className="eyebrow" style={{ color: "var(--violet-mid)" }}>
            {eyebrow}
          </p>
          <h2 className="text-ink mt-4 font-serif text-4xl leading-[1.1] tracking-[-0.035em]">
            {title}
          </h2>
          <p className="text-ink-soft mt-4 text-sm leading-7">{description}</p>
        </div>
        <div
          className="quote-card-bg mt-8 rounded-[2rem] p-6"
        >
          <p
            className="font-serif text-5xl leading-none"
            style={{ color: "var(--violet)" }}
          >
            "
          </p>
          <p className="text-ink mt-3 font-serif text-2xl leading-[1.45] tracking-[-0.025em]">
            {activeDoctor.quote}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <div
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(30,13,78,0.1), rgba(245,237,224,0.9))",
                border: "1px solid rgba(30,13,78,0.14)",
              }}
            >
              <Image
                src={activeDoctor.photoUrl}
                alt={activeDoctor.name}
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            </div>
            <div>
              <p className="text-ink text-sm font-semibold">
                {activeDoctor.name}
              </p>
              <p className="text-ink-soft mt-0.5 text-xs">
                {activeDoctor.title}
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Right: uniform doctor selector */}
      <div className="flex flex-col gap-3">
        {doctors.map((doctor, index) => {
          const isActive = index === activeIndex;

          return (
            <article
              key={doctor.id}
              onClick={() => setActiveIndex(index)}
              className={`surface-panel flex cursor-pointer items-center gap-4 rounded-[1.8rem] p-3 transition-all duration-300 ${
                isActive ? "showcase-active-bg shadow-[0_6px_24px_rgba(30,13,78,0.12)]" : ""
              }`}
            >
              {/* Photo */}
              <div
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[1.2rem]"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(30,13,78,0.08), rgba(245,237,224,0.9))",
                  border: "1px solid rgba(30,13,78,0.1)",
                }}
              >
                <Image
                  src={doctor.photoUrl}
                  alt={doctor.name}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </div>

              {/* Name + specialty + link */}
              <div className="min-w-0 flex-1">
                <p className="text-ink truncate text-sm font-semibold">
                  {doctor.name}
                </p>
                <p className="text-ink-soft mt-0.5 truncate text-xs">
                  {doctor.title}
                </p>
                <Link
                  href={`/doctors/${doctor.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1.5 inline-block text-xs font-semibold transition-colors"
                  style={{ color: "var(--violet-mid)" }}
                >
                  <span className="lang-ar">الملف الطبي</span>
                  <span className="lang-en">Medical Profile</span>
                  {" "}
                  <span aria-hidden="true">←</span>
                </Link>
              </div>

              {/* Experience pill + active dot */}
              <div className="flex shrink-0 flex-col items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                  style={{
                    background: "rgba(30,13,78,0.07)",
                    color: "var(--violet-mid)",
                  }}
                >
                  {doctor.yearsExperience} <span className="lang-ar">سنة</span><span className="lang-en">yrs</span>
                </span>
                <div
                  className="h-2 w-2 rounded-full transition-all duration-300"
                  style={{
                    background: isActive
                      ? "var(--violet)"
                      : "rgba(30,13,78,0.15)",
                    boxShadow: isActive
                      ? "0 0 6px rgba(30,13,78,0.5)"
                      : "none",
                  }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
