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
  icon: string;
  show: (role: UserRole | undefined) => boolean;
}[] = [
  {
    key: "patients",
    href: "/admin/patients",
    label: "جميع المرضى",
    icon: "P",
    show: (role) => hasPortalCapability(role, "patients.view"),
  },
  {
    key: "new",
    href: "/admin/patients/new",
    label: "إضافة مريض",
    icon: "+",
    show: (role) => hasPortalCapability(role, "patients.create"),
  },
  {
    key: "procedures",
    href: "/admin/patients/procedures",
    label: "العمليات",
    icon: "O",
    show: (role) => hasPortalCapability(role, "procedures.view"),
  },
  {
    key: "follow-ups",
    href: "/admin/patients/follow-ups",
    label: "المتابعات",
    icon: "F",
    show: (role) => hasPortalCapability(role, "followUps.view"),
  },
  {
    key: "messages",
    href: "/admin/patients/messages",
    label: "الرسائل",
    icon: "M",
    show: (role) => hasPortalCapability(role, "messages.view"),
  },
  {
    key: "feedback",
    href: "/admin/patients/feedback",
    label: "التقييمات",
    icon: "★",
    show: (role) => hasPortalCapability(role, "feedback.view"),
  },
  {
    key: "templates",
    href: "/admin/patients/templates",
    label: "قوالب التعليمات",
    icon: "T",
    show: (role) => hasPortalCapability(role, "templates.view"),
  },
  {
    key: "import",
    href: "/admin/patients/import",
    label: "استيراد",
    icon: "CSV",
    show: (role) => hasPortalCapability(role, "patients.import"),
  },
  {
    key: "stats",
    href: "/admin/patients/stats",
    label: "الإحصائيات",
    icon: "%",
    show: (role) => hasPortalCapability(role, "stats.view"),
  },
  {
    key: "activity",
    href: "/admin/patients/activity",
    label: "سجل النشاط",
    icon: "A",
    show: (role) => hasPortalCapability(role, "audit.view"),
  },
  {
    key: "settings",
    href: "/admin/patients/settings",
    label: "الإعدادات",
    icon: "S",
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
    <section className="patient-module-nav" aria-label="أقسام إدارة المرضى">
      <div className="patient-module-nav__head">
        <div>
          <span className="patient-module-nav__eyebrow">Patient operations</span>
          <strong>مركز إدارة المرضى</strong>
        </div>
        <span className="patient-module-nav__count">{visible.length} أقسام</span>
      </div>
      <nav className="patient-module-nav__links">
        {visible.map((item) => (
          <Link
            key={item.key}
            href={item.href as Route}
            className={`patient-module-nav__link${
              item.key === active ? " is-active" : ""
            }`}
            aria-current={item.key === active ? "page" : undefined}
          >
            <span className="patient-module-nav__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
