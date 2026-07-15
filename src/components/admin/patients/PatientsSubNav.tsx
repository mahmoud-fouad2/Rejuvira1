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
    show: (role) => hasPortalCapability(role, "patients.manage"),
  },
  {
    key: "new",
    href: "/admin/patients?add=1",
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
  void active;
  void role;
  return null;
}

export const patientModuleNavItems = items;
