import { UserRole } from "@prisma/client";

export const roleLabels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "إدارة عليا",
  [UserRole.ADMIN]: "مدير",
  [UserRole.EDITOR]: "محرر",
  [UserRole.VIEWER]: "مراقب",
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
    prefix: "/admin/crm",
    label: "الطلبات والمتابعة",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    prefix: "/admin/media",
    label: "الميديا والأصول",
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
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.EDITOR,
      UserRole.VIEWER,
    ],
  },
];

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
