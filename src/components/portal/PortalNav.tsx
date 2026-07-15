"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; labelEn: string };

/**
 * The portal's primary nav previously rendered every pill with the same
 * static classes — a patient had no way to tell which section they were on.
 * usePathname() requires a client component; the parent layout stays a
 * server component and just mounts this.
 */
export function PortalNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="تنقل البوابة"
      className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2"
    >
      {items.map((item) => {
        const isActive =
          item.href === "/portal"
            ? pathname === "/portal"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href as Route}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "bg-ink text-canvas rounded-full border border-transparent px-4 py-1.5 text-sm font-semibold whitespace-nowrap shadow-sm"
                : "border-border rounded-full border px-4 py-1.5 text-sm whitespace-nowrap transition-opacity hover:opacity-80"
            }
          >
            <span className="lang-ar">{item.label}</span>
            <span className="lang-en">{item.labelEn}</span>
          </Link>
        );
      })}
    </nav>
  );
}
