"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  brand: React.ReactNode;
  sidebar: React.ReactNode;
  topbarMeta: React.ReactNode;
  children: React.ReactNode;
};

type RouteEntry = {
  href: string;
  ar: string;
  en: string;
  aliases?: string[];
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

  useEffect(() => {
    setOpen(false);
    setNoticeOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const pageLabel = labelForRoute(pathname);
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
    const match = quickRoutes.find((route) => {
      const searchable = [route.ar, route.en, route.href, ...(route.aliases ?? [])]
        .join(" ")
        .toLowerCase();
      return searchable.includes(query);
    });
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
            aria-label="فتح وإغلاق القائمة"
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
            placeholder="ابحث: مريض، عملية، طلب، قوالب..."
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
                <Link href={"/admin/patients/messages" as Route}>
                  رسائل المرضى
                </Link>
                <Link href={"/admin/patients?add=1" as Route}>
                  إضافة مريض سريعًا
                </Link>
                <Link href={"/admin/crm" as Route}>
                  مراجعة الطلبات والليدز
                </Link>
                <Link href={"/admin/logs" as Route}>
                  فحص السجلات والأخطاء
                </Link>
                <Link href={"/admin/maintenance" as Route}>
                  أدوات الصيانة والنسخ
                </Link>
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

const routeEntries: RouteEntry[] = [
  { href: "/admin", ar: "نظرة عامة", en: "Overview", aliases: ["dashboard"] },
  { href: "/admin/content", ar: "المحتوى", en: "Content" },
  { href: "/admin/crm", ar: "الطلبات", en: "Leads", aliases: ["crm"] },
  { href: "/admin/devices", ar: "الأجهزة", en: "Devices" },
  { href: "/admin/doctors", ar: "الأطباء", en: "Doctors" },
  { href: "/admin/gallery", ar: "المعرض", en: "Gallery" },
  { href: "/admin/journal", ar: "المجلة", en: "Journal" },
  { href: "/admin/logs", ar: "السجلات", en: "Logs" },
  { href: "/admin/maintenance", ar: "الصيانة", en: "Maintenance" },
  { href: "/admin/media", ar: "الميديا", en: "Media" },
  { href: "/admin/pages", ar: "صفحات مخصصة", en: "Custom pages" },
  {
    href: "/admin/service-categories",
    ar: "أقسام الخدمات",
    en: "Service categories",
  },
  { href: "/admin/services", ar: "الخدمات", en: "Services" },
  { href: "/admin/settings", ar: "الإعدادات", en: "Settings" },
  { href: "/admin/stats", ar: "الإحصائيات", en: "Analytics" },
  { href: "/admin/users", ar: "المستخدمون", en: "Users" },
  { href: "/admin/webhooks", ar: "ويب هوكس", en: "Webhooks" },
  {
    href: "/admin/integration-tools",
    ar: "التكاملات",
    en: "Integrations",
  },
  {
    href: "/admin/patients",
    ar: "إدارة المرضى",
    en: "Patients",
    aliases: ["patient", "patients", "مريض", "مرضى"],
  },
  {
    href: "/admin/patients/new",
    ar: "إضافة مريض",
    en: "New patient",
    aliases: ["add patient"],
  },
  {
    href: "/admin/patients/procedures",
    ar: "العمليات",
    en: "Procedures",
    aliases: ["عملية", "procedures"],
  },
  {
    href: "/admin/patients/follow-ups",
    ar: "المتابعات",
    en: "Follow-ups",
    aliases: ["follow up", "متابعة"],
  },
  {
    href: "/admin/patients/messages",
    ar: "رسائل المرضى",
    en: "Patient messages",
    aliases: ["رسائل", "messages"],
  },
  {
    href: "/admin/patients/feedback",
    ar: "التقييمات",
    en: "Feedback",
  },
  {
    href: "/admin/patients/templates",
    ar: "قوالب التعليمات",
    en: "Instruction templates",
    aliases: ["templates", "قوالب"],
  },
  { href: "/admin/patients/import", ar: "استيراد", en: "Import" },
  {
    href: "/admin/patients/stats",
    ar: "إحصائيات المرضى",
    en: "Patient analytics",
  },
  {
    href: "/admin/patients/activity",
    ar: "سجل نشاط المرضى",
    en: "Patient activity",
  },
  {
    href: "/admin/patients/settings",
    ar: "إعدادات بوابة المرضى",
    en: "Patient portal settings",
  },
];

const routeLabels = Object.fromEntries(
  routeEntries.map((route) => [route.href, route.ar]),
) as Record<string, string>;

const quickRoutes = routeEntries;

const patientSections = routeEntries.filter((route) =>
  route.href.startsWith("/admin/patients/"),
);

function labelForRoute(pathname: string) {
  if (routeLabels[pathname]) return routeLabels[pathname];
  if (pathname.startsWith("/admin/patients/templates/")) {
    return "قالب تعليمات";
  }
  if (pathname.startsWith("/admin/patients/procedures/")) {
    return "ملف عملية";
  }
  if (pathname.endsWith("/add-procedure")) {
    return "إضافة عملية";
  }
  if (pathname.endsWith("/edit")) {
    return "تعديل مريض";
  }
  if (pathname.startsWith("/admin/patients/")) {
    return "ملف مريض";
  }
  if (pathname.startsWith("/admin/pages/")) {
    return "صفحة مخصصة";
  }
  if (pathname.startsWith("/admin/integration-tools/")) {
    return "أداة تكامل";
  }
  return segmentLabel(pathname);
}

function segmentLabel(pathname: string) {
  const segment = pathname.split("/").filter(Boolean).at(-1);
  if (!segment) return "لوحة الإدارة";
  if (/^[0-9a-f-]{24,}$/i.test(segment)) return "تفاصيل";
  return decodeURIComponent(segment).replaceAll("-", " ");
}

function buildBreadcrumbs(pathname: string) {
  const crumbs = [{ href: "/admin", label: routeLabels["/admin"] ?? "لوحة الإدارة" }];
  if (pathname === "/admin") return crumbs;

  if (pathname.startsWith("/admin/patients")) {
    crumbs.push({
      href: "/admin/patients",
      label: routeLabels["/admin/patients"] ?? "إدارة المرضى",
    });
    if (pathname === "/admin/patients") return crumbs;

    const section = patientSections.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
    if (section && section.href !== "/admin/patients") {
      crumbs.push({ href: section.href, label: section.ar });
      if (pathname === section.href) return crumbs;
    }

    crumbs.push({ href: pathname, label: labelForRoute(pathname) });
    return crumbs;
  }

  crumbs.push({ href: pathname, label: labelForRoute(pathname) });
  return crumbs;
}
