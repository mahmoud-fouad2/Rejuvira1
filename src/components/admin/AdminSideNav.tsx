"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

import { adminNavGroups, type AdminNavGroupKey } from "@/lib/site-content";

type NavItem = {
  label: string;
  labelEn?: string;
  href: string;
  description: string;
  descriptionEn?: string;
  group?: AdminNavGroupKey;
};

/* ── Group metadata ── */
const groupMeta: Record<
  AdminNavGroupKey,
  { ar: string; en: string; icon: React.ReactNode }
> = {
  overview: {
    ar: "نظرة عامة",
    en: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  content: {
    ar: "المحتوى",
    en: "Content",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  ops: {
    ar: "العمليات",
    en: "Operations",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M3 3v18h18" strokeLinecap="round" />
        <path d="M7 16l4-6 4 4 4-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  settings: {
    ar: "الإعدادات",
    en: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
};

/* ── Per-route icon ── */
function iconFor(href: string) {
  switch (href) {
    case "/admin":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" /></svg>;
    case "/admin/doctors":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "/admin/devices":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M12 11v4M10 13h4" /></svg>;
    case "/admin/services":
    case "/admin/content":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M12 3 3 8.5v7L12 21l9-5.5v-7L12 3Z" strokeLinejoin="round" /><path d="M12 12 3 8.5M12 12v9M12 12l9-3.5" /></svg>;
    case "/admin/service-categories":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M3 7h4M3 12h4M3 17h4M9 7h12M9 12h12M9 17h12" strokeLinecap="round" /></svg>;
    case "/admin/journal":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /><path d="M8 7h8M8 11h8" /></svg>;
    case "/admin/gallery":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>;
    case "/admin/stats":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M3 3v18h18" strokeLinecap="round" /><path d="M7 16l4-6 4 4 4-8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "/admin/crm":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>;
    case "/admin/media":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5M12 3v12" /></svg>;
    case "/admin/pages":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></svg>;
    case "/admin/webhooks":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M14.5 17.5a3.5 3.5 0 1 1-7 0c0-2 1.5-2.7 1.5-4.5" /><path d="M9.5 6.5a3.5 3.5 0 1 1 7 0c0 2-1.5 2.7-1.5 4.5" /><path d="M19 13a3 3 0 1 1-3-3" /><path d="m12 13 4-2" /></svg>;
    case "/admin/users":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 11V9a2 2 0 0 0-2-2h-2M16 11h6" /></svg>;
    case "/admin/logs":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" /><path d="M14 2v6h6M10 13h4M10 17h4" /></svg>;
    case "/admin/settings":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>;
    case "/admin/maintenance":
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M14.7 6.3a4 4 0 1 1 3 3l-7.4 7.4a2 2 0 1 1-3-3l7.4-7.4Z" strokeLinejoin="round" /><path d="M6 18h.01M3 21h.01" strokeLinecap="round" /></svg>;
    default:
      return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>;
  }
}

function navActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ── Chevron icon ── */
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function AdminSideNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname() ?? "";

  const groupOrder: AdminNavGroupKey[] = ["overview", "content", "ops", "settings"];

  /* Build a map of groupKey → items */
  const grouped = new Map<AdminNavGroupKey, NavItem[]>();
  for (const item of items) {
    const key = (item.group ?? "overview") as AdminNavGroupKey;
    const list = grouped.get(key) ?? [];
    list.push(item);
    grouped.set(key, list);
  }

  /* Auto-determine which groups contain the active path */
  function groupContainsActive(key: AdminNavGroupKey) {
    return (grouped.get(key) ?? []).some((item) => navActive(pathname, item.href));
  }

  /* Initial open state — expand group that contains active route */
  const [openGroups, setOpenGroups] = useState<Set<AdminNavGroupKey>>(() => {
    const initial = new Set<AdminNavGroupKey>();
    for (const key of groupOrder) {
      if (groupContainsActive(key)) initial.add(key);
    }
    // Always show overview open by default
    initial.add("overview");
    return initial;
  });

  /* When route changes, open the group that contains the new active item */
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      for (const key of groupOrder) {
        if (groupContainsActive(key)) next.add(key);
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggleGroup(key: AdminNavGroupKey) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  /* ── Render a single nav link ── */
  function renderItem(item: NavItem, variant: "primary" | "sub" = "sub") {
    const active = navActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href as Route}
        className={`admin-snav__item admin-snav__item--${variant} ${active ? "is-active" : ""}`}
      >
        <span className="admin-snav__item-icon">{iconFor(item.href)}</span>
        <span className="admin-snav__item-label">
          <span className="lang-ar">{item.label}</span>
          <span className="lang-en">{item.labelEn ?? item.label}</span>
        </span>
        {active && <span className="admin-snav__active-dot" aria-hidden />}
      </Link>
    );
  }

  return (
    <nav className="admin-snav" aria-label="Admin navigation">
      {groupOrder.map((groupKey) => {
        const groupItems = grouped.get(groupKey);
        if (!groupItems || groupItems.length === 0) return null;

        const meta = groupMeta[groupKey];
        const isOpen = openGroups.has(groupKey);
        const hasActive = groupContainsActive(groupKey);

        /* Overview: render items directly without accordion */
        if (groupKey === "overview") {
          return (
            <div key={groupKey} className="admin-snav__section">
              {groupItems.map((item) => renderItem(item, "primary"))}
            </div>
          );
        }

        /* Content group: accordion with sub-items */
        return (
          <div
            key={groupKey}
            className={`admin-snav__section admin-snav__section--accordion ${hasActive ? "has-active" : ""}`}
          >
            <button
              type="button"
              className={`admin-snav__group-btn ${isOpen ? "is-open" : ""} ${hasActive ? "has-active" : ""}`}
              onClick={() => toggleGroup(groupKey)}
              aria-expanded={isOpen}
            >
              <span className="admin-snav__group-icon">{meta.icon}</span>
              <span className="admin-snav__group-label">
                <span className="lang-ar">{meta.ar}</span>
                <span className="lang-en">{meta.en}</span>
              </span>
              {hasActive && !isOpen && (
                <span className="admin-snav__group-active-count">
                  {groupItems.filter((i) => navActive(pathname, i.href)).length}
                </span>
              )}
              <ChevronIcon open={isOpen} />
            </button>

            <div
              className="admin-snav__items-wrap"
              style={{
                maxHeight: isOpen ? `${groupItems.length * 3.5}rem` : "0",
                overflow: "hidden",
                transition: "max-height 0.25s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <div className="admin-snav__items">
                {groupItems.map((item) => renderItem(item, "sub"))}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
