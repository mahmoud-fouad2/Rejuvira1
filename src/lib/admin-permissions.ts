import { UserRole } from "@prisma/client";

export const roleLabels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "إدارة عليا",
  [UserRole.ADMIN]: "مدير",
  [UserRole.EDITOR]: "محرر",
  [UserRole.VIEWER]: "كول سنتر",
};

export const roleDescriptions: Record<
  UserRole,
  { summary: string; allowed: readonly string[]; restricted: readonly string[] }
> = {
  [UserRole.SUPER_ADMIN]: {
    summary: "تحكم كامل في النظام والمستخدمين والصلاحيات.",
    allowed: [
      "إدارة المستخدمين والصلاحيات",
      "تعديل المحتوى والخدمات والأطباء والأجهزة",
      "إدارة الطلبات ومصادرها والتقارير",
      "الإعدادات والصيانة والسجلات",
    ],
    restricted: [],
  },
  [UserRole.ADMIN]: {
    summary: "إدارة تشغيلية للمحتوى والطلبات بدون إدارة حسابات السوبر أدمن.",
    allowed: [
      "تعديل المحتوى والخدمات والأطباء والأجهزة",
      "إدارة الطلبات ومصادرها والتقارير",
      "الإعدادات والصيانة والسجلات",
    ],
    restricted: ["لا يدير حسابات المستخدمين أو يغير أدوارهم."],
  },
  [UserRole.EDITOR]: {
    summary: "إدارة المحتوى فقط بدون الوصول إلى الطلبات أو الإعدادات.",
    allowed: [
      "مركز المحتوى",
      "الخدمات والأقسام",
      "الأطباء والأجهزة",
      "المعرض والمجلة والميديا والصفحات المخصصة",
    ],
    restricted: ["لا يرى الطلبات أو المستخدمين أو الإعدادات."],
  },
  [UserRole.VIEWER]: {
    summary: "حساب كول سنتر مخصص لمتابعة الليدز فقط.",
    allowed: [
      "عرض الطلبات والليدز فقط",
      "تغيير حالة الطلب",
      "إضافة ملاحظات داخلية",
      "تعديل بيانات التواصل والموعد داخل الطلب",
    ],
    restricted: [
      "لا يرى لوحة القيادة العامة أو المحتوى أو الإعدادات.",
      "لا يحذف الطلبات أو التعليقات.",
      "لا يصدر التقارير ولا يغير مصادر الطلبات.",
    ],
  },
};

export type PermissionRule = {
  prefix: string;
  label: string;
  roles: readonly UserRole[];
};

export const permissionMatrix: readonly PermissionRule[] = [
  {
    prefix: "/admin/users",
    label: "المستخدمون والصلاحيات",
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    prefix: "/admin/settings",
    label: "الإعدادات التشغيلية",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    prefix: "/admin/logs",
    label: "السجلات والمراقبة",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    prefix: "/admin/maintenance",
    label: "الصيانة والنسخ الاحتياطية",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    prefix: "/admin/integration-tools",
    label: "أدوات التكامل",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    prefix: "/admin/crm",
    label: "الطلبات والمتابعة",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VIEWER],
  },
  {
    prefix: "/admin/content",
    label: "مركز المحتوى",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  },
  {
    prefix: "/admin/media",
    label: "الميديا والأصول",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  },
  {
    prefix: "/admin/pages",
    label: "الصفحات المخصصة",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  },
  {
    prefix: "/admin/service-categories",
    label: "أقسام الخدمات",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  },
  {
    prefix: "/admin/services",
    label: "الخدمات",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  },
  {
    prefix: "/admin/journal",
    label: "المجلة",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  },
  {
    prefix: "/admin/gallery",
    label: "المعرض",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  },
  {
    prefix: "/admin/doctors",
    label: "الأطباء",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  },
  {
    prefix: "/admin/devices",
    label: "الأجهزة",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  },
  {
    prefix: "/admin",
    label: "لوحة القيادة",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  },
];

const adminHomeByRole: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "/admin",
  [UserRole.ADMIN]: "/admin",
  [UserRole.EDITOR]: "/admin",
  [UserRole.VIEWER]: "/admin/crm",
};

export function getRoleLabel(role?: UserRole) {
  return role ? roleLabels[role] : "غير محدد";
}

export function canAccessAdminRoute(pathname: string, role?: UserRole) {
  if (!role) {
    return false;
  }

  const matchedRule = permissionMatrix.find((rule) =>
    pathname.startsWith(rule.prefix),
  );

  if (!matchedRule) {
    return false;
  }

  return matchedRule.roles.includes(role);
}

export function getAdminHomePath(role?: UserRole) {
  return role ? adminHomeByRole[role] : "/admin";
}

export function canManageCrm(role?: UserRole) {
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
}
