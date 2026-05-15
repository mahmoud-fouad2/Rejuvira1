import Link from "next/link";
import type { Route } from "next";

import { AdminLanguageBridge } from "@/components/admin/AdminLanguageBridge";
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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const currentDateEn = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="admin-app min-h-screen font-[family-name:var(--font-rejuvira-sans)] text-ink antialiased">
      <AdminLanguageBridge />
      <div className="mx-auto grid min-h-screen w-full max-w-[112rem] grid-cols-1 gap-5 px-4 py-5 sm:px-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-6 lg:px-6 xl:grid-cols-[19.5rem_minmax(0,1fr)]">
        <aside className="admin-sidebar surface-panel relative flex w-full flex-col overflow-hidden rounded-[1.5rem] p-4 shadow-sm lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:self-start">
          <div className="pointer-events-none absolute -start-24 top-0 h-52 w-52 rounded-full bg-accent/15 blur-3xl" />
          <div className="pointer-events-none absolute -end-20 bottom-0 h-44 w-44 rounded-full bg-purple-mid/10 blur-3xl" />

          <Link href={"/admin" as Route} className="admin-brand-card relative">
            <BrandLogo
              alt="Rejuvira Center"
              width={220}
              height={160}
              variant="header"
              sizes="96px"
              className="admin-sidebar-logo"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-ink-strong">
                <span className="lang-ar">إدارة Rejuvira</span>
                <span className="lang-en">Rejuvira Admin</span>
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">
                <span className="lang-ar">Operations</span>
                <span className="lang-en">Operations</span>
              </p>
            </div>
          </Link>

          <div className="admin-session-card relative mt-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-strong">
                {session?.user?.name ?? "Super Admin"}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-ink-soft">
                {session?.user?.email ?? "admin session"}
              </p>
            </div>
            <span className="rounded-full border border-accent/25 bg-accent-soft/50 px-2.5 py-1 text-[10px] font-semibold text-ink">
              {getRoleLabel(session?.user?.role)}
            </span>
          </div>

          <div className="relative mt-5 min-h-0 flex-1 overflow-y-auto pe-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <AdminSideNav items={availableNavigation} />
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-2">
            <Link
              href={"/" as Route}
              className="admin-sidebar-action"
            >
              <span className="lang-ar">الموقع</span>
              <span className="lang-en">Site</span>
            </Link>
            <Link
              href={"/admin/media" as Route}
              className="admin-sidebar-action"
            >
              <span className="lang-ar">الصور</span>
              <span className="lang-en">Media</span>
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
          <header className="admin-topbar surface-panel flex flex-col gap-4 rounded-[1.5rem] px-4 py-4 shadow-sm sm:px-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-faint">
                Rejuvira Command Center
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink-strong sm:text-2xl">
                <span className="lang-ar">لوحة الإدارة</span>
                <span className="lang-en">Admin Panel</span>
              </h1>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2 xl:justify-end">
              <span className="admin-notification-pill">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                <span className="lang-ar">لا توجد تنبيهات حرجة</span>
                <span className="lang-en">No critical alerts</span>
              </span>
              <span className="rounded-full border border-line bg-surface-strong px-3 py-2 text-[11px] font-medium text-ink-soft">
                <span className="lang-ar">{currentDateAr}</span>
                <span className="lang-en">{currentDateEn}</span>
              </span>
              <LanguageToggle />
              <ThemeToggle />
              <Link
                href={"/" as Route}
                className="rounded-full border border-line bg-ink-strong px-4 py-2 text-xs font-semibold text-canvas transition hover:opacity-90"
              >
                <span className="lang-ar">زيارة الموقع</span>
                <span className="lang-en">View Site</span>
              </Link>
            </div>
          </header>

          <main className="admin-main flex min-w-0 flex-1 flex-col gap-5">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
