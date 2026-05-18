"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import {
  createAdminUser,
  deleteAdminUser,
  updateAdminUserRole,
} from "@/lib/content-repository";

export type AdminUserActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
  positionTitle: z.string().max(120).optional().or(z.literal("")),
  department: z.string().max(120).optional().or(z.literal("")),
});

const roleUpdateSchema = z.object({
  id: z.string().min(3),
  role: z.nativeEnum(UserRole),
  positionTitle: z.string().max(120).optional().or(z.literal("")),
  department: z.string().max(120).optional().or(z.literal("")),
  isActive: z.string().optional(),
});

async function ensureSuperAdmin() {
  const session = await auth();

  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function createAdminUserAction(
  _previousState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  try {
    await ensureSuperAdmin();
  } catch {
    return {
      status: "error",
      message: "لا تتوفر صلاحية كافية لإضافة حساب جديد.",
    };
  }

  const parsed = initialUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    positionTitle: formData.get("positionTitle"),
    department: formData.get("department"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "يرجى استكمال بيانات الحساب بصورة صحيحة.",
    };
  }

  try {
    await createAdminUser({
      ...parsed.data,
      positionTitle: parsed.data.positionTitle || undefined,
      department: parsed.data.department || undefined,
      isActive: true,
    });
  } catch {
    return {
      status: "error",
      message:
        "تعذر إضافة الحساب بالبيانات الحالية. يرجى مراجعة البريد الإلكتروني والمحاولة مجددًا.",
    };
  }

  revalidatePath("/admin/users");

  return {
    status: "success",
    message: "تمت إضافة الحساب بنجاح.",
  };
}

export async function updateAdminUserRoleAction(
  _previousState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  let session;

  try {
    session = await ensureSuperAdmin();
  } catch {
    return {
      status: "error",
      message: "لا تتوفر صلاحية كافية لتعديل الدور.",
    };
  }

  const parsed = roleUpdateSchema.safeParse({
    id: formData.get("id"),
    role: formData.get("role"),
    positionTitle: formData.get("positionTitle"),
    department: formData.get("department"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "بيانات الدور غير مكتملة.",
    };
  }

  if (
    session.user.id === parsed.data.id &&
    (parsed.data.role !== UserRole.SUPER_ADMIN || parsed.data.isActive !== "on")
  ) {
    return {
      status: "error",
      message:
        "لا يمكن خفض صلاحية الحساب المسؤول عن الإدارة العليا من نفس الجلسة.",
    };
  }

  try {
    await updateAdminUserRole({
      id: parsed.data.id,
      role: parsed.data.role,
      positionTitle: parsed.data.positionTitle || undefined,
      department: parsed.data.department || undefined,
      isActive: parsed.data.isActive === "on",
    });
  } catch {
    return {
      status: "error",
      message: "تعذر تحديث الدور في الوقت الحالي.",
    };
  }

  revalidatePath("/admin/users");

  return {
    status: "success",
    message: "تم تحديث الدور بنجاح.",
  };
}

export async function deleteAdminUserAction(formData: FormData) {
  let session;
  try {
    session = await ensureSuperAdmin();
  } catch {
    return;
  }
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  if (session.user.id === id) return;
  try {
    await deleteAdminUser(id);
  } catch {
    return;
  }
  revalidatePath("/admin/users");
}
