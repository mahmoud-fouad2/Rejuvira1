"use client";

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

const groupLabels: Record<AdminNavGroupKey, { ar: string; en: string }> = {
  overview: { ar: "نظرة عامة", en: "Overview" },
  content: { ar: "المحتوى", en: "Content" },
  ops: { ar: "العمليات", en: "Operations" },
  settings: { ar: "الإعدادات", en: "Settings" },
};

function iconFor(href: string) {
  switch (href) {
    case "/admin":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path
            d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/admin/doctors":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "/admin/devices":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <path d="M12 11v4M10 13h4" />
        </svg>
      );
    case "/admin/services":
    case "/admin/content":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M12 3 3 8.5v7L12 21l9-5.5v-7L12 3Z" strokeLinejoin="round" />
          <path d="M12 12 3 8.5M12 12v9M12 12l9-3.5" />
        </svg>
      );
    case "/admin/journal":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          <path d="M8 7h8M8 11h8" />
        </svg>
      );
    case "/admin/gallery":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      );
    case "/admin/crm":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <path d="M20 8v6M23 11h-6" />
        </svg>
      );
    case "/admin/media":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="m17 8-5-5-5 5M12 3v12" />
        </svg>
      );
    case "/admin/pages":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8M8 17h6" />
        </svg>
      );
    case "/admin/webhooks":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M14.5 17.5a3.5 3.5 0 1 1-7 0c0-2 1.5-2.7 1.5-4.5" />
          <path d="M9.5 6.5a3.5 3.5 0 1 1 7 0c0 2-1.5 2.7-1.5 4.5" />
          <path d="M19 13a3 3 0 1 1-3-3" />
          <path d="m12 13 4-2" />
        </svg>
      );
    case "/admin/users":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 11V9a2 2 0 0 0-2-2h-2M16 11h6" />
        </svg>
      );
    case "/admin/logs":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
          <path d="M14 2v6h6M10 13h4M10 17h4" />
        </svg>
      );
    case "/admin/settings":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      );
    case "/admin/maintenance":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path
            d="M14.7 6.3a4 4 0 1 1 3 3l-7.4 7.4a2 2 0 1 1-3-3l7.4-7.4Z"
            strokeLinejoin="round"
          />
          <path d="M6 18h.01M3 21h.01" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      );
  }
}

function navActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSideNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname() ?? "";

  const groupOrder: AdminNavGroupKey[] = [
    "overview",
    "content",
    "ops",
    "settings",
  ];
  const grouped = new Map<AdminNavGroupKey, NavItem[]>();
  for (const item of items) {
    const groupKey = (item.group ?? "overview") as AdminNavGroupKey;
    const list = grouped.get(groupKey) ?? [];
    list.push(item);
    grouped.set(groupKey, list);
  }

  function renderNavItem(item: NavItem, compact = false) {
    const active = navActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href as Route}
        className={
          compact
            ? `admin-shell__nav-subitem ${active ? "is-active" : ""}`
            : `admin-shell__nav-item ${active ? "is-active" : ""}`
        }
      >
        <span className="admin-shell__nav-icon">{iconFor(item.href)}</span>
        <span className="admin-shell__nav-copy">
          <span className="admin-shell__nav-title">
            <span className="lang-ar">{item.label}</span>
            <span className="lang-en">{item.labelEn ?? item.label}</span>
          </span>
          {!compact ? (
            <span className="admin-shell__nav-description">
              <span className="lang-ar">{item.description}</span>
              <span className="lang-en">
                {item.descriptionEn ?? item.description}
              </span>
            </span>
          ) : null}
        </span>
      </Link>
    );
  }

  return (
    <>
      {groupOrder.map((groupKey) => {
        const groupItems = grouped.get(groupKey);
        if (!groupItems || groupItems.length === 0) return null;
        const groupMeta = adminNavGroups[groupKey];
        const groupLabel = groupLabels[groupKey];
        return (
          <div key={groupKey} className="admin-shell__nav-group">
            <p className="admin-shell__nav-group-label">
              <span className="lang-ar">{groupMeta.label}</span>
              <span className="lang-en">{groupLabel.en}</span>
            </p>
            {groupKey === "content" ? (
              <>
                {groupItems
                  .filter((item) => item.href === "/admin/content")
                  .map((item) => renderNavItem(item))}
                <div className="admin-shell__nav-subgrid">
                  {groupItems
                    .filter((item) => item.href !== "/admin/content")
                    .map((item) => renderNavItem(item, true))}
                </div>
              </>
            ) : (
              groupItems.map((item) => renderNavItem(item))
            )}
          </div>
        );
      })}
    </>
  );
}
