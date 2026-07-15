"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; labelEn: string };

export function PortalNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="تنقل بوابة المرضى" className="portal-nav">
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
            className={isActive ? "portal-nav__link is-active" : "portal-nav__link"}
          >
            <span className="lang-ar">{item.label}</span>
            <span className="lang-en">{item.labelEn}</span>
          </Link>
        );
      })}
    </nav>
  );
}
