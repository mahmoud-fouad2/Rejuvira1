import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import type { MegaMenuEntry } from "@/lib/site-content";

function Bi({ field }: { field: { ar: string; en: string } }) {
  return (
    <>
      <span className="lang-ar">{field.ar}</span>
      <span className="lang-en">{field.en}</span>
    </>
  );
}

export function MegaMenu({ entry }: { entry: MegaMenuEntry }) {
  const featuredAlt = `${entry.featured.title.ar} — ${entry.featured.title.en}`;

  return (
    <div className="rv-mega group/mega relative hidden xl:block">
      <Link
        href={entry.href as Route}
        className="rv-mega-trigger relative rounded-full px-3.5 py-2 text-[0.8125rem] font-semibold tracking-[-0.01em] text-[color:var(--rv-text)] transition-colors duration-200 after:absolute after:inset-x-3 after:-bottom-[2px] after:h-px after:origin-center after:scale-x-0 after:bg-gradient-to-l after:from-[color:var(--rv-purple-strong)] after:to-[#c9a26a] after:transition-transform after:duration-300 group-focus-within/mega:after:scale-x-100 group-hover/mega:after:scale-x-100 hover:text-[color:var(--rv-purple-strong)] focus-visible:text-[color:var(--rv-purple-strong)]"
      >
        <Bi field={entry.label} />
      </Link>

      <div
        className="pointer-events-none absolute top-[calc(100%+0.45rem)] left-1/2 z-50 mt-4 w-[min(92vw,80rem)] -translate-x-1/2 translate-y-3 opacity-0 backdrop-blur-sm transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-within/mega:pointer-events-auto group-focus-within/mega:translate-y-0 group-focus-within/mega:opacity-100 group-hover/mega:pointer-events-auto group-hover/mega:translate-y-0 group-hover/mega:opacity-100"
        role="region"
        aria-label="Mega menu"
      >
        <div className="mega-menu-panel rv-mega-panel border border-[color:var(--rv-line)] shadow-[0_28px_90px_rgba(30,13,78,0.14),0_1px_0_rgba(255,255,255,0.55)_inset]">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] xl:gap-6">
            <div className="relative min-h-[22rem] overflow-hidden rounded-[1.5rem] ring-1 ring-black/5">
              <Image
                src={entry.featured.image}
                alt={featuredAlt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover/mega:scale-[1.02]"
                sizes="(min-width: 1280px) 360px, 90vw"
                loading="lazy"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,6,24,0.45)] via-[rgba(10,6,24,0.18)] to-[rgba(10,6,24,0.82)]" />
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[rgba(30,13,78,0.35)] to-transparent" />

              <div className="relative flex h-full min-h-[22rem] flex-col justify-between p-6 sm:p-7">
                <p className="text-[0.625rem] font-semibold tracking-[0.32em] text-white/70 uppercase">
                  <Bi field={entry.featured.eyebrow} />
                </p>
                <div>
                  <h3 className="balanced-text text-lg leading-snug font-semibold tracking-[-0.02em] text-white sm:text-xl">
                    <Bi field={entry.featured.title} />
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/75">
                    <Bi field={entry.featured.description} />
                  </p>
                  <Link
                    href={entry.featured.href as Route}
                    className="rv-mega-feature-cta mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-white/22 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    <span className="lang-ar">استكشف القسم</span>
                    <span className="lang-en">Explore section</span>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path
                        d="m9 18 6-6-6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
              {entry.cards.map((card, i) => (
                <Link
                  key={`${card.href}-${card.title.ar}`}
                  href={card.href as Route}
                  className="group/card relative flex min-h-[8.5rem] flex-col justify-between overflow-hidden rounded-[1.35rem] border border-[color:var(--rv-line)] bg-[var(--rv-card)] p-4 shadow-[0_2px_12px_rgba(30,13,78,0.04)] transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[rgba(74,36,118,0.28)] hover:shadow-[0_12px_36px_rgba(30,13,78,0.1)] focus-visible:ring-2 focus-visible:ring-[color:var(--rv-purple-strong)] focus-visible:ring-offset-2"
                >
                  <div className="absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--rv-line)] bg-[color:var(--rv-card)] text-[0.65rem] font-bold text-[color:var(--rv-muted)] opacity-50 transition-opacity group-hover/card:opacity-100">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-5">
                    <p className="text-sm leading-snug font-semibold text-[color:var(--rv-text)]">
                      <Bi field={card.title} />
                    </p>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-[color:var(--rv-muted)]">
                      <Bi field={card.description} />
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[color:var(--rv-purple-strong)] opacity-0 transition-opacity duration-200 group-hover/card:opacity-100 group-focus-visible/card:opacity-100">
                    <span className="lang-ar">فتح</span>
                    <span className="lang-en">Open</span>
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden
                    >
                      <path
                        d="m9 18 6-6-6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-[color:var(--rv-line)] bg-[var(--rv-card)] px-4 py-3 sm:px-5 sm:py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a26a]"
                aria-hidden
              />
              <p className="text-[0.8125rem] leading-relaxed text-[color:var(--rv-muted)]">
                <Bi field={entry.summary} />
              </p>
            </div>
            <Link
              href={entry.href as Route}
              className="flex shrink-0 items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-[color:var(--rv-purple-strong)] underline-offset-4 transition-colors duration-150 hover:text-[color:var(--rv-purple)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--rv-purple-strong)]"
            >
              <span className="lang-ar">عرض الكل</span>
              <span className="lang-en">See all</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path
                  d="m9 18 6-6-6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
