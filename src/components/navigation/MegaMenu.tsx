import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import type { MegaMenuEntry } from "@/lib/site-content";

export function MegaMenu({ entry }: { entry: MegaMenuEntry }) {
  return (
    <div className="group/mega relative hidden xl:block">
      {/* Nav link trigger */}
      <Link
        href={entry.href as Route}
        className="relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 text-ink-soft hover:text-ink after:absolute after:inset-x-4 after:-bottom-1 after:h-px after:scale-x-0 after:bg-gradient-to-r after:from-violet after:to-gold after:transition-transform after:duration-300 group-hover/mega:text-ink group-hover/mega:after:scale-x-100"
      >
        {entry.label}
      </Link>

      {/* Dropdown panel */}
      <div className="pointer-events-none absolute top-full left-1/2 z-50 mt-5 w-[min(92vw,80rem)] -translate-x-1/2 translate-y-3 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-within/mega:pointer-events-auto group-focus-within/mega:translate-y-0 group-focus-within/mega:opacity-100 group-hover/mega:pointer-events-auto group-hover/mega:translate-y-0 group-hover/mega:opacity-100">
        <div className="mega-menu-panel">
          <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
            {/* ── Featured panel ── */}
            <div className="relative min-h-[22rem] overflow-hidden rounded-[1.6rem]">
              <Image
                src={entry.featured.image}
                alt={entry.featured.title}
                fill
                className="object-cover transition-transform duration-700 group-hover/mega:scale-[1.03]"
                sizes="340px"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,6,24,0.55)] via-[rgba(10,6,24,0.22)] to-[rgba(10,6,24,0.8)]" />
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[rgba(30,13,78,0.4)] to-transparent" />

              <div className="relative flex h-full flex-col justify-between p-6">
                <p className="text-[9px] font-medium tracking-[0.34em] text-white/55 uppercase">
                  {entry.featured.eyebrow}
                </p>
                <div>
                  <h3 className="balanced-text text-xl font-semibold leading-snug tracking-[-0.02em] text-white">
                    {entry.featured.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-white/68">
                    {entry.featured.description}
                  </p>
                  <Link
                    href={entry.featured.href as Route}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/12 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/22"
                  >
                    استكشف القسم
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Cards grid ── */}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {entry.cards.map((card, i) => (
                <Link
                  key={card.title}
                  href={card.href as Route}
                  className="group/card relative flex flex-col justify-between overflow-hidden rounded-[1.4rem] border border-[rgba(30,13,78,0.08)] bg-[rgba(253,250,246,0.6)] p-5 transition-all duration-200 hover:-translate-y-px hover:border-[rgba(30,13,78,0.18)] hover:bg-[rgba(30,13,78,0.035)] hover:shadow-[0_6px_24px_rgba(30,13,78,0.09)]"
                >
                  <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(30,13,78,0.12)] bg-[rgba(30,13,78,0.06)] text-[9px] font-semibold text-[var(--violet-mid)] opacity-40 transition-opacity group-hover/card:opacity-90">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-4">
                    <p className="text-ink text-sm font-semibold leading-snug">
                      {card.title}
                    </p>
                    <p className="text-ink-soft mt-2 text-sm leading-6">
                      {card.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[var(--violet-mid)] opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
                    <span>فتح</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="mt-4 flex items-center justify-between gap-4 rounded-[1.3rem] border border-[rgba(30,13,78,0.07)] bg-[rgba(30,13,78,0.03)] px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-gold" />
              <p className="text-ink-soft text-sm">{entry.summary}</p>
            </div>
            <Link
              href={entry.href as Route}
              className="flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-[var(--violet-mid)] transition-colors duration-200 hover:text-[var(--violet)]"
            >
              عرض الكل
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
