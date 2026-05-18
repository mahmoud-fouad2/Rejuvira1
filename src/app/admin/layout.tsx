import Link from "next/link";
import type { Route } from "next";

import { AdminLanguageBridge } from "@/components/admin/AdminLanguageBridge";
import { AdminMobileShell } from "@/components/admin/AdminMobileShell";
import { AdminSideNav } from "@/components/admin/AdminSideNav";
import { AdminUserMenu } from "@/components/admin/AdminUserMenu";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { auth } from "@/auth";
import { canAccessAdminRoute, getRoleLabel } from "@/lib/admin-permissions";
import { adminNavigation } from "@/lib/site-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const availableNavigation = adminNavigation.filter((item) =>
    canAccessAdminRoute(item.href, session?.user?.role),
  );

  const sidebarContent = (
    <>
      <Link
        href={"/admin" as Route}
        className="admin-shell__brand"
        aria-label="Rejuvera Admin"
      >
        <span className="admin-shell__brand-logo">
          <BrandLogo
            alt="Rejuvera"
            width={120}
            height={90}
            variant="header"
            sizes="56px"
          />
        </span>
        <span className="admin-shell__brand-mark">Rejuvera</span>
      </Link>

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
      <span className="admin-shell__pill is-success hidden md:inline-flex">
        <span className="lang-ar">جلسة نشطة</span>
        <span className="lang-en">Active</span>
      </span>
      <LanguageToggle />
      <ThemeToggle />
      <AdminUserMenu
        name={session?.user?.name ?? "Admin"}
        email={session?.user?.email ?? ""}
        roleLabel={getRoleLabel(session?.user?.role)}
      />
    </>
  );

  const brand = (
    <p className="admin-shell__topbar-title">
      <span className="lang-ar">لوحة الإدارة</span>
      <span className="lang-en">Admin Panel</span>
    </p>
  );

  return (
    <div className="admin-shell admin-app font-[family-name:var(--font-rejuvira-sans)] antialiased">
      <AdminLanguageBridge />
      <AdminMobileShell
        brand={brand}
        sidebar={sidebarContent}
        topbarMeta={topbarMeta}
      >
        {children}
      </AdminMobileShell>
    </div>
  );
}
