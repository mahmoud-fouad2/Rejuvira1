import Link from "next/link";
import type { Route } from "next";

import { AdminLanguageBridge } from "@/components/admin/AdminLanguageBridge";
import { AdminMobileShell } from "@/components/admin/AdminMobileShell";
import { AdminSideNav } from "@/components/admin/AdminSideNav";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { auth } from "@/auth";
import { canAccessAdminRoute, getRoleLabel } from "@/lib/admin-permissions";
import { adminNavigation } from "@/lib/site-content";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const availableNavigation = adminNavigation.filter((item) =>
    canAccessAdminRoute(item.href, session?.user?.role),
  );
  const currentDateAr = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const currentDateEn = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const sidebarContent = (
    <>
      <Link href={"/admin" as Route} className="admin-shell__brand">
        <span className="admin-shell__brand-logo">
          <BrandLogo
            alt="Rejuvira"
            width={120}
            height={90}
            variant="header"
            sizes="48px"
          />
        </span>
        <span>
          <span className="admin-shell__brand-name">Rejuvira</span>
          <span className="admin-shell__brand-meta">
            <span className="lang-ar">لوحة الإدارة</span>
            <span className="lang-en">Admin Console</span>
          </span>
        </span>
      </Link>

      <div className="admin-shell__session">
        <span className="min-w-0 flex-1">
          <strong className="truncate">
            {session?.user?.name ?? "Super Admin"}
          </strong>
          <span className="truncate" dir="ltr">
            {session?.user?.email ?? ""}
          </span>
        </span>
        <em>{getRoleLabel(session?.user?.role)}</em>
      </div>

      <nav className="admin-shell__nav" aria-label="Admin navigation">
        <AdminSideNav items={availableNavigation} />
      </nav>

      <div className="admin-shell__sidebar-footer">
        <Link href={"/" as Route} className="admin-shell__sidebar-link">
          <span className="lang-ar">زيارة الموقع</span>
          <span className="lang-en">View site</span>
        </Link>
      </div>
    </>
  );

  const topbarMeta = (
    <>
      <span className="admin-shell__pill is-success hidden sm:inline-flex">
        <span className="lang-ar">جلسة نشطة</span>
        <span className="lang-en">Session active</span>
      </span>
      <span className="admin-shell__pill hidden md:inline-flex">
        <span className="lang-ar">{currentDateAr}</span>
        <span className="lang-en">{currentDateEn}</span>
      </span>
      <LanguageToggle />
      <ThemeToggle />
      <Link href={"/" as Route} className="admin-shell__topbar-cta">
        <span className="lang-ar">الموقع</span>
        <span className="lang-en">Site</span>
      </Link>
    </>
  );

  const brand = (
    <>
      <p className="admin-shell__topbar-title">
        <span className="lang-ar">لوحة الإدارة</span>
        <span className="lang-en">Admin Panel</span>
      </p>
    </>
  );

  return (
    <div className="admin-shell admin-app font-[family-name:var(--font-rejuvira-sans)] antialiased">
      <AdminLanguageBridge />
      <AdminMobileShell brand={brand} sidebar={sidebarContent} topbarMeta={topbarMeta}>
        {children}
      </AdminMobileShell>
    </div>
  );
}
