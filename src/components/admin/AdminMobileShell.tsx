"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  brand: React.ReactNode;
  sidebar: React.ReactNode;
  topbarMeta: React.ReactNode;
  children: React.ReactNode;
};

export function AdminMobileShell({
  brand,
  sidebar,
  topbarMeta,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  // Close drawer on route change.
  useEffect(() => {
    setOpen(false);
    setNoticeOpen(false);
  }, [pathname]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Lock body scroll when drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const pageLabel = routeLabels[pathname] ?? segmentLabel(pathname);
  const breadcrumbs = buildBreadcrumbs(pathname);

  function toggleNavigation() {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      setCollapsed((value) => !value);
      return;
    }
    setOpen((value) => !value);
  }

  function submitQuickSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = quickSearch.trim().toLowerCase();
    if (!query) return;
    const match = quickRoutes.find((route) =>
      [route.ar, route.en, route.href].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
    if (match) {
      router.push(match.href as Route);
      setQuickSearch("");
    }
  }

  return (
    <div
      className="admin-shell__layout wrapper layout-fixed"
      data-mobile-open={open ? "true" : "false"}
      data-sidebar-collapsed={collapsed ? "true" : "false"}
    >
      <button
        type="button"
        className="admin-shell__mobile-backdrop"
        aria-hidden={!open}
        tabIndex={-1}
        onClick={() => setOpen(false)}
      />
      <aside
        className="admin-shell__sidebar main-sidebar sidebar-dark-primary elevation-4"
        aria-label="Admin sidebar"
      >
        {sidebar}
      </aside>

      <header className="admin-shell__topbar main-header navbar navbar-expand">
        <div className="admin-shell__topbar-start">
          <button
            type="button"
            className="admin-shell__nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={toggleNavigation}
          >
            <span aria-hidden>
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </span>
          </button>
          <div className="admin-shell__topbar-brand">
            {brand}
            <nav className="admin-shell__breadcrumbs" aria-label="Breadcrumbs">
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.href}>
                  {index > 0 ? <b>/</b> : null}
                  {index === breadcrumbs.length - 1 ? (
                    <strong>{crumb.label}</strong>
                  ) : (
                    <Link href={crumb.href as Route}>{crumb.label}</Link>
                  )}
                </span>
              ))}
            </nav>
          </div>
        </div>

        <form
          className="admin-shell__quick-search"
          onSubmit={submitQuickSearch}
        >
          <span aria-hidden>
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            value={quickSearch}
            onChange={(event) => setQuickSearch(event.target.value)}
            placeholder="بحث سريع داخل الإدارة"
            aria-label="بحث سريع داخل الإدارة"
          />
        </form>

        <div className="admin-shell__topbar-meta">
          <div className="admin-shell__notification">
            <button
              type="button"
              className="admin-shell__icon-btn"
              aria-label="التنبيهات والاختصارات"
              aria-expanded={noticeOpen}
              onClick={() => setNoticeOpen((value) => !value)}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
            </button>
            {noticeOpen ? (
              <div className="admin-shell__notification-panel">
                <span className="admin-shell__notification-title">
                  مركز المتابعة
                </span>
                <Link href="/admin/crm">مراجعة الطلبات والليدز</Link>
                <Link href="/admin/logs">فحص السجلات والأخطاء</Link>
                <Link href="/admin/maintenance">أدوات الصيانة والنسخ</Link>
              </div>
            ) : null}
          </div>
          <span className="admin-shell__current-page">{pageLabel}</span>
          {topbarMeta}
        </div>
      </header>

      <div className="admin-shell__main content-wrapper">
        <main className="admin-shell__content content">
          <div className="admin-shell__container container-fluid">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

const routeLabels: Record<string, string> = {
  "/admin": "نظرة عامة",
  "/admin/content": "المحتوى",
  "/admin/crm": "الطلبات",
  "/admin/devices": "الأجهزة",
  "/admin/doctors": "الأطباء",
  "/admin/gallery": "المعرض",
  "/admin/journal": "المجلة",
  "/admin/logs": "السجلات",
  "/admin/maintenance": "الصيانة",
  "/admin/media": "الميديا",
  "/admin/pages": "صفحات مخصصة",
  "/admin/service-categories": "أقسام الخدمات",
  "/admin/services": "الخدمات",
  "/admin/settings": "الإعدادات",
  "/admin/stats": "الإحصائيات",
  "/admin/users": "المستخدمون",
  "/admin/webhooks": "ويب هوكس",
};

const quickRoutes = Object.entries(routeLabels).map(([href, ar]) => ({
  href,
  ar,
  en: href.replace("/admin", "admin").replaceAll("/", " "),
}));

function segmentLabel(pathname: string) {
  const segment = pathname.split("/").filter(Boolean).at(-1);
  if (!segment) return "لوحة الإدارة";
  return decodeURIComponent(segment).replaceAll("-", " ");
}

function buildBreadcrumbs(pathname: string) {
  const crumbs = [{ href: "/admin", label: "لوحة الإدارة" }];
  if (pathname === "/admin") return crumbs;
  const label = routeLabels[pathname] ?? segmentLabel(pathname);
  crumbs.push({ href: pathname, label });
  return crumbs;
}
