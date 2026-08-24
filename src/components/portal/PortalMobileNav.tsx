"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  labelEn: string;
  icon: (active: boolean) => React.ReactNode;
};

const ITEMS: NavItem[] = [
  {
    href: "/portal",
    label: "الرئيسية",
    labelEn: "Home",
    icon: (active) => (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? "1" : "1.8"}
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/portal/messages",
    label: "رسائلي",
    labelEn: "Messages",
    icon: (active) => (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? "1" : "1.8"}
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/portal/documents",
    label: "مستنداتي",
    labelEn: "Documents",
    icon: (active) => (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? "1" : "1.8"}
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: "/portal/account",
    label: "حسابي",
    labelEn: "Account",
    icon: (active) => (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? "1" : "1.8"}
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function PortalMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="شريط تنقل الجوال للبوابة"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-[#150926]/95 border-t border-purple-900/10 dark:border-white/10 backdrop-blur-xl shadow-lg pb-safe"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {ITEMS.map((item) => {
          const isActive =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href as Route}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
                isActive
                  ? "text-[#4a2476] dark:text-[#cba3f9] font-bold"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
              }`}
            >
              <span className="shrink-0">{item.icon(isActive)}</span>
              <span className="text-[10px] mt-1 truncate max-w-[64px]">
                <span className="lang-ar">{item.label}</span>
                <span className="lang-en">{item.labelEn}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
