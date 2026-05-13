import type { Route } from "next";
import Link from "next/link";
import Image from "next/image";

import { MegaMenu } from "@/components/navigation/MegaMenu";
import { getRuntimeSettings } from "@/lib/content-repository";
import { megaMenuEntries } from "@/lib/site-content";

import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";

export async function SiteHeader() {
  const runtimeSettings = await getRuntimeSettings();

  return (
    <header className="sticky top-0 z-40 px-4 py-3 sm:px-5 lg:px-8">
      <div className="mx-auto flex max-w-[var(--max-width)] flex-col gap-2">
        {/* Announcement bar */}
        <div className="announcement-bar hidden items-center justify-between rounded-full px-6 py-2 text-xs lg:flex">
          <div className="flex items-center gap-2.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--gold)" }}
            />
            <p className="text-ink-soft">{runtimeSettings.brand.announcement}</p>
          </div>
          <div className="flex items-center gap-5 text-ink-faint">
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span className="lang-ar">فريق متخصص</span>
              <span className="lang-en">Specialist Team</span>
            </span>
            <span className="h-3 w-px bg-[var(--line-subtle)]" />
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
              </svg>
              <span className="lang-ar">أجهزة طبية معتمدة</span>
              <span className="lang-en">Certified Medical Devices</span>
            </span>
            <span className="h-3 w-px bg-[var(--line-subtle)]" />
            <Link
              href="/contact"
              className="flex items-center gap-1 font-semibold transition-colors duration-200 hover:text-ink-soft"
              style={{ color: "var(--violet-mid)" }}
            >
              <span className="lang-ar">احجز الآن</span>
              <span className="lang-en">Book Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Main nav bar */}
        <div className="nav-bar-glass rounded-[1.8rem] px-4 py-2.5 lg:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex min-w-0 items-center gap-3 rounded-2xl py-0.5 pe-2 transition-opacity hover:opacity-90">
              <div className="border-line relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border shadow-sm">
                <Image
                  src={runtimeSettings.media.brandMark}
                  alt={runtimeSettings.brand.logoAlt}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-ink font-serif text-lg leading-none tracking-[-0.03em]">
                  {runtimeSettings.brand.siteName}
                </p>
                <p
                  className="mt-0.5 text-[9px] tracking-[0.26em] uppercase"
                  style={{ color: "var(--violet-mid)" }}
                >
                  <span className="lang-ar">الجلدية والتجميل الطبي</span>
                  <span className="lang-en">Dermatology &amp; Medical Aesthetics</span>
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-0.5 xl:flex">
              {megaMenuEntries.map((entry) => (
                <MegaMenu key={entry.label} entry={entry} />
              ))}
              <Link
                href="/contact"
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                <span className="lang-ar">التواصل</span>
                <span className="lang-en">Contact</span>
              </Link>
              <Link
                href="/about"
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                <span className="lang-ar">من نحن</span>
                <span className="lang-en">About Us</span>
              </Link>
            </nav>

            {/* Desktop actions */}
            <div className="hidden items-center gap-2 lg:flex">
              <LanguageToggle />
              <ThemeToggle />
              <div className="h-5 w-px bg-[var(--line-subtle)]" />
              <Link href="/contact" className="btn-primary text-xs">
                <span className="lang-ar">احجز موعدك</span>
                <span className="lang-en">Book Now</span>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <details className="group relative lg:hidden">
              <summary
                className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full transition-colors duration-200"
                style={{
                  border: "1px solid rgba(30,13,78,0.12)",
                  background: "rgba(30,13,78,0.04)",
                  color: "var(--ink-soft)",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </summary>
              <div className="mobile-menu-glass absolute top-[calc(100%+0.75rem)] right-0 left-0 rounded-[1.6rem] p-4">
                <div className="flex flex-col gap-2">
                  {megaMenuEntries.map((entry) => (
                    <details
                      key={entry.label}
                      className="rounded-[1.2rem]"
                      style={{
                        border: "1px solid rgba(30,13,78,0.08)",
                        background: "rgba(30,13,78,0.025)",
                      }}
                    >
                      <summary className="text-ink cursor-pointer px-4 py-3 text-sm font-semibold">
                        {entry.label}
                      </summary>
                      <div className="grid gap-1.5 px-3 pb-3">
                        {entry.cards.map((card) => (
                          <Link
                            key={card.title}
                            href={card.href as Route}
                            className="mobile-nav-item rounded-[0.9rem] px-4 py-3 text-sm transition-colors duration-200"
                          >
                            <span className="text-ink block font-semibold">
                              {card.title}
                            </span>
                            <span className="text-ink-soft mt-0.5 block text-xs leading-5">
                              {card.description}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </details>
                  ))}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <LanguageToggle />
                      <ThemeToggle />
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href="/about" className="btn-secondary text-xs">
                        <span className="lang-ar">من نحن</span>
                        <span className="lang-en">About</span>
                      </Link>
                      <Link href="/contact" className="btn-primary text-xs">
                        <span className="lang-ar">احجز موعدك</span>
                        <span className="lang-en">Book Now</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
