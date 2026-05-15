import Link from "next/link";
import type { Route } from "next";

import { AdminSideNav } from "@/components/admin/AdminSideNav";
import { BrandLogo } from "@/components/layout/BrandLogo";
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

  return (
    <div className="admin-app font-[family-name:var(--font-rejuvira-sans)] text-ink antialiased">
      <div className="mx-auto flex min-h-screen max-w-[100rem] flex-col gap-5 px-4 py-6 sm:px-5 lg:flex-row lg:gap-8 lg:px-8 lg:py-8">
        <aside className="surface-panel relative flex w-full flex-col overflow-hidden rounded-[1.75rem] p-5 shadow-sm lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:max-w-[19.5rem] lg:shrink-0 lg:self-start">
          <div className="pointer-events-none absolute -left-24 top-0 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-purple-mid/10 blur-3xl" />

          <Link
            href="/"
            className="border-line relative flex items-center gap-3 rounded-2xl border bg-surface/80 px-4 py-4 shadow-sm backdrop-blur-sm transition hover:border-accent/30 hover:shadow-md"
          >
            <div className="relative flex h-14 w-20 items-center justify-center overflow-hidden rounded-2xl bg-surface-strong shadow-inner">
              <BrandLogo
                alt="Rejuvira Center"
                width={220}
                height={160}
                variant="header"
                sizes="80px"
                className="admin-sidebar-logo"
              />
            </div>
            <div className="min-w-0 text-start">
              <p className="text-lg font-semibold tracking-tight text-ink-strong">Rejuvira</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
                Clinical Command
              </p>
            </div>
          </Link>

          <div className="border-line relative mt-5 flex items-center justify-between gap-3 rounded-2xl border bg-surface/70 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink-strong">المظهر</p>
              <p className="text-[11px] text-ink-soft">نهاري / ليلي مريح للعين</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="border-line relative mt-4 space-y-4 rounded-2xl border bg-surface/70 p-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint">الجلسة</p>
              <p className="mt-1.5 truncate text-sm font-semibold text-ink-strong">
                {session?.user?.name ?? "مستخدم مسجّل"}
              </p>
              <p className="mt-0.5 truncate text-xs text-ink-soft">{session?.user?.email ?? "—"}</p>
              <span className="mt-3 inline-flex rounded-full border border-line bg-accent-soft/60 px-3 py-1 text-[11px] font-semibold text-ink">
                {getRoleLabel(session?.user?.role)}
              </span>
            </div>
            <div className="border-t border-line pt-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint">نطاق الوصول</p>
              <p className="mt-1.5 text-sm font-semibold text-ink-strong">
                {availableNavigation.length} وحدة إدارية مفعّلة
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                تظهر الأقسام المصرّح بها فقط وفق الدور الحالي — تجربة أوضح وأكثر أمانًا.
              </p>
            </div>
          </div>

          <div className="relative mt-5 min-h-0 flex-1 overflow-y-auto pe-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <AdminSideNav items={availableNavigation} />
          </div>

          <div className="border-line relative mt-5 rounded-2xl border border-dashed border-accent/25 bg-accent-soft/25 px-4 py-3">
            <p className="text-xs font-medium text-ink-strong">الموقع العام</p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">معاينة ما يراه الزائر وربطه بالمحتوى الذي تديرونه هنا.</p>
            <Link
              href={"/" as Route}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink transition hover:border-accent/35 hover:text-accent"
            >
              فتح الواجهة العامة
              <span aria-hidden>↗</span>
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="surface-panel flex flex-col justify-between gap-4 rounded-[1.75rem] px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:px-6">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-ink-faint">Rejuvira · Admin</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink-strong sm:text-2xl">لوحة التشغيل الطبية</h1>
              <p className="mt-1 max-w-xl text-sm text-ink-soft">محتوى المركز، الطلبات، والأصول — في مساحة واحدة منظمة.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="rounded-full border border-line bg-surface-strong px-3 py-1.5 text-[11px] font-medium text-ink-soft">
                {new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date())}
              </span>
              <Link
                href={"/" as Route}
                className="rounded-full border border-line bg-ink-strong px-4 py-2 text-xs font-semibold text-canvas transition hover:opacity-90"
              >
                زيارة الموقع
              </Link>
            </div>
          </header>

          <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
