import { UserRole } from "@prisma/client";

export const roleLabels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "إدارة عليا",
  [UserRole.ADMIN]: "مدير",
  [UserRole.EDITOR]: "محرر",
  [UserRole.VIEWER]: "كول سنتر",
  [UserRole.MEDICAL_DIRECTOR]: "مدير طبي",
  [UserRole.DOCTOR]: "طبيب",
  [UserRole.NURSE]: "تمريض",
  [UserRole.COORDINATOR]: "منسق مرضى",
  [UserRole.RECEPTIONIST]: "استقبال",
  [UserRole.AUDITOR]: "مراجع",
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
  [UserRole.MEDICAL_DIRECTOR]: {
    summary: "اعتماد المحتوى الطبي وقوالب التعليمات ومراجعة ملفات المرضى.",
    allowed: [
      "اعتماد قوالب التعليمات ومراجعة الإصدارات",
      "تعديل المحتوى الطبي للتعليمات",
      "الاطلاع على ملفات المرضى والعمليات",
      "الاطلاع على الإحصائيات والتقييمات",
    ],
    restricted: [
      "لا يدير حسابات المستخدمين أو إعدادات النظام.",
      "لا يضيف مرضى أو حسابات دخول.",
    ],
  },
  [UserRole.DOCTOR]: {
    summary: "متابعة مرضاه وتخصيص تعليماتهم والرد على رسائلهم.",
    allowed: [
      "الاطلاع على ملفات مرضاه وعملياتهم",
      "تخصيص واعتماد تعليمات مرضاه",
      "إضافة ملاحظات طبية",
      "الرد على رسائل المرضى",
    ],
    restricted: [
      "لا يعتمد القوالب العامة (المدير الطبي فقط).",
      "لا يدير المستخدمين أو الإعدادات.",
    ],
  },
  [UserRole.NURSE]: {
    summary: "متابعة قوائم المهام والمتابعات وتأكيد قراءة التعليمات.",
    allowed: [
      "إدارة قوائم المتابعة والمهام",
      "متابعة تأكيد قراءة التعليمات",
      "إضافة ملاحظات تمريضية",
      "الرد على رسائل المرضى",
    ],
    restricted: [
      "لا يعدل التعليمات الطبية أو يعتمدها.",
      "لا يضيف مرضى أو عمليات.",
    ],
  },
  [UserRole.COORDINATOR]: {
    summary: "إضافة المرضى والعمليات وتنظيم المتابعات وإرسال التفعيل.",
    allowed: [
      "إضافة المرضى وتعديل بياناتهم",
      "إضافة العمليات وتنظيم المتابعات",
      "إنشاء الحسابات وإرسال روابط التفعيل",
      "طباعة التعليمات والرد على الرسائل",
    ],
    restricted: [
      "لا يعتمد المحتوى الطبي.",
      "لا يرى التقييمات أو الإحصائيات التفصيلية.",
    ],
  },
  [UserRole.RECEPTIONIST]: {
    summary: "بحث عن المرضى والاطلاع على البيانات الأساسية والمواعيد فقط.",
    allowed: [
      "البحث عن المريض",
      "الاطلاع على البيانات الأساسية والمواعيد",
    ],
    restricted: [
      "لا يرى الملاحظات الطبية أو الداخلية.",
      "لا يعدل التعليمات أو بيانات المرضى.",
      "لا يطبع التعليمات ولا يرسل التفعيل.",
    ],
  },
  [UserRole.AUDITOR]: {
    summary: "قراءة محدودة لأغراض المراجعة دون أي تعديل.",
    allowed: [
      "الاطلاع على سجلات النشاط",
      "الاطلاع على الإحصائيات والتقييمات",
    ],
    restricted: [
      "لا يعدل أي بيانات.",
      "لا ينزل المستندات إلا حسب الصلاحيات.",
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
    prefix: "/admin/patients/settings",
    label: "إعدادات بوابة المرضى",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    prefix: "/admin/patients/activity",
    label: "سجل نشاط بوابة المرضى",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AUDITOR],
  },
  {
    prefix: "/admin/patients/stats",
    label: "إحصائيات بوابة المرضى",
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.MEDICAL_DIRECTOR,
      UserRole.AUDITOR,
    ],
  },
  {
    prefix: "/admin/patients/templates",
    label: "قوالب التعليمات",
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.MEDICAL_DIRECTOR,
      UserRole.DOCTOR,
      UserRole.NURSE,
      UserRole.COORDINATOR,
      UserRole.AUDITOR,
    ],
  },
  {
    prefix: "/admin/patients/feedback",
    label: "تقييمات المرضى",
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.MEDICAL_DIRECTOR,
      UserRole.AUDITOR,
    ],
  },
  {
    prefix: "/admin/patients",
    label: "إدارة المرضى",
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.MEDICAL_DIRECTOR,
      UserRole.DOCTOR,
      UserRole.NURSE,
      UserRole.COORDINATOR,
      UserRole.RECEPTIONIST,
      UserRole.AUDITOR,
    ],
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
  [UserRole.MEDICAL_DIRECTOR]: "/admin/patients",
  [UserRole.DOCTOR]: "/admin/patients",
  [UserRole.NURSE]: "/admin/patients",
  [UserRole.COORDINATOR]: "/admin/patients",
  [UserRole.RECEPTIONIST]: "/admin/patients",
  [UserRole.AUDITOR]: "/admin/patients",
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
