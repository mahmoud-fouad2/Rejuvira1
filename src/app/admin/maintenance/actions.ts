"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import { recordAppLog } from "@/lib/app-log";
import { buildCsv, runBackup, runConnectionChecks } from "@/lib/backup";
import { getCrmSubmissions, saveSettingsGroup } from "@/lib/content-repository";

async function ensureAdmin() {
  const session = await auth();
  if (
    !session?.user?.role ||
    !canAccessAdminRoute("/admin/settings", session.user.role)
  ) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export type MaintenanceActionState = {
  status: "idle" | "success" | "error";
  message: string;
  meta?: Record<string, unknown> | undefined;
};

export async function triggerBackupAction(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: MaintenanceActionState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<MaintenanceActionState> {
  try {
    await ensureAdmin();
  } catch {
    return { status: "error", message: "غير مصرّح بهذه العملية." };
  }
  const result = await runBackup();
  if (!result.ok) {
    return {
      status: "error",
      message: `فشل إنشاء النسخة الاحتياطية: ${result.error ?? "خطأ غير معروف"}`,
    };
  }
  return {
    status: "success",
    message: `تم إنشاء النسخة الاحتياطية${result.key ? ` (${result.key})` : ""}.`,
    meta: { ...result },
  };
}

export async function exportCrmCsvAction(): Promise<MaintenanceActionState> {
  try {
    await ensureAdmin();
  } catch {
    return { status: "error", message: "غير مصرّح بهذه العملية." };
  }
  const records = await getCrmSubmissions();
  const csv = buildCsv(
    records.map((r) => ({ ...r })),
    [
      { key: "id", label: "id" },
      { key: "fullName", label: "fullName" },
      { key: "phone", label: "phone" },
      { key: "email", label: "email" },
      { key: "serviceLabel", label: "service" },
      { key: "status", label: "status" },
      { key: "source", label: "source" },
      { key: "createdAt", label: "createdAt" },
      { key: "notes", label: "notes" },
    ],
  );
  await recordAppLog({
    kind: "export",
    message: "Generated CRM CSV export",
    meta: { rows: records.length },
  });
  return {
    status: "success",
    message: "تم تحضير ملف CSV.",
    meta: {
      filename: `crm-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
    },
  };
}

export async function checkConnectionsAction(): Promise<MaintenanceActionState> {
  try {
    await ensureAdmin();
  } catch {
    return { status: "error", message: "غير مصرّح بهذه العملية." };
  }
  const checks = await runConnectionChecks();
  return {
    status: "success",
    message: "تم تنفيذ اختبارات الاتصال.",
    meta: { ...checks },
  };
}

export async function setMaintenanceModeAction(
  _prev: MaintenanceActionState,
  formData: FormData,
): Promise<MaintenanceActionState> {
  try {
    await ensureAdmin();
  } catch {
    return { status: "error", message: "غير مصرّح بهذه العملية." };
  }
  const enabled = formData.get("maintenanceMode") === "on";
  await saveSettingsGroup("ops", {
    maintenanceMode: enabled ? "true" : "false",
  });
  await recordAppLog({
    kind: "ops",
    message: `Maintenance mode ${enabled ? "enabled" : "disabled"}`,
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/maintenance");
  return {
    status: "success",
    message: enabled
      ? "تم تفعيل وضع الصيانة. سيظهر إشعار الصيانة للزوار."
      : "تم إيقاف وضع الصيانة.",
  };
}

export async function revalidatePublicAction(): Promise<MaintenanceActionState> {
  try {
    await ensureAdmin();
  } catch {
    return { status: "error", message: "غير مصرّح بهذه العملية." };
  }
  const paths = [
    "/",
    "/services",
    "/doctors",
    "/devices",
    "/gallery",
    "/journal",
    "/contact",
    "/about",
  ];
  for (const path of paths) {
    revalidatePath(path);
  }
  revalidatePath("/", "layout");
  await recordAppLog({
    kind: "ops",
    message: "Cache revalidated for public pages",
    meta: { paths },
  });
  return {
    status: "success",
    message: `تم تحديث ${paths.length} صفحات عامة.`,
  };
}
