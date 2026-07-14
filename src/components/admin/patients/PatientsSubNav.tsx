import Link from "next/link";
import type { Route } from "next";
import type { UserRole } from "@prisma/client";

import { hasPortalCapability } from "@/lib/portal/permissions";

export type PatientsSubNavKey =
  | "patients"
  | "new"
  | "procedures"
  | "follow-ups"
  | "messages"
  | "feedback"
  | "templates"
  | "import"
  | "stats"
  | "activity"
  | "settings";

const items: {
  key: PatientsSubNavKey;
  href: string;
  label: string;
  show: (role: UserRole | undefined) => boolean;
}[] = [
  {
    key: "patients",
    href: "/admin/patients",
    label: "جميع المرضى",
    show: (role) => hasPortalCapability(role, "patients.view"),
  },
  {
    key: "new",
    href: "/admin/patients/new",
    label: "إضافة مريض",
    show: (role) => hasPortalCapability(role, "patients.create"),
  },
  {
    key: "procedures",
    href: "/admin/patients/procedures",
    label: "العمليات",
    show: (role) => hasPortalCapability(role, "procedures.view"),
  },
  {
    key: "follow-ups",
    href: "/admin/patients/follow-ups",
    label: "المتابعات",
    show: (role) => hasPortalCapability(role, "followUps.view"),
  },
  {
    key: "messages",
    href: "/admin/patients/messages",
    label: "الرسائل",
    show: (role) => hasPortalCapability(role, "messages.view"),
  },
  {
    key: "feedback",
    href: "/admin/patients/feedback",
    label: "التقييمات",
    show: (role) => hasPortalCapability(role, "feedback.view"),
  },
  {
    key: "templates",
    href: "/admin/patients/templates",
    label: "قوالب التعليمات",
    show: (role) => hasPortalCapability(role, "templates.view"),
  },
  {
    key: "import",
    href: "/admin/patients/import",
    label: "استيراد",
    show: (role) => hasPortalCapability(role, "patients.import"),
  },
  {
    key: "stats",
    href: "/admin/patients/stats",
    label: "الإحصائيات",
    show: (role) => hasPortalCapability(role, "stats.view"),
  },
  {
    key: "activity",
    href: "/admin/patients/activity",
    label: "سجل النشاط",
    show: (role) => hasPortalCapability(role, "audit.view"),
  },
  {
    key: "settings",
    href: "/admin/patients/settings",
    label: "الإعدادات",
    show: (role) => hasPortalCapability(role, "settings.manage"),
  },
];

export function PatientsSubNav({
  active,
  role,
}: {
  active: PatientsSubNavKey;
  role: UserRole | undefined;
}) {
  const visible = items.filter((item) => item.show(role));
  return (
    <nav className="admin-snav" aria-label="أقسام إدارة المرضى">
      {visible.map((item) => (
        <Link
          key={item.key}
          href={item.href as Route}
          className={`admin-chip${item.key === active ? " is-active" : ""}`}
          aria-current={item.key === active ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
